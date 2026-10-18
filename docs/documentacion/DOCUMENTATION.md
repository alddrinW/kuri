# Documentación Integral del Sistema - KURI

**Plataforma de Fidelización y Presencia Digital KURI**  
**Eslogan:** *"Cada visita vale oro"*  
**Arquitectura:** Desacoplada en Capas (`backend/` + `frontend/`)  
**Estado:** Producción Local Operativa  

---

## 1. Visión y Resumen del Sistema

KURI reemplaza las tarjetas de sellos de papel por un **llavero físico con código QR permanente e inmutable ("Tu Kuri")**:
- **Cero Descargas:** El cliente no instala aplicaciones; escanea con la cámara nativa de su teléfono y accede a la web responsiva.
- **Un Solo QR Inteligente:** El código impreso en el llavero no cambia nunca. Si el negocio cambia de campaña, agrega promociones o actualiza su menú, todo se actualiza en la nube sin reimprimir.
- **Resolución Polimórfica:** El mismo enlace físico detecta si quien escanea es un transeúnte anónimo, el cliente titular o el staff de la tienda en caja, desplegando la interfaz apropiada.

---

## 2. Estructura Desacoplada en Capas

### Backend Dedicado (`backend/`)
- Servidor REST en **Node.js / Express con TypeScript**.
- Escuchando en el puerto **`4000`** (`http://localhost:4000`).
- Capas de software: `src/controllers/`, `src/middlewares/`, `src/routes/`, `src/config/`.
- Motor relacional con **Prisma ORM** y SQLite (`dev.db`).
- Script de sembrado de datos en `backend/prisma/seed.ts`.

### Frontend Dedicado (`frontend/`)
- Aplicación Web en **Next.js 15+ App Router** con TypeScript y Tailwind CSS.
- Escuchando en el puerto **`3000`** (`http://localhost:3000`).
- Estándar visual **Figma Make / v0.dev en fondo blanco puro (`#FFFFFF`)** con acentos KURI Gold.
- Comunicación desacoplada hacia el backend mediante `src/lib/api.ts` y rewrites transparentes en `next.config.ts`.

---

## 3. Comandos de Ejecución

Desde la raíz del proyecto (`Fidelizacion_v1/`):

```bash
# Iniciar Backend y Frontend en paralelo
npm run dev

# Iniciar únicamente el servidor Backend (Puerto 4000)
npm run dev:backend

# Iniciar únicamente el cliente Frontend (Puerto 3000)
npm run dev:frontend

# Compilar ambas capas (TypeScript backend + Next.js build frontend)
npm run build

# Volver a sembrar la base de datos con datos reales
npm run seed
```

---

## 4. Credenciales Reales Preconfiguradas para Pruebas

| Rol | Correo Electrónico | Contraseña | Vistas y Accesos |
| :--- | :--- | :--- | :--- |
| **Cliente Titular** | `sofia@gmail.com` | `cliente123` | Billetera multitienda (`/wallet`), Tarjeta de Fidelidad en Café Andino (`/kuri/KURI-CAFE-001`). |
| **Cliente con Oro Alto** | `esteban@gmail.com` | `cliente123` | Tiene 8 Oro acumulados. Puede canjear Tesoros en mostrador. |
| **Staff de Caja POS** | `barista@cafeandino.com`| `kuri2026` | Terminal de escaneo y caja para acreditación de visitas y canjes (`/pos/KURI-CAFE-001`). |
| **Dueño de Comercio** | `carlos@cafeandino.com` | `kuri2026` | Panel de métricas del negocio y clientes leales (`/store/dashboard`). |
| **Super Administrador**| `admin@kuri.app` | `admin123` | Consola central y generador de lotes de llaveros QR (`/admin/dashboard`). |

---

## 5. Llaveros QR Físicos de Demostración

- `KURI-CAFE-001`: Llavero activo de Sofía Delgado (4 Oro en Café Andino).
- `KURI-CAFE-002`: Llavero activo de Esteban Rivas (8 Oro, listo para canje).
- `KURI-CAFE-003`: **Llavero físico nuevo sin activar**, que tiene **2 de Oro huérfanos acumulados previamente en caja** para validar la adjudicación inmediata al registrarse.
- `KURI-BARB-001`: Llavero de Sofía en Barbería La Imperial (demuestra multitienda en una sola cuenta).

---

## 6. Módulos Operativos del SuperAdmin (`/admin/dashboard`)

El panel del Super Administrador cuenta con 4 módulos principales con persistencia real y conexión con la API de Node.js:

