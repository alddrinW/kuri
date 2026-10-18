# Reglas de Frontend Web - Next.js (KURI)

## 1. Lineamientos Generales
- **Framework:** Next.js 15+ con App Router (`src/app`).
- **Lenguaje:** TypeScript estricto.
- **Estilos:** Tailwind CSS con tokens de diseño en fondo blanco (`#FFFFFF`).
- **Enfoque:** Mobile-first PWA optimizada para escaneo rápido con cámara sin instalar app.

## 2. Convenciones de Enrutamiento
- `src/app/kuri/[token]/page.tsx`: Ruta central polimórfica del QR que resuelve el contexto del usuario (Público, Cliente, Dueño, Empleado).
- `src/app/(client)/wallet/`: Billetera del cliente con sus tarjetas de fidelidad multitienda.
- `src/app/(store)/pos/`: Terminal de caja para escaneo y acreditación rápida.
- `src/app/(admin)/campaigns/`: Administración central de tiendas y lotes de llaveros.

## 3. Optimización y Rendimiento
- Carga de página < 800ms en redes móviles 4G.
- Bundle ligero sin dependencias innecesarias.
- Server Components por defecto, Client Components únicamente para interactividad (cámara, animaciones, formularios reactivos).
