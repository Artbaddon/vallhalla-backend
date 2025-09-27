import TenantModel from "../models/tenant.model.js";

class TenantController {
  async getAll(req, res) {
    try {
      // If user is an owner, only show their tenants
      if (req.user.roleId === 2) { // Assuming 2 is OWNER role ID
        const ownerId = req.ownerId;
        const tenants = await TenantModel.findByOwner(ownerId);
        
        return res.status(200).json({
          success: true,
          message: "Owner's tenants retrieved successfully",
          data: tenants,
          count: tenants.length
        });
      }
      
      // Otherwise show all tenants (admin)
      const tenants = await TenantModel.getAll();
      
      res.status(200).json({
        success: true,
        message: "All tenants retrieved successfully",
        data: tenants,
        count: tenants.length
      });
    } catch (error) {
      console.error("Error in getAll tenants:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving tenants"
      });
    }
  }

  async create(req, res) {
    try {
      const { 
        name, 
        document_type, 
        document_number, 
        email, 
        phone, 
        start_date, 
        end_date,
        owner_id 
      } = req.body;

      // Validate required fields
      if (!name || !document_number || !owner_id) {
        return res.status(400).json({
          success: false,
          error: "Name, document number, and owner ID are required"
        });
      }

      // If user is an owner, they can only create tenants for themselves
      if (req.user.roleId === 2) { // Assuming 2 is OWNER role ID
        if (owner_id !== req.ownerId) {
          return res.status(403).json({
            success: false,
            error: "You can only create tenants for your own apartments"
          });
        }
      }

      const tenantId = await TenantModel.create({
        name,
        document_type,
        document_number,
        email,
        phone,
        start_date,
        end_date,
        owner_id
      });

      if (!tenantId) {
        return res.status(500).json({
          success: false,
          error: "Failed to create tenant"
        });
      }

      res.status(201).json({
        success: true,
        message: "Tenant created successfully",
        data: { id: tenantId }
      });
    } catch (error) {
      console.error("Error in create tenant:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while creating tenant"
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Tenant ID is required"
        });
      }

      const tenant = await TenantModel.findById(id);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: "Tenant not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Tenant retrieved successfully",
        data: tenant
      });
    } catch (error) {
      console.error("Error in getById tenant:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving tenant"
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        document_type, 
        document_number, 
        email, 
        phone, 
        start_date, 
        end_date
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Tenant ID is required"
        });
      }

      const updateResult = await TenantModel.update(id, {
        name,
        document_type,
        document_number,
        email,
        phone,
        start_date,
        end_date
      });

      if (!updateResult) {
        return res.status(404).json({
          success: false,
          error: "Tenant not found or no changes made"
        });
      }

      res.status(200).json({
        success: true,
        message: "Tenant updated successfully",
        data: { id }
      });
    } catch (error) {
      console.error("Error in update tenant:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while updating tenant"
      });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Tenant ID is required"
        });
      }

      const deleteResult = await TenantModel.delete(id);

      if (!deleteResult) {
        return res.status(404).json({
          success: false,
          error: "Tenant not found or already deleted"
        });
      }

      res.status(200).json({
        success: true,
        message: "Tenant deleted successfully",
        data: { id }
      });
    } catch (error) {
      console.error("Error in remove tenant:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while deleting tenant"
      });
    }
  }

  async getMyTenants(req, res) {
    try {
      const userId = req.user.userId;

      // Get the owner ID from the user ID
      const owner = await TenantModel.findOwnerByUserId(userId);
      
      if (!owner) {
        return res.status(404).json({
          success: false,
          error: "Owner not found for this user"
        });
      }
      
      const tenants = await TenantModel.findByOwner(owner.Owner_id);
      
      res.status(200).json({
        success: true,
        message: "Owner's tenants retrieved successfully",
        data: tenants,
        count: tenants.length
      });
    } catch (error) {
      console.error("Error in getMyTenants:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving tenants"
      });
    }
  }
}

export default new TenantController(); 