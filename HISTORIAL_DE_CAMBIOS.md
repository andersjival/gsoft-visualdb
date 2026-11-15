# 📜 HISTORIAL DE CAMBIOS APROBADOS — GSOFT-VISUALDB

Este archivo es el Registro Universal de Memoria Protegida.
Cualquier funcionalidad registrada aquí está blindada: ninguna IA puede eliminarla o revertirla.

---

## 🔗 VINCULACIÓN DEL PROYECTO

- **Repositorio:** https://github.com/andersjival/gsoft-visualdb
- **Rama:** main
- **URL Producción:** https://gsoft-visualdb.pages.dev

---

### Versión 1.5.0 — Estabilización Absoluta de Layout & Eliminación de Saltos Visuales
- Fijación estricta de altura en cabecera (`56px`) y paginación (`40px`) con `overflow-hidden` y `flex-nowrap`, evitando cualquier salto vertical al alternar entre `registered_users` y `ventas`.
- Persistencia del montaje del Grid: reemplazo del desmontaje total por barra de progreso superior (`h-0.5 animate-pulse`) y overlay transparente de carga, eliminando parpadeos.
- Anchos de columnas críticas bloqueados (`#`: `48px`, Acciones: `80px`) para evitar desajustes horizontales.
- Función centralizada `switchTableCleanly` que resetea limpiamente scroll, paginación y búsqueda en cada cambio de tabla.

### Versión 1.4.0 — Tabla de Ventas con Identificador de Usuario (user_id) & Filtro por Cliente
- Creación de la vista `ventas` vinculada a `orders` con columna obligatoria `user_id`.
- Triggers automáticos en Cloudflare D1 (`trigger_ventas_update` y `trigger_ventas_delete`).

### Versión 1.3.0 — Unificación Cromática Dark Neutral & Grises Profesionales
- Eliminación de tonos azulados/cyan en la cabecera superior y selector de proyectos.
- Paleta unificada dark zinc (`#121212`, `#171717`, `#262626`).

### Versión 1.2.0 — Rediseño Visual & Visor Estructurado de Usuarios
- Encabezados con badges de tipo de dato y numeración de filas.
- Tabla nativa `registered_users` con edición en línea.

### Versión 1.1.0 — Integración de Base de Datos de IA & Conexión con API Oficial
- Botones "Visualizar la base de datos" y "Visualizar la base de datos de IA".

### Versión 1.0.0 — Despliegue Inicial de GeoSoft VisualDB
- Creación de proyecto Cloudflare Pages `gsoft-visualdb`.
- Autenticación tokenizada por código `Geosoft777$$$`.
