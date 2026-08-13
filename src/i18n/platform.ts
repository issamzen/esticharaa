import type { Locale } from "@/i18n/config";
import type { Category, Expert, Question } from "@/data/platform";

const categoryNames: Record<Locale, Record<string, string>> = {
  en: {
    health: "Health",
    legal: "Legal",
    education: "Education",
    technology: "Technology",
    automotive: "Automotive",
    "real-estate": "Real estate",
    finance: "Finance",
    business: "Business",
    immigration: "Immigration",
    jobs: "Jobs & careers",
    family: "Family",
    travel: "Travel",
    administration: "Administration",
    agriculture: "Agriculture",
    construction: "Construction",
    entrepreneurship: "Entrepreneurship",
    insurance: "Insurance",
    telecommunications: "Telecommunications",
    "government-services": "Government services",
    other: "Other",
  },
  fr: {
    health: "Santé",
    legal: "Droit",
    education: "Éducation",
    technology: "Technologie",
    automotive: "Automobile",
    "real-estate": "Immobilier",
    finance: "Finance",
    business: "Entreprise",
    immigration: "Immigration",
    jobs: "Emploi et carrière",
    family: "Famille",
    travel: "Voyage",
    administration: "Administration",
    agriculture: "Agriculture",
    construction: "Construction",
    entrepreneurship: "Entrepreneuriat",
    insurance: "Assurance",
    telecommunications: "Télécommunications",
    "government-services": "Services publics",
    other: "Autre",
  },
  ar: {
    health: "الصحة",
    legal: "القانون",
    education: "التعليم",
    technology: "التقنية",
    automotive: "السيارات",
    "real-estate": "العقارات",
    finance: "المالية",
    business: "الأعمال",
    immigration: "الهجرة",
    jobs: "العمل والمسار المهني",
    family: "الأسرة",
    travel: "السفر",
    administration: "الإدارة",
    agriculture: "الفلاحة",
    construction: "البناء",
    entrepreneurship: "ريادة الأعمال",
    insurance: "التأمين",
    telecommunications: "الاتصالات",
    "government-services": "الخدمات الحكومية",
    other: "أخرى",
  },
};

type QuestionTranslation = Pick<
  Question,
  "title" | "body" | "preview" | "tags"
>;

const questionTranslations: Record<
  "ar" | "fr",
  Record<string, QuestionTranslation>
