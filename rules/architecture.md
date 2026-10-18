# Arquitectura Desacoplada en Capas - KURI

**Topología:** Arquitectura Desacoplada Cliente-Servidor (Multi-Package / Separated Tiers)  
**Estado:** ACTIVO  

---

## 1. Estructura de Directorios Desacoplada

El sistema KURI está estrictamente separado en dos proyectos independientes: una API REST de Backend en Node.js/Express + Prisma y una aplicación Web de Frontend en Next.js 15+ App Router con Tailwind CSS:

```
Fidelizacion_v1/
├── backend/                       # Servidor API REST dedicado (Puerto 4000)
│   ├── prisma/
│   │   ├── schema.prisma          # Modelado relacional completo
│   │   ├── seed.ts                # Seeder con usuarios, comercios, kurios y transacciones
│   │   └── dev.db                 # Base de datos relacional
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.ts          # Singleton de Prisma Client
│   │   │   └── cloudinary.ts      # Cliente SDK y helpers de carga de Cloudinary
│   │   ├── controllers/           # Controladores de negocio (auth, store, kuri, pos, wallet, admin, upload)
│   │   ├── middlewares/           # Autenticación JWT en cookies y autorización por roles
│   │   ├── routes/                # Enrutadores Express (/api/auth, /api/stores, /api/kuri, /api/upload, etc.)
│   │   └── index.ts               # Servidor Express con CORS, cookies y healthcheck
│   ├── .env                       # PORT=4000, JWT_SECRET, CLOUDINARY_*, FRONTEND_URL=http://localhost:3000
│   ├── .env.example               # Plantilla de variables de entorno con Cloudinary
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Cliente Web Next.js 15+ App Router (Puerto 3000)
│   ├── src/
│   │   ├── app/                   # Vistas reales de producción
│   │   │   ├── admin/dashboard/   # Consola SuperAdmin y generación de lotes QR
│   │   │   ├── kuri/[token]/      # Ruta polimórfica del QR físico permanente
│   │   │   ├── login/             # Inicio de sesión con selector de roles reales
│   │   │   ├── pos/[token]/       # Terminal de caja POS para mostrador
│   │   │   ├── register/          # Registro express y activación de Kuri
│   │   │   ├── store/[slug]/      # Mini-sitio web público del comercio (horarios desplegables, productos, promociones)
│   │   │   ├── store/dashboard/   # Panel integral del comercio (productos, horarios, solicitud llaveros, campañas)
│   │   │   ├── wallet/            # Billetera multitienda del cliente
│   │   │   ├── layout.tsx         # Root Layout con estética Figma Make en fondo blanco (#FFFFFF)
│   │   │   └── page.tsx           # Landing corporativa de KURI
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Cabecera fija de 64px con menú contextual y switcher de prueba
│   │   │   ├── SocialIcons.tsx    # Iconos SVG de alta definición (Facebook, Instagram, WhatsApp, Maps)
│   │   │   └── ImageUploader.tsx  # Componente drag & drop con Cloudinary, preview y feedback
│   │   └── lib/
│   │       └── api.ts             # Cliente fetch para consumir el backend desacoplado
│   ├── .env.local                 # BACKEND_URL=http://localhost:4000
│   ├── next.config.ts             # Proxy transparente /api/* hacia http://localhost:4000
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docs/                          # Documentación viva, SRS, HUs y reportes técnicos
├── rules/                         # Reglas operativas y guías de tecnología
└── package.json                   # Orquestador raíz (npm run dev, npm run build, npm run seed)
```

---

## 2. Comunicación Entre Capas (Frontend ↔ Backend)

1. **Protocolo:** RESTful JSON sobre HTTP.
2. **CORS:** El backend (`http://localhost:4000`) autoriza peticiones con credenciales (`credentials: true`) desde `http://localhost:3000`.
3. **Proxy Rewrite:** El frontend en `next.config.ts` reenvía transparentemente las peticiones de `/api/:path*` hacia el backend en el puerto 4000, eliminando problemas de CORS en navegador y preservando las cookies de sesión HTTP-only.
4. **Persistencia:** JWT en cookie `kuri_session_token` con expiración de 7 días.
