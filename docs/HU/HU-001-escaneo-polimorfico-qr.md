# Historia de Usuario: HU-001 - Escaneo y Resolución Polimórfica del QR

**ID:** HU-001  
**Épica:** EP-02 - Motor de Llaveros QR y Enrutamiento Polimórfico  
**Prioridad:** Alta (Crítica)  
**Estado:** Definida  

---

## 1. Descripción
**Como** cualquier persona que escanea el código QR de un llavero KURI físico con la cámara de su teléfono,  
**Quiero** ser redirigido a una vista contextualizada según mi rol y estado de autenticación,  
**Para** interactuar con la plataforma de forma fluida y sin fricción (ver el negocio, ver mi saldo de Oro o registrar una visita si soy staff).

---

## 2. Criterios de Aceptación (Given-When-Then)

### Escenario 1: Visitante anónimo escanea un llavero asignado a una tienda
- **Given** que el usuario no tiene una sesión iniciada en KURI,
- **When** escanea el QR con la cámara de su celular,
- **Then** el navegador abre la página pública del negocio con sus fotos, descripción, horarios, productos y precios, junto con un botón para registrarse y activar su tarjeta de fidelidad.

### Escenario 2: Cliente titular escanea su propio llavero
- **Given** que el cliente ha iniciado sesión y es el propietario registrado de ese llavero,
- **When** escanea el QR de su llavero,
- **Then** se muestra de inmediato su Tarjeta de Fidelidad de ese negocio, detallando su Oro acumulado, distancia al próximo Tesoro y promociones vigentes.

### Escenario 3: Dueño o empleado de la tienda escanea el llavero de un cliente
- **Given** que un empleado o dueño tiene su sesión iniciada en la tienda emisora del llavero,
- **When** escanea el QR del llavero presentado por el cliente,
- **Then** se abre la Terminal de Caja POS mostrando el nombre del cliente (o estatus anónimo si no está registrado aún), su saldo actual y botones para sumar Oro o canjear Tesoros disponibles.

### Escenario 4: Dueño o empleado de otra tienda escanea el llavero
- **Given** que un empleado de la Tienda "A" escanea un llavero perteneciente a la Tienda "B",
- **When** se procesa la solicitud,
- **Then** el sistema muestra únicamente la vista pública de la Tienda "B", sin habilitar ninguna opción de acreditación o canje de caja.
