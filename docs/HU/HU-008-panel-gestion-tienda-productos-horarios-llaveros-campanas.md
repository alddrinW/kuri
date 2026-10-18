# Historia de Usuario HU-008: Panel de Gestión Integral para Dueños de Negocio

**Código:** HU-008  
**Título:** Panel de Control del Comercio: Gestión de Productos, Horarios, Solicitud de Llaveros y Campañas Polimórficas  
**Épica:** EP-10 - Centro de Operaciones del Comercio KURI  
**Rol:** Dueño de Negocio (`STORE_OWNER`)  
**Fecha:** 2026-10-11  
**Estado:** COMPLETADA Y VALIDADA  

---

## 1. Descripción de la Historia

**Como** dueño o encargado principal de un comercio afiliado a KURI (`STORE_OWNER`),  
**quiero** contar con un panel de control unificado y autónomo para:
1. Registrar, editar y organizar mi catálogo de productos con precios regulares, precios de descuento para Clientes de Oro e imágenes de alta definición.
2. Configurar los horarios de atención detallados de cada día de la semana y el estado de apertura en vivo para reflejarlos en mi vitrina pública.
3. Solicitar nuevos lotes de llaveros físicos (RFID / QR) indicando cantidad y dirección de despacho, con seguimiento del estado de mi pedido.
4. Diseñar y calibrar campañas de fidelización flexibles (sellos por visita, puntos por monto de consumo, descuentos directos presentando el llavero y promociones temporales).

**Para** tener autonomía total sobre la presencia digital de mi tienda, abastecer a mi clientela con llaveros físicos y fidelizar más clientes incrementando el ticket promedio de compra.

---

## 2. Criterios de Aceptación (Gherkin)

### Escenario 1: Registro y administración de productos con precios y descuentos KURI
- **Dado que** he iniciado sesión como `STORE_OWNER` en `/store/dashboard` en la pestaña de Productos,
- **Cuando** completo el formulario con el nombre del producto, categoría, precio de venta, precio preferencial para Clientes de Oro y selecciono una fotografía de alta calidad,
- **Y** presiono "Guardar Producto",
- **Entonces** el producto se persiste en la base de datos relacional y aparece de inmediato en mi catálogo y en la vitrina pública `/store/[slug]`.

### Escenario 2: Configuración de horarios por día y conmutador de apertura en vivo
- **Dado que** accedo al módulo de "Horarios & Operación",
- **Cuando** establezco los rangos de atención para cada día (Lunes a Domingo) o marco días cerrados,
- **Y** activo o desactivo el conmutador de "Abierto ahora",
- **Entonces** los cambios se actualizan en el backend y los visitantes en `/store/[slug]` ven el estado operativo en vivo y el cronograma semanal sin recargar la página.

### Escenario 3: Solicitud de nuevos lotes de llaveros físicos
- **Dado que** me estoy quedando sin llaveros en mi local y visito la sección "Llaveros KURI",
- **Cuando** selecciono una cantidad de llaveros (ej. 50 unidades), confirmo la dirección de entrega y notas de despacho,
- **Y** confirmo el pedido,
- **Entonces** se crea un registro de pedido con estado `PENDING`, se notifica al sistema y se visualiza en mi historial con trazabilidad de estado (`PENDING`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`).

### Escenario 4: Creación y activación de campañas polimórficas
- **Dado que** quiero incentivar visitas o dar beneficios especiales a los poseedores de llaveros,
- **Cuando** configuro una campaña de tipo "Descuento Directo con Llavero" con 15% OFF o calibro los sellos de Oro por visita y límites antifraude,
- **Y** guardo los parámetros,
- **Entonces** el motor de KURI asocia las reglas a mi comercio y la vitrina web pública comunica los beneficios a los clientes.

### Escenario 5: Marcado automático de estado Abierto / Cerrado según horario
- **Dado que** la tienda tiene configurados sus horarios de atención día por día (Lunes a Domingo),
- **Cuando** un cliente o visitante ingresa a la vitrina web pública o consulta el estado del comercio,
- **Entonces** el sistema evalúa automáticamente el día de la semana y la hora actual contra el cronograma configurado y marca el comercio como "Abierto ahora" (con pulso verde) o "Cerrado" (con badge sobrio), sin requerir intervención manual constante, con posibilidad de alternar a control manual si es necesario.

### Escenario 6: Edición de perfil, portada, redes sociales y ubicación de Google Maps
- **Dado que** accedo a la pestaña "Identidad & Perfil" de mi panel de control,
- **Cuando** actualizo la foto de perfil (logotipo), la portada/banner, la descripción de mi negocio, el enlace a Instagram, WhatsApp, correo electrónico y la URL de Google Maps para ubicación,
- **Y** guardo los cambios,
- **Entonces** la vitrina pública despliega de inmediato los accesos directos de contacto (Instagram, Correo, WhatsApp, botón para abrir la ruta en Google Maps) y la nueva imagen corporativa.

---

## 3. Consideraciones Técnicas
- **Seguridad Multi-Tenant:** Cada mutación debe verificar que `store.ownerId === req.user.id` o que el usuario sea `SUPER_ADMIN`.
- **Persistencia Relacional:** Modelos `Product`, `StoreSchedule`, `KeychainOrder`, `StoreCampaign`.
- **Integridad UI/UX:** Cero datos simulados; interfaz moderna, fluida y con cero emojis.
