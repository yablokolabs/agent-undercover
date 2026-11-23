import { defineConfig } from "vite";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
    headers: cors,
  },
  preview: {
    port: 5174,
    strictPort: true,
    headers: cors,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
