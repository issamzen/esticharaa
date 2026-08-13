export type Category = {
  slug: string;
  name: string;
  icon: string;
  questions: number;
  answers: number;
  experts: number;
};

export const categories: Category[] = [
  {
    slug: "health",
    name: "Health",
    icon: "HeartPulse",
    questions: 1284,
    answers: 3120,
    experts: 86,
  },
  {
    slug: "legal",
    name: "Legal",
    icon: "Scale",
    questions: 942,
    answers: 2210,
    experts: 64,
  },
  {
    slug: "education",
    name: "Education",
    icon: "GraduationCap",
    questions: 1105,
    answers: 2740,
    experts: 91,
  },
  {
    slug: "technology",
    name: "Technology",
    icon: "Cpu",
    questions: 1630,
    answers: 4180,
    experts: 124,
  },
  {
    slug: "automotive",
    name: "Automotive",
    icon: "Car",
    questions: 610,
    answers: 1420,
    experts: 38,
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "Building2",
    questions: 780,
    answers: 1610,
    experts: 47,
  },
  {
    slug: "finance",
    name: "Finance",
    icon: "Landmark",
    questions: 865,
    answers: 1980,
    experts: 55,
  },
  {
    slug: "business",
    name: "Business",
    icon: "Briefcase",
    questions: 720,
    answers: 1530,
    experts: 49,
  },
  {
    slug: "immigration",
    name: "Immigration",
    icon: "Plane",
    questions: 990,
    answers: 2050,
    experts: 41,
  },
  {
    slug: "jobs",
    name: "Jobs",
    icon: "UserSearch",
    questions: 1180,
    answers: 2360,
    experts: 58,
  },
  {
    slug: "family",
    name: "Family",
    icon: "Users",
    questions: 540,
    answers: 1290,
    experts: 33,
  },
  {
    slug: "travel",
    name: "Travel",
    icon: "Map",
    questions: 470,
    answers: 980,
    experts: 27,
  },
  {
    slug: "administration",
    name: "Administration",
    icon: "FileText",
    questions: 830,
    answers: 1740,
    experts: 36,
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    icon: "Sprout",
    questions: 320,
    answers: 690,
    experts: 19,
  },
  {
    slug: "construction",
    name: "Construction",
    icon: "HardHat",
    questions: 410,
    answers: 870,
    experts: 24,
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    icon: "Rocket",
    questions: 650,
    answers: 1410,
    experts: 44,
  },
  {
    slug: "insurance",
    name: "Insurance",
    icon: "ShieldCheck",
    questions: 380,
    answers: 810,
    experts: 21,
  },
  {
    slug: "telecommunications",
    name: "Telecommunications",
    icon: "Signal",
    questions: 290,
    answers: 540,
    experts: 15,
  },
  {
    slug: "government-services",
    name: "Government Services",
    icon: "Landmark",
    questions: 700,
    answers: 1450,
    experts: 30,
  },
  {
    slug: "other",
    name: "Other",
    icon: "Sparkles",
    questions: 260,
    answers: 520,
    experts: 12,
  },
];

export type Question = {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  tokens: number;
  answers: number;
  views: number;
  createdAt: string;
  tags: string[];
  body: string;
  preview: string;
  trending?: boolean;
  resolved?: boolean;
};

