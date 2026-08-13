import { useLocale } from "@/i18n/use-locale";

type DeepWiden<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends readonly (infer U)[]
      ? readonly DeepWiden<U>[]
      : T extends object
        ? { [K in keyof T]: DeepWiden<T[K]> }
        : T;

const en = {
  theme: { light: "Use light theme", dark: "Use dark theme" },
  about: {
    eyebrow: "About",
    title: "Good advice should not depend on who you know",
    description:
      "Estichara turns scattered expertise into an accessible, verified and fairly rewarded knowledge marketplace for everyone in Morocco.",
    missionTitle: "Our mission",
    missionText:
      "Give every person in Morocco direct access to a qualified answer without relying on a personal contact or an appointment they cannot afford.",
    visionTitle: "Our vision",
    visionText:
      "Build a national knowledge base written by practitioners, where every useful answer keeps helping people long after it is published.",
    teamTitle: "The people building Estichara",
    teamDescription:
      "A Moroccan team combining product, trust, engineering and expert relations.",
    teamRoles: [
      "Co-founder & CEO",
      "Co-founder & Head of Trust",
      "Engineering",
      "Expert relations",
    ],
    partnersTitle: "Working with trusted institutions",
    partners: [
      "Casablanca Bar Association",
      "Moroccan Medical Council",
      "Startup Maroc",
      "CMI",
    ],
  },
  ask: {
    eyebrow: "Ask",
    title: "Describe your situation clearly",
    description:
      "The right context helps the right expert answer faster. Add the facts, what you tried, and the outcome you need.",
    titleLabel: "Question title",
    titlePlaceholder: "How do I register as a freelancer with CNSS?",
    suggestion:
      "Tip: include your city and your current legal or professional status.",
    detailsLabel: "Details",
    detailsPlaceholder:
      "Explain your situation, what you already tried, and what outcome you need.",
    category: "Category",
    selectCategory: "Select a category",
    visibility: "Visibility",
    public: "Public",
    private: "Private premium",
    answerPrice: "Answer reward",
    free: "Free",
    custom: "Custom",
    attach: "Attach images or a PDF (maximum 10 MB)",
    assistant:
      "The assistant checks for duplicates, suggests a category, and recommends experts before publishing.",
    beta: "Beta",
    publish: "Publish question",
    validationTitle: "Give your question at least 15 characters of context",
    validationBody: "Add more detail so experts can answer precisely",
    validationCategory: "Choose a category",
    validationGeneric: "Please check the form",
    success: "Question ready to publish",
    successDescription: "Connect the backend to save it and charge tokens.",
  },
  becomeExpert: {
    eyebrow: "Experts",
    title: "Turn what you know into meaningful income",
    description:
      "Answer between appointments, build a verified reputation, and earn rewards for every approved contribution.",
    start: "Start your application",
    step: "Step {{number}}",
    steps: [
      {
        title: "Create your profile",
        text: "Add your profession, specialty, city, and biography.",
      },
      {
        title: "Upload documents",
        text: "Provide your identity, diplomas, certificates, and résumé.",
      },
      {
        title: "Human review",
        text: "A trust specialist reviews every document within 72 hours.",
      },
      {
        title: "Get verified",
        text: "Your professional badge unlocks premium opportunities.",
      },
    ],
  },
  blog: {
    eyebrow: "Insights",
    title: "Practical guides written with people who know",
    description:
      "Clear, locally relevant explanations reviewed with verified Moroccan professionals.",
    read: "Read guide",
    posts: [
      {
        title: "The complete 2026 guide to auto-entrepreneur status",
        category: "Administration",
        excerpt:
          "Thresholds, taxes, CNSS coverage, and the forms a Moroccan freelancer needs before registering.",
        date: "August 4, 2026",
      },
      {
        title: "How to read a Moroccan employment contract before signing",
        category: "Legal",
        excerpt:
          "Trial periods, non-compete clauses, and notice periods explained without legal jargon.",
        date: "July 22, 2026",
      },
      {
        title: "Melkia and titre foncier, explained simply",
        category: "Real estate",
        excerpt:
          "Why the same apartment can cost less and what ownership protection you are actually buying.",
        date: "July 9, 2026",
      },
      {
        title: "How Schengen refusal codes actually work",
        category: "Immigration",
        excerpt:
          "Understand codes 2, 3, and 9 and the difference between an appeal and a new application.",
        date: "June 28, 2026",
      },
    ],
  },
  categories: {
    eyebrow: "Categories",
    title: "Every question has the right place",
    description:
      "Explore twenty areas covering the questions Moroccans ask in everyday life and work.",
    questions: "{{count}} questions",
    answers: "{{count}} answers",
    experts: "{{count}} experts available",
  },
  contact: {
    eyebrow: "Support",
    title: "We are here when you need us",
    description:
      "Help with tokens, payouts, verification, partnerships, and your account.",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send message",
    support: "General and billing support",
    liveChat: "Live chat",
    liveChatHours: "Monday–Friday, 09:00–18:00",
    office: "Casablanca office",
    before: "Answers before you write",
    validationName: "Please enter your name",
    validationEmail: "Enter a valid email address",
    validationMessage: "Tell us a little more",
    validationGeneric: "Please check the form",
    success: "Message ready to send",
    successDescription: "Connect the backend to deliver it to support.",
  },
  experts: {
    eyebrow: "Experts",
    title: "Real people with proven experience",
    description:
      "Doctors, lawyers, accountants, consultants, and practitioners verified against real credentials.",
    search: "Search by name, profession, or city…",
    all: "All",
    verifiedOnly: "Verified only",
    empty: "No experts match your search.",
  },
  expert: {
    notFound: "Expert not found",
    back: "Back to the directory",
    loadError: "This profile could not be loaded",
    verifiedLevel: "Verified professional",
    pending: "Verification pending",
    contact: "Contact for 10 tokens",
    ask: "Ask this expert",
    rating: "Rating",
    answersDelivered: "Answers delivered",
    tokensEarned: "Tokens earned",
    responseTime: "Response time",
    biography: "Biography",
    recentAnswers: "Recent answers",
    reviews: "Reviews",
    certificates: "Verified credentials",
    certificateItems: [
      "State diploma verified",
      "Professional registration checked",
      "Identity document verified",
    ],
    achievements: "Achievements",
    achievementItems: [
      "Top contributor 2026",
      "100-answer milestone",
      "Twelve five-star reviews in a row",
    ],
    reviewItems: [
      "Clear, structured, and referenced. It saved me two trips to the administration.",
      "Answered quickly and followed up on my second question without an extra charge.",
    ],
  },
  questions: {
    eyebrow: "Questions",
    title: "What Morocco is asking right now",
    description:
      "Preview useful answers for free and unlock the complete response only when it matters.",
    search: "Search questions, tags, and keywords…",
    filters: {
      newest: "Newest",
      trending: "Trending",
      mostAnswered: "Most answered",
      premium: "Premium",
      unresolved: "Unresolved",
    },
    empty: "No questions match this filter yet.",
    showing: "Showing {{visible}} of {{total}} questions",
  },
  question: {
    notFound: "This question no longer exists",
    back: "Browse questions",
    loadError: "This question could not be loaded",
    premium: "Premium",
    free: "Free",
    answers: "{{count}} answers",
    reviews: "{{count}} reviews",
    unlockTitle: "Unlock the complete answer for {{count}} tokens",
    unlockText:
      "One-time unlock. The answer stays in your account permanently.",
    unlock: "Unlock answer",
    buy: "Buy tokens",
    knowledge: "Knowledge",
    clarity: "Clarity",
    helpfulness: "Helpfulness",
    speed: "Speed",
    related: "Related questions",
    recommended: "Recommended experts",
    lockedSample:
      "The complete answer explains every administrative step, the exact documents to bring, the correct office, and the expected delays. It also covers common mistakes and includes useful legal references.",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "One flexible currency. No subscription.",
    description:
      "Buy tokens once and use them only for the answers and expert access you choose.",
    spendTitle: "What you spend",
    earnTitle: "How experts earn",
    payoutsTitle: "How payouts work",
    payoutsText:
      "When an expert reaches the payout threshold, they can request a withdrawal. Every request is reviewed and every wallet movement remains visible.",
    spend: [
      ["Ask a free public question", "0 tokens"],
      ["Ask a premium question", "5–20 tokens"],
      ["Unlock a complete answer", "5 tokens average"],
      ["Contact an expert privately", "10 tokens"],
    ],
    earn: [
      ["Approved answer", "+8 tokens"],
      ["Selected as best answer", "+15 bonus"],
      ["Monthly top contributor", "+250 tokens"],
      ["Referral signup", "+50 tokens"],
    ],
    packs: "Token packs",
    shop: "Go to token shop",
    faq: "Frequently asked questions",
  },
  tokens: {
    eyebrow: "Token shop",
    title: "Buy once. Use tokens where they matter.",
    description:
      "Tokens never expire. Use them for premium questions, complete answers, or private expert access.",
    mostPopular: "Most popular",
    perToken: "{{value}} MAD per token",
    neverExpires: "Never expires",
    invoice: "Invoice included",
    bonus: "+{{count}} bonus tokens",
    buy: "Buy {{name}}",
    paymentMethods: "Payment methods",
    custom: "Need custom volume for your company or association?",
    talk: "Talk to us",
    methods: [
      "Credit card",
      "Stripe",
      "PayPal",
      "Moroccan gateway (CMI)",
      "Bank transfer",
    ],
  },
} as const;

