import { test, expect } from '@playwright/test';

// Hallazgos de la revisión final: cada prueba reproduce uno.
test.describe('portátil bajo en inglés', () => {
  test.use({ locale: 'en-US' });

  for (const [ancho, alto] of [[1366, 768], [1280, 720], [1024, 700]]) {
    test(`a ${ancho}×${alto} el CTA se ve mientras la sección está fijada`, async ({ page }, info) => {
      test.skip(info.project.name !== 'escritorio');
      await page.setViewportSize({ width: ancho, height: alto });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      for (const id of ['followapp', 'shield', 'cv']) {
        const fijada = await page.locator(`#${id}`).evaluate((el) => el.parentElement.classList.contains('pin-spacer'));
        if (!fijada) continue;
        const y = await page.locator(`#${id}`).evaluate((el) => el.parentElement.getBoundingClientRect().top + scrollY);
        await page.evaluate((v) => window.scrollTo(0, v + innerHeight * 0.4), y);
        await expect.poll(() => page.locator(`#${id} .cta`).evaluate((a) => a.getBoundingClientRect().bottom), { message: id })
          .toBeLessThanOrEqual(alto);
      }
    });
  }
});

test('sin GSAP la portada y las demos quedan legibles', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.route('**/vendor/gsap.min.js', (r) => r.abort());
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errores).toEqual([]);
  expect(await page.locator('.escena.nitida .frag').count()).toBeGreaterThan(0);
  await expect(page.locator('[data-demo=followapp] .aviso')).toBeVisible();
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('cuenta suspendida');
  await expect(page.locator('[data-demo=shield] .chat-quien').first()).toHaveText('Mamá');
  await expect(page.locator('[data-demo=cv] .logro')).toBeVisible();
  await expect(page.locator('[data-demo=cv] .logro-antes')).toBeHidden();
  await expect(page.locator('[data-demo=cv] .burbuja')).toBeVisible();
});

test('la portada CSS deja de animarse fuera de pantalla', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  const corriendo = () => page.evaluate(() => document.getAnimations()
    .filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.portada-css')).length);
  await page.goto('/');
  await expect.poll(corriendo).toBeGreaterThan(0);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(corriendo).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(corriendo).toBeGreaterThan(0);
});
