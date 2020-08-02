// aliases to make review easier
let strings = window.plugin.wasabee.static.strings;
const defaultLang = window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE;
const localStoreKey = window.plugin.wasabee.static.constants.LANGUAGE_KEY;

export const wX = (key, value, option) => {
  const lang = getLanguage();

  // if the skin system is initialized, switch to it
  if (window.plugin.wasabee.skin && window.plugin.wasabee.skin.strings)
    strings = window.plugin.wasabee.skin.strings;

  let s = null;
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

  // do any necessary replacements
  // eslint-disable-next-line
  if (option !== undefined) s = s.replace("${option}", option);
  // eslint-disable-next-line
  if (value !== undefined) s = s.replace("${value}", value);
  return s;
};

export const getLanguage = () => {
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
};

export default wX;
