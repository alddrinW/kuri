# Reporte Técnico de Backend: Módulo de Gestión Integral del Comercio

**Módulo:** Centro de Control de Tienda (Store Management Core)  
**Fecha:** 2026-10-11  
**Autor:** Antigravity Agentic Assistant  
**Estado:** COMPLETADO Y VALIDADO  
**Historia de Usuario Asociada:** [HU-008](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/docs/HU/HU-008-panel-gestion-tienda-productos-horarios-llaveros-campanas.md)  

---

## 1. Resumen Ejecutivo
Se diseñó e implementó la arquitectura de backend para dotar a los dueños de negocios (`STORE_OWNER`) y superadministradores de total autonomía operativa sobre sus tiendas asociadas. Esto comprende:
1. **Catálogo de Productos y Precios:** CRUD relacional completo con soporte de precio estándar, precio exclusivo "Cliente de Oro", fotografías en alta definición y estado de disponibilidad en tiempo real.
2. **Horarios de Atención Semanales:** Modelado estructurado para los 7 días de la semana (`StoreSchedule`) con horas de apertura/cierre, bandera de días no laborales y switch de control de apertura en vivo (`isOpenManual`).
3. **Gestión de Lotes y Solicitud de Llaveros Físicos:** Modelo relacional `KeychainOrder` con trazabilidad de estado (`PENDING`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`), dirección física y notas de grabado.
4. **Campañas Polimórficas de Fidelidad y Descuentos:** Calibración en caliente de la campaña base (`Campaign`) y soporte para múltiples promociones de descuento directo o multiplicadores (`StorePromoCampaign`).

---

## 2. Modelos de Base de Datos y Esquema Prisma

Se agregaron y extendieron las siguientes entidades en [`backend/prisma/schema.prisma`](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/backend/prisma/schema.prisma):

### 2.1. Modelo `StoreSchedule`
```prisma
model StoreSchedule {
  id        String   @id @default(cuid())
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  dayOfWeek Int      // 1: Lunes, ..., 7: Domingo
  openTime  String   @default("08:00")
  closeTime String   @default("20:00")
  isOpen    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([storeId, dayOfWeek])
}
```

### 2.2. Modelo `KeychainOrder`
```prisma
model KeychainOrder {
  id              String   @id @default(cuid())
  storeId         String
  store           Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  quantity        Int      @default(50)
  deliveryAddress String
  contactPhone    String
  recipientName   String
  notes           String?
  status          String   @default("PENDING") // PENDING, IN_PRODUCTION, SHIPPED, DELIVERED, CANCELLED
  trackingNumber  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 2.3. Modelo `StorePromoCampaign`
```prisma
model StorePromoCampaign {
  id              String    @id @default(cuid())
  storeId         String
  store           Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)
  name            String
  type            String    @default("KEYCHAIN_DISCOUNT") // KEYCHAIN_DISCOUNT, VISIT_MULTIPLIER
  description     String?
  discountPercent Float?    @default(10.0)
  multiplier      Int?      @default(2)
  startDate       DateTime?
  endDate         DateTime?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 3. Endpoints de API Expuestos

Todas las rutas fueron registradas en [`backend/src/routes/store.routes.ts`](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/backend/src/routes/store.routes.ts) bajo protección con autenticación persistente JWT/Cookies:

| Método | Endpoint | Middleware | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/store/products` | `requireAuth` | Lista los productos del comercio autenticado |
| **POST** | `/api/store/products` | `requireAuth` | Crea un producto con validación de precios y categorías |
| **PUT** | `/api/store/products/:id` | `requireAuth` | Actualiza atributos o disponibilidad inmediata |
| **DELETE** | `/api/store/products/:id` | `requireAuth` | Elimina un producto de la carta |
| **GET** | `/api/store/schedules` | `requireAuth` | Retorna los horarios semanales estructurados |
| **PUT** | `/api/store/schedules` | `requireAuth` | Actualiza días de apertura y texto de resumen |
| **PUT** | `/api/store/toggle-status` | `requireAuth` | Conmuta estado de apertura en vivo |
| **GET** | `/api/store/keychain-orders`| `requireAuth` | Consulta el historial de pedidos de llaveros |
| **POST** | `/api/store/keychain-orders`| `requireAuth` | Crea una nueva orden de abastecimiento de llaveros |
| **GET** | `/api/store/campaigns` | `requireAuth` | Devuelve la campaña principal y promociones secundarias |
| **PUT** | `/api/store/campaign/main` | `requireAuth` | Calibra puntos de oro, límites diarios y cooldown antifraude |
| **POST** | `/api/store/campaigns/promo`| `requireAuth` | Registra una nueva promoción de descuento con llavero |
| **PUT** | `/api/store/campaigns/promo/:id`| `requireAuth` | Edita o pausa una promoción secundaria |
| **DELETE**| `/api/store/campaigns/promo/:id`| `requireAuth` | Elimina una promoción secundaria |

---

## 4. Pruebas y Validación Real
Se ejecutó un script de verificación automatizado en [`backend/src/tests/test_store_management.ts`](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/backend/src/tests/test_store_management.ts) y una prueba HTTP completa contra el servidor en vivo, certificando:
- Inserción y consulta en base de datos sin errores de tipado (0 linter errors).
- Integridad multi-tenant: las mutaciones verifican pertenencia estricta de la tienda al usuario en sesión.
- Sincronización inmediata con la vitrina pública `/api/stores/:slug`.
