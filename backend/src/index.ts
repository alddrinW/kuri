import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import kuriRoutes from "./routes/kuri.routes.js";
import posRoutes from "./routes/pos.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middlewares globales
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());

// Rutas de API
app.use("/api/auth", authRoutes);
app.use("/api", storeRoutes);
app.use("/api", kuriRoutes);
app.use("/api", posRoutes);
app.use("/api", walletRoutes);
app.use("/api", adminRoutes);
app.use("/api", uploadRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "kuri-backend", timestamp: new Date() });
});

// Manejador de 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada en el backend` });
});

app.listen(PORT, () => {
  console.log(`Servidor KURI Backend ejecutándose en http://localhost:${PORT}`);
  console.log(`CORS habilitado para: ${FRONTEND_URL}`);
});

export default app;
