import { prisma } from "../config/prisma.js";
import { signToken } from "../middlewares/auth.middleware.js";

async function runStoreTests() {
  console.log("Iniciando pruebas de validación con datos reales del panel de comercio...");

  // 1. Obtener usuario dueño de Café Andino
  const owner = await prisma.user.findUnique({
    where: { email: "carlos@cafeandino.com" },
  });

  if (!owner) {
    throw new Error("No se encontró el usuario dueño de prueba carlos@cafeandino.com");
  }

  const token = signToken({
    userId: owner.id,
    email: owner.email,
    name: owner.name,
    role: owner.role,
  });

  const cafeStore = await prisma.store.findFirst({
    where: { ownerId: owner.id },
  });

  if (!cafeStore) {
    throw new Error("No se encontró la tienda asignada a carlos@cafeandino.com");
  }

  console.log(`Usuario autenticado: ${owner.name} (${owner.email})`);
  console.log(`Tienda vinculada: ${cafeStore.name} (ID: ${cafeStore.id}, Slug: ${cafeStore.slug})`);

  // 2. Probar creación de producto real
  const testProduct = await prisma.product.create({
    data: {
      storeId: cafeStore.id,
      name: "Cold Brew Maceración 24h",
      description: "Extracción en frío con café de altura y notas cítricas.",
      price: 3.50,
      discountGoldPrice: 2.80,
      category: "Bebidas Frías",
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
      isAvailable: true,
    },
  });
  console.log(`[PASS] Producto creado: ${testProduct.name} - $${testProduct.price} (Oro: $${testProduct.discountGoldPrice})`);

  // 3. Probar actualización de producto
  const updatedProduct = await prisma.product.update({
    where: { id: testProduct.id },
    data: {
      price: 3.75,
      description: "Extracción en frío con café de altura, notas a jazmín y naranja.",
    },
  });
  console.log(`[PASS] Producto actualizado: nuevo precio $${updatedProduct.price}`);

  // 4. Probar consulta de horarios
  const schedules = await prisma.storeSchedule.findMany({
    where: { storeId: cafeStore.id },
    orderBy: { dayOfWeek: "asc" },
  });
  console.log(`[PASS] Horarios consultados: ${schedules.length} días configurados`);

  // 5. Probar actualización de horario (cambiar domingo a abierto)
  await prisma.storeSchedule.updateMany({
    where: { storeId: cafeStore.id, dayOfWeek: 7 },
    data: { isOpen: true, openTime: "09:00", closeTime: "15:00" },
  });
  console.log(`[PASS] Horario de domingo actualizado a abierto 09:00-15:00`);

  // 6. Probar conmutador de estado en vivo
  const toggled = await prisma.store.update({
    where: { id: cafeStore.id },
    data: { isOpenManual: !cafeStore.isOpenManual },
  });
  console.log(`[PASS] Conmutador de tienda en vivo alterado a: ${toggled.isOpenManual ? "Abierto" : "Cerrado"}`);

  // Restaurar estado abierto
  await prisma.store.update({
    where: { id: cafeStore.id },
    data: { isOpenManual: true },
  });

  // 7. Probar creación de pedido de llaveros
  const newOrder = await prisma.keychainOrder.create({
    data: {
      storeId: cafeStore.id,
      quantity: 150,
      deliveryAddress: "Av. Amazonas y República, PB, Quito",
      contactPhone: "+593991122334",
      recipientName: "Carlos Mendoza",
      notes: "Lote de alta prioridad para evento de café de especialidad",
      status: "PENDING",
    },
  });
  console.log(`[PASS] Pedido de llaveros registrado: ${newOrder.quantity} unidades (Estado: ${newOrder.status})`);

  // 8. Probar campañas polimórficas (actualizar principal y crear secundaria)
  const updatedCampaign = await prisma.campaign.update({
    where: { storeId: cafeStore.id },
    data: {
      goldPerVisit: 2,
      discountPercent: 12.0,
      bannerNotice: "¡Esta semana duplica tu Oro con cada visita!",
    },
  });
  console.log(`[PASS] Campaña principal calibrada: ${updatedCampaign.goldPerVisit} Oro/visita, 12% descuento`);

  const newPromo = await prisma.storePromoCampaign.create({
    data: {
      storeId: cafeStore.id,
      name: "Happy Hour de Cafés Filtrados 20% OFF",
      type: "KEYCHAIN_DISCOUNT",
      description: "Todos los días de 16:00 a 18:00 presentando tu llavero KURI.",
      discountPercent: 20.0,
      isActive: true,
    },
  });
  console.log(`[PASS] Campaña promocional creada: ${newPromo.name} (${newPromo.discountPercent}% OFF)`);

  // 9. Limpiar registros de prueba generados
  await prisma.product.delete({ where: { id: testProduct.id } });
  await prisma.keychainOrder.delete({ where: { id: newOrder.id } });
  await prisma.storePromoCampaign.delete({ where: { id: newPromo.id } });

  // Restaurar campaña principal a valores iniciales
  await prisma.campaign.update({
    where: { storeId: cafeStore.id },
    data: {
      goldPerVisit: 1,
      discountPercent: 10.0,
      bannerNotice: "Presenta tu llavero Kuri y disfruta 10% de descuento en la barra de cafés filtrados",
    },
  });

  console.log("\nTODAS LAS PRUEBAS DE SERVICIO Y BASE DE DATOS FINALIZARON EXITOSAMENTE.");
}

runStoreTests()
  .catch((err) => {
    console.error("ERROR EN PRUEBAS:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
