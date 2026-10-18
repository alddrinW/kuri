# Especificación de Requerimientos del Sistema (SRS) - KURI

**Nombre del Sistema:** Plataforma de Fidelización y Presencia Digital KURI  
**Versión:** 1.0.0-MVP  
**Lema:** *"Cada visita vale oro"*  
**Fecha:** 2026-10-09  

---

## 1. Visión General y Propósito del Sistema

### 1.1 El Problema
Los negocios pequeños y medianos (cafeterías, barberías, restaurantes, salones de belleza, tiendas de barrio) enfrentan dos problemas críticos:
1. **Fidelización obsoleta en papel:** Las tarjetas de sellos físicas se extravían rápidamente, se deterioran, se prestan a falsificaciones y no recopilan ningún dato analítico sobre la frecuencia de los clientes.
2. **Barrera de descarga de aplicaciones móviles:** Los clientes rechazan descargar aplicaciones nativas pesadas para cada cafetería o tienda a la que van.
3. **Presencia digital costosa o desactualizada:** Crear páginas web personalizadas es costoso y los menús/horarios cambian con frecuencia sin ser reflejados.

### 1.2 La Propuesta de Valor KURI
KURI elimina las tarjetas de papel y la fricción de descargas mediante un **único llavero físico con código QR permanente e inmutable ("Tu Kuri")**:
- **Cero descargas para el cliente:** El cliente escanea con la cámara nativa de su smartphone y visualiza al instante su progreso en la web.
- **QR Permanente e Inteligente:** El código impreso en el llavero no cambia nunca. Si el negocio cambia de campaña, agrega promociones o actualiza su menú, todo se actualiza en la nube sin reimprimir.
- **Resolución Polimórfica de Contexto:** El mismo código QR despliega interfaces distintas dependiendo de quién lo escanee (público general, cliente dueño, staff de la tienda o staff de otro comercio).
- **Presencia digital gratuita para el comercio:** El negocio obtiene un mini-sitio web moderno con fotos, horarios, productos y precios sin costo adicional de desarrollo.

---

## 2. Roles de Usuario y Actores del Sistema

| Rol | Descripción y Responsabilidades |
| :--- | :--- |
| **Super Administrador (Admin Principal)** | Plataforma KURI. Da de alta tiendas, configura campañas, genera lotes de llaveros QR para impresión y monitorea métricas globales de suscripciones y comercios. |
| **Dueño de Tienda (Store Owner)** | Administra el perfil de su negocio (fotos, descripción, horarios, contacto, catálogo de productos y precios). Monitorea clientes de oro, métricas de visitas y gestiona empleados/cajeros. |
| **Empleado de Tienda (Store Staff)** | Operador en caja o mostrador. Al escanear el llavero de un cliente con su sesión iniciada, puede sumar Oro (sellos/monto) y canjear Tesoros (premios). Requiere confirmación manual obligatoria. |
| **Cliente Titular (Customer)** | Posee su llavero KURI físico vinculado a su cuenta digital. Al escanearlo, ve su Oro acumulado, distancia hacia el próximo Tesoro, historial de visitas y descuentos activos. Puede tener tarjetas de múltiples tiendas en una sola cuenta. |
| **Usuario Anónimo / Público** | Escanea el llavero sin iniciar sesión o un llavero nuevo. Visualiza la página pública del negocio y la opción inmediata de registrarse y activar su llavero. |

---

## 3. Matriz de Comportamiento del QR Permanente (Resolución de Contexto)

La URL grabada en el llavero tiene la estructura `https://kuri.app/kuri/{keychain_token}`. Al procesarse:

| Escenario de Escaneo | Estado de Sesión / Rol | Resultado en Pantalla |
| :--- | :--- | :--- |
| **Persona cualquiera** | No autenticado / Llavero activado | Página pública de la tienda (datos, menú, horarios) + invitación a activar cuenta o unirse al programa. |
| **Cliente con llavero nuevo** | No autenticado / Llavero sin activar | Página de la tienda con banner destacado: *"¡Reclama tu Kuri!"*. Flujo de registro en 2 pasos; el llavero se vincula de por vida y se le acreditan puntos acumulados previos. |
| **Cliente dueño del llavero** | Autenticado como dueño del token | **Tarjeta de Fidelidad KURI**: Oro actual, barra de progreso al siguiente Tesoro, promociones del día y registro de visitas. |
| **Staff de este negocio** | Autenticado como dueño/empleado de la tienda emisora | **Terminal de Caja POS**: Botón de confirmación para sumar Oro (sellos o por monto), selector de Tesoros para canjear y desglose de descuentos. |
| **Staff de otro negocio** | Autenticado en una tienda distinta | Visualiza únicamente la página pública de la tienda, sin controles de caja (seguridad por aislamiento multi-tenant). |

