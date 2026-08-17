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
type PayMethod = { id: string; label: string; icon: string; active: boolean; details?: string };
type Branding = { site_name:string;site_name_ar:string;logo_url:string;favicon_url:string;logo_ar_url:string;logo_latin_url:string;logo_width_desktop:number;logo_width_mobile:number;use_image_logo:boolean };
type Colors = { primary: string; secondary: string; accent: string; muted: string };
type AboutLocale = { eyebrow:string;title:string;description:string;mission_title:string;mission_text:string;vision_title:string;vision_text:string;team_title:string;team_description:string;partners_title:string };
type TeamMember = { id:string;name:string;role_ar:string;role_fr:string;role_en:string;image_url:string };
type Partner = { id:string;name:string;logo_url:string;website:string };
type AboutSettings = { ar:AboutLocale;fr:AboutLocale;en:AboutLocale;team:TeamMember[];partners:Partner[] };
const EMPTY_ABOUT_LOCALE:AboutLocale={eyebrow:"",title:"",description:"",mission_title:"",mission_text:"",vision_title:"",vision_text:"",team_title:"",team_description:"",partners_title:""};
const DEFAULT_ABOUT:AboutSettings={ar:{...EMPTY_ABOUT_LOCALE},fr:{...EMPTY_ABOUT_LOCALE},en:{...EMPTY_ABOUT_LOCALE},team:[],partners:[]};

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
  const [branding, setBranding] = useState<Branding>({site_name:"",site_name_ar:"",logo_url:"",favicon_url:"",logo_ar_url:"",logo_latin_url:"",logo_width_desktop:170,logo_width_mobile:120,use_image_logo:true});
  const [colors, setColors] = useState<Colors>({ primary: "#0D4B4B", secondary: "#1E8C85", accent: "#D4AF37", muted: "#F2E8D6" });
  const [nav, setNav] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<NavItem[]>([]);
  const [methods, setMethods] = useState<PayMethod[]>([]);
  const [page404, setPage404] = useState<{ image_url: string }>({ image_url: "" });
  const [about, setAbout] = useState<AboutSettings>(DEFAULT_ABOUT);
  const [aboutLang, setAboutLang] = useState<"ar"|"fr"|"en">("ar");
  const [saved, setSaved] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const logoArRef=useRef<HTMLInputElement>(null);
  const logoLatinRef=useRef<HTMLInputElement>(null);
  const favRef = useRef<HTMLInputElement>(null);
  const img404Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["site_branding", "site_colors", "site_nav", "site_footer", "payment_methods", "page_404", "page_about"])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        if (map.site_branding) {
          const next=map.site_branding as Partial<Branding>;
          setBranding(current=>({...current,...next,site_name_ar:next.site_name_ar??"",logo_ar_url:next.logo_ar_url??"",logo_latin_url:next.logo_latin_url??"",logo_width_desktop:Number(next.logo_width_desktop)||170,logo_width_mobile:Number(next.logo_width_mobile)||120,use_image_logo:next.use_image_logo!==false}));
        }
        if (map.site_colors) setColors(map.site_colors as Colors);
        if (map.site_nav) setNav(map.site_nav as NavItem[]);
        if (map.site_footer) setFooter(map.site_footer as NavItem[]);
        if (map.payment_methods) setMethods(map.payment_methods as PayMethod[]);
        if (map.page_404) setPage404(map.page_404 as { image_url: string });
        if (map.page_about) setAbout({ ...DEFAULT_ABOUT, ...(map.page_about as AboutSettings) });
      });
  }, []);

  async function saveKey(key: string, value: unknown, label: string) {
    const { error } = await supabase.from("settings").update({ value }).eq("key", key);
    if (error) { alert(error.message); return; }
    setSaved(label);
    setTimeout(() => setSaved(""), 2500);
  }

  async function upload(file:File,kind:"logo"|"logoAr"|"logoLatin"|"favicon"|"img404"){
    const path = `${kind}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
    if (error) { alert(error.message); return; }
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    if (kind === "img404") {
      const next = { ...page404, image_url: data.publicUrl };
      setPage404(next);
      await saveKey("page_404", next, "صورة 404");
      return;
    }
    const field=kind==="logo"?"logo_url":kind==="logoAr"?"logo_ar_url":kind==="logoLatin"?"logo_latin_url":"favicon_url";
    const next={...branding,[field]:data.publicUrl};setBranding(next);
    await saveKey("site_branding", next, "الشعار");
  }

  function toggleItem(list: NavItem[], setList: (v: NavItem[]) => void, idx: number) {
    const next = list.map((x, i) => (i === idx ? { ...x, visible: !x.visible } : x));
    setList(next);
  }

  // Payment method editor state (null = closed, -1 = new method)
  const [editingMethod, setEditingMethod] = useState<number | null>(null);
  const [mLabel, setMLabel] = useState("");
  const [mDetails, setMDetails] = useState("");

  function openMethodEditor(i: number) {
    setEditingMethod(i);
    if (i === -1) { setMLabel(""); setMDetails(""); }
    else { setMLabel(methods[i].label); setMDetails(methods[i].details ?? ""); }
  }

  async function saveMethod() {
    if (!mLabel.trim()) { alert("أدخل اسم الوسيلة"); return; }
    let next: PayMethod[];
    if (editingMethod === -1) {
      next = [...methods, { id: `m-${Date.now()}`, label: mLabel.trim(), icon: "CreditCard", active: true, details: mDetails.trim() }];
    } else {
      next = methods.map((m, idx) => (idx === editingMethod ? { ...m, label: mLabel.trim(), details: mDetails.trim() } : m));
    }
    setMethods(next);
    setEditingMethod(null);
    await saveKey("payment_methods", next, "وسائل الدفع");
  }

  async function deleteMethod(i: number) {
    if (!confirm(`حذف «${methods[i].label}»؟`)) return;
    const next = methods.filter((_, idx) => idx !== i);
    setMethods(next);
    await saveKey("payment_methods", next, "وسائل الدفع");
  }

  const aboutCopy=about[aboutLang];
  const roleKey=(`role_${aboutLang}`) as "role_ar"|"role_fr"|"role_en";
  function updateAboutCopy(key:keyof AboutLocale,value:string){setAbout({...about,[aboutLang]:{...aboutCopy,[key]:value}})}
  function addMember(){setAbout({...about,team:[...about.team,{id:`member-${Date.now()}`,name:"",role_ar:"",role_fr:"",role_en:"",image_url:""}]})}
  function addPartner(){setAbout({...about,partners:[...about.partners,{id:`partner-${Date.now()}`,name:"",logo_url:"",website:""}]})}

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
            <label className="text-xs font-semibold text-ink/60">اسم الموقع (فرنسية/إنجليزية)</label>
            <input
              dir="ltr"
              value={branding.site_name}
              onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <label className="mt-3 block text-xs font-semibold text-ink/60">اسم الموقع بالعربية</label>
            <input
              dir="rtl"
              placeholder="استشارة"
              value={branding.site_name_ar}
              onChange={(e) => setBranding({ ...branding, site_name_ar: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
            />
            <p className="mt-1.5 text-[11px] leading-5 text-ink/45">
              يظهر للزوار باللغة العربية — اتركه فارغًا لعرض الاسم اللاتيني للجميع
            </p>
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

      {/* Localized image logos */}
      <Card className="fade-up p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><Image className="size-4.5 text-brand-teal"/> الشعار المصور حسب اللغة</h2><p className="mt-1 text-xs text-ink/50">ارفع صورة عربية وصورة للفرنسية والإنجليزية، أو ارجع إلى الاسم النصي في أي وقت.</p></div><button onClick={()=>setBranding({...branding,use_image_logo:!branding.use_image_logo})} className={`rounded-full px-4 py-2 text-xs font-bold ${branding.use_image_logo?"bg-brand-teal text-white":"bg-ink/7 text-ink/55"}`}>{branding.use_image_logo?"الشعار المصور مفعّل":"الاسم النصي مفعّل"}</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-ink/8 bg-white p-4"><p className="text-xs font-bold">الشعار العربي</p><div className="mt-3 flex min-h-24 items-center justify-center rounded-xl bg-paper/70 p-3">{branding.logo_ar_url?<img src={branding.logo_ar_url} alt="Arabic logo" className="max-h-20 max-w-full object-contain"/>:<span className="text-xs text-ink/35">لم ترفع صورة بعد</span>}</div><div className="mt-3 flex gap-2"><Btn small tone="ghost" onClick={()=>logoArRef.current?.click()}>رفع صورة عربية</Btn>{branding.logo_ar_url&&<Btn small tone="danger" onClick={()=>setBranding({...branding,logo_ar_url:""})}>إزالة</Btn>}</div><input ref={logoArRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],"logoAr")}/></div>
          <div className="rounded-2xl border border-ink/8 bg-white p-4"><p className="text-xs font-bold">شعار الفرنسية والإنجليزية</p><div className="mt-3 flex min-h-24 items-center justify-center rounded-xl bg-paper/70 p-3">{branding.logo_latin_url?<img src={branding.logo_latin_url} alt="Latin logo" className="max-h-20 max-w-full object-contain"/>:<span className="text-xs text-ink/35">لم ترفع صورة بعد</span>}</div><div className="mt-3 flex gap-2"><Btn small tone="ghost" onClick={()=>logoLatinRef.current?.click()}>رفع صورة FR / EN</Btn>{branding.logo_latin_url&&<Btn small tone="danger" onClick={()=>setBranding({...branding,logo_latin_url:""})}>إزالة</Btn>}</div><input ref={logoLatinRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],"logoLatin")}/></div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-xs font-semibold text-ink/60">عرض الشعار على الكمبيوتر: <b>{branding.logo_width_desktop}px</b><input type="range" min="80" max="320" step="5" value={branding.logo_width_desktop} onChange={e=>setBranding({...branding,logo_width_desktop:Number(e.target.value)})} className="mt-2 w-full accent-brand-teal"/></label><label className="text-xs font-semibold text-ink/60">عرض الشعار على الهاتف: <b>{branding.logo_width_mobile}px</b><input type="range" min="60" max="220" step="5" value={branding.logo_width_mobile} onChange={e=>setBranding({...branding,logo_width_mobile:Number(e.target.value)})} className="mt-2 w-full accent-brand-teal"/></label></div>
        <div className="mt-5 border-t border-ink/8 pt-4"><Btn onClick={()=>saveKey("site_branding",branding,"الشعار المصور")}><Save className="size-4"/> حفظ الشعار والمقاسات</Btn></div>
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

      {/* About page CMS */}
      <Card className="fade-up p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><Type className="size-4.5 text-brand-teal"/> تحرير صفحة من نحن</h2><p className="mt-1 text-xs text-ink/50">تحكم في كل النصوص والفريق والشركاء بثلاث لغات</p></div><Btn onClick={()=>saveKey("page_about",about,"صفحة من نحن")}><Save className="size-4"/> حفظ الصفحة كاملة</Btn></div>
        <div className="mt-5 flex gap-2">{([['ar','العربية'],['fr','Français'],['en','English']] as const).map(([id,label])=><button key={id} onClick={()=>setAboutLang(id)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${aboutLang===id?"bg-brand-dark text-white":"bg-ink/5 text-ink/55"}`}>{label}</button>)}</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AboutField label="النص الصغير أعلى الصفحة" value={aboutCopy.eyebrow} onChange={v=>updateAboutCopy('eyebrow',v)}/><AboutField label="العنوان الرئيسي" value={aboutCopy.title} onChange={v=>updateAboutCopy('title',v)}/>
          <AboutArea label="وصف الصفحة" value={aboutCopy.description} onChange={v=>updateAboutCopy('description',v)}/><div/>
          <AboutField label="عنوان المهمة" value={aboutCopy.mission_title} onChange={v=>updateAboutCopy('mission_title',v)}/><AboutField label="عنوان الرؤية" value={aboutCopy.vision_title} onChange={v=>updateAboutCopy('vision_title',v)}/>
          <AboutArea label="نص المهمة" value={aboutCopy.mission_text} onChange={v=>updateAboutCopy('mission_text',v)}/><AboutArea label="نص الرؤية" value={aboutCopy.vision_text} onChange={v=>updateAboutCopy('vision_text',v)}/>
          <AboutField label="عنوان قسم الفريق" value={aboutCopy.team_title} onChange={v=>updateAboutCopy('team_title',v)}/><AboutField label="عنوان قسم الشركاء" value={aboutCopy.partners_title} onChange={v=>updateAboutCopy('partners_title',v)}/>
          <AboutArea label="وصف الفريق" value={aboutCopy.team_description} onChange={v=>updateAboutCopy('team_description',v)}/>
        </div>
        <div className="mt-7 border-t border-ink/8 pt-6"><div className="flex items-center justify-between"><div><h3 className="font-bold">أعضاء الفريق</h3><p className="text-xs text-ink/45">الاسم والصورة مشتركان، والدور مترجم حسب اللغة المختارة</p></div><Btn small tone="ghost" onClick={addMember}><Plus className="size-3.5"/> عضو</Btn></div><div className="mt-4 grid gap-3 md:grid-cols-2">{about.team.map((member,index)=><div key={member.id} className="rounded-2xl border border-ink/8 bg-white p-4"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-dark text-xs font-bold text-white">{member.image_url?<img src={member.image_url} alt="" className="size-full object-cover"/>:(member.name||'?').split(' ').map(x=>x[0]).slice(0,2).join('')}</span><div className="min-w-0 flex-1 space-y-2"><input value={member.name} onChange={e=>setAbout({...about,team:about.team.map((m,i)=>i===index?{...m,name:e.target.value}:m)})} placeholder="الاسم الكامل" className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm"/><input value={member[roleKey]} onChange={e=>setAbout({...about,team:about.team.map((m,i)=>i===index?{...m,[roleKey]:e.target.value}:m)})} placeholder="الدور في اللغة المختارة" className="w-full rounded-lg border border-ink/10 px-3 py-2 text-sm"/><input dir="ltr" value={member.image_url} onChange={e=>setAbout({...about,team:about.team.map((m,i)=>i===index?{...m,image_url:e.target.value}:m)})} placeholder="رابط الصورة (اختياري)" className="w-full rounded-lg border border-ink/10 px-3 py-2 text-xs"/></div><button onClick={()=>setAbout({...about,team:about.team.filter((_,i)=>i!==index)})} className="self-start rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="size-4"/></button></div></div>)}</div></div>
        <div className="mt-7 border-t border-ink/8 pt-6"><div className="flex items-center justify-between"><h3 className="font-bold">الشركاء والمؤسسات</h3><Btn small tone="ghost" onClick={addPartner}><Plus className="size-3.5"/> شريك</Btn></div><div className="mt-4 grid gap-3 md:grid-cols-2">{about.partners.map((partner,index)=><div key={partner.id} className="flex gap-2 rounded-xl bg-white p-3"><div className="grid flex-1 gap-2"><input value={partner.name} onChange={e=>setAbout({...about,partners:about.partners.map((p,i)=>i===index?{...p,name:e.target.value}:p)})} placeholder="اسم الشريك" className="rounded-lg border border-ink/10 px-3 py-2 text-sm"/><input dir="ltr" value={partner.logo_url} onChange={e=>setAbout({...about,partners:about.partners.map((p,i)=>i===index?{...p,logo_url:e.target.value}:p)})} placeholder="رابط الشعار" className="rounded-lg border border-ink/10 px-3 py-2 text-xs"/><input dir="ltr" value={partner.website} onChange={e=>setAbout({...about,partners:about.partners.map((p,i)=>i===index?{...p,website:e.target.value}:p)})} placeholder="رابط الموقع" className="rounded-lg border border-ink/10 px-3 py-2 text-xs"/></div><button onClick={()=>setAbout({...about,partners:about.partners.filter((_,i)=>i!==index)})} className="self-start rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="size-4"/></button></div>)}</div></div>
      </Card>

      {/* 404 page */}
      <Card className="fade-up p-6">
        <h2 className="flex items-center gap-2 font-bold"><Image className="size-4.5 text-brand-teal" /> صفحة 404</h2>
        <p className="mt-1 text-xs text-ink/50">الصورة التي تظهر عندما يفتح زائر رابطًا غير موجود — اتركها فارغة لعرض تصميم 404 الافتراضي الأنيق</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {page404.image_url ? (
            <img src={page404.image_url} alt="404" className="h-24 w-auto rounded-xl border border-ink/10 object-contain" />
          ) : (
            <span className="grid h-24 w-36 place-items-center rounded-xl bg-ink/5 text-3xl font-bold text-ink/25">404</span>
          )}
          <div className="flex gap-2">
            <Btn small tone="ghost" onClick={() => img404Ref.current?.click()}>رفع صورة</Btn>
            {page404.image_url && (
              <Btn small tone="danger" onClick={async () => {
                const next = { ...page404, image_url: "" };
                setPage404(next);
                await saveKey("page_404", next, "صورة 404");
              }}>إزالة</Btn>
            )}
          </div>
          <input ref={img404Ref} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "img404")} />
        </div>
      </Card>

      {/* Payment methods */}
      <Card className="fade-up p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><Wallet className="size-4.5 text-brand-teal" /> وسائل الدفع</h2>
          <Btn small onClick={() => openMethodEditor(-1)}><Plus className="size-3.5" /> إضافة وسيلة</Btn>
        </div>
        <p className="mt-1 text-xs text-ink/50">تظهر في صفحة شراء التوكن — أضف التفاصيل (RIB، اسم البنك…) ليعرف المستخدم كيف يدفع</p>
        <div className="mt-4 space-y-2">
          {methods.length === 0 && <Empty text="لا توجد وسائل دفع — أضف أول وسيلة" />}
          {methods.map((m, i) => (
            <div key={m.id} className="rounded-xl bg-ink/4 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`size-2.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-ink/20"}`} />
                  <span className={`text-sm font-medium ${m.active ? "" : "text-ink/40"}`}>{m.label}</span>
                  {!m.details && m.active && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">بدون تفاصيل دفع</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Btn small tone="ghost" onClick={() => openMethodEditor(i)}>تعديل</Btn>
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
              {m.details && (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white/70 p-2.5 text-xs leading-5 text-ink/60" dir="auto">
                  {m.details}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Method editor */}
        {editingMethod !== null && (
          <div className="mt-4 rounded-2xl border-2 border-brand-teal/30 bg-white p-5">
            <h3 className="font-bold">{editingMethod === -1 ? "وسيلة دفع جديدة" : "تعديل وسيلة الدفع"}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink/60">الاسم (كما يظهر للمستخدم)</label>
                <input
                  value={mLabel}
                  onChange={(e) => setMLabel(e.target.value)}
                  placeholder="مثال: تحويل بنكي — التجاري وفا بنك"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">تفاصيل الدفع (تظهر للمستخدم عند اختيار هذه الوسيلة وبعد إنشاء الطلب)</label>
                <textarea
                  value={mDetails}
                  onChange={(e) => setMDetails(e.target.value)}
                  rows={5}
                  placeholder={"مثال:\nالبنك: التجاري وفا بنك\nالاسم: ESTICHARA SARL\nRIB: 007 640 0001234567890123 45\nأرسل وصل التحويل عبر واتساب: 06XXXXXXXX"}
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-teal"
                />
              </div>
              <div className="flex gap-2">
                <Btn onClick={saveMethod}><Save className="size-4" /> حفظ الوسيلة</Btn>
                <Btn tone="ghost" onClick={() => setEditingMethod(null)}>إلغاء</Btn>
              </div>
            </div>
          </div>
        )}
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

function AboutField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){
  return <label className="text-xs font-semibold text-ink/60">{label}<input value={value} onChange={e=>onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"/></label>;
}
function AboutArea({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){
  return <label className="text-xs font-semibold text-ink/60">{label}<textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-brand-teal"/></label>;
}
