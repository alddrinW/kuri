# Reporte Técnico de Backend - Capa Desacoplada KURI

**Ubicación:** `backend/`  
**Runtime:** Node.js 20+ LTS / Express + TypeScript  
**Puerto:** `4000` (`http://localhost:4000`)  
**ORM:** Prisma 5.x+ (SQLite `dev.db` / compatible con PostgreSQL)  
**Estado:** Compilación TypeScript limpia (`tsc`)  

---

## 1. Organización en Capas Internas (`backend/src/`)

```
backend/
├── prisma/
│   ├── schema.prisma          # 10 modelos relacionales
│   ├── seed.ts                # Sembrador con datos de negocios reales
│   └── dev.db
├── src/
│   ├── config/
│   │   └── prisma.ts          # Singleton de Prisma
│   ├── controllers/
│   │   ├── auth.controller.ts    # login, register, getMe, logout
│   │   ├── store.controller.ts   # listStores, getStoreBySlug, updateStore, getStoreDashboard
│   │   ├── kuri.controller.ts    # resolveKuri (resolver polimórfico)
│   │   ├── pos.controller.ts     # handlePosAction (acreditación y canjes)
│   │   ├── wallet.controller.ts  # getWallet, transferLostKeychain
│   │   └── admin.controller.ts   # getAdminMetrics, listBatches, createBatch
│   ├── middlewares/
│   │   └── auth.middleware.ts    # JWT verification, cookies, roles
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── store.routes.ts
│   │   ├── kuri.routes.ts
│   │   ├── pos.routes.ts
│   │   ├── wallet.routes.ts
│   │   └── admin.routes.ts
│   └── index.ts               # Servidor Express con CORS hacia frontend (3000)
├── .env
├── package.json
└── tsconfig.json
```

---

## 2. Endpoints Implementados y Probados

- `POST /api/auth/login`: Autenticación con verificación bcrypt y cookie JWT.
- `POST /api/auth/register`: Registro y vinculación automática de llavero físico.
- `GET /api/auth/me`: Sesión activa y datos del usuario.
- `POST /api/auth/logout`: Revocación de sesión.
- `GET /api/stores`: Directorio de comercios.
- `GET /api/stores/:slug`: Vitrina pública de un negocio.
- `PUT /api/stores/:slug`: Actualización de datos por parte del dueño.
- `GET /api/store/dashboard`: Panel privado de métricas y clientes leales.
- `GET /api/kuri/resolve/:token`: **Resolver dinámico polimórfico del QR**.
- `POST /api/pos/action`: Operaciones de mostrador (sumar Oro por visita, por monto o canje).
- `GET /api/wallet`: Billetera multitienda del cliente.
- `POST /api/wallet/transfer`: Transferencia por llavero extraviado.
- `GET /api/admin/metrics`: Métricas de red del SuperAdmin.
- `GET /api/admin/stores`: Listado exhaustivo de comercios con sus dueños, credenciales, campañas, estado de suscripción y pagos recientes.
- `POST /api/admin/stores`: Alta integral de comercio con cuenta de propietario (`STORE_OWNER`), hash de contraseña, campaña base y mensualidad acordada.
- `PUT /api/admin/stores/:storeId/subscription`: Adaptación de tarifa mensual, día de corte y estado (`ACTIVE`, `SUSPENDED`, `PAST_DUE`).
- `POST /api/admin/stores/:storeId/payments`: Registro inmutable de pago de mensualidad y reactivación inmediata del negocio.
- `PUT /api/admin/campaigns/:storeId`: Configuración en caliente de parámetros de campaña (sellos vs monto, cooldown, límites).
- `GET /api/admin/batches`: Lotes de llaveros físicos.
- `POST /api/admin/batches`: Generación de nuevos lotes de llaveros con códigos QR Data URL.
- `GET /api/admin/keychains`: Catálogo global de todos los llaveros QR con metadata completa y códigos QR Data URL.
- `GET /api/admin/keychains/export/csv`: Exportación y descarga directa en archivo CSV compatible con Excel.

---

## 3. Modelo de Datos de Mensualidades y Facturación

- **Entidad `Store`:**
  - `subscriptionStatus`: Enum textual (`ACTIVE` | `SUSPENDED` | `PAST_DUE`).
  - `monthlyFee`: Cuota mensual pactada con el comercio en USD (Float).
  - `billingDueDay`: Día del mes de corte/vencimiento (1 a 31).
  - `nextBillingDate`: Marca temporal del próximo vencimiento.
  - `lastPaymentDate`: Marca temporal del último cobro registrado.
  - `subscriptionNotes`: Notas administrativas privadas del SuperAdmin.
- **Entidad `SubscriptionPayment`:**
  - Registro auditable de abonos con `id`, `storeId`, `amount`, `status`, `paymentMethod`, `paidAt`, `periodCovered`, `reference`, `notes`.
- **Regla de Bloqueo Automático:**
  - Cualquier negocio con `subscriptionStatus === "SUSPENDED"` ve rechazadas todas las operaciones de terminal POS (`POST /api/pos/action` retorna HTTP 403 `subscriptionSuspended: true`), su vitrina pública `/store/[slug]` se desactiva y el resolver `/api/kuri/resolve/:token` retorna flag de suspensión.


