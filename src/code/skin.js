import { getSelectedOperation } from "./selectedOp";
import addButtons from "./addButtons";

const Wasabee = window.plugin.wasabee;

// the skins probably aren't loaded by the time W's init is called
export function initSkin() {
  Wasabee.skin = {};
  Wasabee.skin.layerTypes = new Map(Wasabee.static.layerTypes);
  Wasabee.skin.linkStyle = Wasabee.static.linkStyle;
  Wasabee.skin.selfBlockStyle = Wasabee.static.selfBlockStyle;
  Wasabee.skin.strings = Object.assign({}, Wasabee.static.strings);

  for (const k of Object.getOwnPropertyNames(Wasabee.static.CSS)) {
    addCSS(k, Wasabee.static.CSS[k]);
  }
}

function addCSS(name, content) {
  if (!Wasabee._css) Wasabee._css = new Array();
  if (Wasabee._css.includes(name)) {
    document.getElementById("wasabee-css-" + name).remove();
    Wasabee._css.splice(Wasabee._css.indexOf(name));
  }

  const c = L.DomUtil.create("style", null, document.head);
  c.textContent = content;
  c.id = "wasabee-css-" + name;

  Wasabee._css.push(name);
}

function resetCSS() {
  for (const name of Wasabee._css) {
    document.getElementById("wasabee-css-" + name).remove();
  }
  Wasabee._css = new Array();
}

// const addFallback = () => {
//   for (const k of Object.getOwnPropertyNames(Wasabee.static.CSS)) {
//     addCSS(k, Wasabee.static.CSS[k]);
//   }
//   for (const [k, d] of Wasabee.static.layerTypes)
//     if (!Wasabee.skin.layerTypes.has(k)) Wasabee.skin.layerTypes.set(k, d);
//   if (!Wasabee.skin.linkStyle)
//     Wasabee.skin.linkStyle = Wasabee.static.linkStyle;
//   if (!Wasabee.skin.selfBlockStyle)
//     Wasabee.skin.selfBlockStyle = Wasabee.static.selfBlockStyle;
// };

export function changeSkin(names) {
  if (!window.plugin.wasabeeSkins) window.plugin.wasabeeSkins = {};

  const op = getSelectedOperation();

  if (names.length == 0) {
    delete localStorage[Wasabee.static.constants.SKIN_KEY];
  }

  delete Wasabee.skin;

  resetCSS();
  initSkin();

  const validNames = [];

  for (const name of names) {
    if (
      !window.plugin.wasabeeSkins[name] ||
      !window.plugin.wasabeeSkins[name].static
    )
      continue;
    validNames.push(name);

    const skin = window.plugin.wasabeeSkins[name].static;

    // if the skin has a language, switch to it
    if (skin.strings) {
      for (const k of Object.getOwnPropertyNames(skin.strings)) {
        if (k == name)
          localStorage[Wasabee.static.constants.LANGUAGE_KEY] = name;
        Wasabee.skin.strings[k] = skin.strings[k];
      }
    }

    for (const k of Object.getOwnPropertyNames(skin.CSS)) {
      addCSS(k, skin.CSS[k]);
    }

    if (skin.layerTypes)
      for (const [k, v] of skin.layerTypes) Wasabee.skin.layerTypes.set(k, v);
    if (skin.linkStyle) Wasabee.skin.linkStyle = skin.linkStyle;
    if (skin.selfBlockStyle) Wasabee.skin.selfBlockStyle = skin.selfBlockStyle;
  }

  localStorage[
    window.plugin.wasabee.static.constants.SKIN_KEY
  ] = JSON.stringify(validNames);

  // makeSelectedOperation(op.ID);
  addButtons(op);
  window.runHooks("wasabeeUIUpdate", op);
  return true;
}
