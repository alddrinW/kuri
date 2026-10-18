import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de datos en KURI Backend...");

  await prisma.storePromoCampaign.deleteMany();
  await prisma.keychainOrder.deleteMany();
  await prisma.storeSchedule.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.unclaimedLedger.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.customerLoyalty.deleteMany();
  await prisma.keychain.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("kuri2026", 10);
  const adminHash = await bcrypt.hash("admin123", 10);
  const clientHash = await bcrypt.hash("cliente123", 10);

  // 1. Super Administrador
  await prisma.user.create({
    data: {
      email: "admin@kuri.app",
      name: "Alddrin Administrador",
      phone: "+593987654321",
      role: "SUPER_ADMIN",
      passwordHash: adminHash,
    },
  });

  // 2. Dueño y Staff - Tienda 1: Café Andino
  const ownerCafe = await prisma.user.create({
    data: {
      email: "carlos@cafeandino.com",
      name: "Carlos Mendoza",
      phone: "+593991122334",
      role: "STORE_OWNER",
      passwordHash,
    },
  });

  const cafeAndino = await prisma.store.create({
    data: {
      slug: "cafe-andino",
      name: "Café Andino de Especialidad",
      tagLine: "Tostaduría artesanal y café de origen andino",
      description: "Seleccionamos granos de altura cosechados a más de 1.800 metros. Espacio acogedor para trabajar, disfrutar y coleccionar Oro con cada visita.",
      logoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
      address: "Av. Amazonas y República, Quito",
      phone: "+593 2 290 4455",
      whatsapp: "593991122334",
      email: "hola@cafeandino.com",
      facebook: "https://facebook.com/cafeandino_ec",
      instagram: "https://instagram.com/cafeandino_ec",
      mapUrl: "https://maps.google.com/?q=Av.+Amazonas+y+Republica,+Quito",
      category: "Cafetería & Panadería de Autor",
      scheduleText: "Lunes a Viernes: 07:30 - 20:30 | Sábados: 09:00 - 18:00",
      scheduleMode: "AUTO",
      isOpenManual: true,
      ownerId: ownerCafe.id,
      subscriptionStatus: "ACTIVE",
      monthlyFee: 35.0,
      billingDueDay: 5,
      nextBillingDate: new Date("2026-11-05"),
      lastPaymentDate: new Date("2026-10-05"),
      subscriptionNotes: "Plan Élite Cafetería con soporte prioritario",
    },
  });

  const staffCafe = await prisma.user.create({
    data: {
      email: "barista@cafeandino.com",
      name: "Mateo Barista",
      phone: "+593998877665",
      role: "STORE_STAFF",
      staffStoreId: cafeAndino.id,
      passwordHash,
    },
  });

  await prisma.campaign.create({
    data: {
      storeId: cafeAndino.id,
      name: "Programa de Fidelidad de Café de Especialidad",
      description: "Acumula Oro con cada visita o compra y canjea Tesoros exclusivos",
      type: "VISIT_STAMP",
      goldPerVisit: 1,
      discountPercent: 10.0,
      cooldownMinutes: 30,
      maxDailyPoints: 2,
      bannerNotice: "Presenta tu llavero Kuri y disfruta 10% de descuento en la barra de cafés filtrados",
    },
  });

  // Campañas promocionales secundarias y descuentos por llavero
  await prisma.storePromoCampaign.create({
    data: {
      storeId: cafeAndino.id,
      name: "10% OFF con Llavero KURI en Barra de Filtrados",
      type: "KEYCHAIN_DISCOUNT",
      description: "Descuento directo e inmediato en todos los métodos V60, Chemex y Aeropress al mostrar tu llavero físico.",
      discountPercent: 10.0,
      isActive: true,
    },
  });

  await prisma.storePromoCampaign.create({
    data: {
      storeId: cafeAndino.id,
      name: "Jueves de Doble Oro Andino",
      type: "VISIT_MULTIPLIER",
      description: "Todos los jueves tus visitas suman el doble de Oro para que alcances tus Tesoros en la mitad de tiempo.",
      multiplier: 2,
      isActive: true,
    },
  });

  // Horarios de atención estructurados día por día
  const cafeSchedules = [
    { dayOfWeek: 1, openTime: "07:30", closeTime: "20:30", isOpen: true },
    { dayOfWeek: 2, openTime: "07:30", closeTime: "20:30", isOpen: true },
    { dayOfWeek: 3, openTime: "07:30", closeTime: "20:30", isOpen: true },
    { dayOfWeek: 4, openTime: "07:30", closeTime: "20:30", isOpen: true },
    { dayOfWeek: 5, openTime: "07:30", closeTime: "20:30", isOpen: true },
    { dayOfWeek: 6, openTime: "09:00", closeTime: "18:00", isOpen: true },
    { dayOfWeek: 7, openTime: "09:00", closeTime: "14:00", isOpen: false }, // Domingo cerrado
  ];
  for (const s of cafeSchedules) {
    await prisma.storeSchedule.create({
      data: {
        storeId: cafeAndino.id,
        ...s,
      },
    });
  }

  // Solicitudes y pedidos de llaveros de la tienda
  await prisma.keychainOrder.create({
    data: {
      storeId: cafeAndino.id,
      quantity: 100,
      deliveryAddress: "Av. Amazonas y República, Edificio Las Cámaras PB, Quito",
      contactPhone: "+593991122334",
      recipientName: "Carlos Mendoza",
      notes: "Llaveros grabados con logo dorado en el reverso para inauguración de campaña",
      status: "DELIVERED",
      trackingNumber: "SERVI-EC-992014",
    },
  });

  await prisma.keychainOrder.create({
    data: {
      storeId: cafeAndino.id,
      quantity: 50,
      deliveryAddress: "Av. Amazonas y República, Edificio Las Cámaras PB, Quito",
      contactPhone: "+593991122334",
      recipientName: "Carlos Mendoza",
      notes: "Pedido de reposición para temporada navideña y eventos de fin de año",
      status: "IN_PRODUCTION",
      trackingNumber: "KURI-PROD-2026-88",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        storeId: cafeAndino.id,
        name: "Espresso Doble Origen Loja",
        description: "Notas achocolatadas, cuerpo sedoso y acidez brillante.",
        price: 2.50,
        discountGoldPrice: 2.00,
        category: "Cafés de Especialidad",
        imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=80",
      },
      {
        storeId: cafeAndino.id,
        name: "Flat White con Leche de Avena",
        description: "Doble ristretto con microespuma cremosa aterciopelada.",
        price: 3.80,
        discountGoldPrice: 3.20,
        category: "Cafés de Especialidad",
        imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=80",
      },
      {
        storeId: cafeAndino.id,
        name: "Filtrado Geisha V60",
        description: "Notas florales a jazmín, bergamota y miel silvestre.",
        price: 4.80,
        discountGoldPrice: 4.00,
        category: "Métodos de Filtrado",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80",
      },
      {
        storeId: cafeAndino.id,
        name: "Tarta Rústica de Frutos Rojos",
        description: "Horneada diariamente con masa quebrada de mantequilla.",
        price: 4.20,
        discountGoldPrice: 3.50,
        category: "Pastelería Artesanal",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=80",
      },
      {
        storeId: cafeAndino.id,
        name: "Croissant Clásico de Mantequilla",
        description: "Hojaldrado tradicional con capas crujientes.",
        price: 2.80,
        discountGoldPrice: 2.30,
        category: "Pastelería Artesanal",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
      },
    ],
  });

  await prisma.reward.create({
    data: {
      storeId: cafeAndino.id,
      title: "Café Filtrado o Americano Gratis",
      description: "Disfruta cualquier bebida clásica caliente de la barra.",
      costInGold: 5,
      stock: 100,
    },
  });

  await prisma.reward.create({
    data: {
      storeId: cafeAndino.id,
      title: "Porción de Tarta Artesanal a Elección",
      description: "Tu postre favorito recién horneado.",
      costInGold: 9,
      stock: 50,
    },
  });

  await prisma.reward.create({
    data: {
      storeId: cafeAndino.id,
      title: "Taza Cerámica KURI Edición Coleccionista",
      description: "Pieza hecha a mano esmaltada con detalles en oro.",
      costInGold: 15,
      stock: 25,
    },
  });

  // 3. Dueño y Staff - Tienda 2: Barbería La Imperial
  const ownerBarber = await prisma.user.create({
    data: {
      email: "miguel@laimperial.com",
      name: "Miguel Barbero",
      phone: "+593994433221",
      role: "STORE_OWNER",
      passwordHash,
    },
  });

  const barberia = await prisma.store.create({
    data: {
      slug: "barberia-imperial",
      name: "Barbería La Imperial",
      tagLine: "Cortes clásicos, afeitado tradicional y cuidado masculino",
      description: "Tradición y precisión en cada corte. Toallas calientes, navaja libre y la mejor atmósfera para caballeros.",
      logoUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
      address: "Calle La Niña y Juan León Mera, Quito",
      phone: "+593 2 250 8899",
      whatsapp: "593994433221",
      email: "citas@laimperial.com",
      facebook: "https://facebook.com/laimperial_barber",
      instagram: "https://instagram.com/laimperial_barber",
      mapUrl: "https://maps.google.com/?q=Calle+La+Nina+y+Juan+Leon+Mera,+Quito",
      category: "Barbería & Estética Masculina",
      scheduleText: "Martes a Sábado: 10:00 - 19:30",
      scheduleMode: "AUTO",
      isOpenManual: true,
      ownerId: ownerBarber.id,
      subscriptionStatus: "ACTIVE",
      monthlyFee: 29.0,
      billingDueDay: 1,
      nextBillingDate: new Date("2026-11-01"),
      lastPaymentDate: new Date("2026-10-01"),
      subscriptionNotes: "Plan Estándar Mensual",
    },
  });

  const staffBarber = await prisma.user.create({
    data: {
      email: "cajero@laimperial.com",
      name: "Andrés Recepción",
      phone: "+593997766554",
      role: "STORE_STAFF",
      staffStoreId: barberia.id,
      passwordHash,
    },
  });

  await prisma.campaign.create({
    data: {
      storeId: barberia.id,
      name: "Club de Caballeros La Imperial",
      description: "Suma Oro en cada corte o afeitado tradicional y canjea servicios de cortesía",
      type: "VISIT_STAMP",
      goldPerVisit: 1,
      discountPercent: 15.0,
      cooldownMinutes: 60,
      maxDailyPoints: 1,
      bannerNotice: "15% de descuento en afeitado tradicional al presentar tu llavero KURI",
    },
  });

  await prisma.storePromoCampaign.create({
    data: {
      storeId: barberia.id,
      name: "15% OFF en Ritual de Barba",
      type: "KEYCHAIN_DISCOUNT",
      description: "Descuento en perfilado de navaja y tratamiento con toallas calientes para portadores de KURI.",
      discountPercent: 15.0,
      isActive: true,
    },
  });

  const barberSchedules = [
    { dayOfWeek: 1, openTime: "10:00", closeTime: "19:30", isOpen: false }, // Lunes cerrado
    { dayOfWeek: 2, openTime: "10:00", closeTime: "19:30", isOpen: true },
    { dayOfWeek: 3, openTime: "10:00", closeTime: "19:30", isOpen: true },
    { dayOfWeek: 4, openTime: "10:00", closeTime: "19:30", isOpen: true },
    { dayOfWeek: 5, openTime: "10:00", closeTime: "19:30", isOpen: true },
    { dayOfWeek: 6, openTime: "09:00", closeTime: "20:00", isOpen: true },
    { dayOfWeek: 7, openTime: "10:00", closeTime: "15:00", isOpen: false }, // Domingo cerrado
  ];
  for (const s of barberSchedules) {
    await prisma.storeSchedule.create({
      data: {
        storeId: barberia.id,
        ...s,
      },
    });
  }

  await prisma.keychainOrder.create({
    data: {
      storeId: barberia.id,
      quantity: 50,
      deliveryAddress: "Calle La Niña y Juan León Mera, Quito",
      contactPhone: "+593994433221",
      recipientName: "Miguel Barbero",
      notes: "Llaveros metálicos grabados para clientes VIP",
      status: "DELIVERED",
      trackingNumber: "SERVI-EC-883902",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        storeId: barberia.id,
        name: "Corte Clásico Imperial",
        description: "Lavado previo, corte a tijera/máquina y peinado profesional.",
        price: 12.00,
        discountGoldPrice: 10.00,
        category: "Servicios de Barbería",
        imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80",
      },
      {
        storeId: barberia.id,
        name: "Ritual de Barba con Toalla Caliente",
        description: "Perfilado a navaja, aceites esenciales y bálsamo hidratante.",
        price: 8.00,
        discountGoldPrice: 6.50,
        category: "Servicios de Barbería",
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=80",
      },
    ],
  });

  await prisma.reward.create({
    data: {
      storeId: barberia.id,
      title: "Perfilado de Barba de Cortesía",
      description: "Ritual express con navaja y toalla caliente.",
      costInGold: 4,
      stock: 50,
    },
  });

  // 3.5. Dueño y Staff - Tienda 3: Panadería La Tradicional (ESTADO: SUSPENDIDA POR FALTA DE PAGO)
  const ownerPanaderia = await prisma.user.create({
    data: {
      email: "elena@latradicional.com",
      name: "Elena Morales",
      phone: "+593995544332",
      role: "STORE_OWNER",
      passwordHash,
    },
  });

  const panaderia = await prisma.store.create({
    data: {
      slug: "panaderia-tradicional",
      name: "Panadería La Tradicional",
      tagLine: "Masa madre, panes artesanales y café de paso",
      description: "Recetas centenarias de masa madre horneadas en leña. Panadería clásica del barrio con aroma inconfundible.",
      logoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&auto=format&fit=crop&q=80",
      address: "Calle Guayaquil y Chile, Centro Histórico, Quito",
      phone: "+593 2 228 1122",
      whatsapp: "593995544332",
      category: "Panadería & Pastelería",
      scheduleText: "Lunes a Domingo: 06:30 - 20:00",
      isOpenManual: true,
      ownerId: ownerPanaderia.id,
      subscriptionStatus: "SUSPENDED",
      monthlyFee: 25.0,
      billingDueDay: 15,
      nextBillingDate: new Date("2026-09-15"),
      lastPaymentDate: new Date("2026-08-15"),
      subscriptionNotes: "Mora de 2 meses. Suspensión preventiva de vitrina web y sistema POS.",
    },
  });

  const staffPanaderia = await prisma.user.create({
    data: {
      email: "caja@latradicional.com",
      name: "Lucía Mostrador",
      phone: "+593993322110",
      role: "STORE_STAFF",
      staffStoreId: panaderia.id,
      passwordHash,
    },
  });

  await prisma.campaign.create({
    data: {
      storeId: panaderia.id,
      type: "VISIT_STAMP",
      goldPerVisit: 1,
      cooldownMinutes: 20,
      maxDailyPoints: 2,
    },
  });

  await prisma.product.create({
    data: {
      storeId: panaderia.id,
      name: "Hogaza de Masa Madre Tradicional",
      description: "Fermentación lenta de 36 horas con harina integral orgánica.",
      price: 4.50,
      discountGoldPrice: 3.50,
      category: "Panadería Rústica",
      imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80",
    },
  });

  await prisma.reward.create({
    data: {
      storeId: panaderia.id,
      title: "Baguette Rústica Gratis",
      description: "Baguette crujiente recién salida del horno.",
      costInGold: 6,
      stock: 30,
    },
  });

  await prisma.keychain.create({
    data: {
      token: "KURI-PANA-001",
      storeId: panaderia.id,
      customerId: null,
      status: "ASSIGNED_STORE",
      batchNumber: "LOTE-2026-03",
    },
  });

  // 4. Clientes Reales
  const customer1 = await prisma.user.create({
    data: {
      email: "sofia@gmail.com",
      name: "Sofía Delgado",
      phone: "+593981122334",
      role: "CUSTOMER",
      passwordHash: clientHash,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "esteban@gmail.com",
      name: "Esteban Rivas",
      phone: "+593985566778",
      role: "CUSTOMER",
      passwordHash: clientHash,
    },
  });

  // 5. Llaveros Físicos
  const keychainCafe1 = await prisma.keychain.create({
    data: {
      token: "KURI-CAFE-001",
      storeId: cafeAndino.id,
      customerId: customer1.id,
      status: "ACTIVATED_USER",
      batchNumber: "LOTE-2026-01",
    },
  });

  const keychainBarb1 = await prisma.keychain.create({
    data: {
      token: "KURI-BARB-001",
      storeId: barberia.id,
      customerId: customer1.id,
      status: "ACTIVATED_USER",
      batchNumber: "LOTE-2026-01",
    },
  });

  const keychainCafe2 = await prisma.keychain.create({
    data: {
      token: "KURI-CAFE-002",
      storeId: cafeAndino.id,
      customerId: customer2.id,
      status: "ACTIVATED_USER",
      batchNumber: "LOTE-2026-01",
    },
  });

  // Llavero sin activar con 2 puntos huérfanos
  await prisma.keychain.create({
    data: {
      token: "KURI-CAFE-003",
      storeId: cafeAndino.id,
      customerId: null,
      status: "ASSIGNED_STORE",
      batchNumber: "LOTE-2026-01",
    },
  });

  await prisma.unclaimedLedger.create({
    data: {
      keychainToken: "KURI-CAFE-003",
      storeId: cafeAndino.id,
      goldAmount: 2,
      staffId: staffCafe.id,
      isClaimed: false,
    },
  });

  // 6. Saldos de Lealtad
  await prisma.customerLoyalty.create({
    data: {
      customerId: customer1.id,
      storeId: cafeAndino.id,
      currentGold: 4,
      lifetimeGold: 7,
      tier: "SILVER",
    },
  });

  await prisma.customerLoyalty.create({
    data: {
      customerId: customer1.id,
      storeId: barberia.id,
      currentGold: 2,
      lifetimeGold: 2,
      tier: "BRONZE",
    },
  });

  await prisma.customerLoyalty.create({
    data: {
      customerId: customer2.id,
      storeId: cafeAndino.id,
      currentGold: 8,
      lifetimeGold: 14,
      tier: "GOLD",
    },
  });

  // 7. Transacciones Históricas
  await prisma.loyaltyTransaction.create({
    data: {
      storeId: cafeAndino.id,
      customerId: customer1.id,
      keychainId: keychainCafe1.id,
      staffId: staffCafe.id,
      goldAmount: 1,
      type: "VISIT",
      note: "Visita confirmada en caja",
    },
  });

  // 8. Registro Real de Mensualidades y Pagos de Comercios
  await prisma.subscriptionPayment.create({
    data: {
      storeId: cafeAndino.id,
      amount: 35.0,
      status: "COMPLETED",
      paymentMethod: "TRANSFERENCIA",
      reference: "TRF-982341-PICHINCHA",
      periodCovered: "Octubre 2026",
      notes: "Mensualidad Plan Élite acreditada en cuenta corporativa KURI",
      paidAt: new Date("2026-10-05T10:30:00Z"),
    },
  });

  await prisma.subscriptionPayment.create({
    data: {
      storeId: barberia.id,
      amount: 29.0,
      status: "COMPLETED",
      paymentMethod: "TARJETA",
      reference: "STRIPE-CH-883192",
      periodCovered: "Octubre 2026",
      notes: "Cobro recurrente aprobado",
      paidAt: new Date("2026-10-01T08:15:00Z"),
    },
  });

  console.log("Sembrado en Backend completado exitosamente con sistema de mensualidades.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