export const questions: Question[] = [
  {
    id: "cnss-freelance",
    title: "How do I register as a freelancer with CNSS in Morocco?",
    category: "Administration",
    categorySlug: "administration",
    tokens: 5,
    answers: 4,
    views: 2843,
    createdAt: "2026-08-09",
    tags: ["CNSS", "auto-entrepreneur", "paperwork"],
    body: "I recently started freelancing as a graphic designer in Casablanca and I want to be covered by social security. Which status should I pick, what documents are required, and how long does the process take?",
    preview:
      "Start by choosing between the auto-entrepreneur status and a full SARL AU — for a solo designer billing under 200,000 MAD a year, auto-entrepreneur is almost always the right call.\nOnce registered on the auto-entrepreneur portal you receive an ICE number within 5 to 10 working days, and only then can you open the CNSS file.",
    trending: true,
  },
  {
    id: "visa-france-refus",
    title:
      "My French visa was refused twice — what changes my odds on the third try?",
    category: "Immigration",
    categorySlug: "immigration",
    tokens: 10,
    answers: 6,
    views: 5210,
    createdAt: "2026-08-11",
    tags: ["visa", "schengen", "appeal"],
    body: "Two Schengen refusals in 12 months, both with code 2 (purpose of stay not justified). I have a stable job and property in Rabat. Should I appeal or reapply?",
    preview:
      "A code 2 refusal is about the coherence of your file, not your income — the consulate could not connect your stated purpose to the documents you filed.\nBefore reapplying, rebuild the narrative: a dated itinerary, employer leave letter, and proof of return obligations that match each other exactly.",
    trending: true,
  },
  {
    id: "apartment-title",
    title:
      "Buying an apartment without a clean land title (titre foncier) — is it ever safe?",
    category: "Real Estate",
    categorySlug: "real-estate",
    tokens: 20,
    answers: 3,
    views: 1904,
    createdAt: "2026-08-06",
    tags: ["titre foncier", "notary", "melkia"],
    body: "A seller in Marrakech offers a 30% discount because the property is still under melkia. My notary is hesitant. What are the real risks?",
    preview:
      "The discount exists precisely because the risk is real: with melkia you buy a claim to ownership, not registered ownership.\nThe safe path is a conditional sale contract where the balance is released only after immatriculation is completed at the Conservation Foncière.",
  },
  {
    id: "startup-taxes",
    title:
      "What taxes does a Moroccan SARL actually pay in its first two years?",
    category: "Finance",
    categorySlug: "finance",
    tokens: 0,
    answers: 5,
    views: 3390,
    createdAt: "2026-08-02",
    tags: ["IS", "TVA", "SARL"],
    body: "Planning a small SaaS company. I keep hearing about exemptions for new companies but I cannot find a clear breakdown.",
    preview:
      "There is no blanket exemption anymore — the progressive IS brackets replaced it, starting at 12.5% on profits below 300,000 MAD.\nTVA registration becomes mandatory the moment you invoice a Moroccan business, regardless of turnover.",
    resolved: true,
  },
  {
    id: "diabetes-ramadan",
    title: "Type 2 diabetes and fasting: how should I adjust metformin timing?",
    category: "Health",
    categorySlug: "health",
    tokens: 5,
    answers: 7,
    views: 6120,
    createdAt: "2026-07-28",
    tags: ["diabetes", "medication", "fasting"],
    body: "I take 1000mg metformin twice daily. My doctor is away and I want to prepare a plan before the next fasting period.",
    preview:
      "Metformin is one of the safer molecules for fasting because it rarely causes hypoglycemia, but the split changes.\nMost endocrinologists move the larger dose to the evening meal and reduce the pre-dawn dose by half.",
    trending: true,
  },
  {
    id: "unfair-dismissal",
    title:
      "Dismissed after 6 years without written notice — what compensation am I owed?",
    category: "Legal",
    categorySlug: "legal",
    tokens: 10,
    answers: 2,
    views: 2280,
    createdAt: "2026-08-10",
    tags: ["labour code", "dismissal", "indemnity"],
    body: "My employer told me verbally to stop coming. No letter, no severance. I have payslips for all 6 years.",
    preview:
      "A verbal dismissal is legally an abusive dismissal under Article 62 of the Labour Code — the absence of the written procedure alone shifts the burden to the employer.\nYou are looking at severance, notice indemnity, and damages calculated at 1.5 months of salary per year worked.",
  },
];

export type Expert = {
  slug: string;
  name: string;
  title: string;
  specialization: string;
  city: string;
  rating: number;
  reviews: number;
  answered: number;
  tokens: number;
  verified: boolean;
  responseTime: string;
  bio: string;
  initials: string;
};

