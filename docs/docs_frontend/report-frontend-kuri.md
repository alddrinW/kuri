# Reporte Técnico de Frontend - Capa Desacoplada KURI

**Ubicación:** `frontend/`  
**Framework:** Next.js 15+ App Router con TypeScript y Tailwind CSS  
**Puerto:** `3000` (`http://localhost:3000`)  
**Backend Vinculado:** `http://localhost:4000`  
**Estado:** Compilación de producción limpia (`npm run build`)  

---

## 1. Organización del Proyecto Frontend (`frontend/src/`)

```
frontend/
├── src/
│   ├── app/
│   │   ├── admin/dashboard/   # Consola SuperAdmin y generación de lotes QR
│   │   ├── kuri/[token]/      # Ruta polimórfica del QR físico permanente
│   │   ├── login/             # Inicio de sesión con selector de roles reales
│   │   ├── pos/[token]/       # Terminal de caja POS para mostrador
│   │   ├── register/          # Registro express y activación de Kuri
│   │   ├── store/[slug]/      # Mini-sitio web público del comercio
│   │   ├── store/dashboard/   # Panel privado del comerciante
│   │   ├── wallet/            # Billetera multitienda del cliente
│   │   ├── layout.tsx         # Root Layout corporativo en fondo blanco puro (#FFFFFF)
│   │   └── page.tsx           # Landing corporativa de KURI con simulador interactivo
│   ├── components/
│   │   └── Navbar.tsx         # Cabecera fija de 64px con menú contextual y switcher de prueba
│   └── lib/
│       └── api.ts             # Cliente fetch para consumir la API de backend (4000)
├── .env.local                 # BACKEND_URL=http://localhost:4000
├── next.config.ts             # Proxy transparente /api/* hacia http://localhost:4000
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. Flujo de Consumo Desacoplado

- La capa frontend no posee conexión directa a base de datos ni modelos Prisma; es 100% cliente.
- Todas las peticiones a `/api/...` se dirigen al backend en el puerto `4000`.
- El frontend soporta tanto llamadas directas con `credentials: "include"` como llamadas vía proxy Next.js rewrite.

---

## 3. Módulos del SuperAdmin (`/admin/dashboard`)

La pantalla `/admin/dashboard` implementa una interfaz corporativa Figma Make / v0.dev estructurada en 4 pestañas interactivas conectadas al backend:

1. **Pestaña `overview` (Resumen de Red):** Indicadores clave (comercios, llaveros, oros, transacciones) y tarjetas directas a los comercios.
2. **Pestaña `stores` (Comercios & Credenciales):** Tabla de comercios activos con búsqueda en tiempo real y modal interactivo para dar de alta un comercio con cuenta de propietario (`STORE_OWNER`).
3. **Pestaña `campaigns` (Configuración de Campañas):** Selector reactivo de comercio con calibrador de modo de fidelidad (visitas vs monto), tasa de conversión, cooldown antifraude y límites diarios.
4. **Pestaña `batches` (Lotes de Llaveros QR):** Generador de lotes por prefijo y cantidad con vista previa en vivo de códigos QR vectoriales y disparador de impresión de pliego.
5. **Pestaña `qrs` (Catálogo Maestro de QR & Agrupación por Lotes):** Visualización de todos los llaveros organizados en **tarjetas por lote ocultas/colapsadas por defecto**. Cada tarjeta de lote expone el nombre del comercio, cantidad de llaveros, conteo de activados/en mostrador, descarga individual del lote en PDF y Excel, y botón para desplegar u ocultar la cuadrícula de códigos QR pertenecientes a dicho lote a demanda del administrador. Incluye también selector de lote, buscador en vivo y alternador a grilla continua.
6. **Pestaña `subscriptions` (Mensualidades & Cobros de Comercios):**
   - Panel de control de facturación recurrente con KPIs financieros (Facturación estimada mensual, Comercios activos, Comercios suspendidos, Total red).
   - Filtros rápidos por estado de servicio (`Todos`, `Al Día`, `Suspendidos`).
   - Modal interactivo para adaptar la tarifa acordada (`monthlyFee`), día de corte (`billingDueDay`) y notas administrativas por negocio.
   - Modal de registro de pago de mensualidad con soporte de métodos (Transferencia, Tarjeta, Efectivo, Depósito) y reactivación inmediata.
   - Alternador rápido "Suspender / Reactivar" con confirmación de seguridad para bloquear o desbloquear el acceso del comercio de forma instantánea.

---

## 4. Experiencia de Usuario y Bloqueo por Suspensión

- **Vitrina Web del Comercio (`/store/[slug]`):** Si el comercio está suspendido, se oculta el catálogo y se renderiza una pantalla institucional sobria y limpia: *"Vitrina Web Inactiva - Suspensión preventiva por mensualidad pendiente"*.
- **Terminal de Caja POS (`/pos/[token]`):** Muestra una tarjeta de alerta y deshabilita los botones de otorgar Oro y canjear Tesoros, impidiendo transacciones hasta regularizar la cuenta.
- **Escaneo de Llavero Kuri (`/kuri/[token]`):** Notifica al usuario de forma clara que el programa de fidelidad del negocio está pausado.
- **Panel del Comerciante (`/store/dashboard`):** Despliega un banner de advertencia si la cuenta está en mora o un badge con los detalles de cuota y próximo corte si está al día.





