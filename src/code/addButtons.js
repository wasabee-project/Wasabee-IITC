import QuickdrawButton from "./buttons/quickdrawButton";
import WasabeeButton from "./buttons/wasabeeButton";
import SyncButton from "./buttons/syncButton";
import OpsButton from "./buttons/opsButton";
import LinkButton from "./buttons/linkButton";
import MarkerButton from "./buttons/markerButton";
import UploadButton from "./buttons/uploadButton";

/* This function adds the plugin buttons on the left side of the screen */
export default function(selectedOp) {
  if (window.plugin.wasabee.buttons) {
    console.log("replacing buttons");
    delete window.plugin.wasabee.buttons;
  }

  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft"
    },
    onAdd: function(map) {
      const outerDiv = L.DomUtil.create(
        "div",
        "leaflet-draw leaflet-draw-section"
      );
      const container = L.DomUtil.create("div", "leaflet-arcs leaflet-bar");
      outerDiv.appendChild(container);
      this._modes = {};

      this.container = container;

      const wb = new WasabeeButton(map, container);
      this._modes[wb.type] = wb;
      const ob = new OpsButton(map, container);
      this._modes[ob.type] = ob;
      const qb = new QuickdrawButton(map, container);
      this._modes[qb.type] = qb;
      const lb = new LinkButton(map, container);
      this._modes[lb.type] = lb;
      const mb = new MarkerButton(map, container);
      this._modes[mb.type] = mb;
      const sb = new SyncButton(map, container);
      this._modes[sb.type] = sb;
      const ub = new UploadButton(map, container);
      this._modes[ub.type] = ub;
      return outerDiv;
    },

    update: function(operation) {
      console.log("updating buttons");
      for (const id in window.plugin.wasabee.buttons._modes) {
        window.plugin.wasabee.buttons._modes[id].Wupdate(
          window.plugin.wasabee.buttons.container,
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

  selectedOp = selectedOp || window.plugin.wasabee.getSelectedOperation();
  window.plugin.wasabee.buttons.update(selectedOp);
}
