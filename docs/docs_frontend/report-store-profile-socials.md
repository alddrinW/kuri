# Reporte Técnico de Frontend: Perfil de Tienda, Redes Sociales y Geolocalización (HU-009)

**Fecha:** 2026-10-11  
**Módulo:** Panel de Comercio (`/store/dashboard`), SuperAdmin (`/admin/dashboard`) y Vitrina Pública (`/store/[slug]`)  
**Estado:** COMPLETADO Y VALIDADO  

---

## 1. Componente Reutilizable de Redes Sociales (`SocialIcons.tsx`)

Se implementó el componente `frontend/src/components/SocialIcons.tsx` con iconos vectoriales SVG pixel-perfect y optimizados para Tailwind CSS:
- `FacebookIcon`: Icono de Facebook.
- `InstagramIcon`: Icono lineal de Instagram con bordes continuos.
- `WhatsAppIcon`: Icono oficial de WhatsApp.
- `GoogleMapsIcon`: Icono de mapa geolocalizado de Google Maps.

---

## 2. Pestaña "Perfil & Redes" en el Panel de Comercio (`/store/dashboard`)

Se añadió una nueva pestaña interactiva y un botón de acceso directo en la cabecera ("Editar Tienda"):
1. **Identidad del Negocio:**
   - Nombre comercial (validación obligatoria).
   - Categoría comercial.
   - Eslogan / Subtítulo.
   - Descripción completa del negocio con textarea estilizado.
2. **Redes Sociales & Medios de Contacto:**
   - Facebook (`https://facebook.com/...`).
   - Instagram (`https://instagram.com/...`).
   - WhatsApp (número internacional para redirección con `wa.me`).
   - Correo electrónico de atención (`mailto:...`).
   - Teléfono fijo o móvil de atención al cliente (`tel:...`).
3. **Ubicación & Google Maps:**
   - Dirección física del local.
   - Link de Google Maps (`mapUrl`) con comprobador interactivo en tiempo real ("Probar enlace").
4. **Imágenes y Marca:**
   - URLs de logotipo y portada panorámica con galería rápida de fotos sugeridas de alta resolución.
5. **Vista Previa en Vivo (Live Preview):**
   - Miniatura de portada, logo superpuesto, microcopy de eslogan y descripción, badges de dirección física y botones de redes sociales en vivo para verificar la experiencia antes de guardar.
6. **Persistencia Reactiva:** Mutación asíncrona contra `PUT /api/store/profile` con feedback visual (alerta de confirmación verde y manejo de errores de red).

---

## 3. Modal de Edición de Comercios en SuperAdmin (`/admin/dashboard`)

En la pestaña "Comercios & Credenciales":
- Se añadió un botón con icono `Pencil` en la tabla de comercios.
- Modal dedicado que permite al Super Administrador editar de forma centralizada cualquier establecimiento: nombre, categoría, descripción, redes sociales (Facebook, Instagram, WhatsApp, Correo, Teléfono), dirección física y URL de Google Maps.
- Mutación contra `PUT /api/admin/stores/:storeId` y sincronización inmediata de la tabla sin necesidad de recargar la página.

---

## 4. Vitrina Pública del Comercio (`/store/[slug]`)

Se enriqueció la experiencia pública del cliente:
- **Barra de Contacto:**
  - Si el negocio tiene dirección física configurada, se muestra junto a un botón interactivo "Ver en Maps" con icono de Google Maps que abre la ubicación exacta en una pestaña nueva.
  - Botones con squircle estilizados para WhatsApp, Facebook, Instagram, Correo y Llamada.
- **Sección "Sobre Nosotros":**
  - Tarjeta sobria con la historia y descripción del comercio y acceso directo a indicaciones de llegada ("Cómo llegar").
