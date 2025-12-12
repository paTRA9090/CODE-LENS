// backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

const VITE_DEV_SERVER = process.env.VITE_SERVER || "http://localhost:5173";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || VITE_DEV_SERVER;

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  // serve built frontend
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // use '/*' instead of '*' to avoid path-to-regexp error
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
} else {
  // DEV: proxy to Vite dev server so you can open backend port and see frontend (HMR preserved)
  app.use(
    "/",
    createProxyMiddleware({
      target: VITE_DEV_SERVER,
      changeOrigin: true,
      ws: true,
      logLevel: "info",
      onError(err, req, res) {
        res.writeHead(502, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<html><body style="font-family:system-ui, Arial;">
            <h2>Frontend dev server not available</h2>
            <p>Express tried to proxy to <code>${VITE_DEV_SERVER}</code> but couldn't reach it.</p>
            <p>Start frontend: <code>cd frontend && npm run dev</code></p>
          </body></html>`
        );
      },
    })
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB().catch((err) => {
    console.error("DB connect failed:", err);
  });
});


