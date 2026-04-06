import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { initializeFirebase } from "./config/firebase.js";
import { errorHandler } from "./middleware/errorHandler.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import requirementsRoutes from "./routes/requirementsRoutes.js";

dotenv.config();

initializeFirebase();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "REMT API is running"
  });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/requirements", requirementsRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(errorHandler);

export default app;
