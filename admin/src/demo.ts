// ============================================================
// DEMO MODE — sample data so you can explore the dashboard
// before connecting Supabase. Set DEMO_MODE = false in
// src/config.ts once your real database is connected.
// ============================================================

const now = Date.now();
const day = 86400000;
const iso = (d: number) => new Date(d).toISOString();

const profiles = [
  { id: "u1", full_name: "عصام الزناكي", role: "admin", city: "الرباط", tokens_balance: 0, is_banned: false, created_at: iso(now - 40 * day) },
  { id: "u2", full_name: "سارة بناني", role: "expert", city: "الدار البيضاء", tokens_balance: 1250, is_banned: false, created_at: iso(now - 12 * day) },
  { id: "u3", full_name: "يوسف العلوي", role: "expert", city: "مراكش", tokens_balance: 2840, is_banned: false, created_at: iso(now - 9 * day) },
  { id: "u4", full_name: "فاطمة الزهراء", role: "user", city: "فاس", tokens_balance: 45, is_banned: false, created_at: iso(now - 6 * day) },
  { id: "u5", full_name: "محمد أيت العامل", role: "user", city: "أكادير", tokens_balance: 120, is_banned: false, created_at: iso(now - 3 * day) },
  { id: "u6", full_name: "حساب مزعج", role: "user", city: "طنجة", tokens_balance: 0, is_banned: true, created_at: iso(now - 2 * day) },
  { id: "u7", full_name: "نادية شرايبي", role: "user", city: "الرباط", tokens_balance: 300, is_banned: false, created_at: iso(now - 1 * day) },
];

const expert_profiles = [
  { user_id: "u2", title: "محامية بهيئة الدار البيضاء", specialization: "قانون الأعمال والشركات", city: "الدار البيضاء", status: "approved", verified: true, rating: 4.9, answered_count: 214, earned_tokens: 16750, created_at: iso(now - 12 * day), profiles: { full_name: "سارة بناني" } },
  { user_id: "u3", title: "خبير محاسب ومستشار ضريبي", specialization: "الضرائب والمحاسبة", city: "مراكش", status: "approved", verified: true, rating: 4.8, answered_count: 189, earned_tokens: 21100, created_at: iso(now - 9 * day), profiles: { full_name: "يوسف العلوي" } },
  { user_id: "u7", title: "مهندسة معمارية", specialization: "التعمير ورخص البناء", city: "الرباط", status: "pending", verified: false, rating: 0, answered_count: 0, earned_tokens: 0, created_at: iso(now - 1 * day), profiles: { full_name: "نادية شرايبي" } },
];

const questions = [
  { id: "q1", title: "ما الشكل القانوني الأنسب لإطلاق وكالة صغيرة في المغرب؟", body: "أخطط لإطلاق وكالة تسويق رقمي مع شريك واحد. هل الأفضل SARL أم auto-entrepreneur؟ وما التكاليف المتوقعة؟", tokens: 5, status: "published", views: 1240, answers_count: 3, created_at: iso(now - 5 * day), profiles: { full_name: "فاطمة الزهراء" }, categories: { name_ar: "الأعمال والقانون" } },
  { id: "q2", title: "كيف أصرّح بالضريبة على الدخل لعامل مستقل؟", body: "أعمل مستقلًا في البرمجة منذ سنة ولم أصرّح بعد بأي دخل. ما الخطوات وهل هناك غرامات تأخير؟", tokens: 10, status: "published", views: 890, answers_count: 2, created_at: iso(now - 3 * day), profiles: { full_name: "محمد أيت العامل" }, categories: { name_ar: "المال والضرائب" } },
  { id: "q3", title: "هل يمكن فسخ وعد بالبيع بعد دفع العربون؟", body: "وقّعت وعدًا بالبيع لشقة ودفعت عربونًا، لكن البائع تراجع. ما حقوقي؟", tokens: 5, status: "pending", views: 0, answers_count: 0, created_at: iso(now - 0.4 * day), profiles: { full_name: "نادية شرايبي" }, categories: { name_ar: "العقار والسكن" } },
  { id: "q4", title: "سؤال مخالف للشروط", body: "محتوى غير لائق تم رصده...", tokens: 0, status: "rejected", views: 0, answers_count: 0, created_at: iso(now - 1.2 * day), profiles: { full_name: "حساب مزعج" }, categories: { name_ar: "أخرى" } },
];

