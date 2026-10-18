import { Response } from "express";
import bcrypt from "bcryptjs";
import type { Store, SubscriptionPayment } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import QRCode from "qrcode";

export async function getAdminMetrics(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalStores,
      totalUsers,
      totalKeychains,
      activatedKeychains,
      totalTransactions,
      totalRedemptions,
      loyaltiesGold,
      unclaimedGold,
    ] = await prisma.$transaction([
      prisma.store.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.keychain.count(),
      prisma.keychain.count({ where: { status: "ACTIVATED_USER" } }),
      prisma.loyaltyTransaction.count(),
      prisma.rewardRedemption.count(),
      prisma.customerLoyalty.aggregate({
        _sum: {
          currentGold: true,
        },
      }),
      prisma.unclaimedLedger.aggregate({
        where: { isClaimed: false },
        _sum: {
          goldAmount: true,
        },
      }),
    ]);

    const totalGoldCirculating =
      (loyaltiesGold._sum.currentGold || 0) + (unclaimedGold._sum.goldAmount || 0);

    const recentStores = await prisma.store.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        campaign: true,
        _count: {
          select: { keychains: true, loyalties: true },
        },
      },
    });

    return res.json({
      success: true,
      metrics: {
        totalStores,
        totalCustomers: totalUsers,
        totalKeychains,
        activatedKeychains,
        unactivatedKeychains: totalKeychains - activatedKeychains,
        totalTransactions,
        totalRedemptions,
        totalGoldCirculating,
      },
      recentStores,
    });
  } catch (error) {
    console.error("Error al obtener métricas en backend:", error);
    return res.status(500).json({ error: "Error al obtener métricas" });
  }
}

export async function listAdminStores(req: AuthenticatedRequest, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
        campaign: true,
        subscriptionPayments: {
          orderBy: { paidAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            products: true,
            rewards: true,
            keychains: true,
            loyalties: true,
            transactions: true,
            subscriptionPayments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, stores });
  } catch (error) {
    console.error("Error al listar tiendas para admin:", error);
    return res.status(500).json({ error: "Error al obtener tiendas" });
  }
}

export async function createAdminStore(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      slug,
      tagLine,
      description,
      address,
      phone,
      whatsapp,
      email,
      facebook,
      instagram,
      mapUrl,
      logoUrl,
      bannerUrl,
      category,
      scheduleText,
      // Credenciales del dueño del negocio
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      // Configuración inicial de Campaña
      campaignType,
      goldPerVisit,
      goldRatioAmount,
      cooldownMinutes,
      maxDailyPoints,
      // Configuración de Mensualidad
      monthlyFee,
      billingDueDay,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "El nombre y el slug de la tienda son obligatorios" });
    }

    if (!ownerEmail || !ownerPassword) {
      return res.status(400).json({ error: "El correo y contraseña del dueño son obligatorios" });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      return res.status(400).json({ error: "El identificador (slug) de la tienda no es válido" });
    }

    const existingStore = await prisma.store.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingStore) {
      return res.status(409).json({ error: `Ya existe una tienda con el identificador "${cleanSlug}"` });
    }

    // Buscar o crear usuario dueño con contraseña hasheada
    let owner = await prisma.user.findUnique({
      where: { email: ownerEmail.toLowerCase().trim() },
    });

    const passwordHash = await bcrypt.hash(ownerPassword, 10);

    if (!owner) {
      owner = await prisma.user.create({
        data: {
          name: ownerName?.trim() || `Dueño de ${name}`,
          email: ownerEmail.toLowerCase().trim(),
          phone: ownerPhone ? ownerPhone.trim() : null,
          role: "STORE_OWNER",
          passwordHash,
        },
      });
    } else {
      // Actualizar rol a STORE_OWNER y asignar la nueva contraseña configurada
      owner = await prisma.user.update({
        where: { id: owner.id },
        data: {
          role: "STORE_OWNER",
          passwordHash,
          name: ownerName?.trim() || owner.name,
          phone: ownerPhone ? ownerPhone.trim() : owner.phone,
        },
      });
    }

    const parsedMonthlyFee = Number(monthlyFee);
    const parsedBillingDueDay = Number(billingDueDay);
    const parsedGoldPerVisit = Number(goldPerVisit);
    const parsedGoldRatio = Number(goldRatioAmount);
    const parsedCooldown = Number(cooldownMinutes);
    const parsedMaxDaily = Number(maxDailyPoints);

    // Crear la tienda y su campaña asociada
    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        tagLine: tagLine?.trim() || null,
        description: description?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        email: email?.trim() || null,
        facebook: facebook?.trim() || null,
        instagram: instagram?.trim() || null,
        mapUrl: mapUrl?.trim() || null,
        category: category?.trim() || "Comercio Local",
        scheduleText: scheduleText?.trim() || "Lunes a Sábado: 08:00 - 20:00",
        isOpenManual: true,
        ownerId: owner.id,
        monthlyFee: !isNaN(parsedMonthlyFee) && parsedMonthlyFee >= 0 ? parsedMonthlyFee : 29.0,
        billingDueDay:
          !isNaN(parsedBillingDueDay) && parsedBillingDueDay >= 1 && parsedBillingDueDay <= 31
            ? parsedBillingDueDay
            : 1,
        subscriptionStatus: "ACTIVE",
        campaign: {
          create: {
            type: campaignType === "PURCHASE_AMOUNT" ? "PURCHASE_AMOUNT" : "VISIT_STAMP",
            goldPerVisit: !isNaN(parsedGoldPerVisit) && parsedGoldPerVisit > 0 ? parsedGoldPerVisit : 1,
            goldRatioAmount: !isNaN(parsedGoldRatio) && parsedGoldRatio > 0 ? parsedGoldRatio : 10.0,
            cooldownMinutes: !isNaN(parsedCooldown) && parsedCooldown >= 0 ? parsedCooldown : 45,
            maxDailyPoints: !isNaN(parsedMaxDaily) && parsedMaxDaily > 0 ? parsedMaxDaily : 2,
            isActive: true,
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        campaign: true,
      },
    });

    return res.json({
      success: true,
      message: `Comercio "${store.name}" y credenciales de acceso creados con éxito`,
      store,
    });
  } catch (error) {
    console.error("Error creando comercio desde SuperAdmin:", error);
    return res.status(500).json({ error: "Error al crear el comercio y credenciales" });
  }
}

