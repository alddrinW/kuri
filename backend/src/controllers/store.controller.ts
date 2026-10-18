import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// Helper: Calcular si el comercio está abierto o cerrado automáticamente según el horario de atención
export function calculateStoreOpenStatus(store: {
  scheduleMode?: string | null;
  isOpenManual: boolean;
  schedules?: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isOpen: boolean }>;
}): { isOpen: boolean; reason: string } {
  // Si está en modo MANUAL, se respeta explícitamente la bandera manual
  if (store.scheduleMode === "MANUAL") {
    return {
      isOpen: Boolean(store.isOpenManual),
      reason: store.isOpenManual ? "Control manual activo (Abierto)" : "Control manual activo (Pausado)",
    };
  }

  // Modo AUTO: evaluamos según los horarios estructurados de la semana
  if (!store.schedules || store.schedules.length === 0) {
    return {
      isOpen: Boolean(store.isOpenManual),
      reason: store.isOpenManual ? "Sin horario definido (Abierto)" : "Sin horario definido (Cerrado)",
    };
  }

  const now = new Date();
  const jsDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const todaySchedule = store.schedules.find((s) => s.dayOfWeek === currentDayOfWeek);
  if (!todaySchedule || !todaySchedule.isOpen) {
    return {
      isOpen: false,
      reason: "Cerrado según el horario del día de hoy",
    };
  }

  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${currentHours}:${currentMinutes}`;

  if (currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime) {
    return {
      isOpen: true,
      reason: `Abierto hoy de ${todaySchedule.openTime} a ${todaySchedule.closeTime}`,
    };
  }

  return {
    isOpen: false,
    reason: `Cerrado en este momento (Horario de hoy: ${todaySchedule.openTime} a ${todaySchedule.closeTime})`,
  };
}

// Helper: Obtener tienda asociada al usuario autenticado (Owner, Staff o SuperAdmin)
async function getStoreForUser(user: { id: string; role: string; staffStoreId?: string | null }) {
  if (user.role === "SUPER_ADMIN") {
    return await prisma.store.findFirst({
      include: {
        campaign: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
        promoCampaigns: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  return await prisma.store.findFirst({
    where: {
      OR: [
        { ownerId: user.id },
        { id: user.staffStoreId || "" },
      ],
    },
    include: {
      campaign: true,
      schedules: { orderBy: { dayOfWeek: "asc" } },
      promoCampaigns: { orderBy: { createdAt: "desc" } },
    },
  });
}

// 1. Listar todas las tiendas (público)
export async function listStores(req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        campaign: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
        promoCampaigns: { where: { isActive: true } },
        _count: {
          select: {
            products: true,
            rewards: true,
            keychains: true,
            loyalties: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = stores.map((s) => {
      const status = calculateStoreOpenStatus(s);
      return {
        ...s,
        isCurrentlyOpen: status.isOpen,
        openStatusReason: status.reason,
      };
    });

    return res.json({ success: true, stores: enriched });
  } catch (error) {
    console.error("Error al listar tiendas:", error);
    return res.status(500).json({ error: "Error al obtener tiendas" });
  }
}

// 2. Obtener tienda por slug (vitrina pública)
export async function getStoreBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        campaign: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
        promoCampaigns: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: "desc" },
        },
        rewards: {
          where: { isActive: true },
          orderBy: { costInGold: "asc" },
        },
        _count: {
          select: {
            loyalties: true,
            transactions: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const openStatus = calculateStoreOpenStatus(store);

    return res.json({
      success: true,
      store: {
        ...store,
        isCurrentlyOpen: openStatus.isOpen,
        openStatusReason: openStatus.reason,
      },
    });
  } catch (error) {
    console.error("Error al obtener tienda:", error);
    return res.status(500).json({ error: "Error al obtener tienda" });
  }
}

// 3. Actualizar información general de la tienda
export async function updateStore(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const slug = String(req.params.slug);
    const store = await prisma.store.findUnique({ where: { slug } });

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const isOwner = store.ownerId === req.user.id;
    const isSuperAdmin = req.user.role === "SUPER_ADMIN";

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ error: "No tienes permisos para editar esta tienda" });
    }

    const body = req.body;
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: body.name !== undefined ? body.name : store.name,
        tagLine: body.tagLine !== undefined ? body.tagLine : store.tagLine,
        description: body.description !== undefined ? body.description : store.description,
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : store.logoUrl,
        bannerUrl: body.bannerUrl !== undefined ? body.bannerUrl : store.bannerUrl,
        address: body.address !== undefined ? body.address : store.address,
        phone: body.phone !== undefined ? body.phone : store.phone,
        whatsapp: body.whatsapp !== undefined ? body.whatsapp : store.whatsapp,
        email: body.email !== undefined ? body.email : store.email,
        facebook: body.facebook !== undefined ? body.facebook : store.facebook,
        instagram: body.instagram !== undefined ? body.instagram : store.instagram,
        mapUrl: body.mapUrl !== undefined ? body.mapUrl : store.mapUrl,
        scheduleText: body.scheduleText !== undefined ? body.scheduleText : store.scheduleText,
        scheduleMode: body.scheduleMode !== undefined ? body.scheduleMode : store.scheduleMode,
        isOpenManual: body.isOpenManual !== undefined ? body.isOpenManual : store.isOpenManual,
        category: body.category !== undefined ? body.category : store.category,
      },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    const openStatus = calculateStoreOpenStatus(updated);

    return res.json({
      success: true,
      store: {
        ...updated,
        isCurrentlyOpen: openStatus.isOpen,
        openStatusReason: openStatus.reason,
      },
    });
  } catch (error) {
    console.error("Error actualizando tienda:", error);
    return res.status(500).json({ error: "Error al actualizar la tienda" });
  }
}

// 3.1. Actualizar perfil e identidad de la tienda del usuario autenticado
export async function updateStoreProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para editar la configuración de la tienda ni sus redes" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const body = req.body;
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : store.name,
        tagLine: body.tagLine !== undefined ? (body.tagLine ? String(body.tagLine).trim() : null) : store.tagLine,
        description: body.description !== undefined ? (body.description ? String(body.description).trim() : null) : store.description,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : store.logoUrl,
        bannerUrl: body.bannerUrl !== undefined ? (body.bannerUrl ? String(body.bannerUrl).trim() : null) : store.bannerUrl,
        address: body.address !== undefined ? (body.address ? String(body.address).trim() : null) : store.address,
        phone: body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : store.phone,
        whatsapp: body.whatsapp !== undefined ? (body.whatsapp ? String(body.whatsapp).trim() : null) : store.whatsapp,
        email: body.email !== undefined ? (body.email ? String(body.email).trim() : null) : store.email,
        facebook: body.facebook !== undefined ? (body.facebook ? String(body.facebook).trim() : null) : store.facebook,
        instagram: body.instagram !== undefined ? (body.instagram ? String(body.instagram).trim() : null) : store.instagram,
        mapUrl: body.mapUrl !== undefined ? (body.mapUrl ? String(body.mapUrl).trim() : null) : store.mapUrl,
        scheduleMode: body.scheduleMode !== undefined ? String(body.scheduleMode) : store.scheduleMode,
        isOpenManual: body.isOpenManual !== undefined ? Boolean(body.isOpenManual) : store.isOpenManual,
        scheduleText: body.scheduleText !== undefined ? (body.scheduleText ? String(body.scheduleText).trim() : null) : store.scheduleText,
        category: body.category !== undefined ? String(body.category).trim() : store.category,
      },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        campaign: true,
        promoCampaigns: { orderBy: { createdAt: "desc" } },
      },
    });

    const openStatus = calculateStoreOpenStatus(updated);

    return res.json({
      success: true,
      store: {
        ...updated,
        isCurrentlyOpen: openStatus.isOpen,
        openStatusReason: openStatus.reason,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil de comercio:", error);
    return res.status(500).json({ error: "Error al actualizar perfil del negocio" });
  }
}

// 4. Obtener panel central del dueño de negocio
export async function getStoreDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { ownerId: req.user.id },
          { id: req.user.staffStoreId || "" },
        ],
      },
      include: {
        campaign: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
        promoCampaigns: { orderBy: { createdAt: "desc" } },
        keychainOrders: { orderBy: { createdAt: "desc" }, take: 5 },
        products: { orderBy: { createdAt: "desc" } },
        rewards: { orderBy: { costInGold: "asc" } },
        staffMembers: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: {
            loyalties: true,
            transactions: true,
            keychains: true,
            products: true,
            keychainOrders: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "No tienes ninguna tienda asignada" });
    }

    const topCustomers = await prisma.customerLoyalty.findMany({
      where: { storeId: store.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { lifetimeGold: "desc" },
      take: 8,
    });

    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      where: { storeId: store.id },
      include: {
        customer: { select: { name: true } },
        staff: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const openStatus = calculateStoreOpenStatus(store);

    return res.json({
      success: true,
      userRole: req.user.role,
      isStaff: req.user.role === "STORE_STAFF",
      isOwner: req.user.role === "STORE_OWNER" || store.ownerId === req.user.id,
      isAdmin: req.user.role === "SUPER_ADMIN",
      currentUser: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isStaff: req.user.role === "STORE_STAFF",
      },
      store: {
        ...store,
        isCurrentlyOpen: openStatus.isOpen,
        openStatusReason: openStatus.reason,
      },
      topCustomers,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error en dashboard de comercio:", error);
    return res.status(500).json({ error: "Error al cargar dashboard de comercio" });
  }
}

// -------------------------------------------------------------
// SECCIÓN 5: GESTIÓN DE PRODUCTOS Y CATÁLOGO DIGITAL
// -------------------------------------------------------------

export async function listStoreProducts(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, products });
  } catch (error) {
    console.error("Error al listar productos:", error);
    return res.status(500).json({ error: "Error al listar productos" });
  }
}

export async function createStoreProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros solo tienen permisos de lectura para ver la carta y productos" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const { name, description, price, discountGoldPrice, category, imageUrl, isAvailable } = req.body;

    if (!name || typeof price !== "number") {
      return res.status(400).json({ error: "Nombre y precio regular son requeridos" });
    }

    const newProduct = await prisma.product.create({
      data: {
        storeId: store.id,
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        price: Number(price),
        discountGoldPrice: discountGoldPrice ? Number(discountGoldPrice) : null,
        category: category ? String(category).trim() : "General",
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });

    return res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return res.status(500).json({ error: "Error al crear producto" });
  }
}

export async function updateStoreProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros solo tienen permisos de lectura para ver la carta y productos" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const productId = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id: productId } });

    if (!existing || existing.storeId !== store.id) {
      return res.status(404).json({ error: "Producto no encontrado o no pertenece a tu comercio" });
    }

    const { name, description, price, discountGoldPrice, category, imageUrl, isAvailable } = req.body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        description: description !== undefined ? (description ? String(description).trim() : null) : existing.description,
        price: price !== undefined ? Number(price) : existing.price,
        discountGoldPrice: discountGoldPrice !== undefined ? (discountGoldPrice ? Number(discountGoldPrice) : null) : existing.discountGoldPrice,
        category: category !== undefined ? String(category).trim() : existing.category,
        imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : existing.imageUrl,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
      },
    });

    return res.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return res.status(500).json({ error: "Error al actualizar producto" });
  }
}

export async function deleteStoreProduct(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros solo tienen permisos de lectura para ver la carta y productos" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const productId = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id: productId } });

    if (!existing || existing.storeId !== store.id) {
      return res.status(404).json({ error: "Producto no encontrado o no pertenece a tu comercio" });
    }

    await prisma.product.delete({ where: { id: productId } });

    return res.json({ success: true, message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({ error: "Error al eliminar producto" });
  }
}

// -------------------------------------------------------------
// SECCIÓN 6: GESTIÓN DE HORARIOS Y ESTADO OPERATIVO AUTOMÁTICO
// -------------------------------------------------------------

export async function getStoreSchedules(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    let schedules = await prisma.storeSchedule.findMany({
      where: { storeId: store.id },
      orderBy: { dayOfWeek: "asc" },
    });

    if (schedules.length === 0) {
      const defaultDays = [
        { dayOfWeek: 1, openTime: "08:00", closeTime: "20:00", isOpen: true },
        { dayOfWeek: 2, openTime: "08:00", closeTime: "20:00", isOpen: true },
        { dayOfWeek: 3, openTime: "08:00", closeTime: "20:00", isOpen: true },
        { dayOfWeek: 4, openTime: "08:00", closeTime: "20:00", isOpen: true },
        { dayOfWeek: 5, openTime: "08:00", closeTime: "20:00", isOpen: true },
        { dayOfWeek: 6, openTime: "09:00", closeTime: "18:00", isOpen: true },
        { dayOfWeek: 7, openTime: "09:00", closeTime: "14:00", isOpen: false },
      ];

      for (const d of defaultDays) {
        await prisma.storeSchedule.create({
          data: { storeId: store.id, ...d },
        });
      }

      schedules = await prisma.storeSchedule.findMany({
        where: { storeId: store.id },
        orderBy: { dayOfWeek: "asc" },
      });
    }

    const openStatus = calculateStoreOpenStatus({ ...store, schedules });

    return res.json({
      success: true,
      schedules,
      scheduleText: store.scheduleText,
      scheduleMode: store.scheduleMode,
      isOpenManual: store.isOpenManual,
      isCurrentlyOpen: openStatus.isOpen,
      openStatusReason: openStatus.reason,
    });
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return res.status(500).json({ error: "Error al obtener horarios" });
  }
}

export async function updateStoreSchedules(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para modificar los horarios de atención de la tienda" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const { schedules, scheduleText, isOpenManual, scheduleMode } = req.body;

    if (Array.isArray(schedules)) {
      for (const item of schedules) {
        if (typeof item.dayOfWeek === "number") {
          await prisma.storeSchedule.upsert({
            where: {
              storeId_dayOfWeek: {
                storeId: store.id,
                dayOfWeek: item.dayOfWeek,
              },
            },
            create: {
              storeId: store.id,
              dayOfWeek: item.dayOfWeek,
              openTime: item.openTime || "08:00",
              closeTime: item.closeTime || "20:00",
              isOpen: Boolean(item.isOpen),
            },
            update: {
              openTime: item.openTime || "08:00",
              closeTime: item.closeTime || "20:00",
              isOpen: Boolean(item.isOpen),
            },
          });
        }
      }
    }

    const updateData: any = {};
    if (scheduleText !== undefined) updateData.scheduleText = String(scheduleText).trim();
    if (isOpenManual !== undefined) updateData.isOpenManual = Boolean(isOpenManual);
    if (scheduleMode !== undefined) updateData.scheduleMode = String(scheduleMode);

    if (Object.keys(updateData).length > 0) {
      await prisma.store.update({
        where: { id: store.id },
        data: updateData,
      });
    }

    const updatedSchedules = await prisma.storeSchedule.findMany({
      where: { storeId: store.id },
      orderBy: { dayOfWeek: "asc" },
    });

    const openStatus = calculateStoreOpenStatus({
      ...store,
      schedules: updatedSchedules,
      scheduleMode: scheduleMode !== undefined ? scheduleMode : store.scheduleMode,
      isOpenManual: isOpenManual !== undefined ? isOpenManual : store.isOpenManual,
    });

    return res.json({
      success: true,
      schedules: updatedSchedules,
      scheduleText: scheduleText !== undefined ? scheduleText : store.scheduleText,
      scheduleMode: scheduleMode !== undefined ? scheduleMode : store.scheduleMode,
      isOpenManual: isOpenManual !== undefined ? isOpenManual : store.isOpenManual,
      isCurrentlyOpen: openStatus.isOpen,
      openStatusReason: openStatus.reason,
    });
  } catch (error) {
    console.error("Error al actualizar horarios:", error);
    return res.status(500).json({ error: "Error al actualizar horarios" });
  }
}

// Conmutar o configurar estado operativo (modo AUTO o alternancia manual)
export async function toggleStoreOpenStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para alterar el estado de apertura de la tienda" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const { scheduleMode } = req.body || {};

    let dataToUpdate: any = {};
    if (scheduleMode) {
      dataToUpdate.scheduleMode = scheduleMode;
    } else {
      // Alternancia rápida: si estaba en modo AUTO, pasar a MANUAL con estado invertido
      // O si estaba en MANUAL, alternar isOpenManual
      dataToUpdate.isOpenManual = !store.isOpenManual;
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: dataToUpdate,
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    const status = calculateStoreOpenStatus(updated);

    return res.json({
      success: true,
      isOpenManual: updated.isOpenManual,
      scheduleMode: updated.scheduleMode,
      isCurrentlyOpen: status.isOpen,
      openStatusReason: status.reason,
    });
  } catch (error) {
    console.error("Error al alternar estado de tienda:", error);
    return res.status(500).json({ error: "Error al cambiar estado de apertura" });
  }
}

// -------------------------------------------------------------
// SECCIÓN 7: PEDIDOS Y SOLICITUDES DE LLAVEROS FÍSICOS
// -------------------------------------------------------------

export async function listKeychainOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const orders = await prisma.keychainOrder.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    const totalKeychainsAssigned = await prisma.keychain.count({
      where: { storeId: store.id },
    });

    return res.json({
      success: true,
      orders,
      totalKeychainsAssigned,
    });
  } catch (error) {
    console.error("Error al listar pedidos de llaveros:", error);
    return res.status(500).json({ error: "Error al listar pedidos de llaveros" });
  }
}

export async function createKeychainOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Solo el dueño del comercio puede solicitar nuevos pedidos de lotes de llaveros" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const { quantity, deliveryAddress, contactPhone, recipientName, notes } = req.body;

    if (!quantity || !deliveryAddress || !contactPhone || !recipientName) {
      return res.status(400).json({ error: "Cantidad, dirección de entrega, teléfono y receptor son obligatorios" });
    }

    const orderQuantity = parseInt(String(quantity), 10);
    if (isNaN(orderQuantity) || orderQuantity <= 0) {
      return res.status(400).json({ error: "La cantidad de llaveros debe ser un número entero positivo" });
    }

    const order = await prisma.keychainOrder.create({
      data: {
        storeId: store.id,
        quantity: orderQuantity,
        deliveryAddress: String(deliveryAddress).trim(),
        contactPhone: String(contactPhone).trim(),
        recipientName: String(recipientName).trim(),
        notes: notes ? String(notes).trim() : null,
        status: "PENDING",
      },
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error al crear pedido de llaveros:", error);
    return res.status(500).json({ error: "Error al procesar solicitud de llaveros" });
  }
}

// -------------------------------------------------------------
// SECCIÓN 8: CONFIGURACIÓN DE CAMPAÑAS POLIMÓRFICAS
// -------------------------------------------------------------

export async function getStoreCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const mainCampaign = await prisma.campaign.findUnique({
      where: { storeId: store.id },
    });

    const promoCampaigns = await prisma.storePromoCampaign.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      mainCampaign,
      promoCampaigns,
    });
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    return res.status(500).json({ error: "Error al obtener campañas" });
  }
}

export async function updateMainCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para configurar campañas" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const {
      name,
      description,
      type,
      goldPerVisit,
      goldRatioAmount,
      discountPercent,
      cooldownMinutes,
      maxDailyPoints,
      isActive,
      bannerNotice,
    } = req.body;

    const updated = await prisma.campaign.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        name: name ? String(name).trim() : "Programa de Fidelidad Principal",
        description: description ? String(description).trim() : null,
        type: type || "VISIT_STAMP",
        goldPerVisit: goldPerVisit !== undefined ? Number(goldPerVisit) : 1,
        goldRatioAmount: goldRatioAmount !== undefined ? Number(goldRatioAmount) : 10.0,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : 10.0,
        cooldownMinutes: cooldownMinutes !== undefined ? Number(cooldownMinutes) : 45,
        maxDailyPoints: maxDailyPoints !== undefined ? Number(maxDailyPoints) : 3,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        bannerNotice: bannerNotice ? String(bannerNotice).trim() : null,
      },
      update: {
        name: name !== undefined ? String(name).trim() : undefined,
        description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
        type: type !== undefined ? type : undefined,
        goldPerVisit: goldPerVisit !== undefined ? Number(goldPerVisit) : undefined,
        goldRatioAmount: goldRatioAmount !== undefined ? Number(goldRatioAmount) : undefined,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
        cooldownMinutes: cooldownMinutes !== undefined ? Number(cooldownMinutes) : undefined,
        maxDailyPoints: maxDailyPoints !== undefined ? Number(maxDailyPoints) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        bannerNotice: bannerNotice !== undefined ? (bannerNotice ? String(bannerNotice).trim() : null) : undefined,
      },
    });

    return res.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("Error actualizando campaña principal:", error);
    return res.status(500).json({ error: "Error al actualizar campaña principal" });
  }
}

export async function createPromoCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para configurar campañas" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const { name, type, description, discountPercent, multiplier, startDate, endDate, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre de la campaña es obligatorio" });
    }

    const promo = await prisma.storePromoCampaign.create({
      data: {
        storeId: store.id,
        name: String(name).trim(),
        type: type || "KEYCHAIN_DISCOUNT",
        description: description ? String(description).trim() : null,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : 10.0,
        multiplier: multiplier !== undefined ? Number(multiplier) : 2,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({ success: true, promoCampaign: promo });
  } catch (error) {
    console.error("Error al crear campaña promocional:", error);
    return res.status(500).json({ error: "Error al crear campaña promocional" });
  }
}

export async function updatePromoCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para configurar campañas" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const promoId = String(req.params.id);
    const existing = await prisma.storePromoCampaign.findUnique({ where: { id: promoId } });

    if (!existing || existing.storeId !== store.id) {
      return res.status(404).json({ error: "Campaña no encontrada o no pertenece a tu comercio" });
    }

    const { name, type, description, discountPercent, multiplier, startDate, endDate, isActive } = req.body;

    const updated = await prisma.storePromoCampaign.update({
      where: { id: promoId },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        type: type !== undefined ? type : existing.type,
        description: description !== undefined ? (description ? String(description).trim() : null) : existing.description,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : existing.discountPercent,
        multiplier: multiplier !== undefined ? Number(multiplier) : existing.multiplier,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return res.json({ success: true, promoCampaign: updated });
  } catch (error) {
    console.error("Error al actualizar campaña promocional:", error);
    return res.status(500).json({ error: "Error al actualizar campaña promocional" });
  }
}

export async function deletePromoCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role === "STORE_STAFF") {
      return res.status(403).json({ error: "Los terminales POS o cajeros no tienen permisos para configurar campañas" });
    }
    const store = await getStoreForUser(req.user);
    if (!store) return res.status(404).json({ error: "Tienda no encontrada" });

    const promoId = String(req.params.id);
    const existing = await prisma.storePromoCampaign.findUnique({ where: { id: promoId } });

    if (!existing || existing.storeId !== store.id) {
      return res.status(404).json({ error: "Campaña no encontrada o no pertenece a tu comercio" });
    }

    await prisma.storePromoCampaign.delete({ where: { id: promoId } });

    return res.json({ success: true, message: "Campaña eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar campaña promocional:", error);
    return res.status(500).json({ error: "Error al eliminar campaña promocional" });
  }
}
