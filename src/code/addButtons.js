import QuickdrawButton from "./buttons/quickdrawButton";
import WasabeeButton from "./buttons/wasabeeButton";
import SyncButton from "./buttons/syncButton";
import OpsButton from "./buttons/opsButton";
import LinkButton from "./buttons/linkButton";
import MarkerButton from "./buttons/markerButton";
import UploadButton from "./buttons/uploadButton";
import { getSelectedOperation } from "./selectedOp";

/* This function adds the plugin buttons on the left side of the screen */
export default function(selectedOp) {
  selectedOp = selectedOp || getSelectedOperation();

  if (window.plugin.wasabee.buttons) {
    console.log("replacing buttons");
    delete window.plugin.wasabee.buttons;
  }

  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft"
    },
    onAdd: function(map) {
      const outerDiv = L.DomUtil.create("div", "wasabee wasabee-section");
      this._container = L.DomUtil.create(
        "div",
        "leaflet-arcs leaflet-bar",
        outerDiv
      );
      this._modes = {};

      const wb = new WasabeeButton(map, this._container);
      this._modes[wb.type] = wb;
      const ob = new OpsButton(map, this._container);
      this._modes[ob.type] = ob;
      const qb = new QuickdrawButton(map, this._container);
      this._modes[qb.type] = qb;
      const lb = new LinkButton(map, this._container);
      this._modes[lb.type] = lb;
      const mb = new MarkerButton(map, this._container);
      this._modes[mb.type] = mb;
      const sb = new SyncButton(map, this._container);
      this._modes[sb.type] = sb;
      const ub = new UploadButton(map, this._container);
      this._modes[ub.type] = ub;
      return outerDiv;
    },

    update: function(operation) {
      for (const id in window.plugin.wasabee.buttons._modes) {
        window.plugin.wasabee.buttons._modes[id].Wupdate(
          window.plugin.wasabee.buttons._container,
          operation
        );
      }
    }
  });

  if (typeof window.plugin.wasabee.buttons === "undefined") {
    window.plugin.wasabee.buttons = new ButtonsControl();
    window.map.addControl(window.plugin.wasabee.buttons);
  }

  window.addHook("wasabeeUIUpdate", window.plugin.wasabee.buttons.update);

  window.plugin.wasabee.buttons.update(selectedOp);
}
