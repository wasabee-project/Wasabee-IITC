const wT = window.plugin.wasabee.static.strings;

const wX = (key, arg, option) => {
  const ll = window.navigator.userLanguage || window.navigator.language || "en";
  let l = ll.substring(0, 2);

  // if chosen langauge does not exist, use english
  if (!wT[l]) l = "en";
  const s = wT[l][key] || wT["en"][key];

  if (!s) return "haec notificatio praebibo est";

  if (!arg) return s; // simple string, no magic needed
  if (!option) {
    // one parameter
    const t = assemble(s, "value");
    return t(arg);
  }
  const t = assemble(s, "value", "option");
  return t(arg, option);
};

// wow this is ugly -- but it works
function assemble(s, value, option) {
  return new Function(value, option, "return `" + s + "`;");
}

export default wX;
