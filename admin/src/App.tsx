import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, GraduationCap, MessagesSquare, MessageSquareText,
  Coins, Wallet, Star, Settings, LogOut, ShieldCheck, Lock, Loader2, Paintbrush, History,
} from "lucide-react";
import { supabase, isConfigured } from "./supabase";
import { Overview } from "./pages/Overview";
import { UsersPage } from "./pages/Users";
import { ExpertsPage } from "./pages/Experts";
import { QuestionsPage } from "./pages/Questions";
import { MessagesPage } from "./pages/Messages";
import { OrdersPage } from "./pages/Orders";
import { WithdrawalsPage } from "./pages/Withdrawals";
import { ReviewsReportsPage } from "./pages/ReviewsReports";
import { SettingsPage } from "./pages/Settings";
import { SitePage } from "./pages/Site";
import { AuditLogsPage } from "./pages/AuditLogs";

const NAV = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "experts", label: "الخبراء", icon: GraduationCap },
  { id: "questions", label: "الأسئلة والأجوبة", icon: MessagesSquare },
  { id: "messages", label: "الرسائل", icon: MessageSquareText },
  { id: "orders", label: "الطلبات والتوكن", icon: Coins },
  { id: "withdrawals", label: "طلبات السحب", icon: Wallet },
  { id: "moderation", label: "التقييمات والبلاغات", icon: Star },
  { id: "audit", label: "سجل الإدارة", icon: History },
  { id: "site", label: "تخصيص الموقع", icon: Paintbrush },
  { id: "settings", label: "إعدادات المنصة", icon: Settings },
] as const;

type PageId = (typeof NAV)[number]["id"];