const answers = [
  { id: "a1", body: "بالنسبة لوكالة يؤسسها شريكان، شركة SARL هي الخيار الأنسب في الغالب: مسؤولية محدودة، رأس مال يبدأ من 10,000 درهم، وإجراءات تأسيس عبر CRI تستغرق أسبوعًا تقريبًا. نظام auto-entrepreneur لا يسمح بالشراكة...", status: "pending", created_at: iso(now - 0.2 * day), profiles: { full_name: "سارة بناني" }, questions: { title: "ما الشكل القانوني الأنسب لإطلاق وكالة صغيرة في المغرب؟" } },
  { id: "a2", body: "التصريح يتم عبر بوابة tax.gov.ma. عليك أولًا الحصول على التعريف الضريبي، ثم إيداع التصريح السنوي قبل نهاية أبريل. غرامة التأخير 15% من الواجب...", status: "pending", created_at: iso(now - 0.1 * day), profiles: { full_name: "يوسف العلوي" }, questions: { title: "كيف أصرّح بالضريبة على الدخل لعامل مستقل؟" } },
];

const conversations = [
  { id: "c1", last_message_at: iso(now - 0.1 * day), user: { full_name: "فاطمة الزهراء" }, expert: { full_name: "سارة بناني" } },
  { id: "c2", last_message_at: iso(now - 0.8 * day), user: { full_name: "محمد أيت العامل" }, expert: { full_name: "يوسف العلوي" } },
];

const messages = [
  { id: "m1", conversation_id: "c1", body: "شكرًا على الجواب المفصل! هل يمكنني طرح سؤال متابعة حول عقد الشراكة؟", sender_id: "u4", created_at: iso(now - 0.15 * day) },
  { id: "m2", conversation_id: "c1", body: "بالطبع، تفضلي. أنصحك بتوثيق اتفاق الشركاء عند موثق حتى لو لم يكن إلزاميًا.", sender_id: "u2", created_at: iso(now - 0.1 * day) },
  { id: "m3", conversation_id: "c2", body: "هل الفاتورات الإلكترونية كافية للتصريح؟", sender_id: "u5", created_at: iso(now - 0.8 * day) },
];

const token_packs = [
  { id: "p1", name_ar: "باقة البداية", name_fr: "Pack Départ", name_en: "Starter Pack", tokens: 100, bonus: 0, price_mad: 99, promo_price_mad: null, promo_ends_at: null, popular: false, active: true, sort: 1 },
  { id: "p2", name_ar: "الباقة الشائعة", name_fr: "Pack Populaire", name_en: "Popular Pack", tokens: 500, bonus: 50, price_mad: 449, promo_price_mad: 399, promo_ends_at: iso(now + 7 * day), popular: true, active: true, sort: 2 },
  { id: "p3", name_ar: "باقة برو", name_fr: "Pack Pro", name_en: "Pro Pack", tokens: 1000, bonus: 100, price_mad: 849, promo_price_mad: null, promo_ends_at: null, popular: false, active: true, sort: 3 },
  { id: "p4", name_ar: "باقة المؤسسات", name_fr: "Entreprise", name_en: "Business", tokens: 5000, bonus: 750, price_mad: 3799, promo_price_mad: null, promo_ends_at: null, popular: false, active: false, sort: 4 },
];

const orders = [
  { id: "o1", tokens: 500, bonus: 50, price_mad: 449, method: "bank_transfer", status: "pending", reference: "VIR-2026-0812", created_at: iso(now - 0.3 * day), profiles: { full_name: "محمد أيت العامل" } },
  { id: "o2", tokens: 100, bonus: 0, price_mad: 99, method: "bank_transfer", status: "paid", reference: "VIR-2026-0798", created_at: iso(now - 2 * day), profiles: { full_name: "فاطمة الزهراء" } },
  { id: "o3", tokens: 1000, bonus: 100, price_mad: 849, method: "cash", status: "cancelled", reference: "", created_at: iso(now - 4 * day), profiles: { full_name: "حساب مزعج" } },
];

