# Reglas de Backend - Node.js (NestJS / Express + TypeScript) (KURI)

## 1. Lineamientos Generales
- **Runtime:** Node.js 20+ LTS con TypeScript estricto.
- **Framework:** NestJS o Express modular con arquitectura por capas (Controllers, Services, Repositories).
- **Validación de Entradas:** Zod o `class-validator` con DTOs estrictos en todas las rutas.
- **Autenticación:** JWT con refresh tokens y control de acceso basado en roles (`SUPER_ADMIN`, `STORE_OWNER`, `STORE_STAFF`, `CUSTOMER`).

## 2. Reglas de Negocio Críticas
- **Confirmación Explícita:** Nunca acreditar puntos por el mero escaneo. Toda transacción requiere un endpoint POST autenticado con el id del staff y el token del llavero.
- **Protección Antifraude y Anti-Abuso:**
  - Cooldown mínimo configurable por tienda (ej. mínimo 30-60 minutos entre visitas).
  - Límite máximo de puntos/visitas diarias por cliente.
  - Geolocalización o validación de IP opcional si se sospecha abuso.
- **Gestión de Llaveros No Reclamados:** Transacciones asociadas al `keychain_id` sin `user_id` persisten en la tabla `unclaimed_ledger` y se transfieren atómicamente cuando el cliente se registra.
- **Transferencia de Llavero:** Endpoint seguro para desvincular llavero anterior y vincular nuevo llavero físico manteniendo saldo, nivel e historial íntegros.
