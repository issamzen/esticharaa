import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";

/** Copy the translation pattern and switcher into your existing site header. */
export function HeaderI18nExample() {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="font-semibold tracking-tight">
          {t("common.brand")}
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link to="/questions">{t("nav.questions")}</Link>
          <Link to="/experts">{t("nav.experts")}</Link>
          <Link to="/categories">{t("nav.categories")}</Link>
          <Link to="/pricing">{t("nav.pricing")}</Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher compact />
          <Button asChild>
            <Link to="/ask">{t("common.askQuestion")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
