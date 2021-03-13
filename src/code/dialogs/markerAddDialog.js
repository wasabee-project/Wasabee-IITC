import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const MarkerAddDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
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

      const markers = getSelectedOperation().getPortalMarkers(
        this._selectedPortal
      );
      let defaultType =
        window.plugin.wasabee.static.constants.DEFAULT_MARKER_TYPE;
      if (
        localStorage[window.plugin.wasabee.static.constants.LAST_MARKER_KEY] !=
        null
      ) {
        defaultType =
          localStorage[window.plugin.wasabee.static.constants.LAST_MARKER_KEY];
      }
      defaultType = markers.has(defaultType) ? null : defaultType;

      for (const k of window.plugin.wasabee.static.markerTypes) {
        const o = L.DomUtil.create("option", null, this._type);
        o.value = k;
        o.textContent = wX(k);
        if (markers.has(k)) o.disabled = true;
        else if (!defaultType) defaultType = k;
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
      if (window.plugin.wasabee.static.markerTypes.has(this._type.value))
        this._addMarker(this._type.value, this._comment.value);
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("ADD MARKER TITLE"),
      html: content,
      width: "auto",
      dialogClass: "markeradd",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerButton,
    });
  },

  _addMarker: function (selectedType, comment) {
    const operation = getSelectedOperation();
    operation.addMarker(selectedType, WasabeePortal.getSelected(), comment);
    this.update();
    localStorage[
      window.plugin.wasabee.static.constants.LAST_MARKER_KEY
    ] = selectedType;
  },
});

export default MarkerAddDialog;