> = {
  fr: {
    "cnss-freelance": {
      title: "Comment m'inscrire à la CNSS en tant que freelance au Maroc ?",
      body: "Je viens de commencer comme graphiste freelance à Casablanca et je souhaite bénéficier de la couverture sociale. Quel statut choisir, quels documents fournir et combien de temps prend la procédure ?",
      preview:
        "Commencez par choisir entre le statut d'auto-entrepreneur et une SARL AU. Pour un graphiste seul facturant moins de 200 000 MAD par an, le statut d'auto-entrepreneur est généralement le plus adapté. Après l'inscription, vous recevrez un numéro ICE sous 5 à 10 jours ouvrables avant d'ouvrir votre dossier CNSS.",
      tags: ["CNSS", "auto-entrepreneur", "formalités"],
    },
    "visa-france-refus": {
      title:
        "Mon visa français a été refusé deux fois : comment améliorer ma troisième demande ?",
      body: "Deux refus Schengen en douze mois, tous deux avec le motif 2. J'ai un emploi stable et un bien à Rabat. Dois-je faire un recours ou déposer une nouvelle demande ?",
      preview:
        "Un refus pour motif 2 concerne surtout la cohérence du dossier. Avant de redéposer, reconstruisez votre récit : itinéraire daté, autorisation de congé et preuves de retour doivent correspondre parfaitement.",
      tags: ["visa", "Schengen", "recours"],
    },
    "apartment-title": {
      title:
        "Acheter un appartement sans titre foncier régulier : est-ce parfois sûr ?",
      body: "Un vendeur à Marrakech propose une remise de 30 % parce que le bien est encore sous melkia. Mon notaire hésite. Quels sont les risques réels ?",
      preview:
        "La remise existe parce que le risque est réel : avec une melkia, vous achetez une prétention de propriété et non un droit enregistré. La voie la plus sûre est une vente conditionnelle dont le solde n'est libéré qu'après l'immatriculation.",
      tags: ["titre foncier", "notaire", "melkia"],
    },
    "startup-taxes": {
      title:
        "Quels impôts une SARL marocaine paie-t-elle réellement pendant ses deux premières années ?",
      body: "Je prépare une petite société SaaS. On me parle souvent d'exonérations, mais je ne trouve pas de présentation claire.",
      preview:
        "Il n'existe plus d'exonération générale : les tranches progressives de l'IS s'appliquent. L'immatriculation à la TVA dépend de l'activité et de la nature des factures émises.",
      tags: ["IS", "TVA", "SARL"],
    },
    "diabetes-ramadan": {
      title:
        "Diabète de type 2 et jeûne : comment adapter les horaires de la metformine ?",
      body: "Je prends 1 000 mg de metformine deux fois par jour. Mon médecin est absent et je souhaite préparer un plan avant la prochaine période de jeûne.",
      preview:
        "La metformine provoque rarement une hypoglycémie, mais la répartition des prises peut changer pendant le jeûne. Toute adaptation doit être validée par votre médecin selon votre glycémie et vos autres traitements.",
      tags: ["diabète", "médicament", "jeûne"],
    },
    "unfair-dismissal": {
      title:
        "Licencié après six ans sans préavis écrit : quelles indemnités puis-je demander ?",
      body: "Mon employeur m'a demandé oralement de ne plus revenir. Aucune lettre ni indemnité. Je possède mes bulletins de salaire des six années.",
      preview:
        "Un licenciement verbal ne respecte pas la procédure prévue par le Code du travail. Votre dossier peut inclure l'indemnité de licenciement, le préavis et des dommages selon les circonstances.",
      tags: ["Code du travail", "licenciement", "indemnité"],
    },
  },
  ar: {
    "cnss-freelance": {
      title: "كيف أسجل كمستقل في الصندوق الوطني للضمان الاجتماعي بالمغرب؟",
      body: "بدأت مؤخرًا العمل الحر كمصمم غرافيك في الدار البيضاء وأرغب في الاستفادة من التغطية الاجتماعية. ما الوضع القانوني الأنسب، وما الوثائق المطلوبة، وكم تستغرق المسطرة؟",
      preview:
        "ابدأ بالمقارنة بين نظام المقاول الذاتي وشركة ذات مسؤولية محدودة بشريك وحيد. بالنسبة إلى مصمم يعمل بمفرده وبرقم معاملات محدود، يكون نظام المقاول الذاتي غالبًا أبسط. بعد التسجيل تحصل على رقم ICE خلال 5 إلى 10 أيام عمل، ثم يمكنك فتح ملف الضمان الاجتماعي.",
      tags: ["الضمان الاجتماعي", "المقاول الذاتي", "الإجراءات"],
    },
    "visa-france-refus": {
      title: "رُفضت تأشيرتي الفرنسية مرتين، كيف أحسن فرص الطلب الثالث؟",
      body: "تعرضت لرفضين لتأشيرة شنغن خلال 12 شهرًا بالسبب رقم 2. لدي عمل مستقر وعقار في الرباط. هل أقدم طعنًا أم طلبًا جديدًا؟",
      preview:
        "الرفض بالسبب رقم 2 يرتبط غالبًا بانسجام الملف لا بالدخل وحده. قبل إعادة الطلب، أعد بناء الملف بحيث يتطابق برنامج السفر وإجازة العمل وأدلة العودة بشكل واضح ودقيق.",
      tags: ["تأشيرة", "شنغن", "طعن"],
    },
    "apartment-title": {
      title: "شراء شقة من دون رسم عقاري سليم: هل يمكن أن يكون آمنًا؟",
      body: "يعرض بائع في مراكش خصمًا قدره 30٪ لأن العقار لا يزال بعقد ملكية عدلي. الموثق متردد. ما المخاطر الحقيقية؟",
      preview:
        "الخصم موجود لأن المخاطرة حقيقية: في هذه الحالة تشتري ادعاءً بالملكية وليس ملكية مسجلة نهائية. المسار الأكثر أمانًا هو عقد بيع مشروط لا يُدفع رصيده إلا بعد اكتمال التحفيظ بالمحافظة العقارية.",
      tags: ["الرسم العقاري", "الموثق", "الملكية"],
    },
    "startup-taxes": {
      title:
        "ما الضرائب التي تؤديها شركة مغربية ذات مسؤولية محدودة في أول سنتين؟",
      body: "أخطط لإطلاق شركة برمجيات صغيرة. أسمع كثيرًا عن إعفاءات الشركات الجديدة، لكنني لم أجد شرحًا واضحًا.",
      preview:
        "لا يوجد إعفاء عام يشمل كل الشركات الجديدة؛ بل تطبق قواعد الضريبة على الشركات بحسب الربح والنشاط. كما يرتبط التسجيل في الضريبة على القيمة المضافة بطبيعة النشاط والفواتير.",
      tags: ["الضريبة على الشركات", "القيمة المضافة", "شركة"],
    },
    "diabetes-ramadan": {
      title: "السكري من النوع الثاني والصيام: كيف أضبط توقيت الميتفورمين؟",
      body: "أتناول 1000 ملغ من الميتفورمين مرتين يوميًا. طبيبي غائب وأرغب في إعداد خطة قبل فترة الصيام المقبلة.",
      preview:
        "يُعد الميتفورمين من الأدوية الأقل تسببًا في هبوط السكر، لكن توزيع الجرعات قد يتغير أثناء الصيام. يجب اعتماد أي تعديل مع الطبيب بناءً على قياسات السكر والعلاجات الأخرى.",
      tags: ["السكري", "الدواء", "الصيام"],
    },
    "unfair-dismissal": {
      title: "طُردت بعد ست سنوات من دون إشعار كتابي، ما التعويضات المستحقة؟",
      body: "طلب مني المشغل شفهيًا التوقف عن الحضور. لم أتلق رسالة أو تعويضًا، ولدي كشوف الأجر عن السنوات الست.",
      preview:
        "الفصل الشفهي لا يحترم المسطرة التي يفرضها قانون الشغل. قد تشمل المطالب التعويض عن الفصل والإشعار والضرر بحسب تفاصيل الملف والإثباتات المتاحة.",
      tags: ["قانون الشغل", "الفصل", "التعويض"],
    },
  },
};

