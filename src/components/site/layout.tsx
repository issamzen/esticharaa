import type { ReactNode } from "react";
import { Sparkles, Wrench, Clock3 } from "lucide-react";
import { Header } from "./header";
import { Footer } from "./footer";
import { useSiteSettings } from "@/lib/site-settings";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/i18n/use-locale";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ScrollToTop } from "./scroll-to-top";

export function SiteLayout({ children }: { children: ReactNode }) {
  const site = useSiteSettings();
  const { profile, loading } = useAuth();
  const locale = useLocale();
  const isAuthPage = typeof window !== "undefined" && /\/auth\/?$/.test(window.location.pathname);
  if (site.loaded && site.maintenance.enabled && !loading && profile?.role !== "admin" && !isAuthPage) {
    const title = locale === "fr" ? site.maintenance.title_fr : locale === "en" ? site.maintenance.title_en : site.maintenance.title_ar;
    const message = locale === "fr" ? site.maintenance.message_fr : locale === "en" ? site.maintenance.message_en : site.maintenance.message_ar;
    return <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--accent),transparent_35%),radial-gradient(circle_at_bottom_left,var(--secondary),transparent_35%)] opacity-10"/><div className="relative max-w-xl text-center"><span className="mx-auto grid size-20 place-items-center rounded-[2rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/20"><Wrench className="size-8"/></span><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-secondary">Estichara.ma</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1><p className="mx-auto mt-5 max-w-md text-base leading-8 text-muted-foreground">{message}</p>{site.maintenance.expected_return&&<p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"><Clock3 className="size-4 text-accent"/>{new Date(site.maintenance.expected_return).toLocaleString(locale==="ar"?"ar-MA":locale)}</p>}</div></div>;
  }
  return <div className="min-h-screen overflow-x-clip bg-background pb-20 md:pb-0"><Header /><main>{children}</main><Footer /><ScrollToTop/><MobileBottomNav /></div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-hero relative isolate overflow-hidden border-b border-border/60">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute -end-24 -top-24 -z-10 size-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -start-28 bottom-0 -z-10 size-80 rounded-full bg-secondary/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            <Sparkles className="size-3.5 text-accent" /> {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
