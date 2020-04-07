// aliases to make review easier
const strings = window.plugin.wasabee.static.strings;
const defaultLang = window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE;
const localStoreKey = window.plugin.wasabee.static.constants.LANGUAGE_KEY;

export const wX = (key, value, option) => {
  const lang = getLanguage();

  let s = null;
  if (strings[lang] && strings[lang][key]) s = strings[lang][key];
  if (!s && strings[defaultLang] && strings[defaultLang][key])
    s = strings[defaultLang][key];
  if (!s) s = "haec notificatio praebibo est";

  // do any necessary replacements
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export const getLanguage = () => {
  // load the selected language, or use DEFAULT_LANGUAGE if not set
  let lang = localStorage[localStoreKey];
  if (!lang) {
    lang = defaultLang;
    localStorage[localStoreKey] = defaultLang;
    console.log("no language set, using default");
  }

  // if the langauge doesn't exist in either list, clear it and use DEFAULT_LANGUAGE
  if (!strings[lang]) {
    lang = defaultLang;
    localStorage[localStoreKey] = defaultLang;
    console.log("invalid language set, changing to default");
  }

  return lang;
};

export default wX;
