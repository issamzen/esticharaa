import type { TFunction } from "i18next";
import { BadgeCheck, Coins, ShieldCheck, Zap } from "lucide-react";

/** Keeps arrays out of the locale files while translating every visible string. */
export function getHomeFeatures(t: TFunction) {
  return [
    {
      icon: BadgeCheck,
      eyebrow: t("home.why.trustEyebrow"),
      title: t("home.why.trustTitle"),
      text: t("home.why.trustText"),
      span: "lg:col-span-3",
    },
    {
      icon: Coins,
      eyebrow: t("home.why.pricingEyebrow"),
      title: t("home.why.pricingTitle"),
      text: t("home.why.pricingText"),
      span: "lg:col-span-3",
    },
    {
      icon: Zap,
      eyebrow: t("home.why.speedEyebrow"),
      title: t("home.why.speedTitle"),
      text: t("home.why.speedText"),
      span: "lg:col-span-2",
    },
    {
      icon: ShieldCheck,
      eyebrow: t("home.why.safetyEyebrow"),
      title: t("home.why.safetyTitle"),
      text: t("home.why.safetyText"),
      span: "lg:col-span-4",
    },
  ];
}

export function getHomeSteps(t: TFunction) {
  return [
    {
      number: "01",
      title: t("home.how.step1Title"),
      text: t("home.how.step1Text"),
    },
    {
      number: "02",
      title: t("home.how.step2Title"),
      text: t("home.how.step2Text"),
    },
    {
      number: "03",
      title: t("home.how.step3Title"),
      text: t("home.how.step3Text"),
    },
    {
      number: "04",
      title: t("home.how.step4Title"),
      text: t("home.how.step4Text"),
    },
  ];
}

export function getHomeStories(t: TFunction) {
  return [
    {
      quote: t("home.stories.item1Quote"),
      name: t("home.stories.item1Name"),
      role: t("home.stories.item1Role"),
    },
    {
      quote: t("home.stories.item2Quote"),
      name: t("home.stories.item2Name"),
      role: t("home.stories.item2Role"),
    },
    {
      quote: t("home.stories.item3Quote"),
      name: t("home.stories.item3Name"),
      role: t("home.stories.item3Role"),
    },
  ];
}

export function getHomeFaqs(t: TFunction) {
  return [
    {
      q: t("home.faq.item1Question"),
      a: t("home.faq.item1Answer"),
    },
    {
      q: t("home.faq.item2Question"),
      a: t("home.faq.item2Answer"),
    },
    {
      q: t("home.faq.item3Question"),
      a: t("home.faq.item3Answer"),
    },
    {
      q: t("home.faq.item4Question"),
      a: t("home.faq.item4Answer"),
    },
    {
      q: t("home.faq.item5Question"),
      a: t("home.faq.item5Answer"),
    },
  ];
}

export function getTokenPackLabel(
  t: TFunction,
  index: number,
  fallback: string,
) {
  switch (index) {
    case 0:
      return t("home.pricing.pack1Name");
    case 1:
      return t("home.pricing.pack2Name");
    case 2:
      return t("home.pricing.pack3Name");
    case 3:
      return t("home.pricing.pack4Name");
    default:
      return fallback;
  }
}

export function getCategoryLabel(t: TFunction, slug: string, fallback: string) {
  switch (slug) {
    case "business":
      return t("categories.names.business");
    case "legal":
      return t("categories.names.legal");
    case "finance":
      return t("categories.names.finance");
    case "health":
      return t("categories.names.health");
    case "career":
      return t("categories.names.career");
    case "education":
      return t("categories.names.education");
    case "technology":
      return t("categories.names.technology");
    case "marketing":
      return t("categories.names.marketing");
    case "real-estate":
    case "realEstate":
      return t("categories.names.realEstate");
    case "family":
      return t("categories.names.family");
    case "travel":
      return t("categories.names.travel");
    case "automotive":
      return t("categories.names.automotive");
    case "home":
      return t("categories.names.home");
    case "administration":
      return t("categories.names.administration");
    case "taxes":
      return t("categories.names.taxes");
    case "immigration":
      return t("categories.names.immigration");
    case "entrepreneurship":
      return t("categories.names.entrepreneurship");
    case "freelancing":
      return t("categories.names.freelancing");
    case "design":
      return t("categories.names.design");
    case "other":
      return t("categories.names.other");
    default:
      return fallback;
  }
}
