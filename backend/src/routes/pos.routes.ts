import { Router } from "express";
import { handlePosAction } from "../controllers/pos.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/pos/action", requireAuth, handlePosAction);

export default router;
