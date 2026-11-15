# 📜 HISTORIAL DE CAMBIOS APROBADOS — GSOFT-VISUALDB

Este archivo es el Registro Universal de Memoria Protegida.
Cualquier funcionalidad registrada aquí está blindada: ninguna IA puede eliminarla o revertirla.

---

## 🔗 VINCULACIÓN DEL PROYECTO

- **Repositorio:** https://github.com/andersjival/gsoft-visualdb
- **Rama:** main
- **URL Producción:** https://gsoft-visualdb.pages.dev

---

### Versión 1.1.0 — Integración de Base de Datos de IA & Conexión con API Oficial
- Se agregaron los dos botones dedicados en la barra superior:
  1. **"Visualizar la base de datos"**: conmuta directamente a la base de datos de producción (`byfiocr-db`).
  2. **"Visualizar la base de datos de IA"**: conmuta a la base de datos del agente de IA (`byfio-agent-db`).
- Conexión con la API oficial del motor de IA (`https://byfiocr.pages.dev/api/ai/metrics` / `ai.byfiocr.com`).
- Panel interactivo `AiStatusBanner` que reporta en tiempo real: estado del motor de IA (Online), consumo de neuronas hoy, mensajes respondidos y consumo mensual.
- Visualización y edición en tiempo real de las 5 tablas del agente: `agent_conversations`, `agent_messages`, `agent_query_metrics`, `agent_neuron_logs` y `agent_interaction_events`.

### Versión 1.0.0 — Despliegue Inicial de GeoSoft VisualDB
- Creación del proyecto en Cloudflare Pages `gsoft-visualdb`.
- Autenticación tokenizada por código de acceso `Geosoft777$$$` con firma criptográfica HMAC-SHA256 y persistencia en sesión.
- Selector dinámico de bases de datos D1 y proyectos de Cloudflare en la cuenta de Anders Jival (`c45409ee4154cf898c37375b1e96d910`).
- Acceso directo y vista destacada para `byfiocr` / `byfiocr.pages.dev` (`byfiocr-db`).
- Explorador visual de tablas, esquema de columnas y tipos.
- Visor de datos interactivo con paginación, búsqueda en tiempo real y ordenamiento.
- Editor CRUD completo: Modificación de registros (UPDATE), inserción (INSERT) y eliminación (DELETE).
- Consola SQL interactiva para ejecutar consultas SQL personalizadas con métricas de rendimiento (ms, rows read/written).