export type PageCopy = DeepWiden<typeof en>;

const fr: PageCopy = {
  theme: { light: "Utiliser le thème clair", dark: "Utiliser le thème sombre" },
  about: {
    eyebrow: "À propos",
    title: "Un bon conseil ne devrait pas dépendre de vos relations",
    description:
      "Estichara rend l'expertise accessible, vérifiée et justement récompensée partout au Maroc.",
    missionTitle: "Notre mission",
    missionText:
      "Donner à chaque personne au Maroc un accès direct à une réponse qualifiée, sans dépendre d'un contact personnel ou d'un rendez-vous inaccessible.",
    visionTitle: "Notre vision",
    visionText:
      "Construire une base de connaissances nationale écrite par des praticiens, où chaque réponse utile continue d'aider après sa publication.",
    teamTitle: "L'équipe qui construit Estichara",
    teamDescription:
      "Une équipe marocaine réunissant produit, confiance, ingénierie et relations experts.",
    teamRoles: [
      "Cofondateur et CEO",
      "Cofondatrice et responsable confiance",
      "Ingénierie",
      "Relations experts",
    ],
    partnersTitle: "Avec des institutions de confiance",
    partners: [
      "Barreau de Casablanca",
      "Conseil médical marocain",
      "Startup Maroc",
      "CMI",
    ],
  },
  ask: {
    eyebrow: "Poser une question",
    title: "Décrivez clairement votre situation",
    description:
      "Un bon contexte permet au bon expert de répondre plus vite. Ajoutez les faits, vos démarches et le résultat attendu.",
    titleLabel: "Titre de la question",
    titlePlaceholder: "Comment m'inscrire à la CNSS comme freelance ?",
    suggestion:
      "Conseil : indiquez votre ville et votre statut juridique ou professionnel actuel.",
    detailsLabel: "Détails",
    detailsPlaceholder:
      "Expliquez votre situation, ce que vous avez déjà essayé et le résultat souhaité.",
    category: "Catégorie",
    selectCategory: "Choisissez une catégorie",
    visibility: "Visibilité",
    public: "Publique",
    private: "Privée premium",
    answerPrice: "Récompense de la réponse",
    free: "Gratuit",
    custom: "Personnalisé",
    attach: "Joindre des images ou un PDF (10 Mo maximum)",
    assistant:
      "L'assistant recherche les doublons, suggère une catégorie et recommande des experts avant la publication.",
    beta: "Bêta",
    publish: "Publier la question",
    validationTitle: "Ajoutez au moins 15 caractères de contexte",
    validationBody: "Ajoutez plus de détails pour obtenir une réponse précise",
    validationCategory: "Choisissez une catégorie",
    validationGeneric: "Vérifiez le formulaire",
    success: "Question prête à être publiée",
    successDescription:
      "Connectez le backend pour l'enregistrer et facturer les jetons.",
  },
  becomeExpert: {
    eyebrow: "Experts",
    title: "Transformez vos connaissances en revenu utile",
    description:
      "Répondez entre deux rendez-vous, développez une réputation vérifiée et soyez récompensé pour vos contributions.",
    start: "Commencer ma candidature",
    step: "Étape {{number}}",
    steps: [
      {
        title: "Créez votre profil",
        text: "Ajoutez votre profession, spécialité, ville et biographie.",
      },
      {
        title: "Ajoutez vos documents",
        text: "Fournissez votre identité, diplômes, certificats et CV.",
      },
      {
        title: "Vérification humaine",
        text: "Un spécialiste examine chaque document sous 72 heures.",
      },
      {
        title: "Obtenez votre badge",
        text: "Votre badge professionnel ouvre les questions premium.",
      },
    ],
  },
  blog: {
    eyebrow: "Conseils",
    title: "Des guides pratiques écrits avec ceux qui savent",
    description:
      "Des explications claires et locales, relues avec des professionnels marocains vérifiés.",
    read: "Lire le guide",
    posts: [
      {
        title: "Le guide complet 2026 du statut d'auto-entrepreneur",
        category: "Administration",
        excerpt:
          "Seuils, impôts, couverture CNSS et formulaires à connaître avant de s'inscrire.",
        date: "4 août 2026",
      },
      {
        title: "Lire un contrat de travail marocain avant de signer",
        category: "Droit",
        excerpt:
          "Période d'essai, non-concurrence et préavis expliqués sans jargon.",
        date: "22 juillet 2026",
      },
      {
        title: "Melkia et titre foncier, simplement expliqués",
        category: "Immobilier",
        excerpt:
          "Pourquoi le même appartement peut coûter moins cher et quelle protection vous achetez.",
        date: "9 juillet 2026",
      },
      {
        title: "Comprendre les codes de refus Schengen",
        category: "Immigration",
        excerpt:
          "Les codes 2, 3 et 9, ainsi que la différence entre recours et nouvelle demande.",
        date: "28 juin 2026",
      },
    ],
  },
  categories: {
    eyebrow: "Catégories",
    title: "Chaque question a sa place",
    description:
      "Explorez vingt domaines couvrant les questions des Marocains dans leur vie et leur travail.",
    questions: "{{count}} questions",
    answers: "{{count}} réponses",
    experts: "{{count}} experts disponibles",
  },
  contact: {
    eyebrow: "Assistance",
    title: "Nous sommes là quand vous en avez besoin",
    description:
      "Aide pour les jetons, paiements, vérification, partenariats et votre compte.",
    name: "Nom",
    email: "E-mail",
    message: "Message",
    send: "Envoyer le message",
    support: "Assistance générale et facturation",
    liveChat: "Chat en direct",
    liveChatHours: "Lundi–vendredi, 09:00–18:00",
    office: "Bureau de Casablanca",
    before: "Des réponses avant de nous écrire",
    validationName: "Saisissez votre nom",
    validationEmail: "Saisissez une adresse e-mail valide",
    validationMessage: "Donnez-nous un peu plus de détails",
    validationGeneric: "Vérifiez le formulaire",
    success: "Message prêt à être envoyé",
    successDescription: "Connectez le backend pour le transmettre au support.",
  },
  experts: {
    eyebrow: "Experts",
    title: "De vraies personnes, une expérience prouvée",
    description:
      "Médecins, avocats, comptables, consultants et praticiens vérifiés à partir de leurs justificatifs.",
    search: "Rechercher par nom, profession ou ville…",
    all: "Tous",
    verifiedOnly: "Experts vérifiés",
    empty: "Aucun expert ne correspond à votre recherche.",
  },
  expert: {
    notFound: "Expert introuvable",
    back: "Retour à l'annuaire",
    loadError: "Impossible de charger ce profil",
    verifiedLevel: "Professionnel vérifié",
    pending: "Vérification en cours",
    contact: "Contacter pour 10 jetons",
    ask: "Poser une question à cet expert",
    rating: "Note",
    answersDelivered: "Réponses publiées",
    tokensEarned: "Jetons gagnés",
    responseTime: "Délai de réponse",
    biography: "Biographie",
    recentAnswers: "Réponses récentes",
    reviews: "Avis",
    certificates: "Qualifications vérifiées",
    certificateItems: [
      "Diplôme d'État vérifié",
      "Inscription professionnelle contrôlée",
      "Pièce d'identité vérifiée",
    ],
    achievements: "Réalisations",
    achievementItems: [
      "Meilleur contributeur 2026",
      "Cap des 100 réponses",
      "Douze avis cinq étoiles consécutifs",
    ],
    reviewItems: [
      "Clair, structuré et référencé. Cela m'a évité deux déplacements.",
      "Réponse rapide avec un suivi sans coût supplémentaire.",
    ],
  },
  questions: {
    eyebrow: "Questions",
    title: "Ce que le Maroc demande aujourd'hui",
    description:
      "Consultez gratuitement les aperçus et débloquez la réponse complète uniquement lorsqu'elle compte.",
    search: "Rechercher des questions, mots-clés et tags…",
    filters: {
      newest: "Plus récentes",
      trending: "Tendances",
      mostAnswered: "Plus de réponses",
      premium: "Premium",
      unresolved: "Sans solution",
    },
    empty: "Aucune question ne correspond à ce filtre.",
    showing: "{{visible}} questions affichées sur {{total}}",
  },
  question: {
    notFound: "Cette question n'existe plus",
    back: "Parcourir les questions",
    loadError: "Impossible de charger cette question",
    premium: "Premium",
    free: "Gratuit",
    answers: "{{count}} réponses",
    reviews: "{{count}} avis",
    unlockTitle: "Débloquer la réponse complète pour {{count}} jetons",
    unlockText:
      "Déblocage unique. La réponse reste définitivement dans votre compte.",
    unlock: "Débloquer la réponse",
    buy: "Acheter des jetons",
    knowledge: "Connaissances",
    clarity: "Clarté",
    helpfulness: "Utilité",
    speed: "Rapidité",
    related: "Questions similaires",
    recommended: "Experts recommandés",
    lockedSample:
      "La réponse complète détaille chaque étape, les documents exacts, le bon service et les délais à prévoir. Elle couvre également les erreurs fréquentes et les références utiles.",
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Une monnaie flexible. Aucun abonnement.",
    description:
      "Achetez des jetons une fois et utilisez-les uniquement pour les réponses et experts que vous choisissez.",
    spendTitle: "Ce que vous dépensez",
    earnTitle: "Comment gagnent les experts",
    payoutsTitle: "Comment fonctionnent les retraits",
    payoutsText:
      "Lorsqu'un expert atteint le seuil, il peut demander un retrait. Chaque demande est examinée et tous les mouvements restent visibles.",
    spend: [
      ["Poser une question publique", "0 jeton"],
      ["Poser une question premium", "5–20 jetons"],
      ["Débloquer une réponse", "5 jetons en moyenne"],
      ["Contacter un expert en privé", "10 jetons"],
    ],
    earn: [
      ["Réponse approuvée", "+8 jetons"],
      ["Meilleure réponse", "+15 bonus"],
      ["Meilleur contributeur du mois", "+250 jetons"],
      ["Inscription par parrainage", "+50 jetons"],
    ],
    packs: "Packs de jetons",
    shop: "Accéder à la boutique",
    faq: "Questions fréquentes",
  },
  tokens: {
    eyebrow: "Boutique de jetons",
    title: "Achetez une fois. Utilisez vos jetons quand ils comptent.",
    description:
      "Les jetons n'expirent jamais. Utilisez-les pour les questions premium, les réponses complètes ou un contact privé.",
    mostPopular: "Le plus populaire",
    perToken: "{{value}} MAD par jeton",
    neverExpires: "N'expire jamais",
    invoice: "Facture incluse",
    bonus: "+{{count}} jetons bonus",
    buy: "Acheter {{name}}",
    paymentMethods: "Moyens de paiement",
    custom:
      "Besoin d'un volume personnalisé pour votre entreprise ou association ?",
    talk: "Parlez-nous",
    methods: [
      "Carte bancaire",
      "Stripe",
      "PayPal",
      "Passerelle marocaine (CMI)",
      "Virement bancaire",
    ],
  },
};

