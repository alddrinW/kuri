# Historia de Usuario: HU-011 - Control de Permisos y Vistas Especializadas para Terminales POS, Baristas y Cajeros

**Épica:** EP-10 - Panel de Gestión Integral del Comercio  
**ID:** HU-011  
**Título:** Restricción de permisos y vista operativa para Terminales POS y Staff de Caja  
**Prioridad:** Alta  
**Estado:** En Progreso  
**Rol Principal:** Terminal POS / Cajero / Barista (`STORE_STAFF`)  
**Roles Secundarios:** Dueño de Comercio (`STORE_OWNER`), Administrador Global (`SUPER_ADMIN`)  

---

## 📖 Descripción Narrativa

**Como** cajero, barista o encargado del Terminal POS (`STORE_STAFF`) que interactúa con los clientes en mostrador y escanea códigos QR,  
**Quiero** acceder a una versión especializada del panel de comercio que me permita consultar el resumen operativo, la carta con precios regulares y de clientes de oro, y el inventario de llaveros físicos,  
**Para** desempeñar ágilmente la atención en caja sin correr el riesgo de modificar accidentalmente los datos legales de la tienda, su perfil, redes sociales, horarios de apertura o campañas promocionales configuradas por el dueño.

---

## 🎯 Criterios de Aceptación (Gherkin)

### Escenario 1: Navegación y módulos restringidos para el Terminal POS / Cajero
- **Dado** que un usuario con rol `STORE_STAFF` ha iniciado sesión en la plataforma y navega a `/store/dashboard`,
- **Cuando** carga la interfaz del panel de comercio,
- **Entonces** solo debe ver disponibles las pestañas:
  1. *Resumen General* (`overview`): métricas clave de clientes, visitas y clientes frecuentes.
  2. *Carta y Productos* (`products`): catálogo digital en modo consulta informativa.
  3. *Llaveros Físicos* (`keychains`): cantidad de llaveros en circulación y estado de lotes.
- **Y** deben quedar ocultas e inaccesibles las pestañas:
  - *Horarios de Atención y Apertura* (`schedules`)
  - *Campañas & Descuentos* (`campaigns`)
  - *Perfil & Redes Sociales* (`profile`)

### Escenario 2: Supresión de controles de mutación en la cabecera
- **Dado** que el usuario activo es `STORE_STAFF`,
- **Cuando** observa la cabecera del centro de operaciones,
- **Entonces** no debe mostrarse el botón "Editar Tienda" ni el conmutador de alternancia operativa "Pausar Atención / Marcar Abierto",
- **Y** debe visualizarse un indicador de rol claro que señale el modo "Terminal POS / Staff de Caja".

### Escenario 3: Catálogo de productos en modo consulta de mostrador
- **Dado** que el cajero o barista selecciona la pestaña *Carta y Productos*,
- **Cuando** revisa el menú para orientar a un cliente o confirmar un precio de cliente con Oro,
- **Entonces** no deben mostrarse los botones de crear nuevo producto, editar producto ni eliminar producto,
- **Y** la información de precios regulares y precios con descuento de cliente fiel permanece legible y actualizada.

### Escenario 4: Inventario de llaveros en modo lectura
- **Dado** que el cajero o barista selecciona la pestaña *Llaveros Físicos*,
- **Cuando** revisa el stock asignado al local,
- **Entonces** puede visualizar los llaveros en circulación y el historial de envíos sin el botón de "Solicitar Más Llaveros".

### Escenario 5: Protección a nivel de API Backend (Cero Bypass)
- **Dado** que un usuario con rol `STORE_STAFF` intenta enviar peticiones PUT o POST a:
  - `/api/store/profile`
  - `/api/store/toggle-status`
  - `/api/store/schedules`
  - `/api/store/campaigns`
  - `/api/store/promo-campaigns`
  - `/api/store/products` (POST/PUT/DELETE)
  - `/api/store/keychains/orders`
- **Cuando** el servidor procesa la solicitud autenticada,
- **Entonces** debe rechazar la mutación retornando código `403 Forbidden` con un mensaje descriptivo de restricción por rol.

---

## 🔒 Restricciones de Seguridad & Arquitectura
- **Verificación en Capa de Negocio:** El backend no confía en el estado del cliente; valida estrictamente `req.user.role === "STORE_STAFF"`.
- **Preservación Total para Dueños (`STORE_OWNER`) y Admins (`SUPER_ADMIN`):** Los dueños de comercio continúan disfrutando del control total sobre horarios, perfil, redes, campañas, productos y pedidos.
- **Experiencia de Usuario Fluida:** Transición inmediata sin redirecciones forzadas ni parpadeos de interfaz.