export const experts: Expert[] = [
  {
    slug: "salma-benali",
    name: "Dr. Salma Benali",
    title: "Endocrinologist",
    specialization: "Health",
    city: "Casablanca",
    rating: 4.9,
    reviews: 312,
    answered: 486,
    tokens: 24800,
    verified: true,
    responseTime: "under 2h",
    bio: "Fifteen years in clinical endocrinology at CHU Ibn Rochd, with a focus on diabetes management and metabolic health for patients balancing treatment with daily life.",
    initials: "SB",
  },
  {
    slug: "youssef-amrani",
    name: "Me. Youssef Amrani",
    title: "Labour Lawyer",
    specialization: "Legal",
    city: "Rabat",
    rating: 4.8,
    reviews: 204,
    answered: 351,
    tokens: 19300,
    verified: true,
    responseTime: "under 4h",
    bio: "Bar of Rabat since 2011. Represents employees and small employers in dismissal, contract and CNSS disputes before the social chamber.",
    initials: "YA",
  },
  {
    slug: "nadia-elfassi",
    name: "Nadia El Fassi",
    title: "Chartered Accountant",
    specialization: "Finance",
    city: "Marrakech",
    rating: 4.9,
    reviews: 178,
    answered: 290,
    tokens: 16750,
    verified: true,
    responseTime: "under 6h",
    bio: "Expert-comptable advising founders on company formation, IS optimisation and TVA compliance for service businesses.",
    initials: "NF",
  },
  {
    slug: "karim-tazi",
    name: "Karim Tazi",
    title: "Immigration Consultant",
    specialization: "Immigration",
    city: "Tangier",
    rating: 4.7,
    reviews: 421,
    answered: 612,
    tokens: 31200,
    verified: true,
    responseTime: "under 3h",
    bio: "Former consular file officer. Prepares Schengen, student and family-reunification applications with an emphasis on refusal recovery.",
    initials: "KT",
  },
  {
    slug: "imane-ouazzani",
    name: "Imane Ouazzani",
    title: "Notary Clerk",
    specialization: "Real Estate",
    city: "Fès",
    rating: 4.6,
    reviews: 96,
    answered: 143,
    tokens: 8400,
    verified: false,
    responseTime: "under 12h",
    bio: "Ten years handling property transfers, melkia regularisation and immatriculation files at a notary office in Fès.",
    initials: "IO",
  },
  {
    slug: "mehdi-chraibi",
    name: "Mehdi Chraibi",
    title: "Software Architect",
    specialization: "Technology",
    city: "Casablanca",
    rating: 4.8,
    reviews: 260,
    answered: 398,
    tokens: 21100,
    verified: true,
    responseTime: "under 5h",
    bio: "Builds payment and identity systems for Moroccan fintechs. Answers questions on architecture, security and hiring engineering teams.",
    initials: "MC",
  },
];

export const tokenPacks = [
  {
    name: "Starter",
    tokens: 100,
    price: 99,
    perToken: 0.99,
    bonus: 0,
    popular: false,
  },
  {
    name: "Standard",
    tokens: 500,
    price: 449,
    perToken: 0.9,
    bonus: 25,
    popular: true,
  },
  {
    name: "Pro",
    tokens: 1000,
    price: 849,
    perToken: 0.85,
    bonus: 100,
    popular: false,
  },
  {
    name: "Enterprise",
    tokens: 5000,
    price: 3799,
    perToken: 0.76,
    bonus: 750,
    popular: false,
  },
];

export const faqs = [
  {
    q: "What is a token and why does the platform use them?",
    a: "A token is the unit of value on Estichara.ma. You buy tokens once and spend them on premium questions, unlocking full answers or contacting an expert directly. It keeps pricing predictable and lets experts be paid per contribution instead of per subscription.",
  },
  {
    q: "Can I read answers for free?",
    a: "Yes. Every answer shows its first two lines, the expert profile and the ratings before you spend anything. Free questions are fully readable. Premium answers require tokens to unlock the complete text.",
  },
  {
    q: "How do experts earn?",
    a: "Experts receive tokens for every answer approved by moderation, plus a bonus when their answer is selected as the best one. Tokens accumulate in the expert wallet.",
  },
  {
    q: "When can an expert cash out?",
    a: "Once the balance reaches the payout threshold of 1,000 tokens, an expert can request a withdrawal by bank transfer, PayPal or local transfer. The conversion rate is set by the platform and displayed before each request.",
  },
  {
    q: "How do you verify experts?",
    a: "Applicants upload an ID, diplomas, certificates and a resume. A human reviewer checks the documents against the claimed profession before the verified badge is granted.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Credit card, Stripe, PayPal, Moroccan payment gateways and bank transfer for larger packs.",
  },
];

export const stories = [
  {
    quote:
      "I had been going back and forth to the CNSS office for three weeks. One answer here listed the exact documents and the right counter. Done in a single morning.",
    name: "Hicham B.",
    role: "Freelance designer, Casablanca",
  },
  {
    quote:
      "After two visa refusals I was ready to give up. The consultant rewrote my whole file logic. Third application approved.",
    name: "Loubna R.",
    role: "Student, Rabat",
  },
  {
    quote:
      "I answer four or five questions a week between consultations. It covers my clinic software subscription and then some.",
    name: "Dr. Anass K.",
    role: "Verified expert, Health",
  },
];
