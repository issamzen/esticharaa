import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessagesSquare, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageCopy } from "@/i18n/page-copy";
import { useSiteSettings, useSiteName } from "@/lib/site-settings";
import { useLocale } from "@/i18n/use-locale";

export function Footer() {
  const { t } = useTranslation();
  const copy = usePageCopy();
  const site = useSiteSettings();
  const locale = useLocale();
  const siteName=useSiteName(locale);
  const localizedLogo=site.branding.use_image_logo?(locale==="ar"?(site.branding.logo_ar_url||site.branding.logo_url):(site.branding.logo_latin_url||site.branding.logo_url)):"";
  const logoStyle={width:`${Math.round((site.branding.logo_width_desktop||170)*.9)}px`} as CSSProperties;

  // Admin can hide any footer link from the dashboard
  const hidden = new Set([
    ...(site.loaded ? site.footer.filter((i) => !i.visible).map((i) => i.to) : []),
    ...(site.tokenProgram.mode === "full" ? [] : ["/tokens", "/pricing"]),
    ...(site.features["expert_applications"]===false?["/become-expert"]:[]),
  ]);

  const groups = [
    {
      title: t("home.explore.eyebrow"),
      links: [
        { to: "/questions", label: t("nav.questions") },
        { to: "/categories", label: t("nav.categories") },
        { to: "/experts", label: t("nav.experts") },
        { to: "/blog", label: copy.blog.eyebrow },
      ],
    },
    {
      title: t("footer.platform"),
      links: [
        { to: "/tokens", label: t("tokens.buyTokens") },
        { to: "/pricing", label: t("nav.pricing") },
        { to: "/ask", label: t("common.askQuestion") },
        { to: "/become-expert", label: t("nav.becomeExpert") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { to: "/about", label: t("footer.about") },
        { to: "/contact", label: t("footer.contact") },
        { to: "/privacy", label: t("footer.privacy") },
        { to: "/terms", label: t("footer.terms") },
      ],
    },
  ] as const;

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[linear-gradient(135deg,#17272b_0%,#243238_55%,#302c29_100%)] text-white">
      <div className="absolute -start-40 -top-40 size-96 rounded-full bg-brand-teal/25 blur-3xl" />
      <div className="absolute -bottom-52 -end-40 size-[30rem] rounded-full bg-brand-gold/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className={`flex w-fit items-center gap-2.5 font-semibold ${localizedLogo?"rounded-2xl bg-white/95 px-4 py-2 shadow-xl shadow-black/15":""}`}>{localizedLogo?<img src={localizedLogo} alt={siteName} style={logoStyle} className="max-h-14 object-contain"/>:<><span className="grid size-10 place-items-center rounded-2xl bg-white/10 text-brand-gold ring-1 ring-white/15"><MessagesSquare className="size-5"/></span>{!site.branding.use_image_logo&&<span className="text-lg" dir={locale==="ar"&&site.branding.site_name_ar?"rtl":"ltr"}>{siteName}</span>}</>}</Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            {t("footer.tagline")}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            <ShieldCheck className="size-4 text-brand-gold" />
            {t("home.assuranceVerified")}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              {group.links
                .filter((link) => !hidden.has(link.to))
                .map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 transition hover:text-brand-gold"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 px-4 py-6 text-center text-xs text-white/50">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
