import { useEffect, useState } from "react";
import {
  Save, Coins, Award, Wallet, ArrowLeftRight, Wrench, LockKeyhole,
  UserRoundCheck, Plus, Trash2, EyeOff, MessageSquareLock,
} from "lucide-react";
import { supabase } from "../supabase";
import { Card, Btn, Badge } from "../ui";

const FIELDS = [
  { key: "award_per_answer", label: "توكن يكسبه الخبير عن كل جواب معتمد", icon: Award },
  { key: "best_answer_bonus", label: "بونص أفضل جواب", icon: Coins },
  { key: "min_payout_tokens", label: "الحد الأدنى للسحب (توكن)", icon: Wallet },
  { key: "token_to_mad", label: "قيمة التوكن عند السحب (درهم)", icon: ArrowLeftRight },
] as const;

type AccessRules = {
  guest_hide_full_content: boolean;
  answer_unlock_required: boolean;
  default_answer_unlock_cost: number;
  allow_free_questions: boolean;
  targeting_enabled: boolean;
  targeting_requires_paid_question: boolean;
  audience_min_token_balance: number;
  question_preview_chars: number;
  answer_preview_chars: number;
};

type Audience = {
  id: string;
  label_ar: string;
  label_fr: string;
  label_en: string;
  active: boolean;
};
type PlatformLimits = {
  questions_per_day: number; answers_per_hour: number; support_threads_per_day: number;
  support_messages_per_hour: number; private_messages_per_hour: number; reports_per_day: number;
  max_open_support_threads: number;
};
const DEFAULT_LIMITS: PlatformLimits = {
  questions_per_day: 10, answers_per_hour: 10, support_threads_per_day: 5,
  support_messages_per_hour: 30, private_messages_per_hour: 60, reports_per_day: 10,
  max_open_support_threads: 5,
};

const DEFAULT_RULES: AccessRules = {
  guest_hide_full_content: true,
  answer_unlock_required: true,
  default_answer_unlock_cost: 5,
  allow_free_questions: true,
  targeting_enabled: true,
  targeting_requires_paid_question: true,
  audience_min_token_balance: 1,
  question_preview_chars: 180,
  answer_preview_chars: 220,
};

