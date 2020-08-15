import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const MarkerChangeDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  initialize: function (map = window.map, options) {
    this.type = MarkerChangeDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: MarkerChangeDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  setup: function (target, operation) {
    this._marker = target;
    this._operation = operation;
  },

  _displayDialog: function () {
    const content = L.DomUtil.create("div", "content");

    const portal = this._operation.getPortal(this._marker.portalId);
    const portalDisplay = L.DomUtil.create("div", "portal", content);

    portalDisplay.appendChild(portal.displayFormat(this._smallScreen));

    this._type = L.DomUtil.create("select", null, content);

    const markers = this._operation.getPortalMarkers(portal);
    for (const k of window.plugin.wasabee.static.markerTypes) {
      const o = L.DomUtil.create("option", null, this._type);
      o.value = k;
      o.textContent = wX(k);
      if (markers.has(k) && k != this._marker.type) o.disabled = true;
    }
    this._type.value = this._marker.type;

    const buttons = {};
    buttons[wX("OK")] = () => {
      if (
        window.plugin.wasabee.static.markerTypes.has(this._type.value) &&
        !markers.has(this._type.value)
      ) {
        this._operation.removeMarker(this._marker);
        this._operation.addMarker(
          this._type.value,
          portal,
          this._marker.comment
        );
      }
      this._dialog.dialog("close");
    };
    buttons[wX("CANCEL")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("SET_MARKER_TYPE_TITLE"),
      html: content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-markerchange",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerButton,
    });
  },
});

export default MarkerChangeDialog;
