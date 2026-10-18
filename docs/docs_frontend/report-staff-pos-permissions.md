# Reporte Técnico Frontend: Adaptación Especializada del Panel de Comercio para Terminales POS / Baristas / Cajeros

**Fecha de Ejecución:** 16 de Octubre de 2026  
**Módulo:** Store Dashboard Frontend (`src/app/store/dashboard/page.tsx`)  
**Historia de Usuario:** HU-011  
**Estado:** Implementado, Verificado con TypeScript y 100% Funcional  

---

## 1. Resumen Ejecutivo
Se adaptó de manera reactiva y contextual el panel de comercio (`/store/dashboard`) para usuarios autenticados con rol `STORE_STAFF` (operadores de Terminal POS, baristas y cajeros). Conforme a los requerimientos institucionales, se ocultaron y bloquearon todos los controles de edición de tienda, horarios, campañas publicitarias y perfil/redes sociales. La interfaz queda configurada exclusivamente con las tres vistas operativas requeridas:
1. **Resumen General**
2. **Carta y Productos** (Modo consulta informativa de mostrador)
3. **Llaveros Físicos** (Modo consulta de inventario y pedidos)

---

## 2. Cambios Visuales y Arquitectura de Componentes

### A. Detección Reactiva de Rol y Forzado de Navegación Segura
- Se lee el rol desde la respuesta del backend:
  ```typescript
  const isStaff = data?.userRole === "STORE_STAFF" || data?.isStaff || data?.currentUser?.isStaff || false;
  ```
- Si un usuario `STORE_STAFF` intenta fijar la pestaña en `schedules`, `campaigns` o `profile` (incluso manipulando el estado), un hook `useEffect` redirige automáticamente a `overview`:
  ```typescript
  useEffect(() => {
    if (isStaff && !["overview", "products", "keychains"].includes(activeTab)) {
      setActiveTab("overview");
    }
  }, [isStaff, activeTab]);
  ```

### B. Cabecera Operativa Contextual
- **Badge Indicador:** En la cabecera, junto al estado de apertura, se muestra el badge sobrio: `[ Terminal POS / Modo Caja ]`.
- **Botones Ocultados:**
  - Se eliminó el botón *"Pausar Atención / Marcar Abierto"* (`handleToggleStoreStatus`).
  - Se eliminó el botón *"Editar Tienda"* (`setActiveTab("profile")`).
- **Botones Preservados:**
  - Acceso a *"Vitrina Web"* (para previsualizar la página del local en pestaña nueva).
  - Acceso a *"Terminal POS"* (acceso directo al escáner de Kurios para registrar visitas o canjear tesoros).

### C. Navegación por Pestañas (Tabs)
Para usuarios `STORE_STAFF` solo se renderizan:
- `Resumen General` (`overview`)
- `Carta y Productos` (`products`)
- `Llaveros Físicos` (`keychains`)

Las pestañas `Horarios de Atención`, `Campañas & Descuentos` y `Perfil & Redes` quedan completamente invisibles y deshabilitadas para el personal de mostrador, reservadas exclusivamente para `STORE_OWNER` y `SUPER_ADMIN`.

### D. Módulo "Carta y Productos" en Modo Consulta
- El botón `+ Nuevo Producto` se oculta automáticamente.
- Se incorpora un banner superior elegante:
  > **Modo Consulta de Mostrador:** Catálogo y precios de referencia para atención al público y validación de beneficios de Cliente de Oro.
- En cada tarjeta de producto:
  - Se ocultan los botones de mutación (editar producto, eliminar producto y conmutador de disponibilidad).
  - Se reemplaza por un indicador de estado visual: `Disponible en mostrador` o `Agotado temporalmente` con su identificador de referencia.

### E. Módulo "Llaveros Físicos" en Modo Inventario
- Se oculta el botón `Solicitar Más Llaveros` para evitar solicitudes de compra no autorizadas por la gerencia.
- El personal puede consultar el número total de llaveros en circulación y revisar el estado de los pedidos de producción registrados.

---

## 3. Verificación de Tipos y Compilación
- Se ejecutó `npx tsc --noEmit` en `frontend/` sin ningún error (`exit code 0`).
