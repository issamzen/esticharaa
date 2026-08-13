import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Coins, Menu, MessagesSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getActiveLocale } from "@/i18n/routing";
import { localeDirection } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { to: "/questions", labelKey: "nav.questions" },
  { to: "/categories", labelKey: "nav.categories" },
  { to: "/experts", labelKey: "nav.experts" },
  { to: "/tokens", labelKey: "tokens.buyTokens" },
  { to: "/pricing", labelKey: "nav.pricing" },
  { to: "/about", labelKey: "footer.about" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const locale = getActiveLocale();
  const sheetSide = localeDirection(locale) === "rtl" ? "left" : "right";

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-brand grid size-8 place-items-center rounded-xl text-primary-foreground">
            <MessagesSquare className="size-4" />
          </span>
          <span className="tracking-tight" dir="ltr">
            Estichara<span className="text-muted-foreground">.ma</span>
          </span>
        </Link>

        <nav
          className="mx-auto hidden items-center gap-1 lg:flex"
          aria-label={t("nav.home")}
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <div className="hidden lg:block">
            <LanguageSwitcher compact />
          </div>

          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link to="/tokens">
              <Coins className="size-4" /> {t("common.tokens")}
            </Link>
          </Button>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/ask">{t("common.askQuestion")}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("nav.openMenu")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side={sheetSide}
              dir={localeDirection(locale)}
              className="w-72"
            >
              <div className="mt-10 flex flex-col gap-1 px-4">
                <div className="mb-5">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {t("language.label")}
                  </p>
                  <LanguageSwitcher
                    compact
                    onLocaleChange={() => setOpen(false)}
                  />
                </div>

                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    activeProps={{ className: "bg-muted text-foreground" }}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}

                <Button asChild className="mt-4">
                  <Link to="/ask" onClick={() => setOpen(false)}>
                    {t("common.askQuestion")}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="mt-2">
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
