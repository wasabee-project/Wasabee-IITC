import { getSelectedOperation, makeSelectedOperation } from "./selectedOp";
import addButtons from "./addButtons";

const Wasabee = window.plugin.wasabee;

// the skins probably aren't loaded by the time W's init is called
export const initSkin = () => {
  Wasabee.skin = {};
  Wasabee.skin.CSS = Wasabee.static.CSS;
  Wasabee.skin.layerTypes = Wasabee.static.layerTypes;
  Wasabee.skin.strings = Wasabee.static.strings;

  for (const k of Object.getOwnPropertyNames(Wasabee.skin.CSS)) {
    addCSS(k, Wasabee.skin.CSS[k]);
  }
};

const addCSS = (name, content) => {
  if (!Wasabee._css) Wasabee._css = new Array();
  if (Wasabee._css.includes(name)) {
    document.getElementById("wasabee-css-" + name).remove();
    Wasabee._css.splice(Wasabee._css.indexOf(name));
  }

  const c = L.DomUtil.create("style", null, document.head);
  c.textContent = content;
  c.id = "wasabee-css-" + name;

  Wasabee._css.push(name);
};

const resetCSS = () => {
  for (const name of Wasabee._css) {
    document.getElementById("wasabee-css-" + name).remove();
  }
  Wasabee._css = new Array();
};

const addFallback = () => {
  for (const k of Object.getOwnPropertyNames(Wasabee.static.CSS)) {
    addCSS(k, Wasabee.static.CSS[k]);
  }
  for (const [k, d] of Wasabee.static.layerTypes)
    if (!Wasabee.skin.layerTypes.has(k)) Wasabee.skin.layerTypes.set(k, d);
};

export const changeSkin = (name) => {
  const op = getSelectedOperation();
  if (name == "main") {
    delete localStorage[Wasabee.static.constants.SKIN_KEY];
    resetCSS();
    initSkin();
    addButtons(op);
    window.runHooks("wasabeeUIUpdate", op);
    return true;
  }

  if (
    window.plugin.wasabeeSkins &&
    window.plugin.wasabeeSkins[name] &&
    window.plugin.wasabeeSkins[name].static
  ) {
    delete Wasabee.skin;
    Wasabee.skin = window.plugin.wasabeeSkins[name].static;

    // add the stock languages back
    for (const k of Object.getOwnPropertyNames(Wasabee.static.strings)) {
      if (Wasabee.skin.strings == null) Wasabee.skin.strings = {};
      Wasabee.skin.strings[k] = Wasabee.static.strings[k];
    }

    // if the skin has a language, switch to it
    if (Wasabee.skin.strings[name]) {
      localStorage[Wasabee.static.constants.LANGUAGE_KEY] = name;
    }

    localStorage[Wasabee.static.constants.SKIN_KEY] = name;

    resetCSS();
    addFallback();

    for (const k of Object.getOwnPropertyNames(Wasabee.skin.CSS)) {
      addCSS(k, Wasabee.skin.CSS[k]);
    }
    makeSelectedOperation(op.ID);
    addButtons(op);
    window.runHooks("wasabeeUIUpdate", op);
    return true;
  }
  console.log("Unknown skin " + name);
  return false;
};
