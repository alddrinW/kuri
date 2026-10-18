# Backlog Maestro - Plataforma KURI

**Proyecto:** KURI ("Cada visita vale oro")  
**Estado General:** MVP Funcional y Robusto Completado  
**Stack Activo:** Next.js (Web App Router) + Node.js API + PostgreSQL/SQLite + Prisma ORM + Tailwind CSS  

---

## 🎯 Resumen de Épicas y Estado de Implementación

| Épica | Nombre | Prioridad | Estado |
| :--- | :--- | :--- | :--- |
| **EP-01** | Arquitectura Base, Infraestructura y Modelado Relacional | Alta (Fase 0) | **Completada** |
| **EP-02** | Motor de Llaveros QR y Enrutamiento Polimórfico (`/kuri/[token]`) | Alta (MVP) | **Completada** |
| **EP-03** | Presencia Digital y Mini-Sitio del Comercio (Página Pública) | Alta (MVP) | **Completada** |
| **EP-04** | Terminal de Caja POS para Acreditación de Oro y Canje de Tesoros | Alta (MVP) | **Completada** |
| **EP-05** | Experiencia y Billetera del Cliente (Onboarding y Multitienda) | Alta (MVP) | **Completada** |
| **EP-06** | Panel SuperAdmin: Generación de Lotes QR y Métricas de Red | Media (MVP/V1) | **Completada** |
| **EP-07** | Reglas Avanzadas: Cooldown Antifraude y Transferencia por Extravío | Media (V1.0) | **Completada** |
| **EP-08** | App Móvil Nativa Flutter para Escaneo Rápido de Negocios | Media (V1.0) | Especificada en reglas |
| **EP-09** | Sistema de Mensualidades, Cobros Recurrentes y Suspensión de Comercios (HU-007) | Alta (V1.1) | **Completada** |
| **EP-10** | Panel de Gestión Integral del Comercio: Productos, Horarios, Llaveros y Campañas (HU-008) | Alta (V1.2) | **Completada** |
| **EP-11** | Edición Integral de Tienda, Redes Sociales (Facebook, Instagram, WhatsApp, Correo) y Ubicación con Maps (HU-009) | Alta (V1.3) | **Completada** |
| **EP-12** | Almacenamiento y Subida de Imágenes en la Nube con Cloudinary (HU-010) | Alta (V1.4) | **Completada** |
| **EP-13** | Control de Acceso por Roles y Vista Especializada para Terminal POS y Staff de Caja (HU-011) | Alta (V1.5) | **Completada** |

---

## 📋 Detalle de Tareas Ejecutadas

### EP-01: Arquitectura Base y Modelado Relacional
- [x] Protocolo `/start_project` y reglas operativas institucionales en `rules/`.
- [x] SRS Ejecutivo en `docs/requirements/REQUIREMENTS.md`.
- [x] Manual de Marca en `docs/requirements/MANUALMARCA.md`.
- [x] Esquema Prisma (`prisma/schema.prisma`) con 10 modelos de dominio y relaciones.
- [x] Script de sembrado de datos reales (`scripts/seed.mjs`) con comercios, productos, kurios y usuarios.

### EP-02: Motor de Llaveros QR y Enrutamiento Polimórfico
- [x] Generador de códigos permanentes inmutables para llaveros físicos.
- [x] Resolver polimórfico en `/api/kuri/resolve/[token]`.
- [x] Ruta dinámica `/kuri/[token]` que detecta el contexto del escaneo en tiempo real.

### EP-03: Mini-Sitio Web del Negocio (Presencia Digital)
- [x] Vista pública `/store/[slug]` con portada, logo, horario dinámico y contacto de WhatsApp.
- [x] Catálogo interactivo de productos con precios regulares y precios con descuento para Clientes de Oro.
- [x] Catálogo de Tesoros canjeables en el negocio.

