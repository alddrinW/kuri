# Reporte Técnico Backend: Control de Permisos y Protección de Endpoints para Terminal POS / Cajeros / Baristas (`STORE_STAFF`)

**Fecha de Ejecución:** 16 de Octubre de 2026  
**Módulo:** Backend Store API (`store.controller.ts`)  
**Historia de Usuario:** HU-011  
**Estado:** Implementado, Compilado y Validado al 100%  

---

## 1. Resumen Ejecutivo
Se implementó el control de acceso basado en roles (RBAC) a nivel de servicios y controladores en el backend para salvaguardar la integridad de las tiendas asociadas a la plataforma KURI. Se restringe rigurosamente a los usuarios con rol `STORE_STAFF` (baristas, cajeros y operadores del terminal POS) para que no puedan realizar modificaciones sobre perfiles de comercio, redes sociales, horarios de atención, campañas promocionales, carta de productos ni compras de lotes de llaveros.

---

## 2. Endpoints y Lógica de Protección Implementada

### A. Exposición de Contexto y Rol en el Dashboard
- **Endpoint:** `GET /api/store/dashboard`
- **Cambio:** Se adjunta el objeto `currentUser` y las propiedades booleanas `isStaff`, `isOwner`, `isAdmin` y `userRole` en la respuesta JSON.
- **Respuesta para `STORE_STAFF`:**
  ```json
  {
    "success": true,
    "userRole": "STORE_STAFF",
    "isStaff": true,
    "isOwner": false,
    "isAdmin": false,
    "currentUser": {
      "id": "cm...",
      "name": "Mateo Barista",
      "email": "barista@cafeandino.com",
      "role": "STORE_STAFF",
      "isStaff": true
    },
    "store": { ... },
    "topCustomers": [ ... ],
    "recentTransactions": [ ... ]
  }
  ```

### B. Endpoints de Solo Lectura Autorizados para `STORE_STAFF`
- `GET /api/store/dashboard` (Resumen general y métricas operativas).
- `GET /api/store/products` (Catálogo de productos con precios regulares y clientes de oro para consulta en mostrador).
- `GET /api/store/keychain-orders` (Inventario de llaveros en circulación e historial de solicitudes).

### C. Endpoints Restringidos con Código `403 Forbidden`
Todo intento de mutación por parte de un usuario con `req.user.role === "STORE_STAFF"` es interceptado y denegado:
1. `PUT /api/store/profile`: Rechazado con 403 (*"Los terminales POS o cajeros no tienen permisos para editar la configuración de la tienda ni sus redes"*).
2. `PUT /api/store/toggle-status`: Rechazado con 403 (*"Los terminales POS o cajeros no tienen permisos para alterar el estado de apertura de la tienda"*).
3. `PUT /api/store/schedules`: Rechazado con 403 (*"Los terminales POS o cajeros no tienen permisos para modificar los horarios de atención de la tienda"*).
4. `POST /api/store/products`: Rechazado con 403 (*"Los terminales POS o cajeros solo tienen permisos de lectura para ver la carta y productos"*).
5. `PUT /api/store/products/:id`: Rechazado con 403.
6. `DELETE /api/store/products/:id`: Rechazado con 403.
7. `PUT /api/store/campaigns/main`: Rechazado con 403 (*"Los terminales POS o cajeros no tienen permisos para configurar campañas"*).
8. `POST /api/store/campaigns/promo`: Rechazado con 403.
9. `PUT /api/store/campaigns/promo/:id`: Rechazado con 403.
10. `DELETE /api/store/campaigns/promo/:id`: Rechazado con 403.
11. `POST /api/store/keychain-orders`: Rechazado con 403 (*"Solo el dueño del comercio puede solicitar nuevos pedidos de lotes de llaveros"*).

---

## 3. Pruebas Automatizadas de Integración
- **Archivo de prueba:** `backend/src/tests/test_staff_pos_permissions.ts`
- **Resultado:**
  ```text
  === INICIANDO VALIDACIÓN DE PERMISOS: TERMINAL POS / BARISTA / CAJERO ===
  [AUTH] Autenticado como staff: Mateo Barista (barista@cafeandino.com) - Rol: STORE_STAFF
  [PASS] GET /api/store/dashboard: Staff puede ver resumen general e identifica su rol correctamente.
  [PASS] GET /api/store/products: Staff puede consultar catálogo digital (5 productos).
  [PASS] GET /api/store/keychain-orders: Staff puede ver inventario y pedidos de llaveros (2 pedidos).
  [PASS] PUT /api/store/profile: Bloqueado con 403 Forbidden para staff de terminal POS.
  [PASS] PUT /api/store/toggle-status: Bloqueado con 403 Forbidden para staff de terminal POS.
  [PASS] PUT /api/store/schedules: Bloqueado con 403 Forbidden para staff de terminal POS.
  [PASS] POST /api/store/products: Bloqueado con 403 Forbidden para staff (solo lectura en mostrador).
  [PASS] POST /api/store/campaigns/promo: Bloqueado con 403 Forbidden para staff.
  [PASS] POST /api/store/keychain-orders: Bloqueado con 403 Forbidden para staff.
  === TODAS LAS REGLAS DE SEGURIDAD Y PERMISOS FUERON VALIDADAS EXITOSAMENTE ===
  ```
