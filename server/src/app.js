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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isLocalhost = origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");

      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
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
