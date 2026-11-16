import { test, expect } from '@playwright/test';

// progress() devuelve la línea de tiempo y Playwright se cuelga serializándola: no devolver nada.
const avanzar = (page, demo, p) => page.evaluate(([d, x]) => { window.__demos[d].progress(x); }, [demo, p]);

test('FollowApp distingue a quien se fue de una cuenta suspendida', async ({ page }) => {
  await page.goto('/');
  await avanzar(page, 'followapp', 0.5);
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('te dejó de seguir');
  await expect(page.locator('[data-demo=followapp] .aviso')).toBeVisible();
  await avanzar(page, 'followapp', 1);
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('cuenta suspendida');
});

test('FollowApp vuelve atrás si el scroll retrocede', async ({ page }) => {
  await page.goto('/');
  await avanzar(page, 'followapp', 1);
  await avanzar(page, 'followapp', 0.5);
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('te dejó de seguir');
  await expect(page.locator('[data-demo=followapp] .aviso')).not.toContainText('suspendida');
});

test('la demo cambia de idioma a medias', async ({ page }) => {
  await page.goto('/');
  await avanzar(page, 'followapp', 0.5);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('unfollowed you');
});
