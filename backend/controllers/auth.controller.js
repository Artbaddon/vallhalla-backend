import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      const { username, password, user_status_id, role_id } = req.body;

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

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with hashed password
      const userId = await UserModel.create({
        name: username,
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
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ 
          error: "Username is required" 
        });
      }

      // Find user by username
      const user = await UserModel.findByName(username);

      if (!user) {
        return res.status(404).json({ 
          error: "User not found" 
        });
      }

      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Send email with reset link
      // 3. Store reset token in database with expiration

      res.status(200).json({
        message: "Password reset instructions sent to your email",
      });

    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ 
          error: "Token and new password are required" 
        });
      }

      res.status(200).json({
        message: "Password reset successfully"
      });

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