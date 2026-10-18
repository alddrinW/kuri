# Historia de Usuario: HU-002 - Acreditación de Oro en Caja con Confirmación Explícita

**ID:** HU-002  
**Épica:** EP-04 - Terminal de Caja POS para Acreditación de Oro y Canje de Tesoros  
**Prioridad:** Alta (Crítica)  
**Estado:** Definida  

---

## 1. Descripción
**Como** dueño o empleado de un negocio con sesión activa en KURI,  
**Quiero** escanear el llavero del cliente y pulsar un botón de confirmación deliberado para sumar Oro (por visita o por monto),  
**Para** evitar acreditaciones accidentales y premiar la lealtad de forma segura y auditada.

---

## 2. Criterios de Aceptación (Given-When-Then)

### Escenario 1: Acreditación exitosa por visita
- **Given** que el empleado está en el terminal de caja tras escanear un llavero válido,
- **When** presiona el botón "Sumar 1 de Oro (Visita)" y confirma en el diálogo modal o botón deslizable,
- **Then** el sistema registra una transacción inmutable en el backend, incrementa el Oro del llavero, reproduce un feedback sonoro/háptico y actualiza la pantalla con el nuevo saldo.

### Escenario 2: Protección de tiempo mínimo entre visitas (Cooldown Antifraude)
- **Given** que un llavero ya recibió Oro hace menos del tiempo mínimo configurado (ej. 45 minutos),
- **When** el empleado intenta acreditar nuevamente Oro al mismo llavero,
- **Then** el sistema bloquea la transacción y muestra una alerta clara indicando el tiempo restante antes de la próxima visita válida.

### Escenario 3: Acreditación a llavero físico aún no activado por el cliente
- **Given** que el cliente tiene un llavero recién entregado y todavía no ha creado su cuenta,
- **When** el empleado confirma la suma de Oro,
- **Then** el Oro se almacena en el registro de saldo del llavero (`UnclaimedLedger`) para que se adjudique automáticamente en cuanto el cliente active su cuenta.
