const wX = (key, value, option) => {
  // aliases to save typing
  const strings = window.plugin.wasabee.static.strings;
  const silly = window.plugin.wasabee.static.stringsSilly;

  // load the selected language, or use English if not set
  // storage named "default-language" for historic reasons
  let lang = localStorage["wasabee-default-language"] || "English";

  // if the langauge doesn't exist in either list, clear it and use English
  if (!strings[lang] && !silly[lang]) {
    delete localStorage["wasabee-default-language"];
    lang = "English";
  }

  let s = null;
  // check the selected langauge in the main list,
  // if that fails, check the silly list. Use English as a last resort
  if (strings[lang] && strings[lang][key]) s = strings[lang][key];
  if (!s && silly[lang] && silly[lang][key]) s = silly[lang][key];
  if (!s && strings["English"][key]) s = strings["English"][key];
  if (!s) s = "haec notificatio praebibo est";

  // do any necessary replacements
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export default wX;
