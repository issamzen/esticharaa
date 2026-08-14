import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, CircleAlert, Coins, Headphones, LogIn, Menu, MessageCircle, MessagesSquare, UserRound, WalletCards } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSiteSettings, useSiteName } from "@/lib/site-settings";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { localeDirection } from "@/i18n/config";
import { useLocale } from "@/i18n/use-locale";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { supabase } from "@/lib/supabase";

type HeaderNotification = { id:string;title:string;body:string;type:string;link:string;read_at:string|null;created_at:string };

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
  const { user, profile } = useAuth();
  const site = useSiteSettings();
  const siteName = useSiteName(locale);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  async function refreshNotifications() {
    if (!user) return;
    const [{ count }, { data }] = await Promise.all([
      supabase.from("notifications").select("id",{count:"exact",head:true}).eq("user_id",user.id).eq("is_archived",false).is("read_at",null),
      supabase.from("notifications").select("id,title,body,type,link,read_at,created_at").eq("user_id",user.id).eq("is_archived",false).order("created_at",{ascending:false}).limit(8),
    ]);
    setUnreadCount(count??0);setNotifications((data as HeaderNotification[])??[]);
  }
  useEffect(() => {
    if (!user) { setUnreadCount(0);setNotifications([]);return; }
    refreshNotifications();
    const timer=window.setInterval(refreshNotifications,30000);
    const channel=supabase.channel(`user-notifications-${user.id}`).on("postgres_changes",{event:"*",schema:"public",table:"notifications",filter:`user_id=eq.${user.id}`},refreshNotifications).subscribe();
    const cleared=()=>{setUnreadCount(0);refreshNotifications()};
    window.addEventListener("estichara:notifications-read",cleared);
    return()=>{window.clearInterval(timer);window.removeEventListener("estichara:notifications-read",cleared);supabase.removeChannel(channel)};
  },[user?.id]);

  async function markAllNotificationsRead(){if(!user)return;await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",user.id).eq("is_archived",false).is("read_at",null);setUnreadCount(0);setNotifications(items=>items.map(item=>({...item,read_at:item.read_at??new Date().toISOString()})));window.dispatchEvent(new Event("estichara:notifications-read"))}
  async function openNotification(item:HeaderNotification){if(!item.read_at){await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",item.id);setUnreadCount(value=>Math.max(0,value-1))}setNotificationOpen(false);window.location.href=item.link.startsWith("/admin")?item.link:`/${locale}${item.link}`}
  function notificationIcon(type:string){if(type==="support_reply")return Headphones;if(type==="private_message")return MessageCircle;if(type==="new_answer"||type==="question_update")return MessagesSquare;if(["token_refund","expert_earning","purchase_confirmed","withdrawal_update"].includes(type))return WalletCards;return CircleAlert}

  // Admin-controlled menu (falls back to the default list before load)
  const navItems = site.loaded
    ? site.nav.filter((i) => i.visible)
    : [...navigation];
  const sheetSide = localeDirection(locale) === "rtl" ? "left" : "right";

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 font-semibold"
        >
          {site.branding.logo_url ? (
            <img
              src={site.branding.logo_url}
              alt={siteName}
              className="size-10 rounded-2xl object-contain"
            />
          ) : (
            <span className="bg-brand grid size-10 place-items-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/15 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <MessagesSquare className="size-5" />
            </span>
          )}
          <span
            className="text-lg tracking-tight"
            dir={locale === "ar" && site.branding.site_name_ar ? "rtl" : "ltr"}
          >
            {siteName !== "Estichara.ma" ? (
              siteName
            ) : (
              <>
                Estichara<span className="text-secondary">.ma</span>
              </>
            )}
          </span>
        </Link>

        <nav
          className="mx-auto hidden items-center gap-1 xl:flex"
          aria-label={t("nav.mainLabel")}
        >
          {navItems.map((item) => (
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

          {user && profile ? (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link to="/tokens">
                <Coins className="size-4 text-accent" />{" "}
                {profile.tokens_balance.toLocaleString()}
              </Link>
            </Button>
          ) : null}
          {user && site.features["new_questions"] !== false ? (
            <Button
              asChild
              size="sm"
              className="hidden rounded-xl sm:inline-flex"
            >
              <Link to="/ask">{t("common.askQuestion")}</Link>
            </Button>
          ) : null}
          {user ? (
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild><Button variant="outline" size="sm" className="relative hidden rounded-xl ps-1.5 sm:inline-flex" aria-label={`${t("nav.account")}${unreadCount?` — ${unreadCount}`:""}`}><span className="relative grid size-7 shrink-0 place-items-center overflow-visible rounded-lg bg-primary/10 text-[10px] font-bold text-primary">{profile?.avatar_url?<img src={profile.avatar_url} alt="" className="size-full rounded-lg object-cover"/>:profile?.full_name?profile.full_name.split(" ").map(word=>word[0]).slice(0,2).join(""):<UserRound className="size-4"/>}{unreadCount>0&&<span className="absolute -end-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-lg shadow-red-500/25">{unreadCount>99?"99+":unreadCount}</span>}</span><span className="hidden lg:inline">{profile?.full_name?.split(" ")[0]||t("nav.account")}</span></Button></PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(25rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border-border/70 p-0 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 p-4"><div><p className="flex items-center gap-2 font-semibold"><Bell className="size-4 text-primary"/> الإشعارات {unreadCount>0&&<span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{unreadCount}</span>}</p><p className="mt-1 text-[10px] text-muted-foreground">آخر التحديثات في حسابك</p></div>{unreadCount>0&&<button onClick={markAllNotificationsRead} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><CheckCheck className="size-3.5"/> قراءة الكل</button>}</div>
                <div className="max-h-[25rem] overflow-y-auto">{notifications.length===0?<div className="py-12 text-center"><Bell className="mx-auto size-8 text-muted-foreground/30"/><p className="mt-3 text-sm text-muted-foreground">لا توجد إشعارات جديدة</p></div>:notifications.map(item=>{const Icon=notificationIcon(item.type);return <button key={item.id} onClick={()=>openNotification(item)} className={`flex w-full gap-3 border-b border-border/40 p-4 text-start transition hover:bg-muted/50 ${item.read_at?"opacity-65":"bg-primary/[.035]"}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.read_at?"bg-muted text-muted-foreground":"bg-primary/10 text-primary"}`}><Icon className="size-4"/></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><b className="text-sm">{item.title}</b>{!item.read_at&&<span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500"/>}</span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{item.body}</span><span className="mt-1.5 block text-[9px] text-muted-foreground/70">{new Date(item.created_at).toLocaleString(locale==="ar"?"ar-MA":locale)}</span></span></button>})}</div>
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 bg-background p-3"><Button asChild variant="ghost" size="sm" className="rounded-xl"><Link to="/account" onClick={()=>setNotificationOpen(false)}><UserRound className="size-3.5"/> حسابي</Link></Button><Button asChild size="sm" className="rounded-xl"><Link to="/account" hash="account-notifications" onClick={()=>setNotificationOpen(false)}>عرض كل الإشعارات</Link></Button></div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Link to="/auth">
                <LogIn className="size-4" />
                <span className="hidden lg:inline">{t("nav.signIn")}</span>
              </Link>
            </Button>
          )}

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
                  <span dir={locale === "ar" && site.branding.site_name_ar ? "rtl" : "ltr"}>
                    {siteName}
                  </span>
                </Link>

                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  {t("language.label")}
                </p>
                <LanguageSwitcher onLocaleChange={() => setOpen(false)} />

                <nav className="mt-7 flex flex-col gap-1">
                  {navItems.map((item) => (
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

                {user && site.features["new_questions"] !== false ? (
                  <Button asChild className="mt-6 w-full rounded-xl">
                    <Link to="/ask" onClick={() => setOpen(false)}>{t("common.askQuestion")}</Link>
                  </Button>
                ) : !user ? (
                  <Button asChild className="mt-6 w-full rounded-xl">
                    <Link to="/auth" onClick={() => setOpen(false)}>{t("nav.signUp")}</Link>
                  </Button>
                ) : null}
                {user ? (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 w-full rounded-xl"
                  >
                    <Link to="/account" onClick={() => setOpen(false)} className="relative">
                      <UserRound className="size-4" /> {t("nav.account")}
                      {unreadCount > 0 && <span className="ms-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 w-full rounded-xl"
                  >
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      <LogIn className="size-4" /> {t("nav.signIn")}
                    </Link>
                  </Button>
                )}
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
