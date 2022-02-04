import { WDialog } from "../../leafletClasses";
import WasabeeMarker from "../../model/marker";
import { getSelectedOperation } from "../../selectedOp";
import wX from "../../wX";
import { getAllPortalsOnScreen } from "../../uiCommands";

import PortalUI from "../../ui/portal";
import { displayError } from "../../error";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
export const AutoDraw = WDialog.extend({
  statics: {
    TYPE: "autodraw",
  },

  needWritePermission: true,

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    this._portalSets = {};
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this._opChange, this);

    this._mapRefreshHook = this._updatePortalSet.bind(this);
    window.addHook("mapDataRefreshEnd", this._mapRefreshHook);

    this._operation = getSelectedOperation();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this._opChange, this);

    window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
  },

  _opChange: function () {
    this._operation = getSelectedOperation();
    this._updatePortalSet();
  },

  _initPortalSet: function (setKey, zone, keys) {
    const portalSet = this._portalSets[setKey];
    portalSet.zone = zone;
    portalSet.keys = keys;
    portalSet.portals = [];
  },

  _updatePortalSet: function () {
    for (const setKey in this._portalSets) {
      const portalSet = this._portalSets[setKey];
      if (portalSet.keys) {
        const keys = this._operation.markers.filter(
          (m) => m.type === WasabeeMarker.constants.MARKER_TYPE_KEY
        );
        portalSet.portals = keys.map((m) =>
          this._operation.getPortal(m.portalId)
        );

        if (portalSet.zone) {
          const zone = this._operation.getZone(portalSet.zone);
          if (zone) {
            //failsafe
            portalSet.portals = portalSet.portals.filter((p) =>
              zone.contains(p.latLng)
            );
          }
        }
      } else {
        const portals = getAllPortalsOnScreen(this._operation);
        if (portalSet.zone == 0) portalSet.portals = portals;
        else {
          const ids = new Set(portalSet.portals.map((p) => p.id));
          for (const p of portals) {
            if (!ids.has(p.id)) portalSet.portals.push(p);
          }
          const zone = this._operation.getZone(portalSet.zone);
          if (zone) {
            // filter all, if zone shape changed
            portalSet.portals = portalSet.portals.filter((p) =>
              zone.contains(p.latLng)
            );
          }
        }
      }
      portalSet.display.textContent = wX("PORTAL_COUNT", {
        count: portalSet.portals.length,
      });
    }
  },

  _addSetPortal: function (text, thisKey, container, storageKey, callback) {
    const label = L.DomUtil.create("label", "set-portal-label", container);
    label.textContent = text;
    const button = L.DomUtil.create("button", "set-portal-button", container);
    button.textContent = wX("SET");
    const display = L.DomUtil.create("span", "set-portal-display", container);
    if (this[thisKey]) {
      display.appendChild(PortalUI.displayFormat(this[thisKey]));
    } else {
      display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(button, "click", () => {
      this[thisKey] = PortalUI.getSelected();
      if (this[thisKey]) {
        if (storageKey)
          localStorage[storageKey] = JSON.stringify(this[thisKey]);
        display.textContent = "";
        display.appendChild(PortalUI.displayFormat(this[thisKey]));
      } else {
        display.textContent = wX("NOT_SET");
        displayError(wX("PLEASE_SELECT_PORTAL"));
      }
      if (callback) callback();
    });
  },

  _addCheckbox: function (text, id, thisKey, container, defaultValue) {
    const label = L.DomUtil.create("label", "checkbox-label", container);
    label.textContent = text;
    label.htmlFor = id;
    const checkbox = L.DomUtil.create("input", "checkbox-input", container);
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = defaultValue;
    this[thisKey] = defaultValue;
    L.DomEvent.on(checkbox, "change", () => {
      this[thisKey] = checkbox.checked;
    });
  },

  _addSelectSet: function (text, setKey, container, defaultValue) {
    const label = L.DomUtil.create("label", "select-set-label", container);
    label.textContent = text;
    const select = L.DomUtil.create("select", "select-set-input", container);
    const display = L.DomUtil.create("span", "select-set-display", container);
    display.textContent = wX("NOT_SET");
    {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_ALL_PORTALS");
      o.value = "all";
      o.selected = defaultValue == o.value;
    }
    {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_ALL_KEYS");
      o.value = "keys";
      o.selected = defaultValue == o.value;
    }
    for (const zone of this._operation.zones) {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = zone.name;
      o.value = zone.id;
      o.selected = defaultValue == o.value;
    }
    for (const zone of this._operation.zones) {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_KEYS_ZONE", { zoneName: zone.name });
      o.value = "keys" + zone.id;
      o.selected = defaultValue == o.value;
    }
    L.DomEvent.on(select, "change", (ev) => {
      L.DomEvent.stop(ev);
      const keys = select.value.slice(0, 4) === "keys";
      const zone =
        select.value === "all" || select.value === "keys"
          ? 0
          : +(keys ? select.value.slice(4) : select.value);
      this._initPortalSet(setKey, zone, keys);
      this._updatePortalSet();
    });

    this._portalSets[setKey] = {
      portals: [],
      zone: 0,
      keys: false,
      display: display,
    };
  },
});
