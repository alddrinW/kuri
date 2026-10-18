# Historia de Usuario: HU-003 - Activación de Llavero Nuevo y Adjudicación de Oro Previo

**ID:** HU-003  
**Épica:** EP-05 - Experiencia y Billetera del Cliente  
**Prioridad:** Alta (MVP)  
**Estado:** Definida  

---

## 1. Descripción
**Como** cliente que acaba de recibir un llavero KURI en una tienda,  
**Quiero** escanearlo y registrarme en segundos desde mi navegador,  
**Para** vincular el llavero a mi cuenta para siempre y no perder ningún punto acumulado previamente en caja.

---

## 2. Criterios de Aceptación (Given-When-Then)

### Escenario 1: Activación y registro exitoso en menos de 20 segundos
- **Given** que el cliente escanea un llavero no vinculado a ninguna cuenta,
- **When** ingresa su número telefónico/correo y nombre para crear su cuenta,
- **Then** el sistema vincula el token del llavero a su perfil de usuario, transfiere cualquier saldo acumulado previo en caja y le muestra su Tarjeta de Fidelidad con una animación de bienvenida.

### Escenario 2: Cliente existente agrega un nuevo llavero de otra tienda
- **Given** que un cliente ya tiene cuenta en KURI con tarjeta de una cafetería y recibe un llavero de una barbería,
- **When** inicia sesión con su cuenta existente al escanear el nuevo llavero,
- **Then** el sistema añade la nueva tienda a su billetera multi-tienda sin alterar sus datos ni el llavero anterior.
