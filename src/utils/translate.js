import * as Localization from 'expo-localization';
import i18n from "i18n-js";

export const languages = [
  { code: "en", name: "English" },
  { code: "sv", name: "Swedish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" }
];

const en = require("../../locales/en/translation.json");
const sv = require("../../locales/sv/translation.json");
const fr = require("../../locales/fr/translation.json");
const de = require("../../locales/de/translation.json");

i18n.fallbacks = true;
i18n.translations = { en, sv, fr, de };
i18n.locale = Localization.locale;

export const setLanguage = locale => (i18n.locale = locale);

export default i18n.translate.bind(i18n);
