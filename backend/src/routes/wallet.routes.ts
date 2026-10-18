import { Router } from "express";
import { getWallet, transferLostKeychain } from "../controllers/wallet.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/wallet", requireAuth, getWallet);
router.post("/wallet/transfer", requireAuth, transferLostKeychain);

export default router;
