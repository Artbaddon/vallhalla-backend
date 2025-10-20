import UserModel from "../models/user.model.js";
import OwnerModel from "../models/owner.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // crypto for secure token generation & hashing
import transporter from "../utils/email.js";
import forgotPasswordTemplate from "../utils/templates/forgotPasswordTemplate.js";
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
          error: "Username or password is required",
        });
      }

      // Find user by username
      const user = await UserModel.findByName(username);

      if (!user) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      // Check if user is active (assuming status_id 1 is active)
      if (user.User_status_FK_ID !== 1) {
        return res.status(401).json({
          error: "User account is not active",
        });
      }

      // Validate password
      const isValidPassword = await AuthController.validatePassword(
        password,
        user
      );
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      // If user is an owner, fetch their Owner_id
      let ownerId = null;
      if (user.Role_FK_ID === 2) { // Owner role
        console.log('🔍 Fetching owner record for userId:', user.Users_id);
        const owner = await OwnerModel.findByUserId(user.Users_id);
        console.log('📋 Owner record found:', owner);
        if (owner && !owner.error) {
          ownerId = owner.Owner_id;
          console.log('✅ Owner_id extracted:', ownerId);
        } else {
          console.log('⚠️ No owner record found for userId:', user.Users_id);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.Users_id,
          username: user.Users_name,
          roleId: user.Role_FK_ID,
          Role_name: user.Role_name,
          Owner_id: ownerId,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // Debug logging
      console.log("🎫 Token payload:", {
        userId: user.Users_id,
        username: user.Users_name,
        roleId: user.Role_FK_ID,
        Role_name: user.Role_name,
        email: user.Users_email,
        Owner_id: ownerId,
      });

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: user.Users_id,
          username: user.Users_name,
          status_id: user.User_status_FK_ID,
          role_id: user.Role_FK_ID,
          email: user.Users_email,
          Role_name: user.Role_name,
        },
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
          error: "Username, password, user_status_id, and role_id are required",
        });
      }

      // Check if username already exists
      const existingUser = await UserModel.findByName(username);
      if (existingUser) {
        return res.status(400).json({
          error: "Username already exists",
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
        role_id,
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

      // Buscar usuario por email o nombre de usuario
      let user = await UserModel.findByEmail(email);
      if (!user) {
        user = await UserModel.findByName(email);
      }

      // Respuesta genérica (evita revelar si el usuario existe)
      const generic = {
        message:
          "If the account exists, password reset instructions were generated.",
      };

      if (!user) {
        return res.status(200).json(generic);
      }

      // Generar token de reseteo
      const rawToken = crypto.randomBytes(4).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // Guardar token en DB
      await UserModel.setResetToken(user.Users_id, tokenHash, expiresAt);

      // ✉️ Enviar correo de prueba
      const mailOptions = {
        from: '"Valhalla" <valhalla.email.co@gmail.com>',
        to: user.Users_email,
        subject: "Restablecimiento de contraseña",
        html: forgotPasswordTemplate(user, rawToken),
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Correo enviado:", info.messageId);
      } catch (mailError) {
        console.error("❌ Error al enviar correo:", mailError);
      }

      // En desarrollo, mostrar el token crudo
      const includeToken = process.env.NODE_ENV !== "production";

      return res.status(200).json({
        ...generic,
        ...(includeToken
          ? { resetToken: rawToken, expiresAt: expiresAt.toISOString() }
          : {}),
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Password reset request failed" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // 1️⃣ Validar datos
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: "El código y la nueva contraseña son obligatorios" });
      }

      // 2️⃣ Validar política de contraseña
      if (
        newPassword.length < 8 ||
        !/[0-9]/.test(newPassword) ||
        !/[A-Za-z]/.test(newPassword)
      ) {
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 8 caracteres e incluir letras y números",
        });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      const record = await UserModel.findByResetToken(tokenHash);
      if (!record) {
        return res.status(400).json({ error: "Código inválido o expirado" });
      }

      if (new Date(record.Password_reset_expires) < new Date()) {
        await UserModel.clearResetToken(record.Users_id); // Limpieza de seguridad
        return res.status(400).json({ error: "Código inválido o expirado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updated = await UserModel.updatePassword(
        record.Users_id,
        hashedPassword
      );

      if (!updated) {
        return res
          .status(500)
          .json({ error: "No se pudo actualizar la contraseña" });
      }

      await UserModel.clearResetToken(record.Users_id);

      return res
        .status(200)
        .json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
      console.error("❌ Reset password error:", error);
      res.status(500).json({ error: "Error al restablecer la contraseña" });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.userId; // From JWT token
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required",
        });
      }

      // Get user details
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Validate current password
      const isValidPassword = await AuthController.validatePassword(
        currentPassword,
        user
      );

      if (!isValidPassword) {
        return res.status(401).json({
          error: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updated = await UserModel.updatePassword(userId, hashedPassword);

      if (!updated) {
        return res.status(500).json({
          error: "Failed to update password",
        });
      }

      res.status(200).json({
        message: "Password changed successfully",
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
          role_id: roleId,
        },
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
