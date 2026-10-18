# Reporte Técnico de Frontend: Componente ImageUploader & Integración de Cloudinary

**Módulo:** Gestión Multimedia & Carga Visual (`HU-010`)  
**Fecha:** 2026-10-11  
**Autor:** Antigravity Agent  
**Estado:** Integrado, Estilizado y Validado en Next.js 15+  

---

## 1. Resumen Ejecutivo
Se diseñó e implementó el componente interactivo reusable `ImageUploader` para Next.js, conectándolo directamente a la API de backend para cargar imágenes a Cloudinary mediante Drag & Drop, selección de archivos o entrada de URL alternativa, con estados de carga animados, badges de estado del servicio y previsualización en vivo.

---

## 2. Componente [ImageUploader.tsx](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/frontend/src/components/ImageUploader.tsx)
- **Props Flexibles:**
  - `label`: Título del campo.
  - `currentUrl`: URL existente (controlada bidireccionalmente).
  - `onImageUploaded(url)`: Callback que se ejecuta cuando Cloudinary confirma la subida.
  - `folder`: Carpeta destino en Cloudinary (`kuri/logos`, `kuri/banners`, `kuri/products`).
  - `aspectRatio`: Relación de aspecto para la previsualización (`square`, `wide`, `any`).
  - `description`: Texto explicativo de especificaciones técnicas.
- **Características UX/UI:**
  - Drag & Drop nativo con respuesta visual de realce al arrastrar archivos.
  - Indicador de estado de conexión con Cloudinary en tiempo real (píldora con icono `Cloud` y color semántico).
  - Spinner de carga con `Loader2` durante el procesamiento en la nube.
  - Botones de acción rápida: *"Cambiar"* y *"Quitar"*.
  - Campo secundario para URLs directas externas o de Unsplash.

---

## 3. Vistas Integradas
1. **Panel del Comercio ([store/dashboard/page.tsx](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/frontend/src/app/store/dashboard/page.tsx)):**
   - **Pestaña Perfil & Redes:** Subida de logotipo de tienda (`kuri/logos`) y banner de cabecera panorámico (`kuri/banners`) con actualización de la tarjeta de Live Preview.
   - **Pestaña Carta y Productos:** Modal de creación y edición de productos con subida de fotografía (`kuri/products`).
2. **Panel SuperAdmin ([admin/dashboard/page.tsx](file:///home/alddrinW/Documentos/proyectos_personales/Fidelizacion_v1/frontend/src/app/admin/dashboard/page.tsx)):**
   - Modal de edición de comercios con `ImageUploader` para logotipo y portada.

---

## 4. Validación de Compilación
- `npm run --prefix frontend build` ejecutado exitosamente (Código de salida: 0).
- Generación de las 9 rutas estáticas y dinámicas sin errores de tipos de TypeScript.
