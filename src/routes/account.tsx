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
  const [payouts, setPayouts] = useState<MyPayout[]>([]);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutTokens, setPayoutTokens] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [payoutBusy, setPayoutBusy] = useState(false);
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
      .select("id, title, status, tokens, answers_count, created_at")
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
  }

  const unread = notifications.filter((n) => !n.read_at).length;

  const questionStatus: Record<string, { label: string; cls: string }> = {
    pending: { label: t("account.statusPending", "قيد المراجعة"), cls: "bg-amber-100 text-amber-700" },
    published: { label: t("account.statusPublished", "منشور"), cls: "bg-emerald-100 text-emerald-700" },
    closed: { label: t("account.statusClosed", "مغلق"), cls: "bg-muted text-muted-foreground" },
    rejected: { label: t("account.statusRejected", "مرفوض"), cls: "bg-red-100 text-red-700" },
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-foreground">
              {(profile?.full_name || user.email || "?")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile?.full_name || t("account.title")}
              </h1>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> {t("nav.signOut")}
          </Button>
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
            <section>
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
                      <p className="mt-2 font-medium">{q.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(q.created_at).toLocaleDateString()} ·{" "}
                        {q.answers_count} {t("account.answers", "إجابة")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* My orders */}
            <section>
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
          </div>

          <div className="space-y-8">
            {/* Notifications */}
            <section className="rounded-3xl border border-border/70 bg-card p-6">
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

            {/* Profile settings */}
            <section className="rounded-3xl border border-border/70 bg-card p-6">
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