const ar: PageCopy = {
  theme: { light: "استخدام الوضع الفاتح", dark: "استخدام الوضع الداكن" },
  about: {
    eyebrow: "من نحن",
    title: "النصيحة الجيدة لا ينبغي أن تعتمد على معارفك",
    description:
      "تحول استشارة الخبرات المتفرقة إلى سوق معرفية متاحة وموثوقة ومنصفة للجميع في المغرب.",
    missionTitle: "مهمتنا",
    missionText:
      "تمكين كل شخص في المغرب من الوصول المباشر إلى إجابة مؤهلة، من دون الاعتماد على علاقة شخصية أو موعد لا يستطيع تحمل تكلفته.",
    visionTitle: "رؤيتنا",
    visionText:
      "بناء قاعدة معرفة وطنية يكتبها الممارسون، بحيث تواصل كل إجابة مفيدة مساعدة الناس بعد نشرها.",
    teamTitle: "الفريق الذي يبني استشارة",
    teamDescription:
      "فريق مغربي يجمع بين المنتج والثقة والهندسة وعلاقات الخبراء.",
    teamRoles: [
      "شريك مؤسس ومدير تنفيذي",
      "شريكة مؤسسة ومسؤولة الثقة",
      "الهندسة",
      "علاقات الخبراء",
    ],
    partnersTitle: "نتعاون مع مؤسسات موثوقة",
    partners: [
      "هيئة المحامين بالدار البيضاء",
      "المجلس الطبي المغربي",
      "Startup Maroc",
      "CMI",
    ],
  },
  ask: {
    eyebrow: "اطرح سؤالًا",
    title: "اشرح وضعك بوضوح",
    description:
      "يساعد السياق الجيد الخبير المناسب على الإجابة بسرعة. أضف الوقائع وما جرّبته والنتيجة التي تحتاج إليها.",
    titleLabel: "عنوان السؤال",
    titlePlaceholder: "كيف أسجل كمستقل في الصندوق الوطني للضمان الاجتماعي؟",
    suggestion: "نصيحة: أضف مدينتك ووضعك القانوني أو المهني الحالي.",
    detailsLabel: "التفاصيل",
    detailsPlaceholder:
      "اشرح وضعك وما جرّبته من قبل والنتيجة التي تحتاج إليها.",
    category: "التصنيف",
    selectCategory: "اختر تصنيفًا",
    visibility: "الظهور",
    public: "عام",
    private: "خاص ومميّز",
    answerPrice: "مكافأة الإجابة",
    free: "مجاني",
    custom: "مخصص",
    attach: "أرفق صورًا أو ملف PDF بحد أقصى 10 ميغابايت",
    assistant:
      "يتحقق المساعد من الأسئلة المتشابهة ويقترح تصنيفًا وخبراء مناسبين قبل النشر.",
    beta: "تجريبي",
    publish: "نشر السؤال",
    validationTitle: "أضف 15 حرفًا على الأقل لتوضيح سؤالك",
    validationBody: "أضف تفاصيل أكثر حتى يتمكن الخبراء من الإجابة بدقة",
    validationCategory: "اختر تصنيفًا",
    validationGeneric: "تحقق من معلومات النموذج",
    success: "السؤال جاهز للنشر",
    successDescription: "اربط الواجهة بالخادم لحفظ السؤال وخصم الرموز.",
  },
  becomeExpert: {
    eyebrow: "الخبراء",
    title: "حوّل معرفتك إلى دخل ذي قيمة",
    description:
      "أجب بين مواعيدك، وابنِ سمعة مهنية موثّقة، واحصل على مكافآت مقابل مساهماتك المفيدة.",
    start: "ابدأ طلب الانضمام",
    step: "الخطوة {{number}}",
    steps: [
      { title: "أنشئ ملفك المهني", text: "أضف مهنتك وتخصصك ومدينتك ونبذتك." },
      {
        title: "ارفع وثائقك",
        text: "أضف وثيقة الهوية والدبلومات والشهادات والسيرة.",
      },
      {
        title: "مراجعة بشرية",
        text: "يراجع مختص الثقة كل وثيقة خلال 72 ساعة.",
      },
      {
        title: "احصل على التوثيق",
        text: "تفتح شارتك المهنية فرص الإجابة عن الأسئلة المميّزة.",
      },
    ],
  },
  blog: {
    eyebrow: "معرفة عملية",
    title: "أدلة عملية مكتوبة مع أهل الخبرة",
    description:
      "شروحات واضحة ومرتبطة بالواقع المغربي، يراجعها مهنيون موثّقون.",
    read: "قراءة الدليل",
    posts: [
      {
        title: "الدليل الكامل لنظام المقاول الذاتي في 2026",
        category: "الإدارة",
        excerpt:
          "السقوف والضرائب وتغطية الضمان الاجتماعي والنماذج التي يحتاج إليها المستقل قبل التسجيل.",
        date: "4 غشت 2026",
      },
      {
        title: "كيف تقرأ عقد شغل مغربي قبل التوقيع؟",
        category: "القانون",
        excerpt:
          "فترة التجربة وعدم المنافسة والإشعار، بشرح واضح ومن دون تعقيد قانوني.",
        date: "22 يوليوز 2026",
      },
      {
        title: "الملكية والرسم العقاري بشرح مبسط",
        category: "العقارات",
        excerpt:
          "لماذا قد تكون الشقة نفسها أرخص، وما الحماية القانونية التي تشتريها فعلًا؟",
        date: "9 يوليوز 2026",
      },
      {
        title: "كيف تعمل رموز رفض تأشيرة شنغن؟",
        category: "الهجرة",
        excerpt: "فهم الرموز 2 و3 و9 والفرق بين الطعن وإيداع طلب جديد.",
        date: "28 يونيو 2026",
      },
    ],
  },
  categories: {
    eyebrow: "التصنيفات",
    title: "لكل سؤال مكانه المناسب",
    description: "استكشف عشرين مجالًا تغطي أسئلة المغاربة في حياتهم وعملهم.",
    questions: "{{count}} سؤالًا",
    answers: "{{count}} إجابة",
    experts: "{{count}} خبيرًا متاحًا",
  },
  contact: {
    eyebrow: "الدعم",
    title: "نحن هنا عندما تحتاج إلينا",
    description: "مساعدة في الرموز والمدفوعات والتوثيق والشراكات وحسابك.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    message: "الرسالة",
    send: "إرسال الرسالة",
    support: "الدعم العام والفوترة",
    liveChat: "المحادثة المباشرة",
    liveChatHours: "الاثنين–الجمعة، 09:00–18:00",
    office: "مكتب الدار البيضاء",
    before: "إجابات قبل مراسلتنا",
    validationName: "أدخل اسمك",
    validationEmail: "أدخل بريدًا إلكترونيًا صالحًا",
    validationMessage: "أضف تفاصيل أكثر",
    validationGeneric: "تحقق من معلومات النموذج",
    success: "الرسالة جاهزة للإرسال",
    successDescription: "اربط الواجهة بالخادم لإيصالها إلى فريق الدعم.",
  },
  experts: {
    eyebrow: "الخبراء",
    title: "أشخاص حقيقيون بخبرة مثبتة",
    description:
      "أطباء ومحامون ومحاسبون ومستشارون وممارسون تم التحقق من مؤهلاتهم الحقيقية.",
    search: "ابحث بالاسم أو المهنة أو المدينة…",
    all: "الكل",
    verifiedOnly: "الموثّقون فقط",
    empty: "لا يوجد خبراء مطابقون لبحثك.",
  },
  expert: {
    notFound: "الخبير غير موجود",
    back: "العودة إلى الدليل",
    loadError: "تعذر تحميل هذا الملف",
    verifiedLevel: "مهني موثّق",
    pending: "التوثيق قيد المراجعة",
    contact: "تواصل مقابل 10 رموز",
    ask: "اطرح سؤالًا على هذا الخبير",
    rating: "التقييم",
    answersDelivered: "الإجابات المنشورة",
    tokensEarned: "الرموز المكتسبة",
    responseTime: "وقت الاستجابة",
    biography: "النبذة المهنية",
    recentAnswers: "أحدث الإجابات",
    reviews: "التقييمات",
    certificates: "المؤهلات الموثّقة",
    certificateItems: [
      "تم التحقق من الدبلوم",
      "تم التحقق من التسجيل المهني",
      "تم التحقق من الهوية",
    ],
    achievements: "الإنجازات",
    achievementItems: [
      "أفضل مساهم في 2026",
      "إنجاز 100 إجابة",
      "اثنا عشر تقييمًا بخمس نجوم متتالية",
    ],
    reviewItems: [
      "إجابة واضحة ومنظمة وموثقة، وفّرت عليّ زيارتين للإدارة.",
      "أجاب بسرعة وتابع سؤالي الثاني من دون تكلفة إضافية.",
    ],
  },
  questions: {
    eyebrow: "الأسئلة",
    title: "ما الذي يسأل عنه المغرب الآن؟",
    description:
      "عاين الإجابات المفيدة مجانًا، وافتح الرد الكامل فقط عندما تحتاج إليه.",
    search: "ابحث في الأسئلة والكلمات والوسوم…",
    filters: {
      newest: "الأحدث",
      trending: "الرائجة",
      mostAnswered: "الأكثر إجابة",
      premium: "المميّزة",
      unresolved: "من دون حل",
    },
    empty: "لا توجد أسئلة مطابقة لهذا الاختيار.",
    showing: "عرض {{visible}} من أصل {{total}} أسئلة",
  },
  question: {
    notFound: "هذا السؤال لم يعد موجودًا",
    back: "تصفّح الأسئلة",
    loadError: "تعذر تحميل هذا السؤال",
    premium: "مميّز",
    free: "مجاني",
    answers: "{{count}} إجابات",
    reviews: "{{count}} تقييمًا",
    unlockTitle: "افتح الإجابة الكاملة مقابل {{count}} رمزًا",
    unlockText: "فتح لمرة واحدة، وتبقى الإجابة في حسابك دائمًا.",
    unlock: "فتح الإجابة",
    buy: "شراء رموز",
    knowledge: "المعرفة",
    clarity: "الوضوح",
    helpfulness: "الفائدة",
    speed: "السرعة",
    related: "أسئلة مرتبطة",
    recommended: "خبراء مقترحون",
    lockedSample:
      "تشرح الإجابة الكاملة كل خطوة إدارية والوثائق الدقيقة والمصلحة الصحيحة والآجال المتوقعة. كما تغطي الأخطاء الشائعة والمراجع المفيدة.",
  },
  pricing: {
    eyebrow: "الأسعار",
    title: "عملة مرنة واحدة، من دون اشتراك.",
    description:
      "اشترِ الرموز مرة واحدة واستخدمها فقط للإجابات والخبراء الذين تختارهم.",
    spendTitle: "ما الذي تنفقه؟",
    earnTitle: "كيف يكسب الخبراء؟",
    payoutsTitle: "كيف تعمل السحوبات؟",
    payoutsText:
      "عندما يصل الخبير إلى الحد المطلوب، يمكنه طلب السحب. تُراجع كل عملية وتظل جميع حركات المحفظة ظاهرة.",
    spend: [
      ["طرح سؤال عام", "0 رمز"],
      ["طرح سؤال مميّز", "5–20 رمزًا"],
      ["فتح إجابة كاملة", "5 رموز في المتوسط"],
      ["التواصل الخاص مع خبير", "10 رموز"],
    ],
    earn: [
      ["إجابة معتمدة", "+8 رموز"],
      ["اختيار أفضل إجابة", "+15 مكافأة"],
      ["أفضل مساهم شهري", "+250 رمزًا"],
      ["تسجيل عن طريق الإحالة", "+50 رمزًا"],
    ],
    packs: "باقات الرموز",
    shop: "الذهاب إلى متجر الرموز",
    faq: "الأسئلة الشائعة",
  },
  tokens: {
    eyebrow: "متجر الرموز",
    title: "اشترِ مرة واحدة، واستخدم الرموز حيث تهمك.",
    description:
      "لا تنتهي صلاحية الرموز. استخدمها للأسئلة المميّزة والإجابات الكاملة والتواصل الخاص.",
    mostPopular: "الأكثر طلبًا",
    perToken: "{{value}} درهم لكل رمز",
    neverExpires: "لا تنتهي صلاحيتها",
    invoice: "الفاتورة متاحة",
    bonus: "+{{count}} رمزًا إضافيًا",
    buy: "شراء {{name}}",
    paymentMethods: "وسائل الدفع",
    custom: "تحتاج إلى حجم مخصص لشركتك أو جمعيتك؟",
    talk: "تواصل معنا",
    methods: [
      "بطاقة بنكية",
      "Stripe",
      "PayPal",
      "بوابة الدفع المغربية CMI",
      "تحويل بنكي",
    ],
  },
};

const copies: Record<"ar" | "fr" | "en", PageCopy> = { ar, fr, en };

export function getPageCopy(locale: "ar" | "fr" | "en") {
  return copies[locale];
}

export function usePageCopy() {
  return getPageCopy(useLocale());
}