const withdrawals = [
  { id: "w1", tokens: 2000, amount_mad: 1000, method: "bank_transfer", payout_details: "RIB: 011 810 0000012345678901 23", status: "pending", created_at: iso(now - 0.5 * day), profiles: { full_name: "يوسف العلوي" } },
  { id: "w2", tokens: 1500, amount_mad: 750, method: "bank_transfer", payout_details: "RIB: 007 640 0000098765432109 87", status: "paid", created_at: iso(now - 6 * day), profiles: { full_name: "سارة بناني" } },
];

const reviews = [
  { id: "r1", rating: 5, comment: "جواب دقيق وواضح، وفّر عليّ استشارة مكتبية كاملة.", created_at: iso(now - 2 * day), expert: { full_name: "سارة بناني" }, reviewer: { full_name: "فاطمة الزهراء" } },
  { id: "r2", rating: 4, comment: "إجابة مفيدة لكن تمنيت تفاصيل أكثر عن الغرامات.", created_at: iso(now - 3 * day), expert: { full_name: "يوسف العلوي" }, reviewer: { full_name: "محمد أيت العامل" } },
];

const reports = [
  { id: "rp1", target_type: "question", reason: "محتوى ترويجي مخالف — إعلان مقنّع في صيغة سؤال", resolved: false, created_at: iso(now - 0.6 * day), reporter: { full_name: "سارة بناني" } },
  { id: "rp2", target_type: "message", reason: "محاولة تواصل خارج المنصة لتفادي العمولة", resolved: true, created_at: iso(now - 5 * day), reporter: { full_name: "يوسف العلوي" } },
];

const settings = [
  { key: "award_per_answer", value: "10" },
  { key: "best_answer_bonus", value: "5" },
  { key: "min_payout_tokens", value: "1000" },
  { key: "token_to_mad", value: "0.5" },
  { key: "maintenance_mode", value: false },
  { key: "content_access_rules", value: {
    guest_hide_full_content: true, answer_unlock_required: true,
    default_answer_unlock_cost: 5, allow_free_questions: true,
    targeting_enabled: true, targeting_requires_paid_question: true,
    audience_min_token_balance: 1, question_preview_chars: 180, answer_preview_chars: 220,
  } },
  { key: "platform_limits", value: {
    questions_per_day: 10, answers_per_hour: 10, support_threads_per_day: 5,
    support_messages_per_hour: 30, private_messages_per_hour: 60, reports_per_day: 10,
    max_open_support_threads: 5,
  } },
  { key: "token_program", value: { mode:"header_only",signup_bonus:100,share_bonus:5,share_daily_limit:1,wallet_enabled:true } },
  { key: "feature_flags", value: { new_questions:true,free_questions:true,paid_questions:true,expert_answers:true,expert_targeting:true,answer_unlocking:true,expert_applications:true,token_purchases:true,withdrawals:true,support_messaging:true,private_messages:true,reviews:true } },
  { key: "maintenance_page", value: { enabled:false,title_ar:"الموقع تحت الصيانة",message_ar:"نعمل على تحسين المنصة. سنعود قريبًا.",title_fr:"Maintenance en cours",message_fr:"Nous serons bientôt de retour.",title_en:"Maintenance",message_en:"We will be back shortly.",expected_return:"" } },
  { key: "moderation_reasons", value: { question:["معلومات غير كافية","سؤال مكرر","محتوى غير مناسب"],answer:["إجابة غير دقيقة","معلومات ناقصة","تخصص غير مطابق"],expert:["وثائق غير مكتملة"],withdrawal:["بيانات التحويل غير صحيحة"] } },
  { key: "expert_audiences", value: [
    { id: "engineers", label_ar: "المهندسون", label_fr: "Ingénieurs", label_en: "Engineers", active: true },
    { id: "diplomats", label_ar: "الدبلوماسيون", label_fr: "Diplomates", label_en: "Diplomats", active: true },
    { id: "teachers", label_ar: "الأساتذة والمعلمون", label_fr: "Enseignants", label_en: "Teachers", active: true },
  ] },
  { key: "page_about", value: { ar:{eyebrow:"من نحن",title:"النصيحة الجيدة للجميع",description:"منصة مغربية للخبرة الموثوقة",mission_title:"مهمتنا",mission_text:"إتاحة الخبرة للجميع",vision_title:"رؤيتنا",vision_text:"قاعدة معرفة وطنية",team_title:"فريقنا",team_description:"فريق مغربي متعدد التخصصات",partners_title:"شركاؤنا"},fr:{eyebrow:"À propos",title:"Le bon conseil pour tous",description:"Une plateforme marocaine",mission_title:"Mission",mission_text:"Rendre le savoir accessible",vision_title:"Vision",vision_text:"Une base nationale",team_title:"Équipe",team_description:"Une équipe marocaine",partners_title:"Partenaires"},en:{eyebrow:"About",title:"Good advice for everyone",description:"A Moroccan knowledge platform",mission_title:"Mission",mission_text:"Make expertise accessible",vision_title:"Vision",vision_text:"A national knowledge base",team_title:"Team",team_description:"A Moroccan team",partners_title:"Partners"},team:[],partners:[] } },
  { key: "site_branding", value: { site_name: "Estichara.ma", logo_url: "", favicon_url: "" } },
  { key: "site_colors", value: { primary: "#0D4B4B", secondary: "#1E8C85", accent: "#D4AF37", muted: "#F2E8D6" } },
  { key: "site_nav", value: [
    { to: "/questions", key: "nav.questions", visible: true },
    { to: "/categories", key: "nav.categories", visible: true },
    { to: "/experts", key: "nav.experts", visible: true },
    { to: "/tokens", key: "tokens.buyTokens", visible: true },
    { to: "/pricing", key: "nav.pricing", visible: true },
    { to: "/about", key: "footer.about", visible: false },
  ] },
  { key: "site_footer", value: [
    { to: "/questions", key: "nav.questions", visible: true },
    { to: "/blog", key: "nav.blog", visible: false },
    { to: "/tokens", key: "tokens.buyTokens", visible: true },
    { to: "/about", key: "footer.about", visible: true },
    { to: "/contact", key: "footer.contact", visible: true },
  ] },
  { key: "payment_methods", value: [
    { id: "card", label: "بطاقة بنكية (CMI)", icon: "CreditCard", active: true },
    { id: "transfer", label: "تحويل بنكي", icon: "Landmark", active: true },
    { id: "cash", label: "كاش بلص / وفاكاش", icon: "Wallet", active: false },
  ] },
];

