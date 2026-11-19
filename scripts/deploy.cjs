const fs = require('fs');
const { execSync } = require('child_process');

// 🛑 BLINDADO: Verificación estricta de identidad de proyecto anti-despliegue cruzado
try {
  const pkg = require('../package.json');
  if (pkg.name !== 'gsoft-visualdb') {
    console.error(`\n🛑 DESPLIEGUE BLOQUEADO: Este directorio es '${pkg.name}', NO 'gsoft-visualdb'. Prohibido desplegar 'gsoft-visualdb' desde aquí.\n`);
    process.exit(1);
  }
} catch (e) {
  console.error('\n🛑 DESPLIEGUE BLOQUEADO: No se pudo verificar package.json de GSOFT-VISUALDB.\n');
  process.exit(1);
}

try {
  const claves = fs.readFileSync('CLAVES GEORGEANDERSMAIL.txt', 'utf8');
  const tokenMatch = claves.match(/Tu token de API:\s*([^\r\n]+)/);
  const accountMatch = claves.match(/ID de cuenta:\s*([^\r\n]+)/);

  if (!tokenMatch || !accountMatch) {
    console.error('No se pudieron extraer las credenciales de CLAVES GEORGEANDERSMAIL.txt');
    process.exit(1);
  }

  const token = tokenMatch[1].trim();
  const accountId = accountMatch[1].trim();

  process.env.CLOUDFLARE_API_TOKEN = token;
  process.env.CLOUDFLARE_ACCOUNT_ID = accountId;

  console.log('🚀 Desplegando en vivo a Cloudflare Pages (gsoft-visualdb)...');
  execSync('npx wrangler pages deploy dist --project-name=gsoft-visualdb --branch=main', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Despliegue de GSOFT-VISUALDB completado con éxito.');
} catch (error) {
  console.error('Error durante el despliegue:', error.message);
  process.exit(1);
}
