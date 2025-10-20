import { Router } from "express";
import PetController from "../controllers/pet.controller.js";
import { requirePermission, requireOwnership, requireRoles } from "../middleware/permissionMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();

// Owners manage their pets (admin bypasses automatically)
router.use(requireRoles(ROLES.OWNER));

// Protected routes
// Admin can see all pets
router.get("/", 
  requirePermission("pets", "read"),
  PetController.show
);

router.get("/report", 
  requirePermission("pets", "read"),
  PetController.downloadPetReport
);

// Create pet
router.post("/",
  requirePermission("pets", "create"),
  PetController.register
);

// Get my pets
router.get("/my/pets",
  requirePermission("pets", "read"),
  PetController.getMyPets
);

// View specific pet (owners can only see their own)
router.get("/:id",
  requirePermission("pets", "read"),
  requireOwnership("pet"),
  PetController.findById
);

// Update pet (owners can only update their own)
router.put("/:id",
  requirePermission("pets", "update"),
  requireOwnership("pet"),
  PetController.update
);

// Delete pet (owners can only delete their own)
router.delete("/:id",
  requirePermission("pets", "delete"),
  requireOwnership("pet"),
  PetController.delete
);

export default router;
