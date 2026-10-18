# Historia de Usuario: HU-005 - Transferencia de Progreso por Llavero Perdido

**ID:** HU-005  
**Épica:** EP-07 - Reglas Avanzadas y Resiliencia  
**Prioridad:** Media (V1.0)  
**Estado:** Definida  

---

## 1. Descripción
**Como** cliente que ha extraviado su llavero físico "Tu Kuri",  
**Quiero** solicitar un llavero de reemplazo en el negocio y transferir todo mi Oro acumulado y nivel,  
**Para** no perder mi progreso ni mi lealtad construida con el comercio.

---

## 2. Criterios de Aceptación (Given-When-Then)

### Escenario 1: Transferencia exitosa a nuevo llavero físico
- **Given** que el cliente tiene una cuenta activa con Oro acumulado y el negocio le entrega un nuevo llavero sin activar,
- **When** el cliente ingresa a su perfil digital, selecciona "Vincular nuevo llavero de reemplazo" y escanea el nuevo código,
- **Then** el llavero antiguo queda revocado permanentemente con estado `LOST`, el nuevo llavero asume el saldo y el historial, y cualquier intento futuro de escanear el llavero perdido muestra que ha sido desactivado.

### Escenario 2: Protección contra transferencias no autorizadas
- **Given** que un tercero intenta vincular un llavero que ya pertenece a otro cliente activo sin autenticación del titular,
- **When** se solicita la vinculación,
- **Then** el sistema rechaza la operación informando que el llavero ya cuenta con un titular asignado.
