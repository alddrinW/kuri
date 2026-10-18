# Reporte Técnico de Backend: Perfil de Tienda, Redes Sociales y Geolocalización (HU-009)

**Fecha:** 2026-10-11  
**Módulo:** Gestión de Tienda y Redes Sociales (Store Profile & Contact)  
**Estado:** COMPLETADO Y VALIDADO  

---

## 1. Modificaciones en el Esquema de Base de Datos (`schema.prisma`)

Se amplió el modelo `Store` agregando el campo para red social Facebook:

```prisma
model Store {
  id           String   @id @default(cuid())
  slug         String   @unique
  name         String
  tagLine      String?
  description  String?
  logoUrl      String?
  bannerUrl    String?
  address      String?
  phone        String?
  whatsapp     String?
  email        String?
  facebook     String?   // <-- Nuevo campo para enlace o página de Facebook
  instagram    String?
  mapUrl       String?   // <-- Enlace a Google Maps
  category     String   @default("Cafetería y Restaurante")
  ...
}
```

Se sincronizó la base de datos relacional mediante `prisma db push` y se regeneró el cliente tipado con `prisma generate`.

---

## 2. Endpoints y Lógica de Negocio

### `PUT /api/store/profile` (Dueño de Tienda / Staff)
Permite al administrador autenticado actualizar la identidad completa y presencia digital de su negocio:
- **Cuerpo JSON:**
  - `name`: Nombre comercial.
  - `description`: Descripción comercial detallada.
  - `tagLine`: Eslogan del negocio.
  - `category`: Categoría comercial.
  - `facebook`: Enlace a página o perfil de Facebook.
  - `instagram`: Enlace a perfil de Instagram.
  - `whatsapp`: Número o enlace directo de WhatsApp.
  - `email`: Correo electrónico de contacto del negocio.
  - `phone`: Teléfono de atención al cliente.
  - `address`: Dirección física del local.
  - `mapUrl`: Enlace directo de Google Maps.
  - `logoUrl` / `bannerUrl`: URLs de identidad gráfica.
- **Respuesta:** 200 OK con objeto `store` enriquecido y estado operativo en tiempo real (`isCurrentlyOpen`, `openStatusReason`).

### `PUT /api/stores/:slug`
Actualización general con control de permisos (`ownerId === user.id` o `role === SUPER_ADMIN`), preservando y actualizando campos de redes sociales y ubicación física.

### `PUT /api/admin/stores/:storeId` (Super Administrador)
Permite al Super Administrador editar directamente cualquier comercio de la red, ajustando nombre, descripción, redes sociales, dirección física y enlace de Google Maps.

---

## 3. Semillas y Datos de Prueba Reales (`seed.ts`)

Se actualizaron los datos reales del seeder para incluir redes completas y enlaces funcionales:
- **Café Andino de Especialidad:**
  - Facebook: `https://facebook.com/cafeandino_ec`
  - Instagram: `https://instagram.com/cafeandino_ec`
  - WhatsApp: `593991122334`
  - Email: `hola@cafeandino.com`
  - Dirección: `Av. Amazonas y República, Quito`
  - Map URL: `https://maps.google.com/?q=Av.+Amazonas+y+Republica,+Quito`
- **Barbería La Imperial:**
  - Facebook: `https://facebook.com/laimperial_barber`
  - Instagram: `https://instagram.com/laimperial_barber`
  - WhatsApp: `593994433221`
  - Email: `citas@laimperial.com`
  - Dirección: `Calle La Niña y Juan León Mera, Quito`
  - Map URL: `https://maps.google.com/?q=Calle+La+Nina+y+Juan+Leon+Mera,+Quito`
