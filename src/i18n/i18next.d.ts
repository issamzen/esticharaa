import "i18next";
import type { resources } from "@/i18n";

// Enables autocomplete and compile-time checking for translation keys.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
    returnNull: false;
  }
}
