import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export async function getWallet(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const loyalties = await prisma.customerLoyalty.findMany({
      where: { customerId: user.id },
      include: {
        store: {
          include: {
            rewards: {
              where: { isActive: true },
              orderBy: { costInGold: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const keychains = await prisma.keychain.findMany({
      where: { customerId: user.id, status: "ACTIVATED_USER" },
      include: {
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { customerId: user.id },
      include: {
        store: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const totalCurrentGold = loyalties.reduce((acc, curr) => acc + curr.currentGold, 0);
    const totalLifetimeGold = loyalties.reduce((acc, curr) => acc + curr.lifetimeGold, 0);

    const cards = loyalties.map((item) => {
      const nextReward = item.store.rewards.find((r) => r.costInGold > item.currentGold) || null;
      const canRedeemRewards = item.store.rewards.filter((r) => r.costInGold <= item.currentGold);
      const associatedKeychain = keychains.find((k) => k.storeId === item.storeId);

      return {
        id: item.id,
        storeId: item.store.id,
        storeName: item.store.name,
        storeSlug: item.store.slug,
        storeCategory: item.store.category,
        storeLogo: item.store.logoUrl,
        storeBanner: item.store.bannerUrl,
        currentGold: item.currentGold,
        lifetimeGold: item.lifetimeGold,
        tier: item.tier,
        keychainToken: associatedKeychain?.token || null,
        nextReward: nextReward
          ? {
              id: nextReward.id,
              title: nextReward.title,
              costInGold: nextReward.costInGold,
              goldNeeded: nextReward.costInGold - item.currentGold,
              progressPercent: Math.min(100, Math.round((item.currentGold / nextReward.costInGold) * 100)),
            }
          : null,
        canRedeemCount: canRedeemRewards.length,
        rewards: item.store.rewards,
      };
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      stats: {
        totalCurrentGold,
        totalLifetimeGold,
        activeStoresCount: cards.length,
      },
      cards,
      keychains,
      transactions,
    });
  } catch (error) {
    console.error("Error al obtener billetera de cliente en backend:", error);
    return res.status(500).json({ error: "Error al cargar la billetera" });
  }
}

export async function transferLostKeychain(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { oldKeychainId, newKeychainToken } = req.body;

    if (!oldKeychainId || !newKeychainToken) {
      return res.status(400).json({
        error: "Se requiere el ID del llavero anterior y el código del nuevo llavero",
      });
    }

    const oldKeychainIdParam = String(oldKeychainId).trim().toUpperCase();
    const newKeychainTokenParam = String(newKeychainToken).trim().toUpperCase();

    const oldKeychain = await prisma.keychain.findFirst({
      where: {
        OR: [{ id: String(oldKeychainId).trim() }, { token: oldKeychainIdParam }],
      },
      include: { store: true },
    });

    if (!oldKeychain || oldKeychain.customerId !== user.id) {
      return res.status(404).json({ error: "Llavero anterior no válido o no pertenece a tu cuenta" });
    }

    const newKeychain = await prisma.keychain.findFirst({
      where: {
        OR: [{ token: newKeychainTokenParam }, { id: String(newKeychainToken).trim() }],
      },
    });

    if (!newKeychain) {
      return res.status(404).json({ error: "El nuevo código de llavero Kuri no existe en el sistema" });
    }

    if (newKeychain.customerId && newKeychain.customerId !== user.id) {
      return res.status(409).json({ error: "El nuevo llavero ya se encuentra vinculado a otra cuenta activa" });
    }

    if (newKeychain.storeId !== oldKeychain.storeId) {
      return res.status(400).json({
        error: `Este nuevo llavero fue asignado a otra tienda (${newKeychain.storeId}). Solicita un llavero de ${oldKeychain.store.name}.`,
      });
    }

    await prisma.$transaction([
      prisma.keychain.update({
        where: { id: oldKeychain.id },
        data: {
          status: "LOST",
          customerId: null,
        },
      }),
      prisma.keychain.update({
        where: { id: newKeychain.id },
        data: {
          status: "ACTIVATED_USER",
          customerId: user.id,
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          storeId: oldKeychain.storeId,
          customerId: user.id,
          keychainId: newKeychain.id,
          staffId: user.id,
          goldAmount: 0,
          type: "TRANSFER",
          note: `Reemplazo de Kuri extraviado (${oldKeychain.token} ➡️ ${newKeychain.token})`,
        },
      }),
    ]);

    return res.json({
      success: true,
      message: `¡Llavero transferido exitosamente! Tu nuevo Kuri activo es ${newKeychain.token}.`,
      newKeychainToken: newKeychain.token,
    });
  } catch (error) {
    console.error("Error al transferir llavero extraviado en backend:", error);
    return res.status(500).json({ error: "Error procesando la transferencia de llavero" });
  }
}