### EP-04: Terminal de Caja POS
- [x] Interfaz de un toque para sumar Oro por visita con confirmación obligatoria.
- [x] Módulo de canje de Tesoros con deducción atómica de Oro y recibo digital.
- [x] Control de cooldown antifraude en el backend para prevenir doble registro accidental.

### EP-05: Experiencia del Cliente y Billetera Multitienda
- [x] Registro express en `/register` con activación de llavero físico y adjudicación de Oro huérfano.
- [x] Billetera digital multitienda en `/wallet` con tarjetas de fidelidad y barras de progreso hacia el siguiente Tesoro.
- [x] Historial de visitas y transacciones de fidelidad.

### EP-06: Panel SuperAdmin de KURI
- [x] Consola central `/admin/dashboard` con métricas globales de red (comercios, llaveros, oros circulantes, transacciones).
- [x] Módulo de Onboarding de Negocios y Aprovisionamiento de Credenciales (`POST /api/admin/stores`).
- [x] Módulo de Configuración y Calibración en Caliente de Campañas de Fidelidad (`PUT /api/admin/campaigns/:storeId`).
- [x] Módulo de Emisión y Previsualización de Lotes de Llaveros QR Permanentes (`POST /api/admin/batches`) con descarga e impresión de pliego serigráfico.
- [x] Catálogo Maestro de Códigos QR con Descarga Masiva en PDF (`.pdf`) y Excel (`.xlsx` / `.csv`) (`GET /api/admin/keychains`).

### EP-07: Resiliencia y Transferencia por Extravío (HU-005)
- [x] Modal interactivo y endpoint seguro `/api/wallet/transfer` para reemplazar un llavero perdido conservando el saldo y nivel íntegros.

### EP-09: Sistema de Mensualidades, Cobros y Suspensión de Comercios (HU-007)
- [x] Modelo de datos relacional para suscripciones (`subscriptionStatus`, `monthlyFee`, `billingDueDay`, `nextBillingDate`, `lastPaymentDate`, `subscriptionNotes`) y pagos históricos (`SubscriptionPayment`).
- [x] Endpoints administrativos: `PUT /api/admin/stores/:storeId/subscription` y `POST /api/admin/stores/:storeId/payments`.
- [x] Bloqueo backend y frontend de vitrina pública `/store/[slug]` cuando el comercio está suspendido.
- [x] Bloqueo estricto de terminal de caja `/pos/[token]` y endpoint `/api/pos/action` cuando el comercio está suspendido (rechazo 403 con mensaje explicativo).
- [x] Pestaña interactiva "Mensualidades & Cobros" en `/admin/dashboard` con KPIs de facturación, ajuste de tarifa y registro de cobros.
- [x] Pantallas de bloqueo estético y profesional para visitantes y clientes, más banner informativo para dueños de comercios.

### EP-10: Panel de Gestión Integral del Comercio (HU-008)
- [x] Modelos de datos relacionales en Prisma: `StoreSchedule`, `KeychainOrder`, `StorePromoCampaign` y ampliación de `Campaign`.
- [x] Endpoints y controladores de backend para productos, horarios semanales, pedidos de llaveros y campañas polimórficas.
- [x] Seeder actualizado con horarios completos, pedidos de llaveros en producción/entregados y promociones reales.
- [x] Panel de control de comercio rediseñado (`/store/dashboard`) con 5 pestañas: Resumen General, Carta y Productos, Horarios de Atención, Llaveros Físicos y Campañas & Descuentos.
- [x] Gestor fotográfico integrado con fotos de alta resolución de Unsplash y soporte de URLs personalizadas.
- [x] Generador automático de texto de horarios y conmutador en vivo de estado de apertura (`isOpenManual`).
- [x] Módulo de solicitud y seguimiento de lotes de llaveros físicos con selección de paquetes y datos de entrega.
- [x] Creador y calibrador de campañas de sellos por visita y promociones de descuento directo con llavero.
- [x] Vitrina pública `/store/[slug]` actualizada con modal de horarios detallados, banner de beneficios de Kuri y catálogo en tiempo real.
- [x] Validación E2E automatizada contra base de datos viva y servidor en ejecución.

