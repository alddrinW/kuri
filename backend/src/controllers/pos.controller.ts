import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export async function handlePosAction(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const { token, actionType, purchaseAmount, rewardId, note } = req.body;

    if (!token || !actionType) {
      return res.status(400).json({ error: "Token de llavero y tipo de acción requeridos" });
    }

    const cleanToken = String(token).trim().toUpperCase();
    const normAction = String(actionType).trim().toUpperCase();

    const isVisit = normAction === "ADD_VISIT" || normAction === "VISIT" || normAction === "STAMP";
    const isAmount = normAction === "ADD_AMOUNT" || normAction === "ADD_PURCHASE" || normAction === "PURCHASE";
    const isRedeem = normAction === "REDEEM_REWARD" || normAction === "REDEEM";

    const keychain = await prisma.keychain.findFirst({
      where: {
        OR: [{ token: cleanToken }, { id: cleanToken }],
      },
      include: {
        store: { include: { campaign: true } },
      },
    });

    if (!keychain) {
      return res.status(404).json({ error: "Llavero no encontrado" });
    }

    const { store } = keychain;

    const isOwner = user.role === "STORE_OWNER" && (await prisma.store.count({ where: { id: store.id, ownerId: user.id } })) > 0;
    const isStaff = user.role === "STORE_STAFF" && user.staffStoreId === store.id;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    if (!isOwner && !isStaff && !isSuperAdmin) {
      return res.status(403).json({ error: "No tienes permisos de caja para esta tienda" });
    }

    if (store.subscriptionStatus === "SUSPENDED") {
      return res.status(403).json({
        error: "Servicio de fidelización suspendido: Este comercio mantiene una mensualidad pendiente. Las funciones de caja KURI están deshabilitadas.",
        subscriptionSuspended: true,
      });
    }

    if (isVisit) {
      if (store.campaign && store.campaign.cooldownMinutes > 0) {
        const lastTx = await prisma.loyaltyTransaction.findFirst({
          where: { keychainId: keychain.id, storeId: store.id },
          orderBy: { createdAt: "desc" },
        });

        if (lastTx) {
          const cooldownMs = store.campaign.cooldownMinutes * 60 * 1000;
          const elapsedMs = Date.now() - new Date(lastTx.createdAt).getTime();
          if (elapsedMs < cooldownMs) {
            const remainingMins = Math.ceil((cooldownMs - elapsedMs) / (60 * 1000));
            return res.status(429).json({
              error: `Control de cooldown activo: Espera ${remainingMins} minuto(s) antes de la siguiente visita.`,
            });
          }
        }
      }

      const goldToAdd = store.campaign ? store.campaign.goldPerVisit : 1;

      if (keychain.customerId) {
        const updatedLoyalty = await prisma.customerLoyalty.upsert({
          where: {
            customerId_storeId: {
              customerId: keychain.customerId,
              storeId: store.id,
            },
          },
          create: {
            customerId: keychain.customerId,
            storeId: store.id,
            currentGold: goldToAdd,
            lifetimeGold: goldToAdd,
            tier: goldToAdd >= 15 ? "GOLD" : goldToAdd >= 8 ? "SILVER" : "BRONZE",
          },
          update: {
            currentGold: { increment: goldToAdd },
            lifetimeGold: { increment: goldToAdd },
          },
        });

        if (updatedLoyalty.lifetimeGold >= 15 && updatedLoyalty.tier !== "GOLD") {
          await prisma.customerLoyalty.update({
            where: { id: updatedLoyalty.id },
            data: { tier: "GOLD" },
          });
        } else if (updatedLoyalty.lifetimeGold >= 8 && updatedLoyalty.tier === "BRONZE") {
          await prisma.customerLoyalty.update({
            where: { id: updatedLoyalty.id },
            data: { tier: "SILVER" },
          });
        }

        await prisma.loyaltyTransaction.create({
          data: {
            storeId: store.id,
            customerId: keychain.customerId,
            keychainId: keychain.id,
            staffId: user.id,
            goldAmount: goldToAdd,
            type: "VISIT",
            note: note || "Visita confirmada en caja",
          },
        });

        return res.json({
          success: true,
          message: `¡Se acreditó ${goldToAdd} de Oro exitosamente!`,
          goldAdded: goldToAdd,
          newCurrentGold: updatedLoyalty.currentGold,
          tier: updatedLoyalty.tier,
          isUnclaimed: false,
        });
      } else {
        await prisma.unclaimedLedger.create({
          data: {
            keychainToken: token,
            storeId: store.id,
            goldAmount: goldToAdd,
            staffId: user.id,
            isClaimed: false,
          },
        });

        await prisma.loyaltyTransaction.create({
          data: {
            storeId: store.id,
            keychainId: keychain.id,
            staffId: user.id,
            goldAmount: goldToAdd,
            type: "VISIT",
            note: note || "Visita guardada en llavero físico pre-activación",
          },
        });

        return res.json({
          success: true,
          message: `Se guardó ${goldToAdd} de Oro en el llavero físico pre-activación.`,
          goldAdded: goldToAdd,
          isUnclaimed: true,
        });
      }
    }

    if (isAmount) {
      const amount = Number(purchaseAmount);
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Monto de compra no válido" });
      }

      const ratio = store.campaign?.goldRatioAmount || 10.0;
      const goldToAdd = Math.max(1, Math.floor(amount / ratio));

      if (keychain.customerId) {
        const updatedLoyalty = await prisma.customerLoyalty.upsert({
          where: {
            customerId_storeId: {
              customerId: keychain.customerId,
              storeId: store.id,
            },
          },
          create: {
            customerId: keychain.customerId,
            storeId: store.id,
            currentGold: goldToAdd,
            lifetimeGold: goldToAdd,
            tier: goldToAdd >= 15 ? "GOLD" : goldToAdd >= 8 ? "SILVER" : "BRONZE",
          },
          update: {
            currentGold: { increment: goldToAdd },
            lifetimeGold: { increment: goldToAdd },
          },
        });

        await prisma.loyaltyTransaction.create({
          data: {
            storeId: store.id,
            customerId: keychain.customerId,
            keychainId: keychain.id,
            staffId: user.id,
            goldAmount: goldToAdd,
            type: "PURCHASE",
            note: `Compra de $${amount.toFixed(2)} (${goldToAdd} Oro)`,
          },
        });

        return res.json({
          success: true,
          message: `¡Se acreditó ${goldToAdd} de Oro por compra de $${amount.toFixed(2)}!`,
          goldAdded: goldToAdd,
          newCurrentGold: updatedLoyalty.currentGold,
        });
      } else {
        await prisma.unclaimedLedger.create({
          data: {
            keychainToken: keychain.token,
            storeId: store.id,
            goldAmount: goldToAdd,
            staffId: user.id,
            isClaimed: false,
          },
        });

        return res.json({
          success: true,
          message: `Se guardó ${goldToAdd} de Oro por consumo de $${amount.toFixed(2)} en el llavero físico pre-activación.`,
          goldAdded: goldToAdd,
          isUnclaimed: true,
        });
      }
    }

    if (isRedeem) {
      if (!keychain.customerId) {
        return res.status(400).json({ error: "El cliente debe activar su llavero para canjear Tesoros" });
      }

      if (!rewardId) {
        return res.status(400).json({ error: "Debe seleccionar un Tesoro para canjear" });
      }

      const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive || reward.storeId !== store.id) {
        return res.status(404).json({ error: "Tesoro no válido o no disponible" });
      }

      const loyalty = await prisma.customerLoyalty.findUnique({
        where: {
          customerId_storeId: {
            customerId: keychain.customerId,
            storeId: store.id,
          },
        },
      });

      if (!loyalty || loyalty.currentGold < reward.costInGold) {
        return res.status(400).json({
          error: `Oro insuficiente. Saldo actual: ${loyalty?.currentGold || 0} Oro. Requerido: ${reward.costInGold} Oro.`,
        });
      }

      const updatedLoyalty = await prisma.customerLoyalty.update({
        where: { id: loyalty.id },
        data: {
          currentGold: { decrement: reward.costInGold },
        },
      });

      const redemptionCode = `CANJE-${Date.now().toString(36).toUpperCase()}`;

      await prisma.rewardRedemption.create({
        data: {
          storeId: store.id,
          customerId: keychain.customerId,
          rewardId: reward.id,
          staffId: user.id,
          goldSpent: reward.costInGold,
          status: "REDEEMED",
          redemptionCode,
        },
      });

      await prisma.loyaltyTransaction.create({
        data: {
          storeId: store.id,
          customerId: keychain.customerId,
          keychainId: keychain.id,
          staffId: user.id,
          goldAmount: -reward.costInGold,
          type: "REDEEM",
          note: `Canje de Tesoro: ${reward.title} (Código: ${redemptionCode})`,
        },
      });

      return res.json({
        success: true,
        message: `¡Tesoro canjeado con éxito! Saldo restante: ${updatedLoyalty.currentGold} de Oro.`,
        rewardTitle: reward.title,
        goldDeducted: reward.costInGold,
        newCurrentGold: updatedLoyalty.currentGold,
        redemptionCode,
      });
    }

    return res.status(400).json({ error: "Tipo de acción no reconocido" });
  } catch (error) {
    console.error("Error en acción de caja POS backend:", error);
    return res.status(500).json({ error: "Error procesando la acción de caja" });
  }
}
