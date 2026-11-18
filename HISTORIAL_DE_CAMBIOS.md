# 📜 HISTORIAL DE CAMBIOS APROBADOS — GSOFT-VISUALDB

Este archivo es el Registro Universal de Memoria Protegida.
Cualquier funcionalidad registrada aquí está blindada: ninguna IA puede eliminarla o revertirla.

---

## 🔗 VINCULACIÓN DEL PROYECTO

- **Repositorio:** https://github.com/andersjival/gsoft-visualdb
- **Rama:** main
- **URL Producción:** https://gsoft-visualdb.pages.dev

---

### Versión 1.9.0 — Migración a Cuenta George Anders & Blindaje de Acceso Cloudflare Zero Trust
- **Migración Integral de Cuenta Cloudflare Pages (`gsoft-visualdb`)**:
  - Reubicación y despliegue del proyecto Pages desde la cuenta `andersjival` hacia la cuenta `georgeandersmail` (`01514e27c0cdd221efd91900be83fb16`), manteniendo el subdominio de producción `https://gsoft-visualdb.pages.dev`.
  - Inyección oficial de variables de entorno de producción en Cloudflare Pages (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID_GEORGE`, `CLOUDFLARE_API_TOKEN_GEORGE`, `CLOUDFLARE_ACCOUNT_ID_ANDERS`, `CLOUDFLARE_API_TOKEN_ANDERS`).
  - Actualización de credenciales y comandos en [`GEMINI.md`](file:///c:/Users/User/Desktop/GeoSoft/CUENTA%20ANDERSJIVAL/CLIENTES%20WEBS/GSOFT-VISUALDB/GEMINI.md) y [`CLAVES GEORGEANDERSMAIL.txt`](file:///c:/Users/User/Desktop/GeoSoft/CUENTA%20ANDERSJIVAL/CLIENTES%20WEBS/GSOFT-VISUALDB/CLAVES%20GEORGEANDERSMAIL.txt).
- **Protección Perimetral Cloudflare Zero Trust (Access)**:
  - Creación de aplicación de acceso `self_hosted` en Cloudflare Access vinculada a `gsoft-visualdb.pages.dev`.
  - Configuración del proveedor de identidad oficial One-Time PIN (`onetimepin`) e integración de `same_site_cookie_attribute: none` para erradicar bucles de redirección.
  - Política de acceso exclusiva con código PIN de un solo uso (One-Time PIN) restringida estrictamente a los 3 correos autorizados: `web@byfiocr.com`, `pampo32@gmail.com` y `georgeandersmail@gmail.com`.
- **Corrección de Token y Conectividad D1 (`functions/api/_cf.ts` & `src/services/api.ts`)**:
  - Corrección de caracteres corruptos en la firma Base64 del token de autenticación de George Anders, resolviendo el error `401 Authentication Error`.
  - Establecimiento de `george` como cuenta activa predeterminada en `src/services/api.ts` y enrutamiento transparente en `functions/api/_cf.ts` con lectura prioritaria de `context.env`.
  - Carga inmediata y sincronización en vivo de las 10 bases de datos D1 del entorno (`byfiocr-db`, `fonticr-db`, `destaqueos-marin-db`, `clikfood-db`, `scanlead-db`, `geosoft-db`, `dentalclik-db`, `autohub-db`, `declara360-db`, `clikchat-db`).

---

### Versión 1.8.0 — Sección de Almacenamiento Cloudflare R2 & Capacidad Integral de Base de Datos
- **Módulo de Almacenamiento R2 (`R2StorageView.tsx`)**:
  - Nueva sección principal accesible directamente desde el Navbar con botón dedicado "Almacenamiento R2".
  - Tarjeta de Espacio R2 en tiempo real: monitoreo de tamaño total almacenado (Bytes/KB/MB) vs cuota mensual de 10.00 GB del plan gratuito de Cloudflare R2, porcentaje de uso, contador de objetos y operaciones de subida.
  - Tarjeta de Capacidad de Base de Datos D1: comparativa de tamaño en vivo vs límite de 500 MB, filas leídas (5M/día) y filas escritas (100k/día).
  - Explorador interactivo de archivos R2 con buscador en tiempo real, miniaturas de imágenes, tamaño formateado, tipo MIME, fecha de subida, modal de previsualización en alta resolución, botón de descarga directa y copiado de URL pública.
- **Endpoint Serverless `/api/r2-storage` (`functions/api/r2-storage.ts`)**:
  - Consulta a Cloudflare REST API para listar buckets (`/r2/buckets`), métricas de uso (`/usage`) y objetos almacenados (`/objects`) de la cuenta activa (`georgeandersmail` / `01514e27c0cdd221efd91900be83fb16`).

### Versión 1.7.0 — Soporte Multi-Cuenta Cloudflare (Anders Jival & George Anders)
- Selector interactivo de cuenta en la barra superior (`Navbar`): alternancia instantánea entre `Anders Jival` (`andersjival`) y `George Anders` (`georgeandersmail@gmail.com`).
- Enrutamiento dinámico en `_cf.ts`: despacho transparente de peticiones y autenticación API por cuenta vía cabecera `X-Cloudflare-Account` y parámetros contextuales.
- Carga y visualización de las bases de datos de George Anders (`byfiocr-db`, `fonticr-db`, `scanlead-db`, `clikchat-db`, `geosoft-db`, `dentalclik-db`, etc.) con soporte completo de CRUD, vista `ventas`, triggers y métricas en tiempo real.
- Configuración segura de variables de entorno de producción en Cloudflare Pages (`CLOUDFLARE_ACCOUNT_ID_GEORGE` y `CLOUDFLARE_API_TOKEN_GEORGE`).

### Versión 1.6.0 — Métricas en Tiempo Real de Base de Datos, Solicitudes del Plan y Peso en Vivo
- Endpoint `/api/db-metrics`: integración con Cloudflare D1 REST API y GraphQL Analytics (`d1AnalyticsAdaptiveGroups`) para telemetría en tiempo real.
- Visualización de tamaño en tiempo real por base de datos (bytes formateados en B/KB/MB/GB) y comparativa contra el límite del plan (500 MB en D1 Free).
- Métricas de solicitudes y operaciones diarias: total de consultas hoy, filas leídas (`rowsRead` vs cupo de 5M/día), filas escritas (`rowsWritten` vs cupo de 100k/día) y acumulado de 30 días.
- Modal dedicado `DbMetricsModal` con barras de progreso, desglose de lecturas/escrituras y botón de actualización en tiempo real.
- Pill interactivo en el selector de proyectos mostrando tamaño vivo y solicitudes de la base de datos seleccionada.

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
