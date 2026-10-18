# Reporte de Optimización Frontend: Creación de Negocios y Activación de Suscripciones con Calendario

## 1. Resumen Ejecutivo
Se implementó la refactorización integral del flujo de alta de comercios y activación de suscripciones en el panel de SuperAdmin (`/admin/dashboard`):
- **Desacoplamiento de la Creación Inicial:** Se removieron los bloques de Campaña Base de Fidelidad y Cuota de Suscripción del formulario modal de registro de negocio. El formulario ahora es ágil, enfocado exclusivamente en datos comerciales y credenciales del propietario.
- **Activación Directa en Directorio de Comercios:** Cada negocio en la tabla de comercios cuenta con un botón directo y contextual para activar o gestionar su suscripción (`Activar Suscripción` / `Gestionar`).
- **Selector de Calendario Profesional:** El modal de configuración de suscripción incorpora un selector de fecha con calendario (`input[type="date"]`) junto con atajos dinámicos (`+15 Días`, `+30 Días`, `1° del Próximo Mes`, `Fin de Mes`) y cálculo automático del día de corte mensual.

---

## 2. Componentes y Vistas Modificadas

### `frontend/src/app/admin/dashboard/page.tsx`
1. **Modal `showCreateStoreModal`:**
   - Reducción del formulario a 2 secciones claras:
     - Sección 1: Datos del Negocio (Nombre, Slug autogenerado, Categoría, Teléfono/WhatsApp, Dirección).
     - Sección 2: Credenciales de Acceso para el Propietario (Nombre, Correo para login, Contraseña inicial).
   - Bloque informativo que notifica que la campaña se inicializa con parámetros recomendados y la suscripción se activa desde el listado.
2. **Tabla de Directorio de Comercios (`activeTab === "stores"`):**
   - Columna "Mensualidad & Estado" enriquecida con badge visual de estado (`Activo` / `Suspendido`), tarifa mensual y fecha de próximo corte extraída del calendario.
   - Botón directo de acción: `Activar Suscripción` (con llamada a la acción en tonos ámbar) para comercios no configurados, o `Gestionar` para comercios al día.
3. **Modal `editSubModalOpen` (Activación y Configuración de Suscripción):**
   - Switch de estado: `Activo` vs `Suspendido`.
   - Selector de tarifa con montos predefinidos ($19, $29, $39, $49, $99).
   - Selector interactivo de calendario con sincronización bidireccional entre la fecha seleccionada y el día de corte mensual (`billingDueDay`).
   - Atajos rápidos de calendario.
   - Mensaje explicativo sobre la suspensión automática en caso de falta de pago a la fecha límite.

---

## 3. Endpoints Integrados
- `POST /api/admin/stores`: Registro del comercio con credenciales de dueño. El backend aplica valores por defecto para campaña y mensualidad base.
- `PUT /api/admin/stores/:storeId/subscription`: Actualización de estado, tarifa mensual, día de corte y `nextBillingDate` en formato ISO.
- `GET /api/admin/stores`: Sincronización en tiempo real de comercios y estados de facturación.

---

## 4. Estándares de Diseño y UX Aplicados
- **Light & Crisp Standard:** Fondos blancos puros (`bg-white`), bordes nítidos (`border-slate-200`), tipografía neutra de alto contraste y sombras físicas suaves (`shadow-subtle`, `shadow-xs`).
- **Cero Emojis:** Iconografía vectorial limpia con `lucide-react` (`Calendar`, `CheckCircle2`, `Ban`, `DollarSign`, `CreditCard`).
- **Microinteracciones y Ergonomía:** Presets de fecha en píldoras interactivas con estados de hover inmediatos.

---

## 5. Verificación de Tipos y Compilación
- `npx tsc --noEmit` en `frontend`: 0 errores de tipado.
- `npx tsc --noEmit` en `backend`: 0 errores de tipado.
