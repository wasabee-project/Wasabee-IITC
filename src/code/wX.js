const wT = window.plugin.wasabee.static.strings;

const wX = (key, value, option) => {
  const ll = window.navigator.userLanguage || window.navigator.language || "en";
  let l = ll.substring(0, 2);

  // if chosen langauge does not exist, use english
  if (!wT[l]) l = "en";
  let s = wT[l][key] || wT["en"][key];

  if (!s) return "haec notificatio praebibo est";
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export default wX;
