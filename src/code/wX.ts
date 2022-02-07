import statics from "./static";

let strings = statics.strings;
const defaultLang = statics.constants.DEFAULT_LANGUAGE;
const localStoreKey = statics.constants.LANGUAGE_KEY;

const templateRe = /\{ *([\w_ -]+) *\}/g;

export function wX(key: string, data?: object) {
  const lang = getLanguage();

  // if the skin system is initialized, switch to it
  if (window.plugin.wasabee.skin && window.plugin.wasabee.skin.strings)
    strings = window.plugin.wasabee.skin.strings;

  let s: string = null;
  if (strings[lang] && strings[lang][key]) s = strings[lang][key];
  if (!s && strings[defaultLang] && strings[defaultLang][key])
    s = strings[defaultLang][key];

  // detect smallScreen here
  let smallScreen = false;
  if (window.plugin.userLocation) smallScreen = true;
  if (smallScreen) {
    if (
      strings[lang] &&
      strings[lang].smallScreen &&
      strings[lang].smallScreen[key]
    )
      s = strings[lang].smallScreen[key];
  }
  if (!s) s = `${key} not in ${lang} or ${defaultLang}`;

  return s.replace(templateRe, function (str, key) {
    const value = data[key];
    if (value === undefined) return `{${key}}`;
    return value;
  });
}

export function getLanguage() {
  // if the skin system is initialized, switch to it
  if (window.plugin.wasabee.skin && window.plugin.wasabee.skin.strings)
    strings = window.plugin.wasabee.skin.strings;

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
}

export default wX;
