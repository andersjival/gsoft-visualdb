# 📜 HISTORIAL DE CAMBIOS APROBADOS — GSOFT-VISUALDB

Este archivo es el Registro Universal de Memoria Protegida.
Cualquier funcionalidad registrada aquí está blindada: ninguna IA puede eliminarla o revertirla.

---

## 🔗 VINCULACIÓN DEL PROYECTO

- **Repositorio:** https://github.com/andersjival/gsoft-visualdb
- **Rama:** main
- **URL Producción:** https://gsoft-visualdb.pages.dev

---

### Versión 1.2.0 — Rediseño Visual Estilo Supabase Studio & Visor Estructurado de Usuarios
- Implementación de interfaz estilo Supabase Studio con paleta dark zinc (`#121212`, `#171717`, `#1f1f1f`) y verde esmeralda Supabase (`#3ecf8e`).
- Encabezados de tabla con badges de tipo de dato (`int`, `text`, `pk`) y numeración secuencial de filas (#1, #2, #3...).
- Visor inteligente de JSON ([`JsonViewerModal`](file:///c:/Users/User/Desktop/GeoSoft/CUENTA%20ANDERSJIVAL/CLIENTES%20WEBS/GSOFT-VISUALDB/src/components/JsonViewerModal.tsx)): detecta datos en formato array/objeto (como los de `site_metrics`) y los desglosa automáticamente en una **tabla estructurada interactiva** con columnas, buscador interno por nombre/correo/teléfono y opción de conmutar a código JSON formateado.
- Acceso directo "Usuarios Registrados" en la barra lateral y en la vista de tabla para visualizar de inmediato a todos los clientes registrados de by.fio en una cuadrícula profesional.

### Versión 1.1.0 — Integración de Base de Datos de IA & Conexión con API Oficial
- Se agregaron los dos botones dedicados en la barra superior: "Visualizar la base de datos" y "Visualizar la base de datos de IA".
- Conexión con la API oficial del motor de IA (`https://byfiocr.pages.dev/api/ai/metrics` / `ai.byfiocr.com`).
- Panel interactivo `AiStatusBanner` que reporta estado online y consumo de neuronas.
- Visualización de tablas del agente de IA: `agent_conversations`, `agent_messages`, etc.

### Versión 1.0.0 — Despliegue Inicial de GeoSoft VisualDB
- Creación de proyecto Cloudflare Pages `gsoft-visualdb`.
- Autenticación tokenizada por código `Geosoft777$$$`.
- Selector dinámico de bases de datos D1.