// Actualizar información y redes sociales de cualquier tienda (SuperAdmin)
export async function updateAdminStore(req: AuthenticatedRequest, res: Response) {
  try {
    const storeId = String(req.params.storeId).trim();
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const {
      name,
      description,
      tagLine,
      logoUrl,
      bannerUrl,
      category,
      address,
      phone,
      whatsapp,
      email,
      facebook,
      instagram,
      mapUrl,
      scheduleText,
    } = req.body;

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: name !== undefined ? String(name).trim() : store.name,
        description: description !== undefined ? (description ? String(description).trim() : null) : store.description,
        tagLine: tagLine !== undefined ? (tagLine ? String(tagLine).trim() : null) : store.tagLine,
        logoUrl: logoUrl !== undefined ? (logoUrl ? String(logoUrl).trim() : null) : store.logoUrl,
        bannerUrl: bannerUrl !== undefined ? (bannerUrl ? String(bannerUrl).trim() : null) : store.bannerUrl,
        category: category !== undefined ? String(category).trim() : store.category,
        address: address !== undefined ? (address ? String(address).trim() : null) : store.address,
        phone: phone !== undefined ? (phone ? String(phone).trim() : null) : store.phone,
        whatsapp: whatsapp !== undefined ? (whatsapp ? String(whatsapp).trim() : null) : store.whatsapp,
        email: email !== undefined ? (email ? String(email).trim() : null) : store.email,
        facebook: facebook !== undefined ? (facebook ? String(facebook).trim() : null) : store.facebook,
        instagram: instagram !== undefined ? (instagram ? String(instagram).trim() : null) : store.instagram,
        mapUrl: mapUrl !== undefined ? (mapUrl ? String(mapUrl).trim() : null) : store.mapUrl,
        scheduleText: scheduleText !== undefined ? (scheduleText ? String(scheduleText).trim() : null) : store.scheduleText,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        campaign: true,
      },
    });

    return res.json({
      success: true,
      message: `Comercio "${updated.name}" actualizado exitosamente`,
      store: updated,
    });
  } catch (error) {
    console.error("Error al actualizar comercio desde SuperAdmin:", error);
    return res.status(500).json({ error: "Error al actualizar los datos de la tienda" });
  }
}

