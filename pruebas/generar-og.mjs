// Rehace ../og.png desde og.html a 2x (2400×1254): LinkedIn la muestra nítida también en pantallas retina.
// Uso: npm run og. Después sube el ?v= de og:image en index.html para que las redes la vuelvan a pedir.
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = (ruta) => fileURLToPath(new URL(ruta, import.meta.url));
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 2 });
await pagina.goto(pathToFileURL(aqui('./og.html')).href);
await pagina.evaluate(() => document.fonts.ready);
await pagina.locator('.og').screenshot({ path: aqui('../og.png') });
await navegador.close();
console.log('og.png listo');
