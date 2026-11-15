# 📜 HISTORIAL DE CAMBIOS APROBADOS — GSOFT-VISUALDB

Este archivo es el Registro Universal de Memoria Protegida.
Cualquier funcionalidad registrada aquí está blindada: ninguna IA puede eliminarla o revertirla.

---

## 🔗 VINCULACIÓN DEL PROYECTO

- **Repositorio:** https://github.com/andersjival/gsoft-visualdb
- **Rama:** main
- **URL Producción:** https://gsoft-visualdb.pages.dev

---

### Versión 1.4.0 — Tabla de Ventas con Identificador de Usuario (user_id) & Filtro por Cliente
- Creación e integración de la vista nativa `ventas` vinculada a `orders` con columna obligatoria `user_id` (identificador único por cliente: correo, teléfono o ID).
- Triggers automáticos en Cloudflare D1 (`trigger_ventas_update` y `trigger_ventas_delete`) para permitir edición y actualización inmediata de ventas.
- Acceso directo "Ventas por Usuario" en la barra lateral y botón directo en cada cliente registrado para ver y filtrar sus compras asociadas en un clic.
- Filtro inteligente por `user_id`, cliente o número de orden con cálculo automático del monto total de ventas en la muestra.

### Versión 1.3.0 — Unificación Cromática Dark Neutral & Grises Profesionales
- Eliminación de tonos azulados/cyan en la cabecera superior y selector de proyectos.
- Paleta unificada dark zinc (`#121212`, `#171717`, `#262626`) con acentos esmeralda (`#3ecf8e`).

### Versión 1.2.0 — Rediseño Visual & Visor Estructurado de Usuarios
- Encabezados de tabla con badges de tipo de dato y numeración de filas.
- Visor inteligente de JSON y tabla nativa `registered_users` con edición en línea.

### Versión 1.1.0 — Integración de Base de Datos de IA & Conexión con API Oficial
- Botones dedicados "Visualizar la base de datos" y "Visualizar la base de datos de IA".
- Conexión con API oficial del motor de IA (`ai.byfiocr.com`).

### Versión 1.0.0 — Despliegue Inicial de GeoSoft VisualDB
- Creación de proyecto Cloudflare Pages `gsoft-visualdb`.
- Autenticación tokenizada por código `Geosoft777$$$`.
