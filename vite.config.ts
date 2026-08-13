import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "netlify",
  },
  tanstackStart: {
    // Keep this only when src/server.ts exists in the repository.
    server: { entry: "server" },
  },
});