### EP-11: Edición Integral de Tienda, Redes Sociales y Ubicación con Maps (HU-009)
- [x] Modelo de datos Prisma ampliado con campo `facebook` en `Store`.
- [x] Endpoints de backend actualizados (`PUT /api/store/profile`, `PUT /api/stores/:slug` y `PUT /api/admin/stores/:storeId`) con soporte de nombre, descripción, facebook, instagram, whatsapp, email, dirección física y mapa.
- [x] Pestaña y formulario interactivo "Perfil & Redes" en `/store/dashboard` para dueños de comercios con previsualización en vivo.
- [x] Modal de edición de tiendas en `/admin/dashboard` para SuperAdmin.
- [x] Vitrina pública `/store/[slug]` actualizada con sección "Acerca del Negocio", enlaces a redes sociales (Facebook, Instagram, WhatsApp, Correo) y botón con link interactivo a Google Maps.
- [x] Pruebas automatizadas de compilación, endpoints y sincronización de datos reales.

### EP-12: Almacenamiento y Subida de Imágenes en la Nube con Cloudinary (HU-010)
- [x] Instalación e integración de `cloudinary` y `multer` con memoria en `backend`.
- [x] Configuración de variables de entorno (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) en `backend/.env` y plantilla `.env.example`.
- [x] Módulo centralizado `backend/src/config/cloudinary.ts` con helpers de subida de streaming y Base64.
- [x] Controlador y rutas de subida en backend (`GET /api/upload/status`, `POST /api/upload/image`, `POST /api/upload/base64`).
- [x] Componente frontend `ImageUploader.tsx` con drag and drop, validación de tipos, feedback de carga y previsualización.
- [x] Integración en el panel del comercio `/store/dashboard` para logo, banner panorámico y fotos de catálogo de productos.
- [x] Integración en la consola `/admin/dashboard` para edición de logotipos y portadas de comercios.
- [x] Pruebas de integración E2E automatizadas con Cloudinary en vivo aprobadas (`test_cloudinary_upload.ts`).

### EP-13: Control de Acceso por Roles y Vista Especializada para Terminal POS y Staff de Caja (HU-011)
- [x] Protección estricta en backend (`store.controller.ts`) contra mutaciones no autorizadas por usuarios `STORE_STAFF` con código `403 Forbidden` (perfil, estado de apertura, horarios, productos, campañas, pedidos de llaveros).
- [x] Enriquecimiento de `GET /api/store/dashboard` con banderas booleanas de contexto de rol (`isStaff`, `isOwner`, `isAdmin`, `userRole`, `currentUser`).
- [x] Ocultación de controles administrativos en cabecera de `/store/dashboard` (botón "Editar Tienda", botón "Pausar Atención / Marcar Abierto").
- [x] Incorporación de badge identificador "Terminal POS / Modo Caja" para cajeros y baristas.
- [x] Restricción de pestañas en panel de comercio para cajeros y baristas: únicamente visibles Resumen General (`overview`), Carta y Productos (`products`) y Llaveros Físicos (`keychains`).
- [x] Ocultación absoluta de pestañas Horarios de Atención (`schedules`), Campañas & Descuentos (`campaigns`) y Perfil & Redes (`profile`) para `STORE_STAFF`.
- [x] Protección reactiva en frontend que redirige automáticamente a `overview` si un staff intenta acceder a pestañas restringidas.
- [x] Catálogo de productos en modo consulta de mostrador para staff (sin botones de agregar, editar, eliminar o alternar disponibilidad).
- [x] Módulo de llaveros en modo inventario de lectura para staff (sin botón de solicitud de lotes de compra).
- [x] Suite de pruebas automatizadas de integración aprobadas (`test_staff_pos_permissions.ts`).


