import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "./header";
import { Footer } from "./footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
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
