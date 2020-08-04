import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const MarkerAddDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  initialize: function (map = window.map, options) {
    this.type = MarkerAddDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: MarkerAddDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    const context = this;
    this._pch = (portal) => {
      context.update(portal);
    };
    window.addHook("portalSelected", this._pch);

    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  update: function () {
    this._type.innerHTML = "";
    this._selectedPortal = WasabeePortal.getSelected();
    if (this._selectedPortal) {
      this._portal.textContent = "";
      this._portal.textContent = "";
      this._portal.appendChild(
        this._selectedPortal.displayFormat(this._smallScreen)
      );
      const markers = this._operation.getPortalMarkers(this._selectedPortal);
      let defaultType =
        window.plugin.wasabee.static.constants.DEFAULT_MARKER_TYPE;
      defaultType = markers.has(defaultType) ? null : defaultType;

      for (const k of window.plugin.wasabee.skin.markerTypes) {
        const o = L.DomUtil.create("option", null, this._type);
        o.value = k[0];
        o.textContent = wX(k[0]);
        if (markers.has(k[0])) o.disabled = true;
        else if (!defaultType) defaultType = k[0];
      }
      this._type.value = defaultType;
    } else {
      this._portal.textContent = wX("PLEASE_SELECT_PORTAL");
    }
  },

  _displayDialog: function () {
    this._marker = null;

    const content = L.DomUtil.create("div", "content");
    this._portal = L.DomUtil.create("div", "portal", content);

    this._type = L.DomUtil.create("select", null, content);
    this.update();

    this._comment = L.DomUtil.create("input", null, content);
    this._comment.placeholder = "Input comment";

    const addMarkerButton = L.DomUtil.create("button", null, content);
    addMarkerButton.textContent = wX("ADD_MARKER2");

    L.DomEvent.on(addMarkerButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._addMarker(this._type.value, this._operation, this._comment.value);
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("ADD MARKER TITLE"),
      html: content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-markeradd",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerButton,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _addMarker: function (selectedType, operation, comment) {
    operation.addMarker(selectedType, WasabeePortal.getSelected(), comment);
    this.update();
  },
});

export default MarkerAddDialog;
