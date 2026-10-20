import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

// Smoke test of the production build, served from a GitHub Pages-style sub-path.
// Run `npm run build` first; `npm run test:e2e` does not rebuild.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}/gate-cs/`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: `PORT=${PORT} node e2e/serve.mjs`, url: `http://localhost:${PORT}/gate-cs/`, reuseExistingServer: true },
});
