const wT = window.plugin.wasabee.static.strings;

const wX = (key, value, option) => {
  let defaultLang = localStorage["wasabee-default-language"] || "English";

  if (!wT[defaultLang]) {
    delete localStorage["wasabee-default-language"];
    defaultLang = "English";
  }

  let s = wT[defaultLang][key] || wT["English"][key];
  if (!s) return "haec notificatio praebibo est";

  // do any necessary replacements
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export default wX;
