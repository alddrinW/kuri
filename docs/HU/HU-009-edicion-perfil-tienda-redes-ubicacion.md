# HU-009: Edición Integral de Perfil de Tienda, Redes Sociales y Ubicación

**Historia de Usuario:**
Como **administrador o dueño de un comercio (Store Owner / SuperAdmin)**,  
quiero **editar la información de mi tienda, incluyendo nombre del negocio, descripción, redes sociales (Facebook, Instagram, WhatsApp, Correo) y ubicación física junto al enlace de Google Maps**,  
para **mantener la identidad de mi negocio actualizada, facilitar el contacto directo con mis clientes e incrementar las visitas a mi local físico**.

---

## 📌 Criterios de Aceptación (Gherkin)

### Escenario 1: Actualización de datos principales y redes sociales desde el Panel de Comercio
- **Dado** que un dueño de comercio o administrador ha iniciado sesión y se encuentra en su panel de control (`/store/dashboard`),
- **Cuando** navega a la pestaña de "Perfil & Redes" y modifica el nombre del negocio, la descripción, su página de Facebook, su perfil de Instagram, su número de WhatsApp y su correo electrónico de contacto,
- **Y** hace clic en "Guardar Cambios",
- **Entonces** el sistema valida los datos, envía la mutación al endpoint `PUT /api/store/profile` y actualiza la base de datos de manera persistente,
- **Y** muestra una confirmación visual inmediata ("Información del comercio actualizada exitosamente").

### Escenario 2: Configuración de ubicación y enlace de Google Maps
- **Dado** que el administrador ingresa la dirección de su local y la URL correspondiente a Google Maps (`mapUrl`),
- **Cuando** guarda los cambios y visita la vitrina pública de su tienda (`/store/[slug]`),
- **Entonces** los clientes pueden ver la dirección física exacta del negocio y hacer clic en el enlace/botón de mapa para abrir las indicaciones directamente en Google Maps en una nueva pestaña.

### Escenario 3: Visualización de canales sociales en la vitrina pública
- **Dado** que el comercio cuenta con enlaces configurados de Facebook, Instagram, WhatsApp y Correo,
- **Cuando** un cliente o visitante ingresa a `/store/[slug]`,
- **Entonces** se muestran botones interactivos y estilizados para cada canal configurado, abriendo la aplicación o enlace web correspondiente con un solo clic.

### Escenario 4: Gestión de datos de comercio por el Super Administrador
- **Dado** que el Super Administrador accede a `/admin/dashboard` en la sección "Comercios & Credenciales",
- **Cuando** selecciona "Editar Comercio" en cualquier establecimiento de la red,
- **Entonces** puede modificar de forma centralizada el nombre, descripción, redes sociales (Facebook, Instagram, WhatsApp, Correo) y coordenadas/enlace de Maps del comercio a través de `PUT /api/admin/stores/:storeId`.
