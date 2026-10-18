# Historia de Usuario: HU-004 - Canje de Tesoros en Comercio

**ID:** HU-004  
**Épica:** EP-04 - Terminal de Caja POS para Acreditación de Oro y Canje de Tesoros  
**Prioridad:** Alta (MVP)  
**Estado:** Definida  

---

## 1. Descripción
**Como** cliente que ha acumulado suficiente Oro en un negocio,  
**Quiero** que el encargado en caja pueda validar y canjear mi Tesoro (recompensa),  
**Para** disfrutar de mi beneficio de forma inmediata sin complicaciones técnicas ni cupones de papel.

---

## 2. Criterios de Aceptación (Given-When-Then)

### Escenario 1: Canje exitoso con saldo suficiente
- **Given** que el cliente presenta su llavero con 10 de Oro acumulados y el Tesoro cuesta 8 de Oro,
- **When** el empleado escanea el llavero y presiona "Canjear: Café Especial (8 Oro)",
- **Then** el sistema descuenta atómicamente 8 de Oro del saldo del cliente, genera un recibo de canje digital y actualiza el saldo remanente a 2 de Oro.

### Escenario 2: Intento de canje con saldo insuficiente
- **Given** que el cliente solo tiene 4 de Oro y el Tesoro cuesta 8 de Oro,
- **When** el empleado visualiza el catálogo de Tesoros en el terminal de caja,
- **Then** el botón de canje aparece deshabilitado indicando el Oro faltante (*"Faltan 4 de Oro"*), imposibilitando la deducción accidental.
