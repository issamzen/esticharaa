import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type NavItem = { to: string; key: string; visible: boolean };
export type PaymentMethod = {
  id: string;
  label: string;
  icon: string;
  active: boolean;
};
export type Branding = {
  site_name: string;
  logo_url: string;
  favicon_url: string;
};
export type SiteColors = {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
};

type SiteSettings = {
  branding: Branding;
  colors: SiteColors | null;
  nav: NavItem[];
  footer: NavItem[];
  paymentMethods: PaymentMethod[];
  loaded: boolean;
};

const DEFAULTS: SiteSettings = {
  branding: { site_name: "Estichara.ma", logo_url: "", favicon_url: "" },
  colors: null,
  nav: [],
  footer: [],
  paymentMethods: [],
  loaded: false,
};

const Ctx = createContext<SiteSettings>(DEFAULTS);

/** Convert #RRGGBB to an oklch()-compatible css color via CSS color-mix trick:
 *  we simply set the raw hex — modern browsers accept hex in the custom
 *  properties because the theme uses var() directly. */
function applyColors(colors: SiteColors) {
  const root = document.documentElement;
  if (colors.primary) {
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--brand-dark", colors.primary);
    root.style.setProperty("--ring", colors.primary);
  }
  if (colors.secondary) {
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--brand-teal", colors.secondary);
  }
  if (colors.accent) {
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--brand-gold", colors.accent);
  }
  if (colors.muted) {
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--brand-cream", colors.muted);
  }
}

function applyFavicon(url: string) {
  if (!url) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "site_branding",
        "site_colors",
        "site_nav",
        "site_footer",
        "payment_methods",
      ])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
        const next: SiteSettings = {
          branding: { ...DEFAULTS.branding, ...(map.site_branding ?? {}) },
          colors: (map.site_colors as SiteColors) ?? null,
          nav: (map.site_nav as NavItem[]) ?? [],
          footer: (map.site_footer as NavItem[]) ?? [],
          paymentMethods: (map.payment_methods as PaymentMethod[]) ?? [],
          loaded: true,
        };
        setSettings(next);
        if (next.colors) applyColors(next.colors);
        applyFavicon(next.branding.favicon_url);
      });
  }, []);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return useContext(Ctx);
}
