import { QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import { useEffect, type ReactNode } from "react";
import type { RouterContext } from "@/router";
import { localeDirection } from "@/i18n/config";
import { LocaleBoundary } from "@/components/site/locale-boundary";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const canonicalHref = context.localeRouting.getCanonicalHref();
    if (canonicalHref) throw redirect({ href: canonicalHref });

    const locale = context.localeRouting.getLocale();
    if (context.i18n.resolvedLanguage !== locale) {
      await context.i18n.changeLanguage(locale);
    }
    return { locale };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0D4B4B" },
      { title: "Estichara.ma — إجابات موثوقة من خبراء حقيقيين" },
      {
        name: "description",
        content:
          "منصة مغربية موثوقة للأسئلة والأجوبة تجمعك بخبراء ومهنيين موثّقين.",
      },
      { name: "author", content: "Estichara.ma" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const { locale } = Route.useRouteContext();

  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, i18n, locale } = Route.useRouteContext();

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <LocaleBoundary locale={locale}>
          <AuthProvider>
            <Outlet />
            <Toaster position="top-center" />
          </AuthProvider>
        </LocaleBoundary>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function NotFoundComponent() {
  const { i18n } = Route.useRouteContext();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="premium-card max-w-md p-8 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {i18n.t("errors.notFoundTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {i18n.t("errors.notFoundText")}
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {i18n.t("errors.goHome")}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const { i18n } = Route.useRouteContext();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="premium-card max-w-md p-8 text-center sm:p-10">
        <h1 className="text-2xl font-semibold">
          {i18n.t("errors.genericTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {i18n.t("errors.genericText")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            {i18n.t("common.retry")}
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium"
          >
            {i18n.t("errors.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
