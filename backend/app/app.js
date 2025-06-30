import express from "express";
import cors from "cors";
import { verifyToken } from "../middleware/authMiddleware.js";

// Import all routers
import authRouter from "../routers/auth.router.js";
import userRouter from "../routers/user.router.js";
import userStatusRouter from "../routers/userStatus.router.js";
import profileRouter from "../routers/profile.router.js";
import rolesRouter from "../routers/roles.router.js";
import permissionsRouter from "../routers/permissions.router.js";
import rolePermissionsRouter from "../routers/rolesPermissions.js";
import modulesRouter from "../routers/modules.router.js";

// Property Management
import ownerRouter from "../routers/owner.router.js";
import apartmentRouter from "../routers/apartment.router.js";
import apartmentStatusRouter from "../routers/apartmentStatus.router.js";

// Payment System
import paymentRouter from "../routers/payment.router.js";

// Security & Access
import guardRouter from "../routers/guard.router.js";
import visitorRouter from "../routers/visitor.router.js";

// Business Operations
import reservationRouter from "../routers/reservation.router.js";
import pqrsRouter from "../routers/pqrs.router.js";
import pqrsCategoryRouter from "../routers/pqrsCategory.router.js";
import notificationRouter from "../routers/notification.router.js";

// Legacy routers (keeping for compatibility)
import apiUserRouter from "../routers/apiUser.router.js";
import webUserRouter from "../routers/webUser.router.js";

const name = "/api";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== PUBLIC ROUTES (No authentication required) =====

// Authentication
app.use(name + "/auth", authRouter);

// ===== PROTECTED ROUTES (Authentication required) =====

// Core System Management
app.use(name + "/users", verifyToken, userRouter);
app.use(name + "/user-status", verifyToken, userStatusRouter);
app.use(name + "/profile", verifyToken, profileRouter);
app.use(name + "/roles", verifyToken, rolesRouter);
app.use(name + "/permissions", verifyToken, permissionsRouter);
app.use(name + "/role-permissions", verifyToken, rolePermissionsRouter);
app.use(name + "/modules", verifyToken, modulesRouter);

// Property Management
app.use(name + "/owners", verifyToken, ownerRouter);
app.use(name + "/apartments", verifyToken, apartmentRouter);
app.use(name + "/apartment-status", verifyToken, apartmentStatusRouter);

// Payment System
app.use(name + "/payments", verifyToken, paymentRouter);

// Security & Access
app.use(name + "/guards", verifyToken, guardRouter);
app.use(name + "/visitors", verifyToken, visitorRouter);

// Business Operations
app.use(name + "/reservations", verifyToken, reservationRouter);
app.use(name + "/pqrs", verifyToken, pqrsRouter);
app.use(name + "/pqrs-categories", verifyToken, pqrsCategoryRouter);
app.use(name + "/notifications", verifyToken, notificationRouter);

// ===== LEGACY ROUTES (For backward compatibility) =====
app.use(name + "/api-users", verifyToken, apiUserRouter);
app.use(name + "/web-users", verifyToken, webUserRouter);

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;