function Switch({ checked, onChange, label, help }: {
  checked: boolean; onChange: (value: boolean) => void; label: string; help?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink/8 bg-white/60 p-4">
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {help && <p className="mt-1 text-xs leading-5 text-ink/50">{help}</p>}
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-brand-teal" : "bg-ink/20"}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${checked ? "start-6" : "start-1"}`} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [maintenance, setMaintenance] = useState(false);
  const [rules, setRules] = useState<AccessRules>(DEFAULT_RULES);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [limits, setLimits] = useState<PlatformLimits>(DEFAULT_LIMITS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("key, value").then(({ data }) => {
      const v: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        if (row.key === "maintenance_mode") setMaintenance(row.value === true || row.value === "true");
        else if (row.key === "content_access_rules") setRules({ ...DEFAULT_RULES, ...(row.value as Partial<AccessRules>) });
        else if (row.key === "expert_audiences") setAudiences((row.value as Audience[]) ?? []);
        else if (row.key === "platform_limits") setLimits({ ...DEFAULT_LIMITS, ...(row.value as Partial<PlatformLimits>) });
        else v[row.key] = String(row.value);
      });
      setValues(v);
    });
  }, []);

  async function updateSetting(key: string, value: unknown) {
    const { error } = await supabase.from("settings").update({ value }).eq("key", key);
    if (error) throw error;
  }

  async function save() {
    setSaving(true);
    try {
      for (const f of FIELDS) await updateSetting(f.key, values[f.key]);
      await updateSetting("maintenance_mode", maintenance);
      await updateSetting("content_access_rules", rules);
      await updateSetting("expert_audiences", audiences);
      await updateSetting("platform_limits", limits);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      alert(error instanceof Error ? error.message : "تعذر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  function addAudience() {
    setAudiences((current) => [...current, {
      id: `group-${Date.now()}`,
      label_ar: "مجموعة جديدة",
      label_fr: "Nouveau groupe",
      label_en: "New group",
      active: true,
    }]);
  }

  function patchAudience(index: number, patch: Partial<Audience>) {
    setAudiences((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إعدادات المنصة</h1>
          <p className="mt-1 text-sm text-ink/55">قواعد عرض المحتوى، الأسئلة، التخصصات واقتصاد التوكن</p>
        </div>
        {saved && <Badge tone="success">تم تطبيق الإعدادات ✓</Badge>}
      </div>

      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <EyeOff className="size-4.5 text-brand-teal" /> عرض الأسئلة والأجوبة
        </h2>
        <p className="mt-1 text-xs text-ink/50">هذه القواعد تُطبّق من قاعدة البيانات؛ المحتوى المقفول لا يُرسل إلى متصفح الزائر.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Switch
            checked={rules.guest_hide_full_content}
            onChange={(value) => setRules({ ...rules, guest_hide_full_content: value })}
            label="إخفاء السؤال والجواب الكامل عن غير المسجلين"
            help="يظهر عنوان السؤال ومقتطف قصير فقط، حتى للأسئلة المجانية."
          />
          <Switch
            checked={rules.answer_unlock_required}
            onChange={(value) => setRules({ ...rules, answer_unlock_required: value })}
            label="فرض التوكن لفتح الأجوبة الكاملة"
            help="المستخدم المسجل يحتاج إلى فتح الإجابة؛ وإذا كان رصيده ناقصًا يُوجّه للشراء."
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <NumberField label="سعر فتح الأجوبة (توكن)" value={rules.default_answer_unlock_cost}
            onChange={(value) => setRules({ ...rules, default_answer_unlock_cost: value })} />
          <NumberField label="طول مقتطف السؤال (حرف)" value={rules.question_preview_chars}
            onChange={(value) => setRules({ ...rules, question_preview_chars: value })} />
          <NumberField label="طول مقتطف الجواب (حرف)" value={rules.answer_preview_chars}
            onChange={(value) => setRules({ ...rules, answer_preview_chars: value })} />
        </div>
      </Card>

      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <MessageSquareLock className="size-4.5 text-brand-teal" /> طرح الأسئلة وتوجيهها
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Switch checked={rules.allow_free_questions}
            onChange={(value) => setRules({ ...rules, allow_free_questions: value })}
            label="السماح بالأسئلة المجانية" help="السؤال المجاني يصل لجميع الخبراء المؤهلين ولا يختار صاحبه فئة محددة." />
          <Switch checked={rules.targeting_enabled}
            onChange={(value) => setRules({ ...rules, targeting_enabled: value })}
            label="السماح باختيار فئة المجيب" help="مثل المهندسين، الدبلوماسيين أو الأساتذة." />
          <Switch checked={rules.targeting_requires_paid_question}
            onChange={(value) => setRules({ ...rules, targeting_requires_paid_question: value })}
            label="الاختيار للأسئلة المدفوعة فقط" help="عند تفعيله لا يمكن توجيه سؤال بمكافأة 0 توكن." />
        </div>
        <div className="mt-4 max-w-xs">
          <NumberField label="أقل رصيد يسمح باختيار الفئة" value={rules.audience_min_token_balance}
            onChange={(value) => setRules({ ...rules, audience_min_token_balance: value })} />
        </div>
      </Card>

      <Card className="fade-up p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold"><UserRoundCheck className="size-4.5 text-brand-teal" /> فئات المجيبين</h2>
            <p className="mt-1 text-xs text-ink/50">أضف أو عدّل الفئات. عيّن فئات كل خبير من صفحة «الخبراء».</p>
          </div>
          <Btn small tone="ghost" onClick={addAudience}><Plus className="size-3.5" /> إضافة فئة</Btn>
        </div>
        <div className="mt-5 space-y-3">
          {audiences.map((audience, index) => (
            <div key={audience.id} className="grid gap-2 rounded-xl border border-ink/10 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <input value={audience.label_ar} onChange={(e) => patchAudience(index, { label_ar: e.target.value })}
                placeholder="الاسم بالعربية" className="rounded-lg border border-ink/12 px-3 py-2 text-sm outline-none focus:border-brand-teal" />
              <input dir="ltr" value={audience.label_fr} onChange={(e) => patchAudience(index, { label_fr: e.target.value })}
                placeholder="Nom français" className="rounded-lg border border-ink/12 px-3 py-2 text-sm outline-none focus:border-brand-teal" />
              <input dir="ltr" value={audience.label_en} onChange={(e) => patchAudience(index, { label_en: e.target.value })}
                placeholder="English name" className="rounded-lg border border-ink/12 px-3 py-2 text-sm outline-none focus:border-brand-teal" />
              <button onClick={() => patchAudience(index, { active: !audience.active })}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${audience.active ? "bg-emerald-100 text-emerald-700" : "bg-ink/8 text-ink/45"}`}>
                {audience.active ? "مفعلة" : "مخفية"}
              </button>
              <button onClick={() => setAudiences((items) => items.filter((_, i) => i !== index))}
                className="grid place-items-center rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="حذف">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold"><LockKeyhole className="size-4.5 text-brand-teal" /> حدود الاستخدام والحماية من الإزعاج</h2>
        <p className="mt-1 text-xs text-ink/50">عدّل الحدود حسب حجم المنصة. التحقق يتم داخل قاعدة البيانات ولا يمكن تجاوزه من المتصفح.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["questions_per_day", "أسئلة لكل مستخدم / يوم"],
            ["answers_per_hour", "أجوبة لكل خبير / ساعة"],
            ["support_threads_per_day", "طلبات دعم جديدة / يوم"],
            ["support_messages_per_hour", "رسائل دعم / ساعة"],
            ["private_messages_per_hour", "رسائل خاصة / ساعة"],
            ["reports_per_day", "بلاغات / يوم"],
            ["max_open_support_threads", "أقصى طلبات دعم مفتوحة"],
          ] as [keyof PlatformLimits, string][]).map(([key, label]) => (
            <NumberField key={key} label={label} value={limits[key]} onChange={(value) => setLimits({ ...limits, [key]: value })} />
          ))}
        </div>
      </Card>

      <Card className="fade-up space-y-5 p-6">
        <h2 className="flex items-center gap-2 font-bold"><Coins className="size-4.5 text-brand-teal" /> اقتصاد التوكن</h2>
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark/8 text-brand-dark"><f.icon className="size-4.5" /></span>
            <label className="flex-1 text-sm font-medium">{f.label}</label>
            <input type="number" step="0.1" dir="ltr" value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-28 rounded-xl border border-ink/15 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-brand-teal" />
          </div>
        ))}
        <div className="flex items-center gap-4 border-t border-ink/8 pt-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600"><Wrench className="size-4.5" /></span>
          <label className="flex-1 text-sm font-medium">وضع الصيانة (يخفي الموقع عن الزوار)</label>
          <button onClick={() => setMaintenance(!maintenance)}
            className={`relative h-7 w-12 rounded-full transition ${maintenance ? "bg-brand-teal" : "bg-ink/20"}`}>
            <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${maintenance ? "start-6" : "start-1"}`} />
          </button>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-2xl border border-brand-dark/10 bg-white/90 p-3 shadow-lg backdrop-blur">
        <Btn onClick={save} disabled={saving}><Save className="size-4" /> {saving ? "جارٍ الحفظ…" : "حفظ وتطبيق كل الإعدادات"}</Btn>
        <span className="text-xs text-ink/45"><LockKeyhole className="me-1 inline size-3.5" /> التحقق النهائي يتم داخل Supabase.</span>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-xs font-semibold text-ink/60">
      {label}
      <input type="number" min="0" dir="ltr" value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-center text-sm font-bold text-ink outline-none focus:border-brand-teal" />
    </label>
  );
}
