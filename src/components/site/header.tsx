import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Coins, Menu, MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { localeDirection } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { to: "/questions", key: "nav.questions" },
  { to: "/categories", key: "nav.categories" },
  { to: "/experts", key: "nav.experts" },
  { to: "/tokens", key: "tokens.buyTokens" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/about", key: "footer.about" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const locale = useLocale();
  const sheetSide = localeDirection(locale) === "rtl" ? "left" : "right";

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 font-semibold"
        >
          <span className="bg-brand grid size-10 place-items-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/15 transition-transform group-hover:-rotate-3 group-hover:scale-105">
            <MessagesSquare className="size-5" />
          </span>
          <span className="text-lg tracking-tight" dir="ltr">
            Estichara<span className="text-secondary">.ma</span>
          </span>
        </Link>

        <nav
          className="mx-auto hidden items-center gap-1 xl:flex"
          aria-label={t("nav.mainLabel")}
        >
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
              activeProps={{ className: "bg-muted text-primary" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 xl:ms-0">
          <div className="hidden xl:block">
            <LanguageSwitcher compact />
          </div>
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Link to="/tokens">
              <Coins className="size-4 text-accent" /> {t("common.tokens")}
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="hidden rounded-xl sm:inline-flex"
          >
            <Link to="/ask">{t("common.askQuestion")}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                aria-label={t("nav.openMenu")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={sheetSide}
              dir={localeDirection(locale)}
              className="w-[min(22rem,88vw)] border-border/70 bg-background/95 px-5 backdrop-blur-2xl"
            >
              <div className="mt-10">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="mb-7 flex items-center gap-2.5 font-semibold"
                >
                  <span className="bg-brand grid size-10 place-items-center rounded-2xl text-primary-foreground">
                    <MessagesSquare className="size-5" />
                  </span>
                  <span dir="ltr">Estichara.ma</span>
                </Link>

                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  {t("language.label")}
                </p>
                <LanguageSwitcher onLocaleChange={() => setOpen(false)} />

                <nav className="mt-7 flex flex-col gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3.5 py-3 text-start text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      activeProps={{ className: "bg-muted text-primary" }}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </nav>

                <Button asChild className="mt-6 w-full rounded-xl">
                  <Link to="/ask" onClick={() => setOpen(false)}>
                    {t("common.askQuestion")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="mt-2 w-full rounded-xl"
                >
                  <Link to="/contact" onClick={() => setOpen(false)}>
                    {t("footer.contact")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
