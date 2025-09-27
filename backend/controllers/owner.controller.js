import { ROLES } from "../middleware/rbacConfig.js";
import OwnerModel from "../models/owner.model.js";
import UserModel from "../models/user.model.js";
import ProfileModel from "../models/profile.model.js";

class OwnerController {
  async register(req, res) {
    try {
      const { 
        username, 
        password, 
        user_status_id, 
        role_id, 
        is_tenant, 
        birth_date,
        // Profile fields as independent arguments
        first_name,
        last_name,
        document_type,
        document_number,
        phone,
        photo_url
      } = req.body;

      // Validate required fields
      if (!username || !password || !user_status_id || !role_id || is_tenant === undefined || !birth_date) {
        return res
          .status(400)
          .json({ error: "username, password, user_status_id, role_id, is_tenant, and birth_date are required" });
      }

      // Validate profile data
      if (!first_name || !last_name) {
        return res
          .status(400)
          .json({ error: "first_name and last_name are required" });
      }

      const result = await OwnerModel.create({
        username,
        password,
        user_status_id,
        role_id,
        is_tenant,
        birth_date,
        profile_data: {
          first_name,
          last_name,
          document_type,
          document_number,
          phone,
          photo_url
        }
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        message: "Owner created successfully with user and profile",
        owner_id: result.owner_id,
        user_id: result.user_id
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const owners = await OwnerModel.show();

      if (owners.error) {
        return res.status(400).json({ error: owners.error });
      }

      if (!owners || owners.length === 0) {
        return res.status(404).json({ error: "No owners found" });
      }

      res.status(200).json({
        message: "Owners retrieved successfully",
        owners: owners,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showWithDetails(req, res) {
    try {
      const owners = await OwnerModel.getOwnersWithDetails();

      if (owners.error) {
        return res.status(400).json({ error: owners.error });
      }

      if (!owners || owners.length === 0) {
        return res.status(404).json({ error: "No owners found" });
      }

      res.status(200).json({
        message: "Owners with details retrieved successfully",
        owners: owners,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { 
        username, 
        password, 
        user_status_id, 
        role_id, 
        is_tenant, 
        birth_date,
        // Profile fields
        first_name,
        last_name,
        document_type,
        document_number,
        phone,
        photo_url
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      // At least one field must be provided for update
      if (!username && !password && !user_status_id && !role_id && 
          is_tenant === undefined && !birth_date && !first_name && 
          !last_name && !document_type && !document_number && !phone && !photo_url) {
        return res.status(400).json({ error: "At least one field must be provided for update" });
      }

      // If first_name is provided, last_name must also be provided and vice versa
      if ((first_name && !last_name) || (!first_name && last_name)) {
        return res.status(400).json({ error: "Both first_name and last_name must be provided together" });
      }

      const updateResult = await OwnerModel.update(id, {
        username,
        password,
        user_status_id,
        role_id,
        is_tenant,
        birth_date,
        first_name,
        last_name,
        document_type,
        document_number,
        phone,
        photo_url
      });

      if (updateResult.error) {
        return res.status(400).json({ error: updateResult.error });
      }

      // Get the updated owner details
      const updatedOwner = await OwnerModel.getOwnerWithDetails(id);
      if (updatedOwner.error) {
        return res.status(400).json({ error: updatedOwner.error });
      }

      // Create a summary of what was updated
      const updates = {
        owner: is_tenant !== undefined || birth_date ? {
          is_tenant: is_tenant,
          birth_date: birth_date
        } : undefined,
        user: username || password || user_status_id || role_id ? {
          username,
          user_status_id,
          role_id,
          password: password ? "updated" : undefined
        } : undefined,
        profile: first_name || document_type || document_number || phone || photo_url ? {
          full_name: first_name && last_name ? `${first_name} ${last_name}` : undefined,
          document_type,
          document_number,
          phone,
          photo_url
        } : undefined
      };

      res.status(200).json({
        message: "Owner updated successfully with user and profile data",
        success: true,
        updated_fields: updates,
        current_data: updatedOwner
      });
    } catch (error) {
      console.error("Error updating owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      // Get the user ID associated with this owner
      const owner = await OwnerModel.findById(id);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      // Instead of deleting, update the user status to inactive
      const updateResult = await OwnerModel.update(id, {
        user_status_id: 2, // 2 is 'Inactive' in user_status table
      });

      if (updateResult.error) {
        return res.status(400).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Owner inactivated successfully. Their apartments and other data are preserved.",
        owner_id: id
      });
    } catch (error) {
      console.error("Error inactivating owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      // If user is an owner, verify they're accessing their own data
      if (req.user.roleId === ROLES.OWNER && parseInt(id) !== parseInt(req.ownerId)) {
        return res.status(403).json({ error: "You don't have permission to access this owner data" });
      }

      const owner = await OwnerModel.findById(id);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findWithDetails(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      // If user is an owner, verify they're accessing their own data
      if (req.user.roleId === ROLES.OWNER && parseInt(id) !== parseInt(req.ownerId)) {
        return res.status(403).json({ error: "You don't have permission to access this owner data" });
      }

      const owner = await OwnerModel.getOwnerWithDetails(id);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner with details found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner with details:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByUserId(req, res) {
    try {
      const { user_id } = req.query;
      let userId = user_id;

      // If user is an owner, they can only see their own data
      if (req.user.roleId === ROLES.OWNER) {
        userId = req.user.userId;
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const owner = await OwnerModel.findByUserId(userId);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner by user ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // New method to get the profile of the currently logged-in owner
  async getMyProfile(req, res) {
    try {
      // This endpoint should only be accessible by owners
      if (req.user.roleId !== ROLES.OWNER) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID could not be determined" });
      }

      // First get the owner record
      const owner = await OwnerModel.findByUserId(userId);
      
      if (!owner) {
        return res.status(404).json({ error: "Owner profile not found" });
      }
      
      // Then get the detailed profile
      const ownerWithDetails = await OwnerModel.getOwnerWithDetails(owner.Owner_id);

      if (!ownerWithDetails) {
        return res.status(404).json({ error: "Owner details not found" });
      }

      res.status(200).json({
        message: "Your profile retrieved successfully",
        profile: ownerWithDetails,
      });
    } catch (error) {
      console.error("Error finding owner's profile:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new OwnerController(); 