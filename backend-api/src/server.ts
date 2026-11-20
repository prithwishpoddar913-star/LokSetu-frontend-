import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to Stamp Safar API",
    status: "Running",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Stamp Safar Backend",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stamp Safar API running on port ${PORT}`);
});