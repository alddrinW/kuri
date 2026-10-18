# Guía Maestra de Diseño UI/UX - KURI

## 1. Principio Fundamental: Fondo Blanco Puro y Elegancia Figma Make / v0.dev

Toda interfaz desarrollada en KURI (web o mobile) debe cumplir estrictamente con los siguientes estándares visuales:

- **Fondo Primario:** `#FFFFFF` (Blanco Puro) y fondos de apoyo sutiles `#F8FAFC` / `#FAFAFA`.
- **Prohibición de Dark Mode por Defecto o Estilos Neón:** Queda terminantemente prohibido inicializar vistas con fondos negros o paletas estridentes no corporativas.
- **Tarjetas y Superficies:** `bg-white`, con bordes ultrafinos de alta definición (`border-slate-100` o `border-zinc-200/80`).
- **Sombras:** Sombras ambientales suaves multicapa (`shadow-[0_2px_8px_rgba(0,0,0,0.04)]` o `shadow-[0_8px_24px_rgba(0,0,0,0.06)]`).
- **Tipografía:** Nítida, oscura (`text-zinc-900` para títulos, `text-zinc-600` para secundarios), con escala tipográfica equilibrada (Inter / Outfit / SF Pro).
- **Copy 100% Humano:** Sin textos técnicos ("conectado a backend", "status 200", etc.). Debe sonar como un producto de alta gama (estilo Apple, Stripe o Cash App).
- **Cero Cajas de Depuración / Falsa Telemetría:** Prohibido insertar paneles de debug o dumps JSON en pantallas públicas o de usuario.

---

## 2. Las 7 Design & Motion Skills Maestras

1. **Emil Kowalski Motion Principles:**
   - Micro-interacciones naturales, físicas y fluidas.
   - Duraciones cortas (150ms - 280ms) con curvas `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Feedback táctil e interactivo en botones, tarjetas y canjes.

2. **Impeccable Visual Polish:**
   - Alineación pixel-perfect, paddings consistentes (múltiplos de 4px / 8px).
   - Jerarquía visual cristalina entre elementos primarios, secundarios y terciarios.

3. **Taste Skill & Curated Aesthetics:**
   - Detalles de oro satinado premium (`#D97706` / `#B45309` / `#F59E0B` dorado cálido) como acento de marca KURI sin sobrecargar el fondo blanco.
   - Texturas sutiles, insignias y sellos con acabado limpio.

4. **UI/UX Pro Max Accessibility & Flow:**
   - Zonas de toque táctil de mínimo 48x48px (ideal para escanear en caja con una sola mano).
   - Contraste visual accesible WCAG AA/AAA.
   - Flujos de registro en menos de 20 segundos para el cliente en el negocio.

5. **Apple Design Language:**
   - Claridad, deferencia y profundidad.
   - Iconografía SF-style minimalista (Lucide Icons con trazo fino 1.5px - 1.75px).

6. **AnimMasterLib Transitions:**
   - Transiciones de estado suaves: cuando se suma oro, animación de moneda o brillo sutil sin bloquear la pantalla.
   - Progress bars con animación de llenado elegante hacia el siguiente "Tesoro".

7. **Mobbin Mobile UX Patterns:**
   - Bottom sheets para acciones rápidas en escaneo.
   - Navegación inferior intuitiva en móviles.
   - Vistas de tarjeta de fidelidad estilo Apple Wallet o billetera digital moderna.
