import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

const MarkerChangeDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  options: {
    // marker
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    const content = L.DomUtil.create("div", "content");

    const portal = operation.getPortal(this.options.marker.portalId);
    const portalDisplay = L.DomUtil.create("div", "portal", content);

    portalDisplay.appendChild(portal.displayFormat(this._smallScreen));

    this._type = L.DomUtil.create("select", null, content);

    const markers = operation.getPortalMarkers(portal);
    for (const k of window.plugin.wasabee.static.markerTypes) {
      const o = L.DomUtil.create("option", null, this._type);
      o.value = k;
      o.textContent = wX(k);
      if (markers.has(k) && k != this.options.marker.type) o.disabled = true;
    }
    this._type.value = this.options.marker.type;

    const buttons = {};
    buttons[wX("OK")] = () => {
      if (
        window.plugin.wasabee.static.markerTypes.has(this._type.value) &&
        !markers.has(this._type.value)
      ) {
        operation.removeMarker(this.options.marker);
        operation.addMarker(this._type.value, portal, {
          zone: this.options.marker.zone,
          comment: this.options.marker.comment,
          assign: this.options.marker.assign,
        });
      }
      this.closeDialog();
    };
    buttons[wX("CANCEL")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("SET_MARKER_TYPE_TITLE"),
      html: content,
      width: "auto",
      dialogClass: "markerchange",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.markerButton,
    });
  },
});

export default MarkerChangeDialog;