---

## 4. Requerimientos Funcionales (RF)

### Módulo A: Super Administrador (Admin Global)
- **RF-A01 (Gestión de Tiendas):** Crear, editar, suspender y activar comercios asociados.
- **RF-A02 (Lotes de QR):** Generación criptográfica masiva de tokens únicos para llaveros agrupados por lote (*batch*), exportables para impresión física con formato SVG/PNG vectorizado.
- **RF-A03 (Asignación de Lotes):** Asociar un lote de llaveros a una tienda específica o mantenerlos en inventario global.
- **RF-A04 (Configuración de Campañas):** Definir reglas de fidelidad base para cada tienda.

### Módulo B: Perfil y Presencia Digital del Negocio (Store Owner)
- **RF-B01 (Mini-Sitio Web del Negocio):** Configuración de banner, logotipo, descripción comercial, teléfono/WhatsApp, redes sociales, dirección física y enlace a mapa.
- **RF-B02 (Horarios de Atención Dinámicos):** Gestión de horarios día por día (Lunes a Domingo con horas de apertura/cierre y estado abierto/cerrado), resumen textual automático y conmutador en vivo de estado operativo ("Abierto ahora" / "Cerrado") que impacta en tiempo real la vitrina pública.
- **RF-B03 (Catálogo de Productos y Precios):** CRUD completo de productos con nombre, descripción, categoría, precio estándar, precio con descuento para Clientes de Oro, disponibilidad inmediata y fotografía de alta resolución.
- **RF-B04 (Solicitud y Pedido de Nuevos Llaveros):** Formulario para ordenar lotes adicionales de llaveros físicos (RFID / QR) con selección de volumen, dirección de entrega física, contacto y trazabilidad del estado del pedido (`PENDING`, `IN_PRODUCTION`, `SHIPPED`, `DELIVERED`).
- **RF-B05 (Gestión de Personal):** Creación de cuentas de cajeros/empleados con credenciales limitadas a la terminal de escaneo.
- **RF-B06 (Métricas y Reportes):** Panel con visitas totales, clientes frecuentes, Tesoros entregados y horas de mayor afluencia.
- **RF-B07 (Campañas Polimórficas del Comercio):** Creación y calibración de múltiples campañas por tienda (Sellos por Visita, Puntos por Consumo Monetario, Descuento Directo presentando el Llavero Kuri y Promociones Especiales Temporales) con activación dinámica.
- **RF-B08 (Estado Operativo Automático según Horario):** Motor de cálculo en tiempo real que determina si la tienda se encuentra "Abierto ahora" o "Cerrado" a partir del día de la semana actual y los rangos horarios de apertura/cierre configurados, con opción de anulación manual de emergencia.
- **RF-B09 (Edición Integral de Perfil de Tienda, Redes Sociales y Ubicación):** Edición completa por parte del administrador/dueño del negocio del nombre del comercio, descripción detallada, redes sociales completas (Facebook, Instagram, WhatsApp, Correo electrónico, teléfono), ubicación física precisa y enlace directo de Google Maps con comprobación interactiva y reflejo inmediato en la vitrina pública del negocio.
- **RF-B10 (Almacenamiento y Subida de Imágenes en la Nube con Cloudinary):** Integración nativa de Cloudinary para la carga, procesamiento, optimización y entrega por CDN de imágenes de logotipos, banners panorámicos y fotografías de productos. Soporte de subida por streaming multipart y Base64, con variables de entorno desacopladas (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), drag & drop interactivo y previsualización en tiempo real.

### Módulo C: Motor de Fidelidad y Reglas de Campaña
- **RF-C01 (Modalidad de Oro):** Soporte de dos modos:
  - *Modo Sellos:* 1 visita confirmada = 1 Oro.
  - *Modo Monto:* X cantidad de dinero consumido = Y Oro.
