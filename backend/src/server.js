import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 5001;

// CORS (OK for local dev. In prod the frontend is served by backend → no CORS needed)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// ---------- PRODUCTION FRONTEND SERVING ----------
const __dirname = path.resolve();

// Since server.js is in backend/src/, go up TWO levels → root folder → frontend/dist
const frontendDistPath = path.join(__dirname, "..", "..", "frontend", "dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistPath));

  // SAFE catch-all route
  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});


