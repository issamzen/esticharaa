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
  /** Payment instructions shown to users: bank name, RIB, PayPal email... */
  details?: string;
};
export type Branding={site_name:string;site_name_ar:string;logo_url:string;favicon_url:string;logo_ar_url:string;logo_latin_url:string;logo_width_desktop:number;logo_width_mobile:number;use_image_logo:boolean;browser_title_ar:string;browser_title_fr:string;browser_title_en:string};
export type SiteColors = {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
};

export type FeatureFlags = Record<string, boolean>;
export type MaintenancePage = { enabled:boolean; title_ar:string; message_ar:string; title_fr:string; message_fr:string; title_en:string; message_en:string; expected_return:string };
export type TokenProgram = { mode:"hidden"|"header_only"|"full";signup_bonus:number;share_bonus:number;share_daily_limit:number;wallet_enabled:boolean };
type SiteSettings = {
  branding: Branding;
  colors: SiteColors | null;
  nav: NavItem[];
  footer: NavItem[];
  paymentMethods: PaymentMethod[];
  features: FeatureFlags;
  maintenance: MaintenancePage;
  tokenProgram: TokenProgram;
  loaded: boolean;
};

const DEFAULTS: SiteSettings = {
  branding:{site_name:"Estichara.ma",site_name_ar:"",logo_url:"",favicon_url:"",logo_ar_url:"",logo_latin_url:"",logo_width_desktop:170,logo_width_mobile:120,use_image_logo:true,browser_title_ar:"Estichara.ma — إجابات موثوقة من المجتمع",browser_title_fr:"Estichara.ma — Questions et réponses fiables",browser_title_en:"Estichara.ma — Trusted questions and answers"},
  colors: null,
  nav: [],
  footer: [],
  paymentMethods: [],
  features: {},
  maintenance: { enabled:false,title_ar:"الموقع تحت الصيانة",message_ar:"سنعود قريبًا.",title_fr:"Maintenance en cours",message_fr:"Nous serons bientôt de retour.",title_en:"Maintenance in progress",message_en:"We will be back shortly.",expected_return:"" },
  tokenProgram: { mode:"header_only",signup_bonus:0,share_bonus:0,share_daily_limit:0,wallet_enabled:true },
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
        "feature_flags",
        "maintenance_page",
        "token_program",
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
          features: (map.feature_flags as FeatureFlags) ?? {},
          maintenance: { ...DEFAULTS.maintenance, ...((map.maintenance_page as Partial<MaintenancePage>) ?? {}) },
          tokenProgram: { ...DEFAULTS.tokenProgram, ...((map.token_program as Partial<TokenProgram>) ?? {}) },
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

/** Site name in the visitor's language:
 *  Arabic locale → Arabic name (if set), otherwise the default name. */
export function useSiteName(locale: string) {
  const { branding } = useContext(Ctx);
  if (locale === "ar" && branding.site_name_ar) return branding.site_name_ar;
  return branding.site_name || "Estichara.ma";
}
