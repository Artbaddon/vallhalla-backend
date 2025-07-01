import express from "express";
import cors from "cors";
import { verifyToken } from "../middleware/authMiddleware.js";


import PetRouter from "../routers/pet.router.js";


const name = "/api_v1";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protected routes (authentication required)
app.use(name, PetRouter);


app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
});

export default app;