export default function App() {
  const [session, setSession] = useState<null | { email: string; isAdmin: boolean }>(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState<PageId>("overview");
  const [supportCount, setSupportCount] = useState(0);

  useEffect(() => {
    if (!isConfigured) { setChecking(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await loadRole(data.session.user.id, data.session.user.email ?? "");
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (s) await loadRole(s.user.id, s.user.email ?? "");
      else setSession(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRole(uid: string, email: string) {
    const { data } = await supabase.from("profiles").select("role").eq("id", uid).single();
    setSession({ email, isAdmin: data?.role === "admin" });
  }

  useEffect(() => {
    if (!session?.isAdmin) return;
    async function refreshSupportCount() {
      const { data } = await supabase.from("support_threads").select("id, status")
        .eq("status", "open");
      setSupportCount(data?.length ?? 0);
    }
    refreshSupportCount();
    const timer = window.setInterval(refreshSupportCount, 30000);
    const channel = supabase.channel("admin-support-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_threads" }, refreshSupportCount)
      .subscribe();
    return () => { window.clearInterval(timer); supabase.removeChannel(channel); };
  }, [session?.isAdmin]);

  if (!isConfigured) return <SetupNotice />;
  if (checking) return <Center><Loader2 className="size-8 animate-spin text-brand-teal" /></Center>;
  if (!session) return <Login />;
  if (!session.isAdmin) return <NotAdmin email={session.email} />;

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(30,140,133,.08),transparent_35%)]">
      {/* Premium sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-e border-white/10 bg-gradient-to-b from-[#0b4141] via-brand-dark to-[#072f30] text-white shadow-2xl lg:flex">
        <div className="relative flex items-center gap-3 px-5 py-7">
          <div className="pointer-events-none absolute -end-16 -top-16 size-44 rounded-full bg-brand-gold/10 blur-3xl" />
          <span className="relative grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner">
            <ShieldCheck className="size-5 text-brand-gold" />
          </span>
          <div className="relative">
            <p className="text-lg font-bold tracking-tight" dir="ltr">Estichara<span className="text-brand-gold">.ma</span></p>
            <p className="text-[11px] text-white/45">مركز إدارة المنصة</p>
          </div>
          <span className="ms-auto rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">LIVE</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">الإدارة</p>
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                page === item.id ? "bg-white/12 text-white shadow-sm ring-1 ring-white/10" : "text-white/60 hover:bg-white/7 hover:text-white"
              }`}
            >
              <span className={`grid size-8 place-items-center rounded-lg transition ${page === item.id ? "bg-brand-gold text-brand-dark" : "bg-white/5 group-hover:bg-white/10"}`}>
                <item.icon className="size-4 shrink-0" />
              </span>
              {item.label}
              {item.id === "messages" && supportCount > 0 && (
                <span className="ms-auto grid min-w-5 place-items-center rounded-full bg-brand-gold px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">{supportCount}</span>
              )}
              {page === item.id && <span className="absolute inset-y-2 end-0 w-0.5 rounded-full bg-brand-gold" />}
            </button>
          ))}
        </nav>
        <div className="m-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-gold text-xs font-bold text-brand-dark">AD</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">مدير المنصة</p>
              <p className="truncate text-[10px] text-white/40" dir="ltr">{session.email}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} title="تسجيل الخروج" className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-brand-dark/8 bg-paper/80 px-8 py-4 backdrop-blur-xl lg:flex">
          <div>
            <p className="text-[11px] font-semibold text-brand-teal">لوحة تحكم Estichara.ma</p>
            <h2 className="mt-0.5 font-bold">{NAV.find((item) => item.id === page)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> النظام يعمل بشكل طبيعي
            </span>
            <span className="rounded-xl bg-white px-3 py-2 text-xs text-ink/50 shadow-sm">
              {new Date().toLocaleDateString("ar-MA", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </header>
        <header className="glass sticky top-0 z-20 flex items-center gap-2 overflow-x-auto px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                page === item.id ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/70"
              }`}
            >
              {item.label}
              {item.id === "messages" && supportCount > 0 && <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-[10px] text-brand-dark">{supportCount}</span>}
            </button>
          ))}
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {page === "overview" && <Overview />}
          {page === "users" && <UsersPage />}
          {page === "experts" && <ExpertsPage />}
          {page === "questions" && <QuestionsPage />}
          {page === "messages" && <MessagesPage />}
          {page === "orders" && <OrdersPage />}
          {page === "withdrawals" && <WithdrawalsPage />}
          {page === "moderation" && <ReviewsReportsPage />}
          {page === "audit" && <AuditLogsPage />}
          {page === "site" && <SitePage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center">{children}</div>;
}

function SetupNotice() {
  return (
    <Center>
      <div className="glass fade-up mx-4 max-w-lg rounded-3xl p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-gold/15">
          <Settings className="size-7 text-brand-gold" />
        </span>
        <h1 className="mt-5 text-xl font-bold">مطلوب إعداد Supabase</h1>
        <p className="mt-3 text-sm leading-7 text-ink/60">
          افتح الملف <code className="rounded bg-ink/8 px-1.5 py-0.5 text-xs" dir="ltr">src/config.ts</code> وضع
          رابط مشروعك ومفتاح <span dir="ltr">anon</span> من
          <span dir="ltr"> Supabase → Project Settings → API</span>، ثم أعد تشغيل التطبيق.
        </p>
      </div>
    </Center>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr("بيانات الدخول غير صحيحة");
    setBusy(false);
  }

  return (
    <Center>
      <form onSubmit={submit} className="glass fade-up mx-4 w-full max-w-sm rounded-3xl p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-dark">
          <Lock className="size-6 text-brand-gold" />
        </span>
        <h1 className="mt-5 text-center text-xl font-bold">دخول المشرف</h1>
        <p className="mt-1 text-center text-xs text-ink/50">Estichara.ma — لوحة التحكم</p>
        <input
          type="email" required dir="ltr" placeholder="admin@estichara.ma"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
        <input
          type="password" required dir="ltr" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-3 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
        {err && <p className="mt-3 text-center text-xs font-semibold text-red-600">{err}</p>}
        <button
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-brand-dark py-3 text-sm font-bold text-white transition hover:bg-brand-teal disabled:opacity-50"
        >
          {busy ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </Center>
  );
}

function NotAdmin({ email }: { email: string }) {
  return (
    <Center>
      <div className="glass fade-up mx-4 max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">ليست لديك صلاحيات المشرف</h1>
        <p className="mt-3 text-sm leading-7 text-ink/60">
          الحساب <span className="font-semibold" dir="ltr">{email}</span> ليس مشرفًا.
          نفّذ هذا الأمر في <span dir="ltr">SQL Editor</span>:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-start text-[11px] leading-6 text-emerald-300" dir="ltr">
{`update public.profiles set role = 'admin'
where id = (select id from auth.users
            where email = '${email}');`}
        </pre>
        <button onClick={() => supabase.auth.signOut()} className="mt-5 rounded-xl bg-ink/8 px-4 py-2 text-sm font-semibold">
          تسجيل الخروج
        </button>
      </div>
    </Center>
  );
}
