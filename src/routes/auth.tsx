import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  );
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  // Sign-in state
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign-up state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  if (user) {
    navigate({ to: "/account" });
    return null;
  }

  async function signInWithGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail,
      password: siPassword,
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? t("auth.invalidCredentials", "البريد الإلكتروني أو كلمة المرور غير صحيحة")
          : error.message,
      );
      return;
    }
    toast.success(t("auth.signInTitle"));
    navigate({ to: "/account" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (suPassword.length < 8) {
      toast.error(t("validation.passwordLength", "كلمة المرور 8 أحرف على الأقل"));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        data: { full_name: suName },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? t("auth.alreadyRegistered", "هذا البريد مسجل بالفعل — جرّب تسجيل الدخول")
          : error.message,
      );
      return;
    }
    if (data.session) {
      // Email confirmation disabled → logged in immediately
      navigate({ to: "/account" });
    } else {
      toast.success(
        t("auth.confirmEmailSent", "تم إرسال رابط التفعيل إلى بريدك الإلكتروني — افتحه لإكمال التسجيل"),
        { duration: 8000 },
      );
    }
  }

  return (
    <SiteLayout>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -left-40 -top-40 -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-40 top-20 -z-10 size-[28rem] rounded-full bg-accent/10 blur-3xl"
        />

        <div className="mx-auto max-w-md px-4 py-16 sm:py-20">
          <Tabs defaultValue="signin" dir="inherit">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="signin" className="rounded-lg">
                <LogIn className="me-1.5 size-4" /> {t("nav.signIn")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">
                <UserPlus className="me-1.5 size-4" /> {t("nav.signUp")}
              </TabsTrigger>
            </TabsList>

            {/* ---------- SIGN IN ---------- */}
            <TabsContent value="signin">
              <div className="mt-6 rounded-3xl border border-border/70 bg-card p-7 shadow-xl shadow-primary/5 sm:p-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {t("auth.signInTitle")}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("auth.signInDescription")}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 w-full rounded-xl bg-background"
                  disabled={busy}
                  onClick={signInWithGoogle}
                >
                  <GoogleIcon /> Google
                </Button>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("auth.orContinueWith")}
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="si-email"
                        type="email"
                        required
                        dir="ltr"
                        autoComplete="email"
                        value={siEmail}
                        onChange={(e) => setSiEmail(e.target.value)}
                        className="rounded-xl pe-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="si-password"
                        type="password"
                        required
                        dir="ltr"
                        autoComplete="current-password"
                        value={siPassword}
                        onChange={(e) => setSiPassword(e.target.value)}
                        className="rounded-xl pe-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl"
                    size="lg"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      t("auth.signInButton")
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* ---------- SIGN UP ---------- */}
            <TabsContent value="signup">
              <div className="mt-6 rounded-3xl border border-border/70 bg-card p-7 shadow-xl shadow-primary/5 sm:p-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {t("auth.signUpTitle")}
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("auth.signUpDescription")}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 w-full rounded-xl bg-background"
                  disabled={busy}
                  onClick={signInWithGoogle}
                >
                  <GoogleIcon /> Google
                </Button>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("auth.orContinueWith")}
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">{t("auth.name")}</Label>
                    <div className="relative">
                      <User className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="su-name"
                        required
                        autoComplete="name"
                        value={suName}
                        onChange={(e) => setSuName(e.target.value)}
                        className="rounded-xl pe-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="su-email"
                        type="email"
                        required
                        dir="ltr"
                        autoComplete="email"
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                        className="rounded-xl pe-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-password">{t("auth.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="su-password"
                        type="password"
                        required
                        minLength={8}
                        dir="ltr"
                        autoComplete="new-password"
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        className="rounded-xl pe-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl"
                    size="lg"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      t("auth.signUpButton")
                    )}
                  </Button>
                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    {t("auth.termsPrefix")}{" "}
                    <Link to="/terms" className="font-semibold text-primary underline underline-offset-2">{t("auth.terms")}</Link>{" · "}
                    <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2">{t("auth.privacy")}</Link>
                  </p>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}