export async function updateAdminCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const storeIdParam = String(req.params.storeId).trim();
    const {
      type,
      goldPerVisit,
      goldRatioAmount,
      cooldownMinutes,
      maxDailyPoints,
      isActive,
    } = req.body;

    const store = await prisma.store.findFirst({
      where: {
        OR: [{ id: storeIdParam }, { slug: storeIdParam }],
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const campaign = await prisma.campaign.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        type: type === "PURCHASE_AMOUNT" ? "PURCHASE_AMOUNT" : "VISIT_STAMP",
        goldPerVisit: Number(goldPerVisit) > 0 ? Number(goldPerVisit) : 1,
        goldRatioAmount: Number(goldRatioAmount) > 0 ? Number(goldRatioAmount) : 10.0,
        cooldownMinutes: cooldownMinutes !== undefined ? Number(cooldownMinutes) : 45,
        maxDailyPoints: Number(maxDailyPoints) > 0 ? Number(maxDailyPoints) : 2,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      update: {
        type: type ? (type === "PURCHASE_AMOUNT" ? "PURCHASE_AMOUNT" : "VISIT_STAMP") : undefined,
        goldPerVisit: goldPerVisit !== undefined ? Number(goldPerVisit) : undefined,
        goldRatioAmount: goldRatioAmount !== undefined ? Number(goldRatioAmount) : undefined,
        cooldownMinutes: cooldownMinutes !== undefined ? Number(cooldownMinutes) : undefined,
        maxDailyPoints: maxDailyPoints !== undefined ? Number(maxDailyPoints) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return res.json({
      success: true,
      message: "Campaña de fidelidad actualizada exitosamente",
      campaign,
    });
  } catch (error) {
    console.error("Error actualizando campaña desde SuperAdmin:", error);
    return res.status(500).json({ error: "Error al actualizar la campaña" });
  }
}

export async function listBatches(req: AuthenticatedRequest, res: Response) {
  try {
    const storeIdFilter = req.query.storeId ? String(req.query.storeId).trim() : null;
    const whereClause: any = {};
    if (storeIdFilter) {
      whereClause.OR = [{ storeId: storeIdFilter }, { store: { slug: storeIdFilter } }];
    }

    const keychains = await prisma.keychain.findMany({
      where: whereClause,
      include: {
        store: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const batchesMap = new Map<string, any>();
    for (const kc of keychains) {
      const bNum = kc.batchNumber || "SIN-LOTE";
      if (!batchesMap.has(bNum)) {
        batchesMap.set(bNum, {
          batchNumber: bNum,
          storeId: kc.storeId,
          storeSlug: kc.store?.slug || "",
          storeName: kc.store?.name || "Sin tienda",
          total: 0,
          activated: 0,
          unassigned: 0,
          createdAt: kc.createdAt,
          items: [],
        });
      }
      const b = batchesMap.get(bNum);
      b.total += 1;
      if (kc.status === "ACTIVATED_USER") b.activated += 1;
      else b.unassigned += 1;
      b.items.push(kc);
    }

    return res.json({
      success: true,
      batches: Array.from(batchesMap.values()),
      allKeychains: keychains,
    });
  } catch (error) {
    console.error("Error al obtener lotes en backend:", error);
    return res.status(500).json({ error: "Error al obtener lotes" });
  }
}

export async function createBatch(req: AuthenticatedRequest, res: Response) {
  try {
    const { storeId, quantity, prefix } = req.body;

    if (!storeId || !quantity) {
      return res.status(400).json({ error: "Tienda y cantidad son obligatorios" });
    }

    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty < 1 || qty > 500) {
      return res.status(400).json({ error: "La cantidad debe ser un número entero entre 1 y 500" });
    }

    const storeIdParam = String(storeId).trim();
    const store = await prisma.store.findFirst({
      where: {
        OR: [{ id: storeIdParam }, { slug: storeIdParam }],
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const batchNumber = `LOTE-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    const cleanPrefix = prefix
      ? String(prefix).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
      : store.slug.substring(0, 4).toUpperCase();
    const pfx = cleanPrefix || "KURI";
    const createdKeychains = [];

    const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    for (let i = 1; i <= qty; i++) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const token = `KURI-${pfx}-${randomPart}-${i.toString().padStart(3, "0")}`;

      const keychain = await prisma.keychain.create({
        data: {
          token,
          storeId: store.id,
          batchNumber,
          status: "ASSIGNED_STORE",
        },
      });

      const qrTargetUrl = `${appUrl}/kuri/${token}`;
      let qrDataUrl = "";
      try {
        qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
          margin: 1,
          width: 300,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        });
      } catch (err) {
        console.error("Error generando QR data URL:", err);
      }

      createdKeychains.push({
        id: keychain.id,
        token: keychain.token,
        qrTargetUrl,
        qrDataUrl,
      });
    }

    return res.json({
      success: true,
      batchNumber,
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
      totalGenerated: createdKeychains.length,
      keychains: createdKeychains,
    });
  } catch (error) {
    console.error("Error generando lote en backend:", error);
    return res.status(500).json({ error: "Error al generar lote de llaveros" });
  }
}

export async function listAllKeychains(req: AuthenticatedRequest, res: Response) {
  try {
    const { storeId, batchNumber, status } = req.query;
    const where: any = {};

    if (storeId) {
      const s = String(storeId).trim();
      where.OR = [{ storeId: s }, { store: { slug: s } }];
    }
    if (batchNumber) {
      where.batchNumber = String(batchNumber).trim();
    }
    if (status) {
      where.status = String(status).trim().toUpperCase();
    }

    const keychains = await prisma.keychain.findMany({
      where,
      include: {
        store: { select: { id: true, name: true, slug: true, category: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Enriquecer cada llavero con su QR Data URL para render y exportación inmediata
    const enrichedKeychains = await Promise.all(
      keychains.map(async (kc) => {
        const qrTargetUrl = `${appUrl}/kuri/${kc.token}`;
        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
            margin: 1,
            width: 260,
            color: {
              dark: "#0F172A",
              light: "#FFFFFF",
            },
          });
        } catch (e) {
          console.error(`Error generando QR para ${kc.token}:`, e);
        }

        return {
          id: kc.id,
          token: kc.token,
          status: kc.status,
          batchNumber: kc.batchNumber || "SIN-LOTE",
          createdAt: kc.createdAt,
          store: kc.store,
          customer: kc.customer,
          qrTargetUrl,
          qrDataUrl,
        };
      })
    );

    return res.json({
      success: true,
      total: enrichedKeychains.length,
      keychains: enrichedKeychains,
    });
  } catch (error) {
    console.error("Error al listar todos los llaveros para admin:", error);
    return res.status(500).json({ error: "Error al listar catálogo de llaveros QR" });
  }
}

export async function exportKeychainsCsv(req: AuthenticatedRequest, res: Response) {
  try {
    const { storeId, batchNumber, status } = req.query;
    const where: any = {};

    if (storeId) {
      const s = String(storeId).trim();
      where.OR = [{ storeId: s }, { store: { slug: s } }];
    }
    if (batchNumber) {
      where.batchNumber = String(batchNumber).trim();
    }
    if (status) {
      where.status = String(status).trim().toUpperCase();
    }

    const keychains = await prisma.keychain.findMany({
      where,
      include: {
        store: { select: { name: true, slug: true } },
        customer: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Generar formato CSV con BOM UTF-8 para apertura directa en Microsoft Excel
    const header = ["Token", "Estado", "Comercio", "Lote", "Cliente Asignado", "Email Cliente", "URL Escaneo", "Fecha Emision"];
    const rows = keychains.map((kc) => [
      `"${kc.token}"`,
      `"${kc.status === "ACTIVATED_USER" ? "Activado por Cliente" : "Asignado a Comercio"}"`,
      `"${kc.store?.name || "Sin Comercio"}"`,
      `"${kc.batchNumber || "SIN-LOTE"}"`,
      `"${kc.customer?.name || "No Vinculado"}"`,
      `"${kc.customer?.email || "N/A"}"`,
      `"${appUrl}/kuri/${kc.token}"`,
      `"${kc.createdAt.toISOString()}"`,
    ]);

    const csvContent = "\uFEFF" + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="kuri-catalogo-llaveros-qr.csv"');
    return res.send(csvContent);
  } catch (error) {
    console.error("Error exportando CSV de llaveros:", error);
    return res.status(500).json({ error: "Error al exportar archivo CSV" });
  }
}

export async function updateStoreSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    const storeIdParam = String(req.params.storeId).trim();
    const {
      monthlyFee,
      billingDueDay,
      subscriptionStatus,
      nextBillingDate,
      subscriptionNotes,
    } = req.body;

    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [{ id: storeIdParam }, { slug: storeIdParam }],
      },
    });

    if (!existingStore) {
      return res.status(404).json({ error: "Comercio no encontrado" });
    }

    const normStatus = subscriptionStatus ? String(subscriptionStatus).trim().toUpperCase() : undefined;
    const validStatuses = ["ACTIVE", "SUSPENDED", "PAST_DUE"];
    if (normStatus && !validStatuses.includes(normStatus)) {
      return res.status(400).json({ error: "Estado no válido. Use ACTIVE, SUSPENDED o PAST_DUE." });
    }

    const parsedFee = monthlyFee !== undefined ? Number(monthlyFee) : undefined;
    const parsedDueDay = billingDueDay !== undefined ? Number(billingDueDay) : undefined;

    const updatedStore = await prisma.store.update({
      where: { id: existingStore.id },
      data: {
        monthlyFee: parsedFee !== undefined && !isNaN(parsedFee) && parsedFee >= 0 ? parsedFee : existingStore.monthlyFee,
        billingDueDay:
          parsedDueDay !== undefined && !isNaN(parsedDueDay) && parsedDueDay >= 1 && parsedDueDay <= 31
            ? parsedDueDay
            : existingStore.billingDueDay,
        subscriptionStatus: normStatus || existingStore.subscriptionStatus,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : existingStore.nextBillingDate,
        subscriptionNotes: subscriptionNotes !== undefined ? subscriptionNotes : existingStore.subscriptionNotes,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        subscriptionPayments: { orderBy: { paidAt: "desc" }, take: 5 },
      },
    });

    return res.json({
      success: true,
      message: `Suscripción de ${updatedStore.name} actualizada correctamente`,
      store: updatedStore,
    });
  } catch (error) {
    console.error("Error al actualizar suscripción de comercio:", error);
    return res.status(500).json({ error: "Error al actualizar la suscripción" });
  }
}

export async function recordSubscriptionPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const storeIdParam = String(req.params.storeId).trim();
    const {
      amount,
      paymentMethod,
      reference,
      periodCovered,
      notes,
    } = req.body;

    const store = await prisma.store.findFirst({
      where: {
        OR: [{ id: storeIdParam }, { slug: storeIdParam }],
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Comercio no encontrado" });
    }

    const numAmount = Number(amount);
    const paymentAmount = !isNaN(numAmount) && numAmount > 0 ? numAmount : store.monthlyFee;

    const payment = await prisma.subscriptionPayment.create({
      data: {
        storeId: store.id,
        amount: paymentAmount,
        status: "COMPLETED",
        paymentMethod: paymentMethod?.trim() ? String(paymentMethod).trim().toUpperCase() : "TRANSFERENCIA",
        reference: reference?.trim() || `PAGO-${Date.now().toString(36).toUpperCase()}`,
        periodCovered: periodCovered?.trim() || new Date().toLocaleString("es-ES", { month: "long", year: "numeric" }),
        notes: notes?.trim() || null,
        paidAt: new Date(),
      },
    });

    // Reactivar automáticamente la tienda y calcular próxima fecha de corte (+1 mes)
    const nextDate = new Date(store.nextBillingDate || new Date());
    if (nextDate.getTime() < Date.now()) {
      nextDate.setTime(Date.now());
    }
    nextDate.setMonth(nextDate.getMonth() + 1);
    if (store.billingDueDay) {
      nextDate.setDate(Math.min(store.billingDueDay, 28));
    }

    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        subscriptionStatus: "ACTIVE",
        lastPaymentDate: new Date(),
        nextBillingDate: nextDate,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        subscriptionPayments: { orderBy: { paidAt: "desc" }, take: 5 },
      },
    });

    return res.json({
      success: true,
      message: `Pago de $${paymentAmount.toFixed(2)} registrado exitosamente. Negocio reactivado.`,
      payment,
      store: updatedStore,
    });
  } catch (error) {
    console.error("Error al registrar pago de mensualidad:", error);
    return res.status(500).json({ error: "Error al registrar el pago de mensualidad" });
  }
}
