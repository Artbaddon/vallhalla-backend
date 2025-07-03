import UserModel from "../models/user.model.js";
import ProfileModel from "../models/profile.model.js";
import { ROLES } from "../middleware/rbacConfig.js";

class UserController {
  async register(req, res) {
    try {
      const { name, password, user_status_id, role_id } = req.body;

      const { 
        first_name, 
        last_name, 
        phone, 
        document_type_id, 
        document_number, 
        photo_url 
      } = req.body.profile || {};

      if (!name || !password || !user_status_id || !role_id) {
        return res
          .status(400)
          .json({ error: "Name, password, user_status_id, and role_id are required" });
      }

      if (!req.body.profile || !first_name || !last_name) {
        return res
          .status(400)
          .json({ error: "Profile data with at least first_name and last_name is required" });
      }

      // Hash the password before storing
      const bcrypt = (await import('bcrypt')).default;
      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await UserModel.create({
        name,
        password: hashedPassword,
        user_status_id,
        role_id,
      });

      if (userId.error) {
        return res.status(400).json({ error: userId.error });
      }

      const profileId = await ProfileModel.create({
        User_FK_ID: userId,
        Profile_fullName: `${first_name} ${last_name}`,
        Profile_document_type: document_type_id || '',
        Profile_document_number: document_number || '',
        Profile_telephone_number: phone || '',
        Profile_photo: photo_url || null
      });

      if (profileId.error) {
        // If profile creation fails, we should clean up the user
        await UserModel.delete(userId);
        return res.status(400).json({ error: profileId.error });
      }

      res.status(201).json({
        message: "User and profile created successfully",
        userId: userId,
        profileId: profileId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const users = await UserModel.show(includeInactive);

      if (users.error) {
        return res.status(400).json({ error: users.error });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({ 
          error: includeInactive ? 
            "No users found" : 
            "No active users found. Use ?includeInactive=true to show all users" 
        });
      }

      res.status(200).json({
        message: includeInactive ? 
          "All users retrieved successfully" : 
          "Active users retrieved successfully",
        users: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showWithDetails(req, res) {
    try {
      const users = await UserModel.getUsersWithDetails();

      if (users.error) {
        return res.status(400).json({ error: users.error });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }

      res.status(200).json({
        message: "Users with details retrieved successfully",
        users: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { name, user_status_id, role_id, profile } = req.body;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Get current user data to only update what's changed
      const currentUser = await UserModel.findById(id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prepare user update data
      const updateData = {
        name: name || currentUser.Users_name,
        user_status_id: user_status_id || currentUser.User_status_FK_ID,
        role_id: role_id || currentUser.Role_FK_ID
      };

      const updateResult = await UserModel.update(id, updateData);
      if (updateResult.error) {
        return res.status(400).json({ error: updateResult.error });
      }

      // If profile data is provided, update the profile too
      let profileUpdateResult = null;
      if (profile) {
        const { first_name, last_name, phone, document_type_id, document_number, photo_url } = profile;
        
        // Only update profile if at least one field is provided
        if (first_name || last_name || phone || document_type_id || document_number || photo_url) {
          const existingProfile = await ProfileModel.findByUserId(id);
          
          if (existingProfile) {
            // If we have first_name or last_name, we need both
            if ((first_name && !last_name) || (!first_name && last_name)) {
              return res.status(400).json({ error: "Both first_name and last_name must be provided together" });
            }

            profileUpdateResult = await ProfileModel.update(existingProfile.Profile_id, {
              first_name: first_name || existingProfile.Profile_fullName.split(' ')[0],
              last_name: last_name || existingProfile.Profile_fullName.split(' ')[1],
              phone: phone !== undefined ? phone : existingProfile.Profile_telephone_number,
              document_type_id: document_type_id !== undefined ? document_type_id : existingProfile.Profile_document_type,
              document_number: document_number !== undefined ? document_number : existingProfile.Profile_document_number,
              photo_url: photo_url !== undefined ? photo_url : existingProfile.Profile_photo
            });
          } else {
            // If no profile exists and we have name fields, create one
            if (first_name && last_name) {
              profileUpdateResult = await ProfileModel.create({
                User_FK_ID: id,
                Profile_fullName: `${first_name} ${last_name}`,
                Profile_document_type: document_type_id || '',
                Profile_document_number: document_number || '',
                Profile_telephone_number: phone || '',
                Profile_photo: photo_url || null
              });
            }
          }
        }
      }

      // Get updated user data to return
      const updatedUser = await UserModel.findById(id);
      const updatedProfile = await ProfileModel.findByUserId(id);

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
        profile: updatedProfile,
        changes: {
          user: updateResult,
          profile: profileUpdateResult
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status_id } = req.body;

      if (!id || !status_id) {
        return res.status(400).json({ error: "User ID and status_id are required" });
      }

      const updateResult = await UserModel.updateStatus(id, status_id);

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "User status updated successfully",
        affectedRows: updateResult,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Get current user data
      const currentUser = await UserModel.findById(id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Instead of deleting, update the user status to inactive (status_id = 2)
      const updateResult = await UserModel.updateStatus(id, 2);

      if (updateResult.error) {
        return res.status(400).json({ error: updateResult.error });
      }

      // Get the updated user data to confirm the change
      const updatedUser = await UserModel.findById(id);

      res.status(200).json({
        message: "User inactivated successfully. All related data (guard, owner, etc.) is preserved.",
        user: updatedUser,
        previous_status: currentUser.User_status_FK_ID
      });
    } catch (error) {
      console.error("Error inactivating user:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      if (req.user.roleId === ROLES.OWNER && parseInt(id) !== parseInt(req.user.userId)) {
        return res.status(403).json({ error: "You don't have permission to access this user data" });
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      delete user.Users_password;

      res.status(200).json({
        message: "User found successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error finding user by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByName(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ error: "Name parameter is required" });
      }

      const user = await UserModel.findByName(name);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "User found successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error finding user by name:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMyProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID could not be determined" });
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      delete user.Users_password;

      res.status(200).json({
        message: "Your profile retrieved successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController(); 