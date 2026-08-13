import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: "0.0.0.0", allowedHosts: true },
  // Served from estichara.ma/admin
  base: "/admin/",
  build: { outDir: "../dist/admin", emptyOutDir: true },
});
