// Merge these changes into the file where your TanStack router is created.

import "@/i18n";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ensureLocalePrefix, localeRewrite } from "@/i18n/routing";

// Normalizes / and older unprefixed links before the router reads browser history.
ensureLocalePrefix();

export const router = createRouter({
  routeTree,
  rewrite: localeRewrite,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
