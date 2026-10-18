import { prisma } from "../config/prisma.js";
import { signToken } from "../middlewares/auth.middleware.js";

async function runStaffPermissionTests() {
  console.log("=== INICIANDO VALIDACIÓN DE PERMISOS: TERMINAL POS / BARISTA / CAJERO ===");
  const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";

  // 1. Obtener usuario barista / cajero con rol STORE_STAFF
  const staff = await prisma.user.findUnique({
    where: { email: "barista@cafeandino.com" },
  });

  if (!staff) {
    throw new Error("No se encontró el usuario staff barista@cafeandino.com en la base de datos");
  }

  const staffToken = signToken({
    userId: staff.id,
    email: staff.email,
    name: staff.name,
    role: staff.role,
    staffStoreId: staff.staffStoreId,
  });

  const authHeaders = {
    "Authorization": `Bearer ${staffToken}`,
    "Cookie": `kuri_session_token=${staffToken}`,
  };
  console.log(`[AUTH] Autenticado como staff: ${staff.name} (${staff.email}) - Rol: ${staff.role}`);

  // 2. Probar lectura del Dashboard (Permitido: Resumen General)
  const dashRes = await fetch(`${baseUrl}/api/store/dashboard`, {
    headers: { ...authHeaders },
  });
  const dashData: any = await dashRes.json();
  if (dashRes.status !== 200 || !dashData.isStaff || dashData.userRole !== "STORE_STAFF") {
    throw new Error(`Fallo en lectura de dashboard para staff: Status ${dashRes.status}, isStaff=${dashData?.isStaff}`);
  }
  console.log("[PASS] GET /api/store/dashboard: Staff puede ver resumen general e identifica su rol correctamente.");

  // 3. Probar lectura de Carta y Productos (Permitido: Modo consulta)
  const productsRes = await fetch(`${baseUrl}/api/store/products`, {
    headers: { ...authHeaders },
  });
  const productsData: any = await productsRes.json();
  if (productsRes.status !== 200 || !Array.isArray(productsData.products)) {
    throw new Error(`Fallo en consulta de productos para staff: Status ${productsRes.status}`);
  }
  console.log(`[PASS] GET /api/store/products: Staff puede consultar catálogo digital (${productsData.products.length} productos).`);

  // 4. Probar lectura de Llaveros (Permitido: Inventario y lotes)
  const keychainsRes = await fetch(`${baseUrl}/api/store/keychain-orders`, {
    headers: { ...authHeaders },
  });
  const keychainsData: any = await keychainsRes.json();
  if (keychainsRes.status !== 200 || !Array.isArray(keychainsData.orders)) {
    throw new Error(`Fallo en consulta de llaveros para staff: Status ${keychainsRes.status}`);
  }
  console.log(`[PASS] GET /api/store/keychain-orders: Staff puede ver inventario y pedidos de llaveros (${keychainsData.orders.length} pedidos).`);

  // 5. Probar bloqueo de Edición de Perfil de Tienda (Prohibido -> 403)
  const profileRes = await fetch(`${baseUrl}/api/store/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ name: "Intento de cambio no autorizado" }),
  });
  if (profileRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al editar perfil pero se obtuvo ${profileRes.status}`);
  }
  console.log("[PASS] PUT /api/store/profile: Bloqueado con 403 Forbidden para staff de terminal POS.");

  // 6. Probar bloqueo de Alternar Estado de Apertura (Prohibido -> 403)
  const toggleRes = await fetch(`${baseUrl}/api/store/toggle-status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({}),
  });
  if (toggleRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al alternar apertura pero se obtuvo ${toggleRes.status}`);
  }
  console.log("[PASS] PUT /api/store/toggle-status: Bloqueado con 403 Forbidden para staff de terminal POS.");

  // 7. Probar bloqueo de Horarios de Atención (Prohibido -> 403)
  const schedulesRes = await fetch(`${baseUrl}/api/store/schedules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ scheduleText: "Lunes a Viernes" }),
  });
  if (schedulesRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al modificar horarios pero se obtuvo ${schedulesRes.status}`);
  }
  console.log("[PASS] PUT /api/store/schedules: Bloqueado con 403 Forbidden para staff de terminal POS.");

  // 8. Probar bloqueo de Creación de Producto (Prohibido -> 403)
  const createProductRes = await fetch(`${baseUrl}/api/store/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ name: "Producto No Autorizado", price: 10 }),
  });
  if (createProductRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al crear producto pero se obtuvo ${createProductRes.status}`);
  }
  console.log("[PASS] POST /api/store/products: Bloqueado con 403 Forbidden para staff (solo lectura en mostrador).");

  // 9. Probar bloqueo de Configuración de Campañas (Prohibido -> 403)
  const campaignRes = await fetch(`${baseUrl}/api/store/campaigns/promo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ name: "Campaña No Autorizada", discountPercent: 50 }),
  });
  if (campaignRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al configurar campañas pero se obtuvo ${campaignRes.status}`);
  }
  console.log("[PASS] POST /api/store/campaigns/promo: Bloqueado con 403 Forbidden para staff.");

  // 10. Probar bloqueo de Pedidos de Lotes de Llaveros (Prohibido -> 403)
  const orderRes = await fetch(`${baseUrl}/api/store/keychain-orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ quantity: 100, deliveryAddress: "Calle Falsa", contactPhone: "123", recipientName: "Mateo" }),
  });
  if (orderRes.status !== 403) {
    throw new Error(`Se esperaba 403 Forbidden al solicitar lotes de llaveros pero se obtuvo ${orderRes.status}`);
  }
  console.log("[PASS] POST /api/store/keychain-orders: Bloqueado con 403 Forbidden para staff.");

  console.log("=== TODAS LAS REGLAS DE SEGURIDAD Y PERMISOS FUERON VALIDADAS EXITOSAMENTE ===");
}

runStaffPermissionTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error en validación:", err);
    process.exit(1);
  });
