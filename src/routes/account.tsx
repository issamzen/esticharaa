import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Banknote,
  Bell,
  Coins,
  Loader2,
  LogOut,
  MessagesSquare,
  Save,
  ShoppingBag,
  User,
  X,
  Activity,
  CheckCircle2,
  Clock3,
  WalletCards,
  Headphones,
  Send,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type MyQuestion = {
  id: string;
  title: string;
  body: string;
  status: string;
  tokens: number;
  answers_count: number;
  created_at: string;
};

type MyOrder = {
  id: string;
  tokens: number;
  bonus: number;
  price_mad: number;
  method: string;
  status: string;
  created_at: string;
};

type MyPayout = {
  id: string;
  tokens: number;
  amount_mad: number;
  method: string;
  status: string;
  created_at: string;
};

type MyNotification = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type MyTransaction = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  created_at: string;
};

function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const site = useSiteSettings();

  // Match an order's method label to the admin-configured payment details
  function methodDetails(methodLabel: string) {
    return site.paymentMethods.find(
      (m) => m.label === methodLabel || m.id === methodLabel,
    )?.details;
  }

  const [questions, setQuestions] = useState<MyQuestion[]>([]);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [notifications, setNotifications] = useState<MyNotification[]>([]);
  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [payouts, setPayouts] = useState<MyPayout[]>([]);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutTokens, setPayoutTokens] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [payoutBusy, setPayoutBusy] = useState(false);

  // Question editing state
  const [editingQ, setEditingQ] = useState<MyQuestion | null>(null);
  const [eqTitle, setEqTitle] = useState("");
  const [eqBody, setEqBody] = useState("");
  const [eqBusy, setEqBusy] = useState(false);
  const [minPayout, setMinPayout] = useState(1000);
  const [rate, setRate] = useState(0.5);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setCity(profile.city ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("questions")
      .select("id, title, body, status, tokens, answers_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setQuestions((data as MyQuestion[]) ?? []));
    supabase
      .from("orders")
      .select("id, tokens, bonus, price_mad, method, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setOrders((data as MyOrder[]) ?? []));
    supabase
      .from("notifications")
      .select("id, title, body, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15)
      .then(({ data }) => setNotifications((data as MyNotification[]) ?? []));
    supabase
      .from("token_transactions")
      .select("id, amount, type, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setTransactions((data as MyTransaction[]) ?? []));
    loadPayouts();
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["min_payout_tokens", "token_to_mad"])
      .then(({ data }) => {
        (data ?? []).forEach((row) => {
          if (row.key === "min_payout_tokens") setMinPayout(Number(row.value) || 1000);
          if (row.key === "token_to_mad") setRate(Number(row.value) || 0.5);
        });
      });
  }, [user]);

  function loadQuestions() {
    if (!user) return;
    supabase
      .from("questions")
      .select("id, title, body, status, tokens, answers_count, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setQuestions((data as MyQuestion[]) ?? []));
  }

  function openQuestionEditor(q: MyQuestion) {
    setEditingQ(q);
    setEqTitle(q.title);
    setEqBody(q.body);
  }

  async function saveQuestionEdit() {
    if (!editingQ) return;
    if (eqTitle.trim().length < 15 || eqBody.trim().length < 30) {
      toast.error(t("account.editTooShort", "العنوان 15 حرفًا على الأقل والتفاصيل 30 حرفًا على الأقل"));
      return;
    }
    setEqBusy(true);
    const { error } = await supabase
      .from("questions")
      .update({ title: eqTitle.trim(), body: eqBody.trim() })
      .eq("id", editingQ.id);
    setEqBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEditingQ(null);
    loadQuestions();
    toast.success(t("account.editSaved", "تم تعديل سؤالك"));
  }

  async function deleteQuestion(q: MyQuestion) {
    if (!confirm(t("account.confirmDeleteQ", "حذف هذا السؤال نهائيًا؟"))) return;
    const { error } = await supabase.from("questions").delete().eq("id", q.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    loadQuestions();
    toast.success(t("account.deletedQ", "تم حذف السؤال"));
  }

  function loadPayouts() {
    if (!user) return;
    supabase
      .from("withdrawals")
      .select("id, tokens, amount_mad, method, status, created_at")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setPayouts((data as MyPayout[]) ?? []));
  }

  const PAYOUT_ERRORS: Record<string, string> = {
    BELOW_MINIMUM_PAYOUT: t("payout.belowMin", `الحد الأدنى للتحويل هو ${minPayout} توكن`),
    INSUFFICIENT_TOKENS: t("payout.insufficient", "رصيدك غير كافٍ"),
    MISSING_PAYOUT_DETAILS: t("payout.missingDetails", "أدخل معلومات استلام المال (RIB أو رقم الهاتف...)"),
    ACCOUNT_BANNED: t("payout.banned", "هذا الحساب محظور"),
  };

  async function submitPayout() {
    if (!payoutDetails.trim()) {
      toast.error(PAYOUT_ERRORS.MISSING_PAYOUT_DETAILS);
      return;
    }
    setPayoutBusy(true);
    const { error } = await supabase.rpc("request_payout", {
      p_tokens: payoutTokens,
      p_method: payoutMethod,
      p_details: payoutDetails.trim(),
    });
    setPayoutBusy(false);
    if (error) {
      const key = Object.keys(PAYOUT_ERRORS).find((k) => error.message.includes(k));
      toast.error(key ? PAYOUT_ERRORS[key] : error.message);
      return;
    }
    setPayoutOpen(false);
    setPayoutDetails("");
    await refreshProfile();
    loadPayouts();
    toast.success(
      t("payout.requested", "تم إرسال طلب التحويل! سيُراجعه فريقنا وستصلك الأموال بعد الموافقة."),
      { duration: 8000 },
    );
  }

  async function cancelPayout(id: string) {
    if (!confirm(t("payout.confirmCancel", "إلغاء طلب التحويل واسترجاع التوكن إلى رصيدك؟"))) return;
    const { error } = await supabase.rpc("cancel_payout", { p_id: id });
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    loadPayouts();
    toast.success(t("payout.cancelled", "تم الإلغاء واسترجاع التوكن إلى رصيدك"));
  }

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, phone, city })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success(t("account.saved"));
  }

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user!.id)
      .is("read_at", null);
    setNotifications((n) =>
      n.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })),
    );
    window.dispatchEvent(new Event("estichara:notifications-read"));
  }

  const unread = notifications.filter((n) => !n.read_at).length;

  const questionStatus: Record<string, { label: string; cls: string }> = {
    pending: { label: t("account.statusPending", "قيد المراجعة"), cls: "bg-amber-100 text-amber-700" },
    published: { label: t("account.statusPublished", "منشور"), cls: "bg-emerald-100 text-emerald-700" },
    closed: { label: t("account.statusClosed", "مغلق"), cls: "bg-muted text-muted-foreground" },
    rejected: { label: t("account.statusRejected", "مرفوض"), cls: "bg-red-100 text-red-700" },
  };
  const dashboardLinks = [
    { id: "dashboard-overview", label: "نظرة عامة", icon: Activity },
    { id: "my-questions", label: t("account.myQuestions"), icon: MessagesSquare },
    { id: "wallet-activity", label: "المحفظة", icon: WalletCards },
    { id: "account-notifications", label: t("account.notifications"), icon: Bell },
    { id: "admin-support", label: "مراسلة الإدارة", icon: Headphones },
    { id: "profile-settings", label: t("account.personalInfo"), icon: User },
  ];
  const overviewStats = [
    { value: questions.length, label: "أسئلتي", icon: MessagesSquare, tone: "text-blue-600 bg-blue-50" },
    { value: questions.filter((q) => q.status === "published").length, label: "أسئلة منشورة", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { value: questions.filter((q) => q.status === "pending").length, label: "قيد المراجعة", icon: Clock3, tone: "text-amber-600 bg-amber-50" },
    { value: unread, label: "إشعارات جديدة", icon: Bell, tone: "text-violet-600 bg-violet-50" },
  ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Premium dashboard hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground shadow-2xl shadow-primary/15 sm:p-8">
          <div className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 start-1/3 size-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="relative grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/12 text-xl font-bold shadow-inner backdrop-blur">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="size-full rounded-2xl object-cover" /> : (profile?.full_name || user.email || "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                {unread > 0 && <span className="absolute -end-2 -top-2 grid min-h-6 min-w-6 place-items-center rounded-full border-2 border-primary bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">{unread > 99 ? "99+" : unread}</span>}
              </span>
              <div>
                <p className="text-xs font-medium text-primary-foreground/65">{t("account.title", "لوحة حسابك")}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{profile?.full_name || t("account.title")}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-primary-foreground/70">
                  <span dir="ltr">{user.email}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold">
                    {profile?.role === "expert" ? "خبير معتمد" : profile?.role === "admin" ? "مشرف" : "عضو"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center backdrop-blur">
                <p className="text-[11px] text-primary-foreground/60">الرصيد المتاح</p>
                <p className="mt-0.5 text-2xl font-bold text-accent">{(profile?.tokens_balance ?? 0).toLocaleString()}</p>
              </div>
              <Button variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="size-4" /> {t("nav.signOut")}
              </Button>
            </div>
          </div>
        </section>

        <nav className="sticky top-20 z-10 mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-border/70 bg-background/85 p-2 shadow-soft backdrop-blur-xl">
          {dashboardLinks.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-primary/8 hover:text-primary">
              <Icon className="size-3.5" /> {label}
            </a>
          ))}
        </nav>

        <div id="dashboard-overview" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map(({ value, label, icon: Icon, tone }) => (
            <div key={label} className="group rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-4.5" /></span>
                <span className="text-2xl font-bold tracking-tight">{value}</span>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Wallet + quick actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-primary/20 bg-primary p-6 text-primary-foreground shadow-xl shadow-primary/15">
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Coins className="size-4" /> {t("account.wallet")}
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              {profile?.tokens_balance ?? 0}
              <span className="ms-2 text-sm font-normal text-primary-foreground/70">
                {t("common.tokens")}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm" className="rounded-xl">
                <Link to="/tokens">{t("tokens.buyTokens")}</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/25 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => {
                  setPayoutTokens(Math.min(profile?.tokens_balance ?? 0, minPayout));
                  setPayoutOpen(true);
                }}
              >
                <ArrowLeftRight className="size-3.5" />{" "}
                {t("payout.convert", "تحويل إلى أموال")}
              </Button>
            </div>
          </div>

          <Link
            to="/ask"
            className="group flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
          >
            <MessagesSquare className="size-6 text-primary" />
            <div>
              <p className="mt-4 font-semibold">{t("common.askQuestion")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("account.askHint", "اطرح سؤالك واحصل على إجابات موثوقة")}
              </p>
            </div>
          </Link>

          <Link
            to="/questions"
            className="group flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
          >
            <ShoppingBag className="size-6 text-primary" />
            <div>
              <p className="mt-4 font-semibold">{t("nav.questions")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("account.browseHint", "تصفّح الأسئلة والإجابات المنشورة")}
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-8">
            {/* My questions */}
            <section id="my-questions" className="scroll-mt-36">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MessagesSquare className="size-5 text-primary" />
                {t("account.myQuestions")}
              </h2>
              <div className="mt-4 space-y-3">
                {questions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    {t("account.noQuestions", "لم تطرح أي سؤال بعد")}
                    <div className="mt-3">
                      <Button asChild size="sm" className="rounded-xl">
                        <Link to="/ask">{t("common.askQuestion")}</Link>
                      </Button>
                    </div>
                  </div>
                )}
                {questions.map((q) => {
                  const st = questionStatus[q.status] ?? questionStatus.pending;
                  const editable = q.status === "pending" || q.status === "rejected";
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-border/70 bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                        {q.tokens > 0 && (
                          <Badge variant="secondary" className="rounded-full">
                            {q.tokens} {t("common.tokens")}
                          </Badge>
                        )}
                      </div>
                      {q.status === "published" ? (
                        <Link
                          to="/questions/$questionId"
                          params={{ questionId: q.id }}
                          className="mt-2 block font-medium hover:text-primary"
                        >
                          {q.title}
                        </Link>
                      ) : (
                        <p className="mt-2 font-medium">{q.title}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(q.created_at).toLocaleDateString()} ·{" "}
                          {q.answers_count} {t("account.answers", "إجابة")}
                        </p>
                        {editable && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => openQuestionEditor(q)}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              {t("account.editQ", "تعديل")}
                            </button>
                            <button
                              onClick={() => deleteQuestion(q)}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              {t("account.deleteQ", "حذف")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* My orders */}
            <section id="wallet-activity" className="scroll-mt-36">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingBag className="size-5 text-primary" />
                {t("nav.purchases")}
              </h2>
              <div className="mt-4 space-y-3">
                {orders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    {t("account.noOrders", "لا توجد مشتريات بعد")}
                  </div>
                )}
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {o.tokens + o.bonus} {t("common.tokens")}
                          {o.bonus > 0 && (
                            <span className="ms-1 text-xs text-secondary">
                              (+{o.bonus})
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()} ·{" "}
                          {o.price_mad} {t("common.mad")}
                          {o.method ? <> · {o.method}</> : null}
                        </p>
                      </div>
                      {o.status === "pending" && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          {t("account.orderPending", "بانتظار تأكيد الدفع")}
                        </span>
                      )}
                      {o.status === "paid" && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {t("account.orderPaid", "مدفوع")}
                        </span>
                      )}
                      {o.status === "cancelled" && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          {t("account.orderCancelled", "ملغى")}
                        </span>
                      )}
                    </div>
                    {o.status === "pending" && methodDetails(o.method) ? (
                      <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3">
                        <p className="text-xs font-semibold text-amber-800">
                          {t("account.paymentInstructions", "تعليمات إتمام الدفع")}
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-6 text-amber-900/80" dir="auto">
                          {methodDetails(o.method)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="size-5 text-primary" /> سجل حركة التوكن
                </h2>
                <Badge variant="outline" className="rounded-full">آخر {transactions.length} عملية</Badge>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {transactions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">لا توجد حركات توكن بعد</p>}
                {transactions.map((tx) => {
                  const positive = tx.amount > 0;
                  const labels: Record<string, string> = {
                    purchase: "شراء توكن", spend_unlock: "فتح إجابة", earn_answer: "مكافأة إجابة",
                    earn_bonus: "مكافأة إضافية", withdrawal_hold: "طلب تحويل", withdrawal_refund: "استرجاع تحويل", admin_adjust: "تعديل إداري",
                  };
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3.5">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        <Coins className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{labels[tx.type] ?? tx.type}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{tx.note || new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <span dir="ltr" className={`font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                        {positive ? "+" : ""}{tx.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Notifications */}
            <section id="account-notifications" className="scroll-mt-36 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Bell className="size-4.5 text-primary" />
                  {t("account.notifications")}
                  {unread > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </h2>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("account.markAllRead", "تحديد الكل كمقروء")}
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("account.noNotifications", "لا توجد إشعارات")}
                  </p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3 text-sm ${n.read_at ? "opacity-60" : "bg-primary/[0.04]"}`}
                  >
                    <p className="font-medium">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <SupportCenter userId={user.id} />

            {/* Profile settings */}
            <section id="profile-settings" className="scroll-mt-36 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <h2 className="flex items-center gap-2 font-semibold">
                <User className="size-4.5 text-primary" />
                {t("account.personalInfo")}
              </h2>
              <form onSubmit={saveProfile} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pf-name">{t("account.displayName")}</Label>
                  <Input
                    id="pf-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pf-phone">{t("account.phone")}</Label>
                  <Input
                    id="pf-phone"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pf-city">{t("account.city")}</Label>
                  <Input
                    id="pf-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="size-4" /> {t("account.saveChanges")}
                    </>
                  )}
                </Button>
              </form>
            </section>

            {/* Payout history */}
            {payouts.length > 0 && (
              <section className="rounded-3xl border border-border/70 bg-card p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Banknote className="size-4.5 text-primary" />
                  {t("payout.history", "تحويلاتي المالية")}
                </h2>
                <div className="mt-4 space-y-3">
                  {payouts.map((p) => (
                    <div key={p.id} className="rounded-xl border border-border/60 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                          {p.amount_mad} {t("common.mad")}
                          <span className="ms-2 text-xs font-normal text-muted-foreground">
                            ({p.tokens.toLocaleString()} {t("common.tokens")})
                          </span>
                        </p>
                        {p.status === "pending" && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            {t("payout.pending", "قيد المراجعة")}
                          </span>
                        )}
                        {p.status === "approved" && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {t("payout.approved", "موافَق — بانتظار التحويل")}
                          </span>
                        )}
                        {p.status === "paid" && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            {t("payout.paid", "تم التحويل")}
                          </span>
                        )}
                        {p.status === "rejected" && (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            {t("payout.rejected", "مرفوض/ملغى")}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </p>
                        {p.status === "pending" && (
                          <button
                            onClick={() => cancelPayout(p.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                          >
                            <X className="size-3" /> {t("payout.cancel", "إلغاء واسترجاع التوكن")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ===== Edit my question dialog ===== */}
      <Dialog open={!!editingQ} onOpenChange={(o) => !o && setEditingQ(null)}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-start text-xl">
              {t("account.editQTitle", "تعديل سؤالي")}
            </DialogTitle>
            <DialogDescription className="text-start">
              {t("account.editQNote", "يمكن التعديل ما دام السؤال قيد المراجعة")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="eq-title">{t("account.qTitle", "العنوان")}</Label>
              <Input
                id="eq-title"
                value={eqTitle}
                maxLength={160}
                onChange={(e) => setEqTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eq-body">{t("account.qBody", "التفاصيل")}</Label>
              <Textarea
                id="eq-body"
                value={eqBody}
                maxLength={4000}
                rows={6}
                onChange={(e) => setEqBody(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              disabled={eqBusy}
              onClick={saveQuestionEdit}
            >
              {eqBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-4" /> {t("account.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Fancy token → money conversion dialog ===== */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-start text-xl">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <ArrowLeftRight className="size-4.5" />
              </span>
              {t("payout.title", "حوّل توكن إلى أموال")}
            </DialogTitle>
            <DialogDescription className="text-start">
              {t("payout.subtitle", "اختر المبلغ وسيصلك المال بعد موافقة فريقنا")}
            </DialogDescription>
          </DialogHeader>

          {/* Live conversion display */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-foreground/70">{t("common.tokens")}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {payoutTokens.toLocaleString()}
                </p>
              </div>
              <ArrowLeftRight className="size-5 text-primary-foreground/50" />
              <div className="text-end">
                <p className="text-xs text-primary-foreground/70">{t("common.mad")}</p>
                <p className="text-3xl font-bold tracking-tight text-accent">
                  {(payoutTokens * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-5" dir="ltr">
              <Slider
                value={[payoutTokens]}
                min={0}
                max={profile?.tokens_balance ?? 0}
                step={50}
                onValueChange={(v) => setPayoutTokens(v[0])}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-primary-foreground/60">
              <span>0</span>
              <span>
                {t("payout.balance", "رصيدك")}: {(profile?.tokens_balance ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {[0.25, 0.5, 1].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPayoutTokens(Math.floor((profile?.tokens_balance ?? 0) * f))}
                  className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-semibold transition hover:bg-white/20"
                >
                  {f === 1 ? t("payout.all", "الكل") : `${f * 100}%`}
                </button>
              ))}
            </div>
          </div>

          {payoutTokens > 0 && payoutTokens < minPayout && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              ⚠️ {t("payout.minNote", "الحد الأدنى للتحويل هو")}{" "}
              <b>{minPayout.toLocaleString()}</b> {t("common.tokens")} (
              {(minPayout * rate).toLocaleString()} {t("common.mad")})
            </p>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("payout.method", "طريقة الاستلام")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["bank_transfer", t("payout.bank", "تحويل بنكي")],
                  ["cash", t("payout.cash", "كاش بلص / وفاكاش")],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPayoutMethod(id)}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${
                      payoutMethod === id
                        ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20"
                        : "border-border/70 hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-details">
                {payoutMethod === "bank_transfer"
                  ? t("payout.rib", "RIB والاسم الكامل")
                  : t("payout.phone", "رقم الهاتف والاسم الكامل")}
              </Label>
              <Input
                id="payout-details"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={
                  payoutMethod === "bank_transfer"
                    ? "007 640 00012345678901 23 — الاسم الكامل"
                    : "06XXXXXXXX — الاسم الكامل"
                }
                className="rounded-xl"
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full rounded-xl"
            disabled={payoutBusy || payoutTokens < minPayout || !payoutDetails.trim()}
            onClick={submitPayout}
          >
            {payoutBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Banknote className="size-4" />{" "}
                {t("payout.submit", "طلب التحويل")} —{" "}
                {(payoutTokens * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                {t("common.mad")}
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

// Secure user ↔ administration support center.
type SupportThread = {
  id: string;
  subject: string;
  status: "open" | "waiting_user" | "resolved" | "closed";
  priority: string;
  last_message_at: string;
  created_at: string;
};
type SupportMessage = { id: string; sender_id: string; body: string; read_at: string | null; created_at: string };

function SupportCenter({ userId }: { userId: string }) {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selected, setSelected] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadThreads(selectId?: string) {
    const { data } = await supabase.from("support_threads")
      .select("id, subject, status, priority, last_message_at, created_at")
      .eq("user_id", userId).order("last_message_at", { ascending: false });
    const rows = (data as SupportThread[]) ?? [];
    setThreads(rows);
    if (selectId) setSelected(rows.find((item) => item.id === selectId) ?? null);
  }

  async function loadMessages(thread: SupportThread) {
    const { data } = await supabase.from("support_messages")
      .select("id, sender_id, body, read_at, created_at")
      .eq("thread_id", thread.id).order("created_at");
    setMessages((data as SupportMessage[]) ?? []);
    await supabase.from("support_messages").update({ read_at: new Date().toISOString() })
      .eq("thread_id", thread.id).is("read_at", null);
  }

  useEffect(() => { loadThreads(); }, [userId]);
  useEffect(() => { if (selected) loadMessages(selected); }, [selected?.id]);

  async function createThread() {
    if (subject.trim().length < 3 || body.trim().length < 10) {
      toast.error("اكتب موضوعًا واضحًا ورسالة من 10 أحرف على الأقل"); return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("create_support_thread", { p_subject: subject.trim(), p_body: body.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSubject(""); setBody(""); setCreating(false);
    await loadThreads(data as string);
    toast.success("تم إرسال رسالتك إلى الإدارة");
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("reply_support_thread", { p_thread_id: selected.id, p_body: reply.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setReply("");
    await loadMessages(selected);
    await loadThreads(selected.id);
  }

  const statusLabel: Record<string, string> = { open: "مفتوحة", waiting_user: "بانتظار ردك", resolved: "تم الحل", closed: "مغلقة" };

  return (
    <section id="admin-support" className="scroll-mt-36 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Headphones className="size-4.5" /></span>
          <div><h2 className="font-semibold">مراسلة الإدارة</h2><p className="text-[11px] text-muted-foreground">دعم خاص وآمن داخل حسابك</p></div>
        </div>
        <Button size="sm" className="rounded-xl" onClick={() => { setCreating(true); setSelected(null); }}><Plus className="size-3.5" /> رسالة جديدة</Button>
      </div>

      {creating ? (
        <div className="space-y-4 p-5">
          <div><Label htmlFor="support-subject">موضوع الرسالة</Label><Input id="support-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} className="mt-1.5 rounded-xl" placeholder="مثال: مشكلة في الدفع أو الحساب" /></div>
          <div><Label htmlFor="support-body">تفاصيل الطلب</Label><Textarea id="support-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} className="mt-1.5 min-h-32 rounded-xl" placeholder="اشرح طلبك بوضوح، وستجيبك الإدارة هنا…" /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>إلغاء</Button><Button className="rounded-xl" disabled={busy} onClick={createThread}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} إرسال للإدارة</Button></div>
        </div>
      ) : selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex w-full items-center gap-2 border-b border-border/60 px-5 py-3 text-start text-xs font-medium text-muted-foreground hover:bg-muted/40"><ChevronLeft className="size-3.5 rotate-180 rtl:rotate-0" /> كل الرسائل</button>
          <div className="border-b border-border/60 px-5 py-4"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{selected.subject}</h3><Badge variant="outline" className="rounded-full">{statusLabel[selected.status]}</Badge></div></div>
          <div className="max-h-80 space-y-3 overflow-y-auto bg-muted/20 p-5">
            {messages.map((message) => {
              const mine = message.sender_id === userId;
              return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md border border-border/60 bg-background"}`}><p className="whitespace-pre-wrap">{message.body}</p><p className={`mt-1 text-[9px] ${mine ? "text-primary-foreground/55" : "text-muted-foreground"}`}>{mine ? "أنت" : "الإدارة"} · {new Date(message.created_at).toLocaleString()}</p></div></div>;
            })}
          </div>
          {selected.status !== "closed" && <div className="flex gap-2 border-t border-border/60 p-4"><Textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={4000} className="min-h-11 flex-1 resize-none rounded-xl" placeholder="اكتب ردك…" /><Button size="icon" className="size-11 shrink-0 rounded-xl" disabled={busy || !reply.trim()} onClick={sendReply}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button></div>}
        </div>
      ) : (
        <div className="p-3">
          {threads.length === 0 ? <div className="py-10 text-center"><Headphones className="mx-auto size-8 text-muted-foreground/35" /><p className="mt-3 text-sm text-muted-foreground">لا توجد رسائل مع الإدارة</p></div> : threads.map((thread) => (
            <button key={thread.id} onClick={() => setSelected(thread)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-start transition hover:bg-muted/55">
              <span className={`size-2 shrink-0 rounded-full ${thread.status === "waiting_user" ? "bg-amber-500" : thread.status === "resolved" ? "bg-emerald-500" : "bg-primary"}`} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{thread.subject}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(thread.last_message_at).toLocaleString()}</p></div>
              <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">{statusLabel[thread.status]}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
