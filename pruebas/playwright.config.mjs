import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  // WebGL por software (SwiftShader) compite por CPU: con más de 2 workers fallan temporizadores.
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // El público principal habla español; la prueba de ES/EN cubre el inglés.
    locale: 'es-ES',
    // Sin GPU, Chromium solo da WebGL por software si se le pide.
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: 'node servidor.mjs',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
});
