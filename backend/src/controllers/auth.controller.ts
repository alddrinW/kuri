import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signToken, COOKIE_NAME, AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo electrónico y contraseña requeridos" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        ownedStores: { select: { id: true, slug: true, name: true } },
        staffStore: { select: { id: true, slug: true, name: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      staffStoreId: user.staffStoreId,
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        staffStoreId: user.staffStoreId,
        store: user.ownedStores[0] || user.staffStore || null,
      },
    });
  } catch (error) {
    console.error("Error en login backend:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone, keychainToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({ error: "Ya existe una cuenta con este correo electrónico" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        role: "CUSTOMER",
        passwordHash,
      },
    });

    let activatedStoreSlug = null;
    if (keychainToken) {
      const cleanToken = String(keychainToken).trim().toUpperCase();
      const keychain = await prisma.keychain.findFirst({
        where: {
          OR: [{ token: cleanToken }, { id: String(keychainToken).trim() }],
        },
        include: { store: true },
      });

      if (keychain) {
        await prisma.keychain.update({
          where: { id: keychain.id },
          data: {
            customerId: user.id,
            status: "ACTIVATED_USER",
          },
        });

        const unclaimed = await prisma.unclaimedLedger.findMany({
          where: { keychainToken: keychain.token, isClaimed: false },
        });

        const bonusGold = unclaimed.reduce((acc, curr) => acc + curr.goldAmount, 0);

        await prisma.customerLoyalty.upsert({
          where: {
            customerId_storeId: {
              customerId: user.id,
              storeId: keychain.storeId,
            },
          },
          create: {
            customerId: user.id,
            storeId: keychain.storeId,
            currentGold: bonusGold,
            lifetimeGold: bonusGold,
            tier: bonusGold >= 15 ? "GOLD" : bonusGold >= 8 ? "SILVER" : "BRONZE",
          },
          update: {
            currentGold: { increment: bonusGold },
            lifetimeGold: { increment: bonusGold },
          },
        });

        if (unclaimed.length > 0) {
          await prisma.unclaimedLedger.updateMany({
            where: { keychainToken, isClaimed: false },
            data: { isClaimed: true, claimedAt: new Date() },
          });

          await prisma.loyaltyTransaction.create({
            data: {
              storeId: keychain.storeId,
              customerId: user.id,
              keychainId: keychain.id,
              staffId: unclaimed[0].staffId,
              goldAmount: bonusGold,
              type: "UNCLAIMED_CLAIM",
              note: `Adjudicación de ${bonusGold} Oro por activación de Kuri`,
            },
          });
        }

        activatedStoreSlug = keychain.store.slug;
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      activatedStoreSlug,
    });
  } catch (error) {
    console.error("Error en registro backend:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.json({ authenticated: false, user: null });
    }

    const ownedStore = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
      select: { id: true, slug: true, name: true },
    });

    const staffStore = req.user.staffStoreId
      ? await prisma.store.findUnique({
          where: { id: req.user.staffStoreId },
          select: { id: true, slug: true, name: true },
        })
      : null;

    return res.json({
      authenticated: true,
      user: {
        ...req.user,
        store: ownedStore || staffStore || null,
      },
    });
  } catch (error) {
    console.error("Error en me backend:", error);
    return res.status(500).json({ authenticated: false, user: null });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ success: true });
}