type ExpertTranslation = Pick<
  Expert,
  "title" | "specialization" | "city" | "responseTime" | "bio"
>;

const expertTranslations: Record<
  "ar" | "fr",
  Record<string, ExpertTranslation>
> = {
  fr: {
    "salma-benali": {
      title: "Endocrinologue",
      specialization: "Santé",
      city: "Casablanca",
      responseTime: "moins de 2 h",
      bio: "Quinze ans d'endocrinologie clinique au CHU Ibn Rochd, avec une spécialisation en diabétologie et santé métabolique.",
    },
    "youssef-amrani": {
      title: "Avocat en droit du travail",
      specialization: "Droit",
      city: "Rabat",
      responseTime: "moins de 4 h",
      bio: "Membre du barreau de Rabat depuis 2011. Il accompagne salariés et petites entreprises dans les litiges de licenciement, contrat et CNSS.",
    },
    "nadia-elfassi": {
      title: "Expert-comptable",
      specialization: "Finance",
      city: "Marrakech",
      responseTime: "moins de 6 h",
      bio: "Elle conseille les fondateurs sur la création d'entreprise, l'IS et la conformité à la TVA.",
    },
    "karim-tazi": {
      title: "Consultant en immigration",
      specialization: "Immigration",
      city: "Tanger",
      responseTime: "moins de 3 h",
      bio: "Ancien agent de traitement consulaire, spécialisé dans les dossiers Schengen, étudiants et regroupement familial.",
    },
    "imane-ouazzani": {
      title: "Clerc de notaire",
      specialization: "Immobilier",
      city: "Fès",
      responseTime: "moins de 12 h",
      bio: "Dix ans d'expérience dans les transferts immobiliers, la régularisation des melkias et l'immatriculation foncière.",
    },
    "mehdi-chraibi": {
      title: "Architecte logiciel",
      specialization: "Technologie",
      city: "Casablanca",
      responseTime: "moins de 5 h",
      bio: "Il conçoit des systèmes de paiement et d'identité pour des fintechs marocaines et conseille sur l'architecture et la sécurité.",
    },
  },
  ar: {
    "salma-benali": {
      title: "طبيبة الغدد والسكري",
      specialization: "الصحة",
      city: "الدار البيضاء",
      responseTime: "أقل من ساعتين",
      bio: "خمسة عشر عامًا في طب الغدد السريري بالمركز الاستشفائي ابن رشد، مع تركيز على تدبير السكري والصحة الأيضية.",
    },
    "youssef-amrani": {
      title: "محامٍ متخصص في قانون الشغل",
      specialization: "القانون",
      city: "الرباط",
      responseTime: "أقل من 4 ساعات",
      bio: "عضو بهيئة الرباط منذ 2011، يواكب الأجراء والمقاولات الصغيرة في نزاعات الفصل والعقود والضمان الاجتماعي.",
    },
    "nadia-elfassi": {
      title: "خبيرة محاسبة",
      specialization: "المالية",
      city: "مراكش",
      responseTime: "أقل من 6 ساعات",
      bio: "تواكب مؤسسي الشركات في التأسيس والضريبة على الشركات والامتثال للضريبة على القيمة المضافة.",
    },
    "karim-tazi": {
      title: "مستشار في الهجرة",
      specialization: "الهجرة",
      city: "طنجة",
      responseTime: "أقل من 3 ساعات",
      bio: "موظف قنصلي سابق متخصص في ملفات شنغن والدراسة والتجمع العائلي ومعالجة حالات الرفض.",
    },
    "imane-ouazzani": {
      title: "مساعدة موثق",
      specialization: "العقارات",
      city: "فاس",
      responseTime: "أقل من 12 ساعة",
      bio: "عشر سنوات من الخبرة في نقل الملكية وتسوية عقود الملكية والتحفيظ العقاري.",
    },
    "mehdi-chraibi": {
      title: "مهندس معماريات برمجية",
      specialization: "التقنية",
      city: "الدار البيضاء",
      responseTime: "أقل من 5 ساعات",
      bio: "يصمم أنظمة الدفع والهوية لشركات التقنية المالية المغربية ويجيب عن أسئلة المعمارية والأمن وبناء الفرق التقنية.",
    },
  },
};

