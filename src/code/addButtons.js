import QuickdrawButton from "./buttons/quickdrawButton";
import WasabeeButton from "./buttons/wasabeeButton";
import SyncButton from "./buttons/syncButton";
import OpButton from "./buttons/opButton";
import LinkButton from "./buttons/linkButton";
import MarkerButton from "./buttons/markerButton";
import UploadButton from "./buttons/uploadButton";
import { getSelectedOperation } from "./selectedOp";

/* This function adds the plugin buttons on the left side of the screen */
export function addButtons(selectedOp) {
  selectedOp = selectedOp || getSelectedOperation();

  if (window.plugin.wasabee.buttons) {
    console.log("replacing buttons");
    window.map.removeControl(window.plugin.wasabee.buttons);
    delete window.plugin.wasabee.buttons;
  }

  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft",
    },
    onAdd: function (map) {
      const outerDiv = L.DomUtil.create("div", "wasabee-buttons");
      this._container = L.DomUtil.create("ul", "leaflet-bar", outerDiv);
      this._modes = {};

      for (const Constructor of [
        WasabeeButton,
        OpButton,
        QuickdrawButton,
        LinkButton,
        MarkerButton,
        SyncButton,
        UploadButton,
      ]) {
        const item = L.DomUtil.create("li", null, this._container);
        const button = new Constructor(map, item);
        this._modes[button.type] = button;
      }
      return outerDiv;
    },

    update: function (operation) {
      for (const id in window.plugin.wasabee.buttons._modes) {
        window.plugin.wasabee.buttons._modes[id].Wupdate(
          window.plugin.wasabee.buttons._container,
          operation
        );
      }
    },
  });

  if (typeof window.plugin.wasabee.buttons === "undefined") {
    window.plugin.wasabee.buttons = new ButtonsControl();
    window.map.addControl(window.plugin.wasabee.buttons);
  }

  // this should not be run multiple times...
  window.addHook("wasabeeUIUpdate", window.plugin.wasabee.buttons.update);

  window.plugin.wasabee.buttons.update(selectedOp);
}

export default addButtons;
