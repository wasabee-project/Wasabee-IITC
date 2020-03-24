const wT = window.plugin.wasabee.static.strings;

const wX = (key, value, option) => {
  const ll = window.navigator.userLanguage || window.navigator.language || "en";
  let l = ll.substring(0, 2);

  const defaultLang = localStorage["wasabee-default-language"] || "en";

  // if chosen langauge does not exist, use the default
  if (!wT[l]) l = defaultLang;

  // if this key does not exist in the chosen langauge, use the default, or English
  let s = wT[defaultLang][key] || wT[l][key] || wT["en"][key];

  // if it doesn't exist in English
  if (!s) return "haec notificatio praebibo est";

  // do any necessary replacements
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export default wX;
