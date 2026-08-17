import { useEffect, useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  IdCard,
  ImageIcon,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/become-expert")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "becomeExpert"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: BecomeExpertPage,
});

const icons = [IdCard, Upload, FileCheck2, ShieldCheck];

// Documents: CIN + personal photo required; CV + others optional
const DOC_KINDS = [
  { kind: "cin", label: "بطاقة التعريف الوطنية (CIN)", icon: IdCard, required: true, accept: "image/*,.pdf" },
  { kind: "photo", label: "صورة شخصية", icon: ImageIcon, required: true, accept: "image/*" },
  { kind: "cv", label: "السيرة الذاتية (CV)", icon: FileText, required: false, accept: ".pdf,.doc,.docx" },
  { kind: "diploma", label: "دبلوم / شهادة", icon: FileCheck2, required: false, accept: "image/*,.pdf" },
  { kind: "license", label: "ترخيص مهني (إن وجد)", icon: ShieldCheck, required: false, accept: "image/*,.pdf" },
] as const;

type DocKind = (typeof DOC_KINDS)[number]["kind"];

type Application = {
  status: "pending" | "approved" | "rejected" | "suspended";
  title: string;
  specialization: string;
  city: string;
  bio: string;
};

function BecomeExpertPage() {
  const copy = usePageCopy().becomeExpert;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const site=useSiteSettings();

  const [application, setApplication] = useState<Application | null>(null);
  const [checked, setChecked] = useState(false);

  const [title, setTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [docs, setDocs] = useState<Partial<Record<DocKind, { name: string; url: string }>>>({});
  const [uploading, setUploading] = useState<DocKind | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRefs = useRef<Partial<Record<DocKind, HTMLInputElement | null>>>({});

  useEffect(() => {
    if (!user) {
      setChecked(true);
      return;
    }
    supabase
      .from("expert_profiles")
      .select("status, title, specialization, city, bio")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setApplication(data as Application);
        setChecked(true);
      });
  }, [user]);

  async function uploadDoc(kind: DocKind, file: File) {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("الحد الأقصى لحجم الملف 8 ميغابايت");
      return;
    }
    setUploading(kind);
    const path = `${user.id}/${kind}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("expert-docs").upload(path, file);
    setUploading(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDocs((d) => ({ ...d, [kind]: { name: file.name, url: path } }));
    toast.success("تم رفع الملف");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!docs.cin || !docs.photo) {
      toast.error("بطاقة التعريف والصورة الشخصية مطلوبتان");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("expert_profiles").insert({
      user_id: user.id,
      title,
      specialization,
      city,
      bio,
      status: "pending",
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    // Save document records
    const rows = Object.entries(docs).map(([kind, f]) => ({
      user_id: user.id,
      kind,
      file_url: f!.url,
      file_name: f!.name,
    }));
    await supabase.from("expert_documents").insert(rows);
    setSubmitting(false);
    setApplication({ status: "pending", title, specialization, city, bio });
    toast.success("تم إرسال طلبك! سيراجعه فريقنا ويردّ عليك قريبًا.", { duration: 8000 });
  }

  // ---------- states ----------
  if (loading || !checked) {
    return (
      <SiteLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }
  if(site.loaded&&site.features["expert_applications"]===false)return <SiteLayout><div className="mx-auto max-w-xl px-4 py-32 text-center"><ShieldCheck className="mx-auto size-12 text-primary"/><h1 className="mt-5 text-3xl font-semibold">{t("nav.becomeExpert")}</h1><p className="mt-3 text-muted-foreground">طلبات الانضمام كخبير متوقفة مؤقتًا من طرف الإدارة.</p><Button asChild className="mt-6 rounded-xl"><Link to="/questions">{t("nav.questions")}</Link></Button></div></SiteLayout>;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {/* Steps overview (marketing) */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute start-[12.5%] end-[12.5%] top-7 hidden border-t border-dashed border-secondary/35 lg:block" />
          {copy.steps.map((step, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <article
                key={step.title}
                className="premium-card relative p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary/10 text-secondary">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Not logged in */}
        {!user && (
          <div className="premium-card p-8 text-center sm:p-10">
            <ShieldCheck className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">
              {t("auth.signUpTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              سجّل حسابك أولًا ثم قدّم طلب الانضمام كخبير مع وثائقك.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-xl">
              <Link to="/auth">
                {t("nav.signUp")} <ArrowRight data-directional className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Existing application status */}
        {user && application && (
          <div className="premium-card p-8 text-center sm:p-10">
            {application.status === "pending" && (
              <>
                <Clock3 className="mx-auto size-10 text-accent" />
                <h2 className="mt-4 text-2xl font-semibold">طلبك قيد المراجعة</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  استلمنا طلبك ووثائقك، وسيراجعها فريق الإشراف.
                  ستصلك النتيجة في إشعارات حسابك.
                </p>
              </>
            )}
            {application.status === "approved" && (
              <>
                <BadgeCheck className="mx-auto size-10 text-secondary" />
                <h2 className="mt-4 text-2xl font-semibold">مبروك! أنت خبير معتمد</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  يمكنك الآن الإجابة على الأسئلة وكسب التوكن.
                </p>
                <Button asChild size="lg" className="mt-6 rounded-xl">
                  <Link to="/questions">{t("nav.questions")}</Link>
                </Button>
              </>
            )}
            {application.status === "rejected" && (
              <>
                <XCircle className="mx-auto size-10 text-destructive" />
                <h2 className="mt-4 text-2xl font-semibold">لم يُقبل طلبك</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  يمكنك التواصل معنا لمعرفة السبب أو لتقديم وثائق إضافية.
                </p>
                <Button asChild variant="outline" size="lg" className="mt-6 rounded-xl">
                  <Link to="/contact">{t("footer.contact")}</Link>
                </Button>
              </>
            )}
          </div>
        )}

        {/* Application form */}
        {user && !application && (
          <form onSubmit={submit} className="premium-card p-7 sm:p-9">
            <h2 className="text-2xl font-semibold tracking-tight">
              طلب الانضمام كخبير
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              املأ معلوماتك المهنية وارفع وثائق التحقق — تُراجع يدويًا من فريقنا.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="be-title">اللقب المهني *</Label>
                <Input
                  id="be-title" required value={title}
                  placeholder="مثال: محامٍ بهيئة الرباط"
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="be-spec">التخصص *</Label>
                <Input
                  id="be-spec" required value={specialization}
                  placeholder="مثال: قانون الأعمال والشركات"
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="be-city">المدينة *</Label>
                <Input
                  id="be-city" required value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="be-bio">نبذة مهنية *</Label>
                <Textarea
                  id="be-bio" required rows={4} value={bio}
                  placeholder="خبرتك، سنوات الممارسة، المجالات التي تجيب فيها…"
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold">وثائق التحقق</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                الملفات تُخزّن بشكل خاص ولا يطّلع عليها إلا فريق الإشراف. (حد أقصى 8MB لكل ملف)
              </p>
              <div className="mt-4 space-y-3">
                {DOC_KINDS.map((d) => {
                  const uploaded = docs[d.kind];
                  return (
                    <div
                      key={d.kind}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
                        uploaded
                          ? "border-secondary/40 bg-secondary/5"
                          : "border-border/70"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${uploaded ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>
                          {uploaded ? <CheckCircle2 className="size-5" /> : <d.icon className="size-5" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {d.label}{" "}
                            {d.required ? (
                              <span className="text-destructive">*</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">(اختياري)</span>
                            )}
                          </p>
                          {uploaded && (
                            <p className="truncate text-xs text-muted-foreground" dir="ltr">
                              {uploaded.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={uploaded ? "outline" : "default"}
                        className="rounded-xl"
                        disabled={uploading === d.kind}
                        onClick={() => fileRefs.current[d.kind]?.click()}
                      >
                        {uploading === d.kind ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="size-3.5" />{" "}
                            {uploaded ? "استبدال" : "رفع"}
                          </>
                        )}
                      </Button>
                      <input
                        ref={(el) => { fileRefs.current[d.kind] = el; }}
                        type="file"
                        accept={d.accept}
                        hidden
                        onChange={(e) => e.target.files?.[0] && uploadDoc(d.kind, e.target.files[0])}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-8 w-full rounded-xl"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>إرسال الطلب للمراجعة <ArrowRight data-directional className="size-4" /></>
              )}
            </Button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