1. **Resumen de Red:**
   - Métricas agregadas en tiempo real: total de comercios afiliados, llaveros emitidos, kurios circulantes y transacciones procesadas.
   - Acceso rápido a cada tienda afiliada y su mini-sitio público.

2. **Comercios & Credenciales de Acceso:**
   - Formulario de alta completa de comercio: nombre, slug, categoría, dirección, teléfono.
   - Generación de credenciales del propietario (`STORE_OWNER`): nombre del titular, correo electrónico institucional y contraseña encriptada con `bcrypt`.
   - Inicialización atómica de la primera campaña activa del comercio.
   - Tabla interactiva con búsqueda por nombre, slug o correo del propietario.

3. **Configuración y Calibración en Caliente de Campañas:**
   - Selector en tiempo real del comercio a configurar.
   - Parámetros de fidelidad ajustables:
     - **Modo:** Por Visita (`VISIT_COUNT`) o Por Monto Consumido (`AMOUNT_RATIO`).
     - **Tasa de Oros:** Cantidad de Oros otorgados por visita o por dólar.
     - **Ventana Antifraude (Cooldown):** Minutos mínimos entre acreditaciones por llavero.
     - **Límite Diario:** Límite de acreditaciones por día por cliente.
   - Las modificaciones se aplican instantáneamente sobre los llaveros físicos del comercio sin necesidad de reimpresiones.

4. **Emisión y Previsualización de Lotes de Llaveros QR:**
   - Generador de lotes indicando nombre de remesa, prefijo identificador (ej. `KURI-CENTRO`) y cantidad de llaveros.
   - Creación de tokens permanentes inmutables (`KURI-...-XXXX`) y renderizado de códigos QR vectoriales de alta resolución.
   - Opción para imprimir el pliego serigráfico o descargar la relación de llaveros para control de inventario.

5. **Catálogo Maestro de Llaveros QR y Exportación Masiva (PDF & Excel):**
   - Inventario central de todos los códigos QR emitidos en la plataforma con visualización directa de la imagen QR y token permanente.
   - Filtros dinámicos por estado (`Activado por Cliente` vs `Disponible en Mostrador`), por comercio y buscador predictivo.
   - **Descarga en Excel (`.xlsx`):** Generación binaria instantánea vía SheetJS con columnas ordenadas y datos de clientes y comercios.
   - **Descarga en PDF (`.pdf`):** Generación de catálogo multipágina A4 con rejilla 2x3 de tarjetas con QR vectorial, código, comercio y líneas de corte serigráficas.
   - **Ficha Detallada:** Modal de inspección con vista ampliada del QR, copia rápida de token y enlace para probar escaneo en vivo.

7. **Sistema de Mensualidades, Facturación Recurrente y Suspensión de Comercios (HU-007):**
   - **Modelo de Cobro Adaptable:** El SuperAdmin define de manera individualizada la cuota mensual (`monthlyFee`) y el día de corte (`billingDueDay`) para cada negocio afiliado.
   - **Estados de Servicio:**
     - `ACTIVE`: Funcionamiento pleno de vitrina web pública, catálogo de productos, terminal POS de fidelidad y escaneo de kurios.
     - `SUSPENDED`: Bloqueo preventivo total por falta de pago.
     - `PAST_DUE`: En mora con advertencia previa a la suspensión.
   - **Mecanismo de Bloqueo Inmediato:**
     - **Sitio Web Público (`/store/[slug]`):** No renderiza el catálogo ni promociones; presenta una pantalla de aviso institucional ("Vitrina Web Inactiva por mensualidad pendiente").
     - **Terminal POS de Caja (`/pos/[token]`):** Deshabilita los botones de otorgar Oro y canjear Tesoros, mostrando alerta de cuenta suspendida.
     - **API de Mutaciones (`/api/pos/action`):** Guardia estricta a nivel de base de datos que rechaza con HTTP 403 (`subscriptionSuspended: true`).
     - **Escaneo de Llavero (`/kuri/[token]`):** Notifica al cliente de forma limpia que el programa de fidelidad del negocio está pausado.
   - **Registro de Cobros y Reactivación Automática (`POST /api/admin/stores/:storeId/payments`):**
     - Registra abonos con monto, método (Transferencia, Tarjeta, Efectivo, Depósito), referencia bancaria y periodo cubierto en la tabla `SubscriptionPayment`.
     - Reactiva automáticamente el comercio a estado `ACTIVE`.
     - Actualiza la fecha de último pago y extiende la próxima fecha de corte en 1 mes manteniendo el día de vencimiento asignado.

