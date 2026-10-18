import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export async function resolveKuri(req: AuthenticatedRequest, res: Response) {
  try {
    const rawToken = String(req.params.token).trim();
    const cleanToken = rawToken.toUpperCase();
    const user = req.user;

    const keychain = await prisma.keychain.findFirst({
      where: {
        OR: [{ token: cleanToken }, { id: rawToken }],
      },
      include: {
        store: {
          include: {
            campaign: true,
            rewards: {
              where: { isActive: true },
              orderBy: { costInGold: "asc" },
            },
            products: {
              where: { isAvailable: true },
              take: 8,
            },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!keychain) {
      return res.status(404).json({ error: "Llavero Kuri no encontrado o no registrado en el sistema" });
    }

    const store = keychain.store;

    if (store.subscriptionStatus === "SUSPENDED") {
      return res.json({
        success: false,
        isSuspended: true,
        error: "Servicio suspendido: Este comercio mantiene una mensualidad pendiente. El catálogo y sistema de fidelidad se encuentran inactivos.",
        store: {
          id: store.id,
          slug: store.slug,
          name: store.name,
          category: store.category,
          subscriptionStatus: "SUSPENDED",
        },
        keychain: {
          id: keychain.id,
          token: keychain.token,
        },
      });
    }

    const unclaimedLedgers = await prisma.unclaimedLedger.findMany({
      where: { keychainToken: keychain.token, isClaimed: false },
    });
    const unclaimedBonus = unclaimedLedgers.reduce((acc, curr) => acc + curr.goldAmount, 0);

    let context: "STORE_PUBLIC" | "KEYCHAIN_UNACTIVATED" | "CUSTOMER_CARD" | "STAFF_TERMINAL" | "OTHER_STORE_STAFF" = "STORE_PUBLIC";

    const isOwnerOfStore = user && user.role === "STORE_OWNER" && (await prisma.store.count({ where: { id: store.id, ownerId: user.id } })) > 0;
    const isStaffOfStore = user && (user.role === "STORE_STAFF" || isOwnerOfStore) && (user.staffStoreId === store.id || isOwnerOfStore);
    const isSuperAdmin = user && user.role === "SUPER_ADMIN";

    let canAddGold = true;
    let cooldownRemainingMinutes = 0;
    let lastTransaction = null;

    if (isStaffOfStore || isSuperAdmin) {
      context = "STAFF_TERMINAL";

      lastTransaction = await prisma.loyaltyTransaction.findFirst({
        where: { keychainId: keychain.id, storeId: store.id },
        orderBy: { createdAt: "desc" },
      });

      if (lastTransaction && store.campaign) {
        const cooldownMs = store.campaign.cooldownMinutes * 60 * 1000;
        const elapsedMs = Date.now() - new Date(lastTransaction.createdAt).getTime();
        if (elapsedMs < cooldownMs) {
          canAddGold = false;
          cooldownRemainingMinutes = Math.ceil((cooldownMs - elapsedMs) / (60 * 1000));
        }
      }
    } else if (user && user.role === "STORE_STAFF" && user.staffStoreId !== store.id) {
      context = "OTHER_STORE_STAFF";
    } else if (user && keychain.customerId === user.id) {
      context = "CUSTOMER_CARD";
    } else if (!keychain.customerId) {
      context = "KEYCHAIN_UNACTIVATED";
    } else {
      context = "STORE_PUBLIC";
    }

    let customerLoyalty = null;
    let transactionHistory: any[] = [];

    if (keychain.customerId) {
      customerLoyalty = await prisma.customerLoyalty.findUnique({
        where: {
          customerId_storeId: {
            customerId: keychain.customerId,
            storeId: store.id,
          },
        },
      });

      transactionHistory = await prisma.loyaltyTransaction.findMany({
        where: {
          customerId: keychain.customerId,
          storeId: store.id,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }

    return res.json({
      success: true,
      context,
      userRole: user?.role || "GUEST",
      keychain: {
        id: keychain.id,
        token: keychain.token,
        status: keychain.status,
        isActivated: !!keychain.customerId,
        customerName: keychain.customer?.name || null,
        customerId: keychain.customerId,
      },
      store: {
        id: store.id,
        slug: store.slug,
        name: store.name,
        tagLine: store.tagLine,
        description: store.description,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        address: store.address,
        phone: store.phone,
        whatsapp: store.whatsapp,
        category: store.category,
        scheduleText: store.scheduleText,
        isOpenManual: store.isOpenManual,
        campaign: store.campaign,
      },
      customerLoyalty: customerLoyalty
        ? {
            currentGold: customerLoyalty.currentGold,
            lifetimeGold: customerLoyalty.lifetimeGold,
            tier: customerLoyalty.tier,
          }
        : null,
      unclaimedBonus,
      canAddGold,
      cooldownRemainingMinutes,
      lastTransaction: lastTransaction
        ? {
            createdAt: lastTransaction.createdAt,
            goldAmount: lastTransaction.goldAmount,
            type: lastTransaction.type,
          }
        : null,
      rewards: store.rewards,
      products: store.products,
      recentTransactions: transactionHistory,
    });
  } catch (error) {
    console.error("Error resolviendo llavero Kuri en backend:", error);
    return res.status(500).json({ error: "Error procesando el código del llavero" });
  }
}
