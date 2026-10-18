# Historia de Usuario: HU-010 - Almacenamiento y Subida de Imágenes en la Nube con Cloudinary

**Épica:** EP-12: Gestión Multimedia y Optimización de Imágenes en la Nube  
**Prioridad:** Alta  
**Estado:** Implementada y Verificada  
**Fecha:** 2026-10-11  

---

## 🎯 Descripción de la Historia de Usuario

**Como** dueño de comercio o administrador de la plataforma,  
**quiero** cargar y almacenar de forma segura las imágenes de logotipos, banners de portada y fotografías de productos directamente en Cloudinary mediante variables de entorno configurables,  
**para** garantizar una entrega multimedia ultrarrápida, optimizada, responsiva y persistente sin depender de enlaces externos temporales o sobrecargar el servidor local.

---

## 📋 Criterios de Aceptación (Gherkin)

### Escenario 1: Subida de archivo de imagen desde el panel del comercio
- **Dado que** el comerciante está en la pestaña "Perfil & Redes" de su panel `/store/dashboard`
- **Cuando** arrastra un archivo de imagen o hace clic en el área de carga del logotipo o portada
- **Entonces** el sistema valida que sea un formato de imagen permitido (JPG, PNG, WEBP, SVG) menor a 10MB
- **Y** envía la imagen mediante `POST /api/upload/image` a la API de KURI
- **Y** la API procesa el buffer y lo almacena en la nube de Cloudinary en su respectiva carpeta (`kuri/logos`, `kuri/banners`)
- **Y** el componente recibe la URL segura (`secure_url`) optimizada por CDN y actualiza la previsualización en vivo.

### Escenario 2: Subida de foto de platillo o producto en el catálogo digital
- **Dado que** el comerciante abre el modal de creación o edición de producto en `/store/dashboard`
- **Cuando** selecciona una foto desde su dispositivo mediante el selector de archivo
- **Entonces** la foto se sube a la carpeta `kuri/products` de Cloudinary
- **Y** el formulario del producto vincula automáticamente el campo `imageUrl` a la URL devuelta por Cloudinary.

### Escenario 3: Edición de imágenes desde la consola de SuperAdmin
- **Dado que** el Super Administrador está en la consola `/admin/dashboard`
- **Cuando** edita un comercio y sube una nueva imagen para su logo o banner
- **Entonces** la imagen se persiste en Cloudinary y se actualiza el registro en la base de datos tras confirmar el formulario.

### Escenario 4: Seguridad y configuración de credenciales
- **Dado que** las credenciales de API de Cloudinary son sensibles
- **Cuando** se despliega el backend
- **Entonces** las claves `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` se leen exclusivamente desde las variables de entorno (`backend/.env`)
- **Y** nunca se exponen al cliente frontend.

---

## 🛠️ Componentes Técnicos Involucrados
1. **Configuración SDK Backend:** `backend/src/config/cloudinary.ts` con inicialización dinámica y helpers de subida por streaming y Base64.
2. **Middleware Multer:** Almacenamiento en memoria sin retención en disco temporal para procesar peticiones multipart.
3. **Endpoints de API:** `GET /api/upload/status`, `POST /api/upload/image`, `POST /api/upload/file`, `POST /api/upload/base64`.
4. **Plantilla de Entorno:** `backend/.env.example` y `backend/.env` con las variables configurables.
5. **Componente Reusable Frontend:** `frontend/src/components/ImageUploader.tsx` con Drag & Drop, indicador de estado de Cloudinary, previsualización en vivo y feedback de carga.
6. **Vistas Integradas:** `/store/dashboard` (Perfil & Redes y Catálogo de Productos) y `/admin/dashboard` (Edición de Comercios).
