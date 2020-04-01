const wX = (key, value, option) => {
  // aliases to save typing
  const strings = window.plugin.wasabee.static.strings;
  const silly = window.plugin.wasabee.static.stringsSilly;

  // I don't like this, probably slow ...
  const merged = Object.assign(strings, silly);

  // load the selected language, or use English if not set
  // storage named "default-language" for historic reasons
  let lang =
    localStorage[window.plugin.wasabee.static.constants.LANGUAGE_KEY] ||
    window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE;

  // if the langauge doesn't exist in either list, clear it and use English
  if (!merged[lang]) {
    delete localStorage[window.plugin.wasabee.static.constants.LANGUAGE_KEY];
    lang = window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE;
  }

  let s = null;
  if (merged[lang] && merged[lang][key]) s = merged[lang][key];
  if (
    !s &&
    merged[window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE][key]
  )
    s = merged[window.plugin.wasabee.static.constants.DEFAULT_LANGUAGE][key];
  if (!s) s = "haec notificatio praebibo est";

  // do any necessary replacements
  if (option) s = s.replace("${option}", option);
  if (value) s = s.replace("${value}", value);
  return s;
};

export default wX;
