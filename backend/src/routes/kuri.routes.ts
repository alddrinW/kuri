import { Router } from "express";
import { resolveKuri } from "../controllers/kuri.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/kuri/resolve/:token", optionalAuth, resolveKuri);

export default router;
