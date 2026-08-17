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
type FeatureFlags = Record<"new_questions"|"free_questions"|"paid_questions"|"expert_answers"|"expert_targeting"|"answer_unlocking"|"expert_applications"|"token_purchases"|"withdrawals"|"support_messaging"|"private_messages"|"reviews", boolean>;
const DEFAULT_FEATURES: FeatureFlags = { new_questions:true,free_questions:true,paid_questions:true,expert_answers:true,expert_targeting:true,answer_unlocking:true,expert_applications:true,token_purchases:true,withdrawals:true,support_messaging:true,private_messages:true,reviews:true };
type MaintenancePage={enabled:boolean;title_ar:string;message_ar:string;title_fr:string;message_fr:string;title_en:string;message_en:string;expected_return:string};
const DEFAULT_MAINTENANCE:MaintenancePage={enabled:false,title_ar:"الموقع تحت الصيانة",message_ar:"نعمل على تحسين المنصة. سنعود قريبًا.",title_fr:"Maintenance en cours",message_fr:"Nous améliorons la plateforme.",title_en:"We are improving the platform",message_en:"We will be back shortly.",expected_return:""};
type ModerationReasons={question:string[];answer:string[];expert:string[];withdrawal:string[]};
const DEFAULT_REASONS:ModerationReasons={question:["معلومات غير كافية","سؤال مكرر","محتوى غير مناسب"],answer:["إجابة غير دقيقة","معلومات ناقصة","تخصص غير مطابق"],expert:["وثائق غير مكتملة"],withdrawal:["بيانات التحويل غير صحيحة"]};
type TokenProgram={mode:"hidden"|"header_only"|"full";signup_bonus:number;share_bonus:number;share_daily_limit:number;wallet_enabled:boolean};
const DEFAULT_TOKEN_PROGRAM:TokenProgram={mode:"header_only",signup_bonus:100,share_bonus:5,share_daily_limit:1,wallet_enabled:true};

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
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);
  const [maintenancePage, setMaintenancePage] = useState<MaintenancePage>(DEFAULT_MAINTENANCE);
  const [moderationReasons, setModerationReasons] = useState<ModerationReasons>(DEFAULT_REASONS);
  const [tokenProgram,setTokenProgram]=useState<TokenProgram>(DEFAULT_TOKEN_PROGRAM);
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
        else if (row.key === "feature_flags") setFeatures({ ...DEFAULT_FEATURES, ...(row.value as Partial<FeatureFlags>) });
        else if (row.key === "maintenance_page") { const page = { ...DEFAULT_MAINTENANCE, ...(row.value as Partial<MaintenancePage>) }; setMaintenancePage(page); if (page.enabled) setMaintenance(true); }
        else if (row.key === "moderation_reasons") setModerationReasons({ ...DEFAULT_REASONS, ...(row.value as Partial<ModerationReasons>) });
        else if(row.key==="token_program")setTokenProgram({...DEFAULT_TOKEN_PROGRAM,...(row.value as Partial<TokenProgram>)});
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
      await updateSetting("feature_flags", features);
      await updateSetting("maintenance_page", { ...maintenancePage, enabled: maintenance });
      await updateSetting("moderation_reasons", moderationReasons);
      await updateSetting("token_program",tokenProgram);
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
        <h2 className="flex items-center gap-2 font-bold"><Coins className="size-4.5 text-brand-gold"/> برنامج التوكن المجاني</h2>
        <p className="mt-1 text-xs text-ink/50">تحكم في ظهور التوكن والمكافآت من دون بيع أو شراء.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">{([{id:"hidden",title:"إخفاء كامل",text:"لا يظهر الرصيد أو المحفظة"},{id:"header_only",title:"الرصيد والمكافآت",text:"يظهر في الهيدر ويفتح سجل المحفظة"},{id:"full",title:"النظام الكامل",text:"شراء، فتح إجابات ومكافآت"}] as const).map(option=><button key={option.id} onClick={()=>setTokenProgram({...tokenProgram,mode:option.id})} className={`rounded-2xl border p-4 text-start transition ${tokenProgram.mode===option.id?"border-brand-teal bg-brand-teal/8 ring-2 ring-brand-teal/15":"border-ink/10 bg-white"}`}><p className="text-sm font-bold">{option.title}</p><p className="mt-1 text-[11px] leading-5 text-ink/50">{option.text}</p></button>)}</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><NumberField label="توكن عند أول تسجيل" value={tokenProgram.signup_bonus} onChange={value=>setTokenProgram({...tokenProgram,signup_bonus:value})}/><NumberField label="مكافأة مشاركة الموقع" value={tokenProgram.share_bonus} onChange={value=>setTokenProgram({...tokenProgram,share_bonus:value})}/><NumberField label="عدد مكافآت المشاركة يوميًا" value={tokenProgram.share_daily_limit} onChange={value=>setTokenProgram({...tokenProgram,share_daily_limit:value})}/><NumberField label="مكافأة الإجابة المعتمدة" value={Number(values["award_per_answer"])||0} onChange={value=>setValues({...values,award_per_answer:String(value)})}/></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField label="قيمة التوكن بالدرهم المغربي" value={Number(values["token_to_mad"])||0} onChange={value=>setValues({...values,token_to_mad:String(value)})}/><Switch checked={tokenProgram.wallet_enabled} onChange={value=>setTokenProgram({...tokenProgram,wallet_enabled:value})} label="تفعيل صفحة المحفظة والسجل" help="عند تعطيلها لا يمكن فتح المحفظة حتى لو ظهر النظام."/></div>
        {tokenProgram.mode!=="full"&&<p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-700">الوضع المجاني يعطّل شراء التوكن والأسئلة المدفوعة وفتح الإجابات بالتوكن تلقائيًا. تبقى المكافآت وسجلها متاحة في وضع «الرصيد والمكافآت».</p>}
      </Card>

      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold"><Wrench className="size-4.5 text-brand-teal" /> مركز التحكم في الميزات</h2>
        <p className="mt-1 text-xs text-ink/50">أوقف أو فعّل أي جزء من المنصة. الإيقاف محمي أيضًا داخل قاعدة البيانات.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["new_questions","طرح أسئلة جديدة"],["free_questions","الأسئلة المجانية"],["paid_questions","الأسئلة المدفوعة"],
            ["expert_answers","إجابات الخبراء"],["expert_targeting","اختيار فئة المجيب"],["answer_unlocking","فتح الأجوبة بالتوكن"],
            ["expert_applications","طلبات الانضمام كخبير"],["token_purchases","شراء التوكن"],["withdrawals","طلبات السحب"],
            ["support_messaging","مراسلة الإدارة"],["private_messages","الرسائل الخاصة"],["reviews","التقييمات"],
          ] as [keyof FeatureFlags,string][]).map(([key,label])=><Switch key={key} checked={features[key]} onChange={value=>setFeatures({...features,[key]:value})} label={label}/>) }
        </div>
        <div className="mt-6 border-t border-ink/8 pt-5"><h3 className="font-bold">صفحة الصيانة</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-ink/60">العنوان بالعربية<input value={maintenancePage.title_ar} onChange={e=>setMaintenancePage({...maintenancePage,title_ar:e.target.value})} className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm"/></label><label className="text-xs font-semibold text-ink/60">موعد العودة المتوقع<input type="datetime-local" dir="ltr" value={maintenancePage.expected_return} onChange={e=>setMaintenancePage({...maintenancePage,expected_return:e.target.value})} className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm"/></label></div><label className="mt-4 block text-xs font-semibold text-ink/60">رسالة الصيانة<textarea value={maintenancePage.message_ar} onChange={e=>setMaintenancePage({...maintenancePage,message_ar:e.target.value})} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm"/></label></div>
      </Card>

      <Card className="fade-up p-6">
        <h2 className="font-bold">أسباب المراجعة الجاهزة</h2><p className="mt-1 text-xs text-ink/50">اكتب سببًا في كل سطر. تظهر للمشرف عند رفض المحتوى.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{([['question','رفض الأسئلة'],['answer','رفض الأجوبة'],['expert','رفض الخبراء'],['withdrawal','رفض السحب']] as [keyof ModerationReasons,string][]).map(([key,label])=><label key={key} className="text-xs font-semibold text-ink/60">{label}<textarea rows={5} value={moderationReasons[key].join('\n')} onChange={e=>setModerationReasons({...moderationReasons,[key]:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)})} className="mt-1.5 w-full resize-none rounded-xl border border-ink/15 bg-white p-3 text-sm leading-6"/></label>)}</div>
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
