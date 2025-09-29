import RolePermission from "../models/rolePermissions.model.js";
import RoleModel from "../models/roles.model.js";
import Permissions from "../models/permissions.model.js";
import ModulesModel from "../models/modules.model.js";

class RolePermissionsController {
  async register(req, res) {
    try {
      const { roleId, permissionId, moduleId } = req.body;

      if (!roleId || !permissionId || !moduleId) {
        return res
          .status(400)
          .json({ error: "roleId, permissionId and moduleId are required" });
      }

      // Validate role exists
      const existingRole = await RoleModel.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Validate permission exists
      const existingPermission = await Permissions.findById(permissionId);
      if (!existingPermission) {
        return res.status(404).json({ error: "Permission not found" });
      }

      // Validate module exists
      const existingModule = await ModulesModel.findById(moduleId);
      if (!existingModule) {
        return res.status(404).json({ error: "Module not found" });
      }

      const rolePermissionResult = await RolePermission.create({
        roleId,
        permissionId,
        moduleId
      });

      if (rolePermissionResult.error) {
        return res.status(400).json({ error: rolePermissionResult.error, message: rolePermissionResult.message });
      }

      const statusCode = rolePermissionResult.alreadyExists ? 200 : 201;

      res.status(statusCode).json({
        message: rolePermissionResult.alreadyExists
          ? "Permission was already assigned to this role/module"
          : "Role-Permission created successfully",
        id: rolePermissionResult.id,
        alreadyExists: rolePermissionResult.alreadyExists || false
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const showRolePermission = await RolePermission.show();

      if (showRolePermission.error) {
        return res.status(500).json({ error: showRolePermission.error });
      }

      res.status(200).json({
        message: "RolePermissions retrieved successfully",
        RolePermissions: showRolePermission,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { roleId, permissionId, moduleId } = req.body;

      if (!roleId || !permissionId || !id) {
        return res
          .status(400)
          .json({ error: "roleId, permissionId and ID are required" });
      }

      // Validate role exists
      const existingRole = await RoleModel.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Validate permission exists
      const existingPermission = await Permissions.findById(permissionId);
      if (!existingPermission) {
        return res.status(404).json({ error: "Permission not found" });
      }

      // If moduleId is provided, validate it exists
      if (moduleId) {
        const existingModule = await ModulesModel.findById(moduleId);
        if (!existingModule || existingModule.length === 0) {
          return res.status(404).json({ error: "Module not found" });
        }
      }

      const updateRolePermission = await RolePermission.update(id, {
        roleId,
        permissionId,
        moduleId
      });

      if (updateRolePermission.error) {
        return res.status(400).json({ error: updateRolePermission.error });
      }

      res.status(200).json({
        message: "RolePermission updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating RolePermission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteRolePermission = await RolePermission.delete(id);

      if (deleteRolePermission.error) {
        return res.status(404).json({ error: deleteRolePermission.error });
      }

      res.status(200).json({
        message: "RolePermission deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting RolePermission:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingRolePermission = await RolePermission.findById(id);

      if (!existingRolePermission) {
        return res.status(404).json({ error: "RolePermission not found" });
      }

      res.status(200).json({
        message: "RolePermission found successfully",
        rolePermission: existingRolePermission,
      });
    } catch (error) {
      console.error("Error finding RolePermission by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new RolePermissionsController();