---

## 8. Centro de Control y Panel del Dueño del Negocio (`/store/dashboard`) (HU-008)

El panel del comerciante ofrece un entorno de autogestión completa para el propietario de la tienda (`STORE_OWNER`), conectado de forma 100% real a la base de datos relacional y a la API de backend:

1. **Resumen Operativo y Control de Apertura en Vivo:**
   - Visualización de clientes leales, visitas históricas, llaveros asignados y tesoros activos.
   - **Conmutador de Atención en Vivo (`isOpenManual`):** Botón para pausar o reactivar la atención al instante. Si se pausa, la vitrina web pública refleja inmediatamente el estado "Cerrado" con pulso rojo.
   - Directorio de "Clientes de Oro Más Frecuentes" con saldos de Oro y nivel (`BRONZE`, `SILVER`, `GOLD`).

2. **Catálogo de Productos y Carta Digital:**
   - **CRUD Completo:** Creación, edición, activación/pausa y eliminación de productos.
   - **Doble Esquema de Precios:** Define un **Precio Regular** para público general y un **Precio Cliente de Oro** con descuento automático para fidelizados.
   - **Gestor Fotográfico Integrado:** Permite ingresar URLs de imagen personalizadas o seleccionar con un solo toque fotografías de alta resolución preconfiguradas para cafeterías, pastelerías y barberías.

3. **Horarios de Atención Semanales y Sincronización:**
   - Configuración individual para los 7 días de la semana (Lunes a Domingo) con horas de apertura y cierre en formato 24h.
   - Casilla de verificación para marcar días de descanso o cerrados.
   - **Generador Inteligente de Resumen:** Sintetiza la semana en un texto conciso (ej. *"Lunes a Viernes: 07:30 - 20:30 | Sábados: 09:00 - 18:00"*).
   - En la vitrina pública `/store/[slug]`, los clientes pueden hacer clic en el horario de la cabecera para abrir un modal con el desglose semanal completo.

4. **Solicitud y Pedidos de Llaveros Físicos (RFID / QR):**
   - Módulo para ordenar nuevos paquetes de llaveros permanentes inmutables (25, 50, 100, 200 o personalizados).
   - Formulario de despacho con dirección física, nombre del receptor, teléfono de contacto y notas para el lote.
   - Historial de solicitudes con trazabilidad de estado (`PENDING`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`) y número de guía de mensajería.

5. **Campañas Polimórficas de Fidelidad y Descuentos:**
   - **Calibración de Campaña Principal:** Ajuste de puntos de Oro por visita, minutos de ventana antifraude (*cooldown*), límite de sellos diarios por cliente y aviso destacado en la vitrina pública.
   - **Promociones y Descuentos Directos por Llavero:** Creación de promociones especiales vinculadas al llavero físico (ej. *10% OFF en barra de filtrados* o *Doble Oro los jueves*).
   - Las promociones activas se renderizan de inmediato en la vitrina pública destacando el valor de tener un Kuri.

6. **Edición Integral de Tienda, Redes Sociales y Ubicación con Maps (HU-009):**
   - **Gestión de Identidad y Presencia (Comercio & SuperAdmin):**
     - Tanto el dueño del comercio en su panel (`/store/dashboard` -> pestaña *"Perfil & Redes"*) como el Super Administrador en la consola central (`/admin/dashboard` -> botón *"Editar"*) pueden actualizar en caliente los datos corporativos de la tienda.
     - Campos administrables: Nombre del negocio, descripción institucional, eslogan/tagline, categoría, dirección física, enlace a Google Maps, correo electrónico, teléfono de contacto y canales sociales (WhatsApp, Instagram, Facebook).
   - **Previsualización en Vivo (Live Preview):**
     - El formulario del comerciante incluye un visor interactivo en tiempo real que refleja inmediatamente los cambios en la cabecera, bio, insignias y botones de acción antes de guardar.
     - Selector rápido de banners y logos de alta resolución, además de soporte para URLs externas de marca.
   - **Vitrina Pública Enriquecida (`/store/[slug]`):**
     - **Barra de Conexión Rápida:** Botones de un toque con iconos SVG dedicados para WhatsApp (`https://wa.me/...`), Facebook, Instagram, Correo Electrónico (`mailto:...`) y Teléfono (`tel:...`).
     - **Sección 'Sobre Nosotros':** Tarjeta corporativa con la descripción del establecimiento y acceso directo a la ruta.
     - **Geolocalización Asistida:** Botón *"Ver en Maps"* que abre el enlace verificado de Google Maps en una pestaña independiente, permitiendo al cliente abrir la navegación GPS de inmediato.
   - **Integración y Persistencia:**
     - Consumo seguro de endpoints de backend `PUT /api/store/profile` (autenticado por comercio o fallback activo) y `PUT /api/admin/stores/:storeId` (administración global), persistiendo en el modelo relacional `Store` de Prisma con cero datos simulados.

7. **Almacenamiento y Carga Multimedia en la Nube con Cloudinary (HU-010):**
   - **Gestión Centralizada y Segura de Credenciales:**
     - El backend gestiona de forma desacoplada las credenciales de Cloudinary mediante las variables de entorno en `backend/.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), asegurando que las llaves privadas nunca se expongan al cliente navegador.
     - Disponibilidad de plantilla documentada en `backend/.env.example` para nuevos despliegues.
   - **Infraestructura y Procesamiento en Memoria:**
     - Middleware con `multer.memoryStorage()`, procesando la subida por streaming directamente hacia Cloudinary sin retención de archivos temporales en el disco duro del servidor.
     - Endpoints habilitados: `GET /api/upload/status` (auditoría del estado del servicio), `POST /api/upload/image` (procesamiento de imágenes multipart hasta 10 MB) y `POST /api/upload/base64` (soporte para subidas directas serializadas).
     - Validación estricta de tipos MIME (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`, `image/avif`).
   - **Componente Reusable Frontend `ImageUploader`:**
     - Experiencia Drag & Drop con feedback táctil y visual al arrastrar imágenes.
     - Indicador semántico de estado de conexión (`Cloudinary Activo` vs. `Requiere API Keys`).
     - Previsualización instantánea de la imagen subida con relación de aspecto adaptable (`square` para logos, `wide` para banners y productos).
     - Botones de acción directa para *"Cambiar"* o *"Quitar"* la imagen, con campo complementario para ingreso manual de URLs externas.
   - **Puntos de Integración en la Plataforma:**
     - **Panel del Comercio (`/store/dashboard`):** Pestaña *"Perfil & Redes"* (Logotipo y Portada panorámica) y pestaña *"Carta y Productos"* (Modal de creación y edición de productos del catálogo).
     - **Panel SuperAdmin (`/admin/dashboard`):** Modal de edición de tiendas para actualizar la identidad visual de cualquier comercio asociado.

