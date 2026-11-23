import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: [
    {
      command: "npm run dev:workbench",
      port: 5173,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm run dev:target",
      port: 5174,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
