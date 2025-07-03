import express from "express";
import cors from "cors";
import { verifyToken, apiAccessMiddleware } from "../middleware/authMiddleware.js";

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

// Facility Management
import facilityRouter from "../routers/facility.router.js";

// Payment System
import paymentRouter from "../routers/payment.router.js";

// Security & Access
import guardRouter from "../routers/guard.router.js";
import visitorRouter from "../routers/visitor.router.js";

// Business Operations
import reservationRouter from "../routers/reservation.router.js";
import reservationStatusRouter from "../routers/reservationStatus.router.js";
import reservationTypeRouter from "../routers/reservationType.router.js";
import pqrsRouter from "../routers/pqrs.router.js";
import pqrsCategoryRouter from "../routers/pqrsCategory.router.js";
import notificationRouter from "../routers/notification.router.js";
import towerRouter from "../routers/tower.router.js";
import petRouter from "../routers/pet.router.js";
import parkingRouter from "../routers/parking.router.js";
import vehicleTypeRouter from "../routers/vehicleType.router.js";
import surveyRouter from "../routers/survey.router.js";
import questionRouter from "../routers/question.router.js";
import answerRouter from "../routers/answers.router.js";

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
// Option 1: Apply apiAccessMiddleware to all protected routes
// This will check permissions based on the rbacConfig.js file
app.use(name, verifyToken, apiAccessMiddleware);

// Core System Management
app.use(name + "/users", userRouter);
app.use(name + "/user-status", userStatusRouter);
app.use(name + "/profile", profileRouter);
app.use(name + "/roles", rolesRouter);
app.use(name + "/permissions", permissionsRouter);
app.use(name + "/role-permissions", rolePermissionsRouter);
app.use(name + "/modules", modulesRouter);

// Property Management
app.use(name + "/owners", ownerRouter);
app.use(name + "/apartments", apartmentRouter);
app.use(name + "/apartment-status", apartmentStatusRouter);

// Facility Management
app.use(name + "/facilities", facilityRouter);

// Payment System
app.use(name + "/payment", paymentRouter);

// Security & Access
app.use(name + "/guards", guardRouter);
app.use(name + "/visitors", visitorRouter);

// Business Operations
app.use(name + "/reservations", reservationRouter);
app.use(name + "/reservation-status", reservationStatusRouter);
app.use(name + "/reservation-types", reservationTypeRouter);
app.use(name + "/pqrs", pqrsRouter);
app.use(name + "/pqrs-categories", pqrsCategoryRouter);
app.use(name + "/notifications", notificationRouter);
app.use(name + "/towers", towerRouter);
app.use(name + "/pets", petRouter);
app.use(name + "/parking", parkingRouter);
app.use(name + "/vehicle-types", vehicleTypeRouter);  
app.use(name + "/surveys", surveyRouter);
app.use(name + "/questions", questionRouter);
app.use(name + "/answers", answerRouter);


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
