# Historia de Usuario HU-007: Sistema de Mensualidades, Cobros y Suspensión de Comercios

**Código:** HU-007  
**Módulo:** Facturación, Mensualidades & Control Operativo Central  
**Rol Principal:** Super Administrador (Admin Global KURI)  
**Roles Secundarios:** Dueño de Comercio (`STORE_OWNER`), Cajero (`STORE_STAFF`), Cliente Final (`CUSTOMER`)  

---

## 📌 Declaración de la Historia
> **Como** Super Administrador de la plataforma KURI,  
> **quiero** configurar y adaptar la mensualidad acordada para cada comercio afiliado, registrar sus pagos periódicos y contar con un mecanismo de suspensión automática o manual por falta de pago,  
> **para** garantizar la recaudación recurrente del modelo SaaS de KURI e inhabilitar de inmediato tanto la vitrina web pública como el sistema de fidelidad y POS de los comercios que incumplan con sus mensualidades.

---

## 🎯 Criterios de Aceptación (Gherkin)

### Escenario 1: Adaptación de cuota mensual y día de corte por negocio
- **Dado que** el SuperAdmin está autenticado en `/admin/dashboard` y accede a la pestaña "Mensualidades & Cobros",
- **Cuando** selecciona "Ajustar Tarifa" sobre un comercio específico y modifica la cuota (ej. $35.00 USD/mes) y el día de corte (ej. Día 5 de cada mes),
- **Entonces** el sistema actualiza la entidad `Store` en base de datos (`monthlyFee`, `billingDueDay`), recalculando su ciclo de facturación sin alterar sus llaveros ni clientes existentes.

### Escenario 2: Bloqueo total de la vitrina web pública cuando el comercio está suspendido
- **Dado que** un comercio tiene su estado de suscripción en `SUSPENDED`,
- **Cuando** un cliente o visitante ingresa a su URL pública `/store/[slug]`,
- **Entonces** el sistema no renderiza el catálogo, precios ni recompensas, mostrando en su lugar una pantalla sobria y profesional de suspensión: "Vitrina Web Inactiva - Suspensión preventiva por mensualidad pendiente".

### Escenario 3: Bloqueo de terminal POS y escaneo de llaveros cuando el comercio está suspendido
- **Dado que** un comercio se encuentra en estado `SUSPENDED`,
- **Cuando** el cajero o dueño intenta abrir la terminal POS `/pos/[token]` o enviar una acreditación (`ADD_VISIT`, `ADD_PURCHASE`, `REDEEM_REWARD`),
- **Entonces** el backend rechaza la mutación con código HTTP 403 (`subscriptionSuspended: true`) y la interfaz muestra una alerta de bloqueo impidiendo otorgar Oro o canjear Tesoros.

### Escenario 4: Registro de pago y reactivación inmediata del servicio
- **Dado que** un comercio suspendido regulariza su cuota mensual,
- **Cuando** el SuperAdmin registra el cobro en el panel indicando el monto, método de pago (transferencia, tarjeta, efectivo) y referencia de comprobante,
- **Entonces** el sistema crea un registro inmutable en `SubscriptionPayment`, actualiza la tienda a `ACTIVE`, establece la fecha de último pago, avanza la próxima fecha de corte en 1 mes y desbloquea instantáneamente su vitrina pública y su terminal POS.

---

## 🛠️ Especificación Técnica
- **Modelos BD:**
  - `Store`: `subscriptionStatus` (`ACTIVE` | `SUSPENDED` | `PAST_DUE`), `monthlyFee`, `billingDueDay`, `nextBillingDate`, `lastPaymentDate`, `subscriptionNotes`.
  - `SubscriptionPayment`: `id`, `storeId`, `amount`, `status`, `paymentMethod`, `paidAt`, `periodCovered`, `reference`, `notes`.
- **Endpoints:**
  - `PUT /api/admin/stores/:storeId/subscription` (Actualización de cuota, día de corte y estado).
  - `POST /api/admin/stores/:storeId/payments` (Registro de abono, histórico y reactivación inmediata).
  - `GET /api/admin/stores` (Incluye métricas de suscripción e historial reciente de pagos).
  - `POST /api/pos/action` (Guard de suscripción activa antes de mutar puntos).
  - `GET /api/kuri/resolve/:token` (Retorna flag `isSuspended: true` si la tienda está en mora).
- **Frontend:**
  - Pestaña "Mensualidades & Cobros" en `/admin/dashboard` con KPIs financieros, directorio y filtros.
  - Modales dedicados para edición de mensualidad y registro de cobro.
  - Vistas de bloqueo en `/store/[slug]`, `/pos/[token]`, `/kuri/[token]` y banner en `/store/dashboard`.
