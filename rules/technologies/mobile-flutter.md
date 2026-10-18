# Reglas de Mobile - Flutter (KURI)

## 1. Lineamientos Generales
- **Framework:** Flutter 3.x+ (Dart 3.x+ null-safety estricto).
- **Arquitectura:** Feature-First (Data, Domain, Presentation por feature).
- **Gestión de Estado:** BLoC (`flutter_bloc`) o Riverpod.
- **Enrutamiento:** `go_router` declarativo con deep linking para escaneo de URLs KURI.

## 2. Enfoque de la App Móvil
- Aplicación de punto de venta (POS) y terminal para dueños y empleados de tienda.
- Escaneo continuo de alta velocidad con cámara (`mobile_scanner`).
- Soporte offline con sincronización en cola si la conexión a internet cae temporalmente en caja.

## 3. UI/UX
- Adaptación a temas claros limpios (`ThemeData.light()`) con acentos dorados KURI.
- Feedback háptico (`HapticFeedback.lightImpact()`) al escanear y confirmar transacciones.
