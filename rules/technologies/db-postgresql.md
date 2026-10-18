# Reglas de Base de Datos - PostgreSQL & Prisma ORM (KURI)

## 1. Lineamientos Generales
- **Motor:** PostgreSQL 16+.
- **ORM:** Prisma 5.x+.
- **Identificadores:** UUID v4 (`cuid` o `uuid`) para entidades públicas; códigos alfanuméricos seguros y compactos para tokens físicos de llavero QR.
- **Auditoría:** `createdAt` y `updatedAt` obligatorios en todos los modelos.

## 2. Esquema Relacional Base (Entidades Principales)
- `User`: Roles (`SUPER_ADMIN`, `STORE_OWNER`, `STORE_STAFF`, `CUSTOMER`), credenciales, perfil.
- `Store`: Información del negocio (nombre, slug, foto, descripción, contacto, horarios, productos/precios).
- `Campaign`: Configuración de fidelidad (sellos por visita vs puntos por monto, cooldown, límite diario, niveles).
- `Keychain`: Llavero físico (código único permanente, lote de impresión `batch_id`, estado `UNASSIGNED`, `ASSIGNED_STORE`, `ACTIVATED_USER`, `LOST`).
- `CustomerLoyalty`: Relación cliente-tienda (oro acumulado actual, oro histórico, nivel actual: Bronce/Plata/Oro).
- `LoyaltyTransaction`: Registro inmutable (oro sumado/restado, tipo: `VISIT`, `PURCHASE_AMOUNT`, `REWARD_REDEMPTION`, staff responsable, timestamps).
- `Reward` ("Tesoros"): Catálogo de recompensas (costo en oro, stock, reglas de canje).
- `RewardRedemption`: Cupones/canjes generados y validados en caja.
- `UnclaimedLedger`: Oro acumulado en llaveros antes de que el cliente cree su cuenta digital.
