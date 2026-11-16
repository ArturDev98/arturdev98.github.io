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

test('la intensidad cambia el desenfoque y los no leídos siguen nítidos', async ({ page }) => {
  await page.goto('/');
  // fill() no admite input range: se fija el valor como lo haría el usuario y se avisa.
  await page.locator('#intensidad').evaluate((el) => { el.value = '12'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  const d = page.locator('[data-demo=shield]');
  await expect(d.locator('.chat-texto').first()).toHaveCSS('filter', 'blur(12px)');
  await expect(d.locator('.no-leidos').first()).toHaveCSS('filter', 'none');
  await expect(d.locator('.sh-valor')).toHaveText('12 px');
});

test('el cursor revela el chat y al irse se vuelve a tapar', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.goto('/');
  const fila = page.locator('[data-demo=shield] .chat').nth(1);
  await fila.hover();
  await expect(fila.locator('.chat-texto')).toHaveCSS('filter', 'none');
  await page.mouse.move(0, 0);
  await expect(fila.locator('.chat-texto')).not.toHaveCSS('filter', 'none');
});

test('tocar con el dedo revela el chat', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');
  await page.goto('/');
  const fila = page.locator('[data-demo=shield] .chat').nth(1);
  await fila.tap();
  await expect(fila.locator('.chat-texto')).toHaveCSS('filter', 'none');
});

test('la demo de Shield revela una fila a mitad de camino', async ({ page }) => {
  await page.goto('/');
  await avanzar(page, 'shield', 0.3);
  await expect(page.locator('[data-demo=shield] .chat.revelada-demo')).toHaveCount(1);
  await avanzar(page, 'shield', 1);
  await expect(page.locator('[data-demo=shield] .chat.revelada-demo')).toHaveCount(0);
});

test('la demo cambia de idioma a medias', async ({ page }) => {
  await page.goto('/');
  await avanzar(page, 'followapp', 0.5);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('[data-demo=followapp] .aviso')).toContainText('unfollowed you');
});
