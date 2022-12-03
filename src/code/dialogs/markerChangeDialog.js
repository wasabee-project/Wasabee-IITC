import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { WasabeeMarker, WasabeeBlocker } from "../model";

import * as PortalUI from "../ui/portal";

const MarkerChangeDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  needWritePermission: true,

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

    portalDisplay.appendChild(PortalUI.displayFormat(portal));

    this._type = L.DomUtil.create("select", null, content);

    for (const k of WasabeeMarker.markerTypes) {
      const o = L.DomUtil.create("option", null, this._type);
      o.value = k;
      o.textContent = wX(k);
    }
    this._type.value = this.options.marker.type;

    const buttons = {};
    buttons[wX("OK")] = () => {
      if (WasabeeMarker.markerTypes.has(this._type.value)) {
        operation.startBatchMode();
        operation.removeMarker(this.options.marker);
        operation.addMarker(this._type.value, portal, {
          zone: this.options.marker.zone,
          comment: this.options.marker.comment,
          assign: this.options.marker.assignedTo,
        });
        if (WasabeeMarker.isDestructMarkerType(this._type.value))
          WasabeeBlocker.removeBlocker(operation, portal.id);
        operation.endBatchMode();
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
      autofocus: true,
    });
  },
});

export default MarkerChangeDialog;
