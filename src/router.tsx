import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { i18n as I18nInstance } from "i18next";
import { routeTree } from "./routeTree.gen";
import { createI18n } from "@/i18n";
import { createLocaleRouting, type LocaleRouting } from "@/i18n/routing";

export type RouterContext = {
  queryClient: QueryClient;
  i18n: I18nInstance;
  localeRouting: LocaleRouting;
};

export const getRouter = () => {
  const queryClient = new QueryClient();
  const localeRouting = createLocaleRouting();
  const i18n = createI18n();

  return createRouter({
    routeTree,
    rewrite: localeRouting.rewrite,
    context: { queryClient, i18n, localeRouting } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
