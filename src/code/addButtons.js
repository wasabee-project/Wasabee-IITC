import { ButtonsControl } from "./leafletClasses";
import QuickdrawButton from "./buttons/quickdrawButton";
import WasabeeButton from "./buttons/wasabeeButton";
import SyncButton from "./buttons/syncButton";
import OpButton from "./buttons/opButton";
import LinkButton from "./buttons/linkButton";
import MarkerButton from "./buttons/markerButton";
import UploadButton from "./buttons/uploadButton";

/* This function adds the plugin buttons on the left side of the screen */
export function addButtons() {
  if (window.plugin.wasabee.buttons) {
    console.warn("replacing buttons");
    window.map.removeControl(window.plugin.wasabee.buttons);
    delete window.plugin.wasabee.buttons;
  }

  const options = {};
  // XXX next refactor pass, don't require a container to be passed in, get the formatting on ButtonsControl.onAdd()
  options.container = L.DomUtil.create("ul", "leaflet-bar");
  options.position = "topleft";
  options.buttons = new Map();
  for (const Constructor of [
    WasabeeButton,
    OpButton,
    QuickdrawButton,
    LinkButton,
    MarkerButton,
    SyncButton,
    UploadButton,
  ]) {
    const item = L.DomUtil.create("li", null, options.container);
    const button = new Constructor(window.map, item);
    options.buttons.set(button.type, button);
  }

  window.plugin.wasabee.buttons = new ButtonsControl(options);
  window.map.addControl(window.plugin.wasabee.buttons);

  // start off with a fresh update
  window.plugin.wasabee.buttons.update();
}

export default addButtons;
