# ⚡ Instrucciones Automáticas del Proyecto GSOFT-VISUALDB

## 🌐 Despliegue en Vivo a Cloudflare Pages
- **Proyecto Cloudflare Pages:** `gsoft-visualdb`
- **URL Producción:** `https://gsoft-visualdb.pages.dev`
- **Cuenta:** Anders Jival (`c45409ee4154cf898c37375b1e96d910`)
- **Código de Acceso:** `Geosoft777$$$` (Tokenizado con Web Crypto HMAC-SHA256)

## 🚀 Comando de Despliegue en Vivo
```powershell
npm run build
$claves = Get-Content "CLAVES ANDERSJIVAL.txt" -Raw
$token = [regex]::Match($claves, 'Tu token de API:\s*([^\r\n]+)').Groups[1].Value.Trim()
$cuenta = [regex]::Match($claves, 'ID de cuenta:\s*([^\r\n]+)').Groups[1].Value.Trim()
$env:CLOUDFLARE_API_TOKEN = $token
$env:CLOUDFLARE_ACCOUNT_ID = $cuenta
npx wrangler pages deploy dist --project-name=gsoft-visualdb
git add -A; git commit -m "feat: actualización visualdb"; git push origin main
```