8. **Control de Acceso y Vistas Especializadas para Terminales POS, Baristas y Cajeros (HU-011):**
   - **Segmentación de Experiencia y Seguridad de Datos:**
     - Los usuarios con rol `STORE_STAFF` (cajeros, baristas y personal de mostrador) cuentan con una vista adaptada y segura en el panel de comercio (`/store/dashboard`).
     - **Ocultamiento de Controles Administrativos:** Se eliminan de la cabecera los botones de *"Editar Tienda"* y el alternador de *"Pausar Atención / Marcar Abierto"*, incorporando en su lugar la insignia distintiva `[ Terminal POS / Modo Caja ]`.
   - **Módulos Disponibles para `STORE_STAFF`:**
     - **1. Resumen General (`overview`):** Métricas clave de clientes afiliados, transacciones registradas, llaveros asignados y catálogo informativo de tesoros.
     - **2. Carta y Productos (`products`) en Modo Consulta:** Catálogo visual con precios regulares y precios exclusivos de Clientes de Oro para informar y verificar beneficios en caja, sin botones de crear, editar o eliminar productos.
     - **3. Llaveros Físicos (`keychains`):** Consulta del inventario de llaveros en circulación y estado de producción de lotes, sin opción de compra de nuevos paquetes.
   - **Módulos Prohibidos y Bloqueados para `STORE_STAFF`:**
     - Las pestañas *"Horarios de Atención"* (`schedules`), *"Campañas & Descuentos"* (`campaigns`) y *"Perfil & Redes"* (`profile`) no se renderizan en el menú de navegación y cuentan con redirección forzada automática si se intenta acceder a ellas.
   - **Protección a Nivel de API (Backend 403 Forbidden):**
     - Todos los endpoints mutadores (`PUT /api/store/profile`, `PUT /api/store/toggle-status`, `PUT /api/store/schedules`, `POST/PUT/DELETE /api/store/products`, `POST/PUT/DELETE /api/store/campaigns/promo`, `PUT /api/store/campaigns/main`, `POST /api/store/keychain-orders`) verifican activamente el rol del usuario autenticado y retornan código `403 Forbidden` si la solicitud proviene de un `STORE_STAFF`.
