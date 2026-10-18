import { Router } from "express";
import {
  listStores,
  getStoreBySlug,
  updateStore,
  updateStoreProfile,
  getStoreDashboard,
  // Gestión de Productos
  listStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  // Horarios y Operación en Vivo
  getStoreSchedules,
  updateStoreSchedules,
  toggleStoreOpenStatus,
  // Solicitud y Pedidos de Llaveros
  listKeychainOrders,
  createKeychainOrder,
  // Campañas Polimórficas de Fidelidad y Descuentos
  getStoreCampaigns,
  updateMainCampaign,
  createPromoCampaign,
  updatePromoCampaign,
  deletePromoCampaign,
} from "../controllers/store.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas Públicas de Tiendas
router.get("/stores", listStores);
router.get("/stores/:slug", getStoreBySlug);

// Dashboard General y Perfil de Tienda
router.put("/stores/:slug", requireAuth, updateStore);
router.put("/store/profile", requireAuth, updateStoreProfile);
router.get("/store/dashboard", requireAuth, getStoreDashboard);

// Módulo de Catálogo y Productos
router.get("/store/products", requireAuth, listStoreProducts);
router.post("/store/products", requireAuth, createStoreProduct);
router.put("/store/products/:id", requireAuth, updateStoreProduct);
router.delete("/store/products/:id", requireAuth, deleteStoreProduct);

// Módulo de Horarios y Apertura en Vivo
router.get("/store/schedules", requireAuth, getStoreSchedules);
router.put("/store/schedules", requireAuth, updateStoreSchedules);
router.put("/store/toggle-status", requireAuth, toggleStoreOpenStatus);

// Módulo de Solicitud y Pedidos de Llaveros Físicos
router.get("/store/keychain-orders", requireAuth, listKeychainOrders);
router.post("/store/keychain-orders", requireAuth, createKeychainOrder);

// Módulo de Campañas de Fidelidad y Descuentos
router.get("/store/campaigns", requireAuth, getStoreCampaigns);
router.put("/store/campaign/main", requireAuth, updateMainCampaign);
router.post("/store/campaigns/promo", requireAuth, createPromoCampaign);
router.put("/store/campaigns/promo/:id", requireAuth, updatePromoCampaign);
router.delete("/store/campaigns/promo/:id", requireAuth, deletePromoCampaign);

export default router;