const TABLES: Record<string, unknown[]> = {
  profiles, expert_profiles, questions, answers, conversations, messages,
  token_packs, orders, withdrawals, reviews, reports, settings,
};

const stats = {
  users: 7, experts: 2, pending_experts: 1,
  questions: 4, pending_questions: 1, pending_answers: 2,
  pending_orders: 1, pending_withdrawals: 1,
  tokens_in_circulation: 4555, revenue_mad: 548,
  signups_14d: Array.from({ length: 14 }, (_, i) => ({
    day: iso(now - (13 - i) * day),
    count: [0, 1, 0, 2, 1, 3, 2, 1, 4, 2, 5, 3, 6, 4][i],
  })),
};

// --- minimal chainable mock of the supabase client ---
function chain(table: string) {
  let rows = [...(TABLES[table] ?? [])];
  const api = {
    select: () => api,
    order: () => api,
    limit: () => api,
    eq: (col: string, val: unknown) => {
      rows = rows.filter((r) => (r as Record<string, unknown>)[col] === val);
      return api;
    },
    in: (col: string, vals: unknown[]) => {
      rows = rows.filter((r) => vals.includes((r as Record<string, unknown>)[col]));
      return api;
    },
    is: () => api,
    single: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    then: (resolve: (v: { data: unknown[]; error: null }) => void) =>
      resolve({ data: rows, error: null }),
  };
  return api;
}

export const demoClient = {
  from: (table: string) => chain(table),
  rpc: (name: string) => ({
    then: (resolve: (v: { data: unknown; error: null }) => void) =>
      resolve({ data: name === "admin_dashboard_stats" ? stats : null, error: null }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: { user: { id: "u1", email: "demo@estichara.ma" } } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as unknown as import("@supabase/supabase-js").SupabaseClient;
