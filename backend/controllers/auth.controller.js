import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // crypto for secure token generation & hashing

// NOTE: Password reset tokens now stored in DB columns (no new table) to persist across restarts.
// Added columns (via migration_v3_password_reset.js):
//   Password_reset_token VARCHAR(64) NULL (sha256 hex digest)
//   Password_reset_expires DATETIME NULL

class AuthController {
  static async validatePassword(password, user) {
    try {
      return await bcrypt.compare(password, user.Users_password);
    } catch (error) {
      console.error("Password validation error:", error);
      return false;
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          error: "Username or password is required" 
        });
      }

      // Find user by username
      const user = await UserModel.findByName(username);

      if (!user) {
        return res.status(401).json({ 
          error: "User not found" 
        });
      }

      // Check if user is active (assuming status_id 1 is active)
      if (user.User_status_FK_ID !== 1) {
        return res.status(401).json({ 
          error: "User account is not active" 
        });
      }

      // Validate password
      const isValidPassword = await AuthController.validatePassword(password, user);      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: "Invalid credentials" 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.Users_id, 
          username: user.Users_name,
          roleId: user.Role_FK_ID,
          Role_name: user.Role_name
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // Debug logging
      console.log('User data for token:', {
        userId: user.Users_id,
        username: user.Users_name,
        roleId: user.Role_FK_ID,
        Role_name: user.Role_name
      });

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.Users_id,
          username: user.Users_name,
          status_id: user.User_status_FK_ID,
          role_id: user.Role_FK_ID,
          Role_name: user.Role_name
        }
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  async register(req, res) {
    try {
      const { username, email, password, user_status_id, role_id } = req.body;

      if (!username || !password || !user_status_id || !role_id) {
        return res.status(400).json({ 
          error: "Username, password, user_status_id, and role_id are required" 
        });
      }

      // Check if username already exists
      const existingUser = await UserModel.findByName(username);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Username already exists" 
        });
      }

      if (email) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with hashed password
      const userId = await UserModel.create({
        name: username,
        email,
        password: hashedPassword,
        user_status_id,
        role_id
      });

      if (userId.error) {
        return res.status(400).json({ error: userId.error });
      }

      res.status(201).json({
        message: "User registered successfully",
        id: userId,
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "email is required" });
      }

      // Try locate by email first, then fallback to username for backward compatibility
      let user = await UserModel.findByEmail(email);
      if (!user) {
        user = await UserModel.findByName(email);
      }

      // Generic response to avoid user enumeration
      const generic = { message: "If the account exists, password reset instructions were generated." };

      if (!user) {
        return res.status(200).json(generic);
      }

      // Generate raw token & expiry (1 hour)
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

      // Persist hashed token & expiry in users table (overwrites any previous one)
      await UserModel.setResetToken(user.Users_id, tokenHash, expiresAt);

      // Since no email service, return token ONLY when not production
      const includeToken = process.env.NODE_ENV !== 'production';

      return res.status(200).json({
        ...generic,
        ...(includeToken ? { resetToken: rawToken, expiresAt: expiresAt.toISOString() } : {})
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Password reset request failed" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "token and newPassword are required" });
      }

      // Policy: >=8 chars, at least one number & one letter
      if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[A-Za-z]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must be >=8 chars and include letters & numbers" });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const record = await UserModel.findByResetToken(tokenHash);
      if (!record) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      if (new Date(record.Password_reset_expires) < new Date()) {
        await UserModel.clearResetToken(record.Users_id); // cleanup expired
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const updated = await UserModel.updatePassword(record.Users_id, hashedPassword);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update password" });
      }

      await UserModel.clearResetToken(record.Users_id);
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.userId; // From JWT token
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: "Current password and new password are required" 
        });
      }

      // Get user details
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ 
          error: "User not found" 
        });
      }

      // Validate current password
      const isValidPassword = await AuthController.validatePassword(currentPassword, user);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: "Current password is incorrect" 
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updated = await UserModel.updatePassword(userId, hashedPassword);

      if (!updated) {
        return res.status(500).json({ 
          error: "Failed to update password" 
        });
      }

      res.status(200).json({
        message: "Password changed successfully"
      });

    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Password change failed" });
    }
  }

  async validateToken(req, res) {
    try {
      // Token is already validated by middleware
      // Just return user info from token
      const { userId, username, roleId } = req.user;

      res.status(200).json({
        message: "Token is valid",
        user: {
          id: userId,
          username: username,
          role_id: roleId
        }
      });

    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ error: "Token validation failed" });
    }
  }
}

// Export an instance of the controller
const authController = new AuthController();
export default authController;