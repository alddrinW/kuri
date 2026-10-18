# Historia de Usuario HU-006: Administración Central de Comercios, Campañas y Lotes QR

## Identificación
- **ID:** HU-006
- **Módulo:** SuperAdmin Core / Operaciones Centrales
- **Título:** Creación de Comercio, Asignación de Credenciales, Configuración de Campaña y Lotes QR
- **Prioridad:** Alta (Crítica para onboarding de comercios)

---

## Narrativa del Usuario
**Como** Administrador Principal de la red KURI,  
**quiero** dar de alta nuevos comercios afiliados con sus credenciales de acceso de propietario, configurar de forma dinámica las reglas de sus campañas de fidelización y emitir lotes físicos de llaveros con códigos QR inmutables,  
**para** habilitar la operación comercial de las tiendas locales de manera inmediata sin modificar código ni reimprimir soportes físicos ante cambios en las promociones.

---

## Criterios de Aceptación

### 1. Creación de Comercio y Credenciales de Propietario
- El SuperAdmin puede registrar un comercio especificando:
  - Nombre comercial, slug único, categoría, dirección y teléfono.
  - Nombre del dueño/gerente, correo electrónico institucional y contraseña temporal inicial.
- El sistema crea la cuenta de usuario con rol `STORE_OWNER` con contraseña encriptada mediante `bcrypt`.
- Se asocia de manera atómica el usuario como propietario de la nueva tienda creada.
- El sistema inicializa automáticamente una campaña de fidelización activa predeterminada para el comercio.

### 2. Configuración y Ajuste en Caliente de Campañas
- El SuperAdmin puede seleccionar cualquier comercio de la red y calibrar sus parámetros de fidelidad:
  - **Modo de Acreditación:** Por Visita (`VISIT_COUNT`) o Por Monto Consumido (`AMOUNT_RATIO`).
  - **Tasa de Conversión:** Cantidad de Kuri Oros otorgados por cada dólar o por cada visita registrada.
  - **Ventana Antifraude (Cooldown):** Tiempo mínimo en minutos entre acreditaciones para el mismo llavero.
  - **Límite Diario de Visitas/Transacciones:** Máximo de acreditaciones válidas por día por cliente.
- Las modificaciones toman efecto de forma inmediata sobre todos los llaveros activos escaneados en dicho comercio sin requerir ninguna reimpresión ni reinstalación.

### 3. Emisión de Lotes de Llaveros QR Permanentes
- El SuperAdmin puede generar lotes masivos de llaveros QR indicando:
  - Nombre de la remesa o lote (ej. `Lote Centro Histórico`).
  - Prefijo alfanumérico identificador (ej. `KURI-CH`).
  - Cantidad de unidades a emitir (de 1 a 100 unidades por lote).
- Cada llavero recibe un identificador permanente y token único inmutable (`KURI-...-XXXX`).
- El sistema genera los códigos QR vectoriales de alta definición listos para ser impresos en serigrafía o pliegos adhesivos para el ensamble de llaveros físicos.

### 4. Catálogo Maestro de QR y Exportación Masiva en PDF y Excel
- El SuperAdmin dispone de una vista unificada (`Catálogo de QR`) donde se listan todos los códigos QR físicos emitidos en la plataforma con:
  - Imagen escaneable del código QR.
  - Token inmutable (`KURI-...`).
  - Nombre del comercio y lote de origen.
  - Estado del llavero (`Activado por Cliente` vs `Disponible en Mostrador`).
  - Nombre y correo del cliente titular (si está activado).
- **Exportación a Excel (`.xlsx` / `.csv`):** Botón de descarga masiva con formato estructurado, anchos de columna tipados y soporte nativo para Microsoft Excel.
- **Exportación a PDF (`.pdf`):** Generación de documento multi-página formateado en cuadrícula de pliegos serigráficos (2x3 por hoja A4) con código QR de alta resolución, token en negrita, identificador de comercio y guías de corte punteadas para producción física.
- **Descargas Individuales:** Opción de descarga directa de cada imagen QR en formato PNG y enlace directo para probar la resolución polimórfica.

---

## Verificación Técnica
- **Controlador Backend:** `backend/src/controllers/admin.controller.ts` (`createStore`, `updateCampaign`, `createKeychainBatch`, `listAllKeychains`, `exportKeychainsCsv`).
- **Rutas API:** `POST /api/admin/stores`, `PUT /api/admin/campaigns/:storeId`, `POST /api/admin/batches`, `GET /api/admin/keychains`, `GET /api/admin/keychains/export/csv`.
- **Vista Frontend:** `frontend/src/app/admin/dashboard/page.tsx` conectada al API con persistencia real, librerías `jspdf` y `xlsx` para descargas inmediatas.

