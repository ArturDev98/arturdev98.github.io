// Rehace una imagen para compartir a 2x (2400×1254) desde una plantilla: LinkedIn la muestra nítida en retina.
// Uso: npm run og:apps (o og). Después sube el ?v= de og:image para que las redes la vuelvan a pedir.
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = (ruta) => fileURLToPath(new URL(ruta, import.meta.url));
const [plantilla, destino] = process.argv.slice(2);
if (!plantilla || !destino) { console.error('Uso: node generar-og.mjs <plantilla.html> <destino.png>'); process.exit(1); }
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 2 });
await pagina.goto(pathToFileURL(aqui('./' + plantilla)).href);
await pagina.evaluate(() => document.fonts.ready);
await pagina.locator('.og').screenshot({ path: aqui(destino) });
await navegador.close();
console.log(destino + ' listo');
