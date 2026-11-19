# ⚡ Instrucciones Automáticas del Proyecto GSOFT-VISUALDB

## 🌐 Despliegue en Vivo a Cloudflare Pages
- **Proyecto Cloudflare Pages:** `gsoft-visualdb`
- **URL Producción:** `https://gsoft-visualdb.pages.dev`
- **Cuenta:** Georgeandersmail (`01514e27c0cdd221efd91900be83fb16`)
- **Código de Acceso:** `Geosoft777$$$` (Tokenizado con Web Crypto HMAC-SHA256)

## 🚀 Comando Universal de Despliegue en Vivo (Estándar Obligatorio)
Tras cualquier modificación aprobada ejecutar obligatoriamente:
```powershell
npm run deploy:live
git add -A; git commit -m "feat: actualización visualdb"; git push origin main
```

> [!CAUTION] Blindaje Anti-Despliegue Cruzado
> En este directorio (`GSOFT-VISUALDB`) el ÚNICO proyecto permitido de Cloudflare Pages es `gsoft-visualdb`. Queda estrictamente prohibido ejecutar comandos con `--project-name=byfiocr` o cualquier otro proyecto ajeno desde esta carpeta. El script `npm run deploy:live` contiene validación atómica que previene cualquier ejecución en carpetas equivocadas.
