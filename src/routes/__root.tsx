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
import { useEffect, useState, type ReactNode } from "react";
import type { RouterContext } from "@/router";
import { localeDirection } from "@/i18n/config";
import { LocaleBoundary } from "@/components/site/locale-boundary";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { SiteSettingsProvider } from "@/lib/site-settings";

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
            <SiteSettingsProvider>
              <Outlet />
              <Toaster position="top-center" />
            </SiteSettingsProvider>
          </AuthProvider>
        </LocaleBoundary>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function NotFoundComponent() {
  const { i18n } = Route.useRouteContext();
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("settings")
        .select("value")
        .eq("key", "page_404")
        .single()
        .then(({ data }) => {
          const url = (data?.value as { image_url?: string })?.image_url;
          if (url) setImage(url);
        });
    });
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 -z-10 size-[30rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 -z-10 size-[30rem] rounded-full bg-accent/15 blur-3xl"
      />

      <div className="mx-auto max-w-lg text-center">
        {image ? (
          <img
            src={image}
            alt="404"
            className="mx-auto max-h-64 w-auto rounded-3xl object-contain drop-shadow-xl"
          />
        ) : (
          <p
            aria-hidden="true"
            className="bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-[7rem] font-bold leading-none tracking-tighter text-transparent sm:text-[9rem]"
          >
            404
          </p>
        )}

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {i18n.t("errors.notFoundTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
          {i18n.t("errors.notFoundText")}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            {i18n.t("errors.goHome")}
          </Link>
          <Link
            to="/questions"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            {i18n.t("nav.questions")}
          </Link>
        </div>
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
