import { test, expect } from '@playwright/test';

test('no pide nada a terceros', async ({ page }) => {
  const ajenas = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173')) ajenas.push(r.url()); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(ajenas).toEqual([]);
});

test('las fuentes salen del repo', async ({ page }) => {
  await page.goto('/');
  const cargadas = await page.evaluate(async () => {
    await document.fonts.ready;
    return ['800 20px Archivo', '400 12px "JetBrains Mono"', '400 16px "Source Serif 4"']
      .map((f) => [...document.fonts].some((x) => x.status === 'loaded' && f.includes(x.family.replace(/"/g, ''))));
  });
  expect(cargadas).toEqual([true, true, true]);
});

test('ES/EN cambia los textos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Small tools that ask you for nothing');
});

test('aviso de móvil solo en móvil', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('#movil')).toBeVisible({ visible: info.project.name === 'movil' });
});

test('copiar enlace avisa', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'movil');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('#copiar').click();
  await expect(page.locator('#dicho')).toHaveText(/Enlace copiado|Link copied/);
});