const packNames: Record<Locale, Record<string, string>> = {
  en: {
    Starter: "Starter",
    Standard: "Standard",
    Pro: "Pro",
    Enterprise: "Enterprise",
  },
  fr: {
    Starter: "Découverte",
    Standard: "Essentiel",
    Pro: "Pro",
    Enterprise: "Entreprise",
  },
  ar: {
    Starter: "البداية",
    Standard: "الأساسية",
    Pro: "الاحترافية",
    Enterprise: "المؤسسات",
  },
};

export function localizeCategory(category: Category, locale: Locale): Category {
  return {
    ...category,
    name: categoryNames[locale][category.slug] ?? category.name,
  };
}

export function categoryName(slug: string, fallback: string, locale: Locale) {
  return categoryNames[locale][slug] ?? fallback;
}

export function localizeQuestion(question: Question, locale: Locale): Question {
  const translation =
    locale === "en" ? undefined : questionTranslations[locale][question.id];
  return {
    ...question,
    ...translation,
    category: categoryName(question.categorySlug, question.category, locale),
  };
}

export function localizeExpert(expert: Expert, locale: Locale): Expert {
  const translation =
    locale === "en" ? undefined : expertTranslations[locale][expert.slug];
  return { ...expert, ...translation };
}

export function tokenPackName(name: string, locale: Locale) {
  return packNames[locale][name] ?? name;
}
