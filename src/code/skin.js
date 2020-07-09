import { getSelectedOperation, makeSelectedOperation } from "./selectedOp";
import addButtons from "./addButtons";

const Wasabee = window.plugin.wasabee;

// the skins probably aren't loaded by the time W's init is called
export const initSkin = () => {
  Wasabee.skin = {};
  Wasabee.skin.CSS = Wasabee.static.CSS;
  Wasabee.skin.images = Wasabee.static.images;
  Wasabee.skin.layerTypes = Wasabee.static.layerTypes;
  Wasabee.skin.markerTypes = Wasabee.static.markerTypes;
  Wasabee.skin.strings = Wasabee.static.strings;

  for (const k of Object.getOwnPropertyNames(window.plugin.wasabee.skin.CSS)) {
    addCSS(k, window.plugin.wasabee.skin.CSS[k]);
  }
};

const addCSS = (name, content) => {
  if (!window.plugin.wasabee._css) window.plugin.wasabee._css = new Array();
  if (window.plugin.wasabee._css.includes(name)) {
    document.getElementById("wasabee-css-" + name).remove();
    window.plugin.wasabee._css.splice(window.plugin.wasabee._css.indexOf(name));
  }

  const c = L.DomUtil.create("style", null, document.head);
  c.textContent = content;
  c.id = "wasabee-css-" + name;
};

const resetCSS = () => {
  for (const name of window.plugin.wasabee._css) {
    document.getElementById("wasabee-css-" + name).remove();
  }
  window.plugin.wasabee._css = new Array();
};

export const changeSkin = name => {
  const op = getSelectedOperation();
  if (name == "main") {
    delete localStorage[window.plugin.wasabee.static.constants.SKIN_KEY];
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
      Wasabee.skin.strings[k] = Wasabee.static.strings[k];
    }

    // if the skin has a language, switch to it
    if (Wasabee.skin.strings[name]) {
      localStorage[window.plugin.wasabee.static.constants.LANGUAGE_KEY] = name;
    }

    localStorage[Wasabee.static.constants.SKIN_KEY] = name;

    resetCSS();
    for (const k of Object.getOwnPropertyNames(
      window.plugin.wasabee.skin.CSS
    )) {
      addCSS(k, window.plugin.wasabee.skin.CSS[k]);
    }
    makeSelectedOperation(op.ID);
    addButtons(op);
    window.runHooks("wasabeeUIUpdate", op);
    return true;
  }
  console.log("Unknown skin " + name);
  return false;
};
