import Permission from "../models/permissions.model.js";

class PermissionsController {
  async register(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Permission name is required" });
      }

      const permissionId = await Permission.create(name);

      if (permissionId.error) {
        return res.status(400).json({ error: permissionId.error });
      }

      res.status(201).json({
        message: "Permission created successfully",
        id: permissionId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const permissions = await Permission.getPermissions();

      if (permissions.error) {
        return res.status(500).json({ error: permissions.error });
      }

      res.status(200).json({
        message: "Permissions retrieved successfully",
        permissions: permissions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Permission name is required" });
      }

      const result = await Permission.update(id, { name });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "Permission not found" });
      }

      res.status(200).json({
        message: "Permission updated successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Permission ID is required" });
      }

      const result = await Permission.delete(id);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      if (result === 0) {
        return res.status(404).json({ error: "Permission not found" });
      }

      res.status(200).json({
        message: "Permission deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Permission ID is required" });
      }

      const permission = await Permission.findById(id);

      if (!permission || permission.error) {
        return res.status(404).json({ error: "Permission not found" });
      }

      res.status(200).json({
        message: "Permission found successfully",
        permission: permission
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // New methods for handling user permissions
  async getUserPermissions(req, res) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      const permissions = await Permission.getUserPermissions(roleId);

      if (!permissions) {
        return res.status(404).json({ error: "No permissions found for this role" });
      }

      res.status(200).json({
        message: "User permissions retrieved successfully",
        permissions: permissions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async checkPermission(req, res) {
    try {
      const { roleId } = req.params;
      const { moduleName, permissionName } = req.body;

      if (!roleId || !moduleName || !permissionName) {
        return res.status(400).json({ 
          error: "Role ID, module name, and permission name are required" 
        });
      }

      const hasPermission = await Permission.checkPermission(
        roleId, 
        moduleName, 
        permissionName
      );

      res.status(200).json({
        message: "Permission check completed",
        hasPermission: hasPermission
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getModulePermissions(req, res) {
    try {
      const { moduleId } = req.params;

      if (!moduleId) {
        return res.status(400).json({ error: "Module ID is required" });
      }

      const permissions = await Permission.getModulePermissions(moduleId);

      res.status(200).json({
        message: "Module permissions retrieved successfully",
        permissions: permissions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRoleModules(req, res) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      const modules = await Permission.getRoleModules(roleId);

      res.status(200).json({
        message: "Role modules retrieved successfully",
        modules: modules
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PermissionsController();
