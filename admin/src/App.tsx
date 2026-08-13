import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, GraduationCap, MessagesSquare, MessageSquareText,
  Coins, Wallet, Star, Settings, LogOut, ShieldCheck, Lock, Loader2, Paintbrush,
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

const NAV = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "experts", label: "الخبراء", icon: GraduationCap },
  { id: "questions", label: "الأسئلة والأجوبة", icon: MessagesSquare },
  { id: "messages", label: "الرسائل", icon: MessageSquareText },
  { id: "orders", label: "الطلبات والتوكن", icon: Coins },
  { id: "withdrawals", label: "طلبات السحب", icon: Wallet },
  { id: "moderation", label: "التقييمات والبلاغات", icon: Star },
  { id: "site", label: "تخصيص الموقع", icon: Paintbrush },
  { id: "settings", label: "إعدادات المنصة", icon: Settings },
] as const;

type PageId = (typeof NAV)[number]["id"];

export default function App() {
  const [session, setSession] = useState<null | { email: string; isAdmin: boolean }>(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState<PageId>("overview");

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

  if (!isConfigured) return <SetupNotice />;
  if (checking) return <Center><Loader2 className="size-8 animate-spin text-brand-teal" /></Center>;
  if (!session) return <Login />;
  if (!session.isAdmin) return <NotAdmin email={session.email} />;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-brand-dark/10 bg-brand-dark text-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/10">
            <ShieldCheck className="size-5 text-brand-gold" />
          </span>
          <div>
            <p className="font-bold tracking-tight" dir="ltr">Estichara<span className="text-brand-gold">.ma</span></p>
            <p className="text-[11px] text-white/50">لوحة التحكم</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                page === item.id ? "bg-white/12 text-brand-gold" : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/50" dir="ltr">{session.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-2 flex w-full items-center gap-2 rounded-xl bg-white/8 px-3.5 py-2.5 text-sm text-white/80 transition hover:bg-white/15"
          >
            <LogOut className="size-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
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
            </button>
          ))}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {page === "overview" && <Overview />}
          {page === "users" && <UsersPage />}
          {page === "experts" && <ExpertsPage />}
          {page === "questions" && <QuestionsPage />}
          {page === "messages" && <MessagesPage />}
          {page === "orders" && <OrdersPage />}
          {page === "withdrawals" && <WithdrawalsPage />}
          {page === "moderation" && <ReviewsReportsPage />}
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
