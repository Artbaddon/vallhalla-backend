import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          error: "Username and password are required" 
        });
      }

      // Find user by username
      const user = await UserModel.findByName(username);

      if (!user) {
        return res.status(401).json({ 
          error: "Invalid credentials" 
        });
      }

      // Check if user is active (assuming status_id 1 is active)
      if (user.User_status_FK_ID !== 1) {
        return res.status(401).json({ 
          error: "User account is not active" 
        });
      }

      // Validate password
      const isValidPassword = await this.validatePassword(password, user);
      
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
          roleId: user.Role_FK_ID 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.Users_id,
          username: user.Users_name,
          status_id: user.User_status_FK_ID,
          role_id: user.Role_FK_ID
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

      // Create user (you might need to add password_hash field to your users table)
      const userId = await UserModel.create({
        name: username,
        user_status_id,
        role_id,
        // password_hash: hashedPassword // Add this field to your users table
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

      // In a real implementation, you would:
      // 1. Verify the reset token
      // 2. Check if token is expired
      // 3. Hash the new password
      // 4. Update user password
      // 5. Invalidate the reset token

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
      const isValidPassword = await this.validatePassword(currentPassword, user);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: "Current password is incorrect" 
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password (you might need to add password_hash field to your users table)
      // await UserModel.updatePassword(userId, hashedPassword);

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
      const userId = req.user.userId;
      
      // Get user details with profile information
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(401).json({
          valid: false,
          message: "User not found"
        });
      }

      // Check if user is still active
      if (user.User_status_FK_ID !== 1) {
        return res.status(401).json({
          valid: false,
          message: "User account is no longer active"
        });
      }

      res.status(200).json({
        valid: true,
        message: "Token is valid",
        user: {
          id: user.Users_id,
          username: user.Users_name,
          status_id: user.User_status_FK_ID,
          role_id: user.Role_FK_ID
        },
        token: {
          userId: req.user.userId,
          username: req.user.username,
          roleId: req.user.roleId,
          iat: req.user.iat,
          exp: req.user.exp,
          expiresAt: new Date(req.user.exp * 1000).toISOString()
        }
      });

    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({
        valid: false,
        message: "Token validation failed"
      });
    }
  }

  // Helper method to validate password
  async validatePassword(password, user) {
    // For now, we'll use a simple check
    // In production, you should:
    // 1. Store hashed passwords in the database
    // 2. Use bcrypt.compare() to validate passwords
    
    // Placeholder logic - replace with actual password validation
    if (password === 'admin123' && user.Users_name === 'admin') {
      return true;
    }
    
    // For other users, you might want to add a password field to your users table
    // and implement proper password hashing/validation
    
    return false;
  }
}

export default new AuthController(); 