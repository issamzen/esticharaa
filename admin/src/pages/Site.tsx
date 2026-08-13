import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Image,
  Palette,
  Plus,
  Save,
  Trash2,
  Type,
  Wallet,
} from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type NavItem = { to: string; key: string; visible: boolean };
type PayMethod = { id: string; label: string; icon: string; active: boolean };
type Branding = { site_name: string; logo_url: string; favicon_url: string };
type Colors = { primary: string; secondary: string; accent: string; muted: string };

const NAV_LABELS: Record<string, string> = {
  "/questions": "الأسئلة",
  "/categories": "التصنيفات",
  "/experts": "الخبراء",
  "/tokens": "شراء توكن",
  "/pricing": "الأسعار",
  "/about": "من نحن",
  "/blog": "المدونة",
  "/ask": "اطرح سؤالًا",
  "/become-expert": "انضم كخبير",
  "/contact": "اتصل بنا",
};

const COLOR_LABELS: Record<keyof Colors, string> = {
  primary: "اللون الأساسي (أزرار وعناوين)",
  secondary: "اللون الثانوي",
  accent: "لون التمييز (ذهبي)",
  muted: "لون الخلفيات الهادئة",
};

export function SitePage() {
  const [branding, setBranding] = useState<Branding>({ site_name: "", logo_url: "", favicon_url: "" });
  const [colors, setColors] = useState<Colors>({ primary: "#0D4B4B", secondary: "#1E8C85", accent: "#D4AF37", muted: "#F2E8D6" });
  const [nav, setNav] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<NavItem[]>([]);
  const [methods, setMethods] = useState<PayMethod[]>([]);
  const [saved, setSaved] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const favRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["site_branding", "site_colors", "site_nav", "site_footer", "payment_methods"])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        if (map.site_branding) setBranding(map.site_branding as Branding);
        if (map.site_colors) setColors(map.site_colors as Colors);
        if (map.site_nav) setNav(map.site_nav as NavItem[]);
        if (map.site_footer) setFooter(map.site_footer as NavItem[]);
        if (map.payment_methods) setMethods(map.payment_methods as PayMethod[]);
      });
  }, []);

  async function saveKey(key: string, value: unknown, label: string) {
    const { error } = await supabase.from("settings").update({ value }).eq("key", key);
    if (error) { alert(error.message); return; }
    setSaved(label);
    setTimeout(() => setSaved(""), 2500);
  }

  async function upload(file: File, kind: "logo" | "favicon") {
    const path = `${kind}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
    if (error) { alert(error.message); return; }
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    const next = { ...branding, [kind === "logo" ? "logo_url" : "favicon_url"]: data.publicUrl };
    setBranding(next);
    await saveKey("site_branding", next, "الشعار");
  }

  function toggleItem(list: NavItem[], setList: (v: NavItem[]) => void, idx: number) {
    const next = list.map((x, i) => (i === idx ? { ...x, visible: !x.visible } : x));
    setList(next);
  }

  async function addMethod() {
    const label = prompt("اسم وسيلة الدفع (كما ستظهر للزوار):", "بطاقة بنكية");
    if (!label) return;
    const next = [...methods, { id: `m-${Date.now()}`, label, icon: "CreditCard", active: true }];
    setMethods(next);
    await saveKey("payment_methods", next, "وسائل الدفع");
  }

  async function editMethod(i: number) {
    const label = prompt("تعديل الاسم:", methods[i].label);
    if (!label) return;
    const next = methods.map((m, idx) => (idx === i ? { ...m, label } : m));
    setMethods(next);
    await saveKey("payment_methods", next, "وسائل الدفع");
  }

  async function deleteMethod(i: number) {
    if (!confirm(`حذف «${methods[i].label}»؟`)) return;
    const next = methods.filter((_, idx) => idx !== i);
    setMethods(next);
    await saveKey("payment_methods", next, "وسائل الدفع");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">تخصيص الموقع</h1>
          <p className="mt-1 text-sm text-ink/55">
            الشعار والألوان والقوائم ووسائل الدفع — تُطبّق على estichara.ma مباشرة دون لمس GitHub
          </p>
        </div>
        {saved && <Badge tone="success">تم حفظ: {saved} ✓</Badge>}
      </div>

      {/* Branding */}
      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold"><Type className="size-4.5 text-brand-teal" /> الهوية</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-ink/60">اسم الموقع</label>
            <input
              value={branding.site_name}
              onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink/60">الشعار (PNG — يظهر في الترويسة)</label>
            <div className="mt-1.5 flex items-center gap-3">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="logo" className="size-10 rounded-lg border border-ink/10 object-contain" />
              ) : (
                <span className="grid size-10 place-items-center rounded-lg bg-ink/5"><Image className="size-4 text-ink/40" /></span>
              )}
              <Btn small tone="ghost" onClick={() => logoRef.current?.click()}>رفع شعار</Btn>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo")} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink/60">الأيقونة (ICO/PNG — تبويب المتصفح)</label>
            <div className="mt-1.5 flex items-center gap-3">
              {branding.favicon_url ? (
                <img src={branding.favicon_url} alt="favicon" className="size-10 rounded-lg border border-ink/10 object-contain" />
              ) : (
                <span className="grid size-10 place-items-center rounded-lg bg-ink/5"><Image className="size-4 text-ink/40" /></span>
              )}
              <Btn small tone="ghost" onClick={() => favRef.current?.click()}>رفع أيقونة</Btn>
              <input ref={favRef} type="file" accept="image/x-icon,image/png,image/svg+xml" hidden
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "favicon")} />
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-ink/8 pt-4">
          <Btn onClick={() => saveKey("site_branding", branding, "الهوية")}><Save className="size-4" /> حفظ الهوية</Btn>
        </div>
      </Card>

      {/* Colors */}
      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold"><Palette className="size-4.5 text-brand-teal" /> ألوان الموقع</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(colors) as (keyof Colors)[]).map((k) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3">
              <input
                type="color"
                value={colors[k]}
                onChange={(e) => setColors({ ...colors, [k]: e.target.value })}
                className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold">{COLOR_LABELS[k]}</p>
                <p className="text-[11px] text-ink/45" dir="ltr">{colors[k]}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-ink/8 pt-4">
          <Btn onClick={() => saveKey("site_colors", colors, "الألوان")}><Save className="size-4" /> حفظ الألوان</Btn>
        </div>
      </Card>

      {/* Header nav */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="fade-up p-6">
          <h2 className="font-bold">قائمة الترويسة (Header)</h2>
          <p className="mt-1 text-xs text-ink/50">أخفِ أو أظهر أي عنصر — يختفي الرابط والصفحة من القائمة فورًا</p>
          <div className="mt-4 space-y-2">
            {nav.map((item, i) => (
              <div key={item.to} className="flex items-center justify-between rounded-xl bg-ink/4 px-4 py-2.5">
                <span className={`text-sm font-medium ${item.visible ? "" : "text-ink/35 line-through"}`}>
                  {NAV_LABELS[item.to] ?? item.to} <span className="text-[10px] text-ink/35" dir="ltr">{item.to}</span>
                </span>
                <button onClick={() => toggleItem(nav, setNav, i)}
                  className={`rounded-lg p-2 transition ${item.visible ? "text-brand-teal hover:bg-brand-teal/10" : "text-ink/30 hover:bg-ink/8"}`}>
                  {item.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-ink/8 pt-4">
            <Btn small onClick={() => saveKey("site_nav", nav, "قائمة الترويسة")}><Save className="size-3.5" /> حفظ</Btn>
          </div>
        </Card>

        <Card className="fade-up p-6">
          <h2 className="font-bold">روابط التذييل (Footer)</h2>
          <p className="mt-1 text-xs text-ink/50">تحكم في الروابط الظاهرة أسفل الموقع</p>
          <div className="mt-4 space-y-2">
            {footer.map((item, i) => (
              <div key={item.to} className="flex items-center justify-between rounded-xl bg-ink/4 px-4 py-2.5">
                <span className={`text-sm font-medium ${item.visible ? "" : "text-ink/35 line-through"}`}>
                  {NAV_LABELS[item.to] ?? item.to} <span className="text-[10px] text-ink/35" dir="ltr">{item.to}</span>
                </span>
                <button onClick={() => toggleItem(footer, setFooter, i)}
                  className={`rounded-lg p-2 transition ${item.visible ? "text-brand-teal hover:bg-brand-teal/10" : "text-ink/30 hover:bg-ink/8"}`}>
                  {item.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-ink/8 pt-4">
            <Btn small onClick={() => saveKey("site_footer", footer, "روابط التذييل")}><Save className="size-3.5" /> حفظ</Btn>
          </div>
        </Card>
      </div>

      {/* Payment methods */}
      <Card className="fade-up p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><Wallet className="size-4.5 text-brand-teal" /> وسائل الدفع</h2>
          <Btn small onClick={addMethod}><Plus className="size-3.5" /> إضافة وسيلة</Btn>
        </div>
        <p className="mt-1 text-xs text-ink/50">تظهر في صفحة شراء التوكن — التعطيل يخفيها فورًا</p>
        <div className="mt-4 space-y-2">
          {methods.length === 0 && <Empty text="لا توجد وسائل دفع — أضف أول وسيلة" />}
          {methods.map((m, i) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink/4 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-ink/20"}`} />
                <span className={`text-sm font-medium ${m.active ? "" : "text-ink/40"}`}>{m.label}</span>
              </div>
              <div className="flex gap-2">
                <Btn small tone="ghost" onClick={() => editMethod(i)}>تعديل</Btn>
                <Btn small tone={m.active ? "danger" : "primary"}
                  onClick={async () => {
                    const next = methods.map((x, idx) => (idx === i ? { ...x, active: !x.active } : x));
                    setMethods(next);
                    await saveKey("payment_methods", next, "وسائل الدفع");
                  }}>
                  {m.active ? "تعطيل" : "تفعيل"}
                </Btn>
                <Btn small tone="danger" onClick={() => deleteMethod(i)}><Trash2 className="size-3.5" /></Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="fade-up border-brand-gold/30 bg-brand-gold/5 p-5">
        <p className="text-sm leading-6 text-ink/70">
          💡 <b>باقات التوكن والأسعار</b> تُدار من صفحة «الطلبات والتوكن» → تبويب «باقات التوكن».
          أي تعديل هناك يظهر مباشرة في صفحتي الأسعار وشراء التوكن على الموقع.
        </p>
      </Card>
    </div>
  );
}
