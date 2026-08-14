import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, House, MessageSquareText, Plus, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/i18n/use-locale";

export function MobileBottomNav() {
  const { user, profile } = useAuth();
  const site = useSiteSettings();
  const locale = useLocale();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    async function refresh() {
      const { count } = await supabase.from("notifications").select("id", { count:"exact", head:true })
        .eq("user_id", user!.id).eq("is_archived", false).is("read_at", null);
      setUnread(count ?? 0);
    }
    refresh();
    const timer = window.setInterval(refresh, 30000);
    const channel = supabase.channel(`mobile-nav-notifications-${user.id}`)
      .on("postgres_changes", { event:"*", schema:"public", table:"notifications", filter:`user_id=eq.${user.id}` }, refresh).subscribe();
    const cleared = () => setUnread(0);
    window.addEventListener("estichara:notifications-read", cleared);
    return () => { window.clearInterval(timer); window.removeEventListener("estichara:notifications-read", cleared); supabase.removeChannel(channel); };
  }, [user?.id]);

  const path = location.pathname;
  const labels = locale === "ar"
    ? { home:"الرئيسية", questions:"الأسئلة", ask:"اسأل", notifications:"الجديد", account:"حسابي" }
    : locale === "fr"
      ? { home:"Accueil", questions:"Questions", ask:"Poser", notifications:"Nouveau", account:"Compte" }
      : { home:"Home", questions:"Questions", ask:"Ask", notifications:"Updates", account:"Account" };
  const askEnabled = site.features["new_questions"] !== false;
  const tap = () => { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8); };
  const active = (route:string) => route === "/" ? path === "/" : path.startsWith(route);
  const initials = profile?.full_name?.split(" ").map(word=>word[0]).slice(0,2).join("") || "";

  return (
    <nav className="mobile-app-nav fixed inset-x-0 bottom-0 z-[60] md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-1.5">
        <NavItem to="/" label={labels.home} active={active("/")} onTap={tap}><House className="size-[1.3rem]" /></NavItem>
        <NavItem to="/questions" label={labels.questions} active={active("/questions")} onTap={tap}><MessageSquareText className="size-[1.3rem]" /></NavItem>

        <div className="relative flex justify-center">
          <Link to={user ? (askEnabled ? "/ask" : "/account") : "/auth"} onClick={tap}
            className="group -mt-7 flex min-w-16 flex-col items-center gap-1 text-[10px] font-bold text-primary">
            <span className="grid size-14 place-items-center rounded-[1.3rem] border-4 border-background bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl shadow-primary/25 transition active:scale-90">
              <Plus className="size-6 transition-transform group-active:rotate-90" />
            </span>
            <span>{labels.ask}</span>
          </Link>
        </div>

        <NavItem to={user ? "/account" : "/auth"} {...(user ? { hash:"account-notifications" } : {})}
          label={labels.notifications} active={user ? path.startsWith("/account") && location.hash === "#account-notifications" : false} onTap={tap}>
          <span className="relative"><Bell className="size-[1.3rem]" />{unread>0&&<span className="absolute -end-2.5 -top-2.5 grid min-h-4 min-w-4 place-items-center rounded-full border-2 border-background bg-red-500 px-0.5 text-[8px] font-bold leading-none text-white">{unread>99?"99+":unread}</span>}</span>
        </NavItem>

        <NavItem to={user ? "/account" : "/auth"} label={labels.account} active={active(user?"/account":"/auth") && location.hash !== "#account-notifications"} onTap={tap}>
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="size-6 rounded-lg object-cover" /> : initials ? <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-[8px] font-bold text-primary">{initials}</span> : <UserRound className="size-[1.3rem]" />}
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({to,hash,label,active,onTap,children}:{to:"/"|"/questions"|"/account"|"/auth";hash?:string;label:string;active:boolean;onTap:()=>void;children:ReactNode}) {
  return <Link to={to} {...(hash ? { hash } : {})} onClick={onTap} className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-semibold transition active:scale-90 ${active?"text-primary":"text-muted-foreground"}`}>
    <span className={`relative grid size-7 place-items-center rounded-lg transition ${active?"bg-primary/10":""}`}>{children}</span><span>{label}</span>{active&&<span className="absolute -bottom-0.5 size-1 rounded-full bg-primary"/>}
  </Link>;
}