- **RF-C02 (Catálogo de Tesoros):** Configuración de premios con costo en Oro (ej. "Café gratis = 5 Oro", "Corte de barba gratis = 8 Oro").
- **RF-C03 (Niveles de Cliente):** Segmentación automática:
  - *Bronce:* 0 - 10 Oro histórico.
  - *Plata:* 11 - 25 Oro histórico (desbloquea descuentos exclusivos).
  - *Oro:* 26+ Oro histórico (trato preferencial y promociones VIP).
- **RF-C04 (Promociones Temporales):** Descuentos o multiplicadores de Oro por día u horario (ej. "Martes 2x1 en Oro").

### Módulo D: Terminal de Escaneo y Caja (Store Staff / POS)
- **RF-D01 (Acreditación Manual Segura):** El staff ingresa la visita o el monto y presiona explícitamente "Confirmar Acreditación".
- **RF-D02 (Canje de Tesoros):** Si el cliente cuenta con suficiente Oro, el staff selecciona el premio y confirma el canje; el Oro se descuenta atómicamente.
- **RF-D03 (Control Antifraude y Cooldown):** Restricción configurable de tiempo mínimo entre visitas (ej. 45 minutos) y máximo de visitas acreditables por día por cliente.
- **RF-D04 (Restricción de Permisos Administrativos para Terminal POS / Staff de Caja):** Bloqueo estricto a nivel de frontend y backend para que los cajeros y baristas (`STORE_STAFF`) no puedan modificar el perfil de la tienda, redes sociales, horarios semanales, estado de apertura, configuración de campañas ni pedidos de lotes de llaveros.
- **RF-D05 (Vistas Operativas Exclusivas para Staff):** El personal de caja solo dispone de acceso al *Resumen General* operativo, la *Carta y Productos* en modo informativo/consulta de precios y beneficios de Oro, y la consulta de inventario de *Llaveros Físicos* en circulación.

### Módulo E: Experiencia del Cliente (Customer Wallet)
- **RF-E01 (Onboarding Ultrarrápido):** Registro con número celular o Google en menos de 20 segundos tras escanear el llavero físico.
- **RF-E02 (Puntos Huérfanos / Pre-activación):** Si el comercio acreditó Oro a un llavero físico antes de que el cliente se registrara, dicho saldo se adjudica automáticamente a su cuenta en cuanto la crea.
- **RF-E03 (Billetera Multitienda):** Una sola cuenta de cliente centraliza los kurios de múltiples tiendas (ej. la cafetería de la esquina y la barbería del centro).
- **RF-E04 (Transferencia por Llavero Perdido):** Si el cliente extravía su llavero, puede registrar un nuevo llavero físico y transferir su saldo histórico y nivel sin pérdidas.

---

## 5. Requerimientos No Funcionales (RNF)

- **RNF-01 (Velocidad de Carga):** Tiempo de carga de la vista del QR en móviles < 600ms en 4G.
- **RNF-02 (Disponibilidad y Concurrencia):** Operación 99.9% uptime con transacciones ACID en PostgreSQL para evitar duplicación de Oro en concurrencia de escaneo.
- **RNF-03 (Seguridad de Tokens):** Los códigos de los llaveros utilizan hashes o tokens criptográficos no secuenciales ni predecibles (evitando que terceros adivinen códigos de otros llaveros).
- **RNF-04 (Diseño Visual Excepcional):** Cumplimiento estricto del estándar claro Figma Make / v0.dev (`#FFFFFF`), micro-interacciones suaves y contraste accesible WCAG AA.
- **RNF-05 (Compatibilidad):** 100% responsivo en navegadores móviles estándar (Safari iOS, Chrome Android) sin necesidad de soporte de apps de terceros.

---

## 6. Casos Borde y Reglas de Negocio Clave

1. **Intento de Escaneo Múltiple Rápido:** Si un cliente o staff intenta escanear dos veces seguidas en menos del tiempo de cooldown, el sistema muestra una advertencia amigable: *"Ya se registró tu visita hace pocos minutos. ¡Gracias por volver!"* sin sumar Oro adicional.
2. **Llavero en Tránsito / No Asignado:** Si un usuario escanea un llavero que aún no fue entregado a ninguna tienda, el sistema muestra: *"Este Kuri aún no ha sido activado por ningún comercio."*
3. **Cambio de Dispositivo del Cliente:** El cliente no depende del llavero físico para ver su saldo; puede iniciar sesión con su teléfono en cualquier navegador y ver todas sus tarjetas activas.
