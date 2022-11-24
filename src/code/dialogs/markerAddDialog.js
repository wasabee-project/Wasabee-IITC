import { WDialog } from "../leafletClasses";
import { WasabeeMe, WasabeeMarker, WasabeeBlocker } from "../model";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

import * as PortalUI from "../ui/portal";
import { displayError } from "../error";
import { getMe, getTeams } from "../model/cache";
import statics from "../static";

const MarkerAddDialog = WDialog.extend({
  statics: {
    TYPE: "markerButton",
  },

  needWritePermission: true,

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._pch = () => {
      context.update();
    };
    window.addHook("portalSelected", this._pch);

    this._displayDialog(); // async, but no need to await
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  update: async function () {
    // updating with a new portal selected and in bulk mode?
    if (
      this._selectedPortal &&
      PortalUI.getSelected() &&
      this._selectedPortal.id !== PortalUI.getSelected().id &&
      this._bulk.checked
    ) {
      this._selectedPortal = PortalUI.getSelected();
      if (WasabeeMarker.markerTypes.has(this._type.value))
        await this._addMarker(
          this._type.value,
          this._comment.value,
          this._zones.value,
          this._assign.value
        );
      return;
    }

    // zones can be populated even if portal not selected
    this._zones.textContent = ""; // do we need to do this every time? the zone list can change while this dialog is open.
    const zoneAll = L.DomUtil.create("option", null, this._zones);
    zoneAll.value = 0;
    zoneAll.textContent = wX("dialog.common.zone_all");
    for (const z of getSelectedOperation().zones) {
      const o = L.DomUtil.create("option", null, this._zones);
      o.value = z.id;
      o.textContent = z.name;
    }

    // clean and rebuild
    const options = await this._getAgentMenu();
    this._assign.textContent = "";
    for (const option of options) {
      this._assign.appendChild(option);
    }

    this._type.textContent = "";
    this._selectedPortal = PortalUI.getSelected();
    if (this._selectedPortal) {
      this._portal.textContent = "";
      this._portal.textContent = "";
      this._portal.appendChild(PortalUI.displayFormat(this._selectedPortal));

      this._zones.value = getSelectedOperation().determineZone(
        this._selectedPortal.latLng
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

      const types = Array.from(WasabeeMarker.markerTypes).map((t) => [
        t,
        wX(t),
      ]);
      types.sort((t1, t2) => t1[1].localeCompare(t2[1]));
      for (const [k, wx] of types) {
        const o = L.DomUtil.create("option", null, this._type);
        o.value = k;
        o.textContent = wx;
      }
      this._type.value = defaultType;
    } else {
      this._portal.textContent = wX("PLEASE_SELECT_PORTAL");
    }

    this.setTitle(wX("ADD MARKER TITLE"));
  },

  _displayDialog: async function () {
    this._marker = null;

    const content = L.DomUtil.create("div", "content");
    this._portal = L.DomUtil.create("div", "portal", content);

    L.DomUtil.create("label", null, content).textContent = wX("TYPE");
    this._type = L.DomUtil.create("select", null, content);

    L.DomUtil.create("label", null, content).textContent = wX("ZONE");
    this._zones = L.DomUtil.create("select", null, content);

    L.DomUtil.create("label", null, content).textContent = wX("AGENT");
    this._assign = L.DomUtil.create("select", null, content);

    L.DomUtil.create("label", null, content).textContent = wX("ADD_BULK");
    const bulk = L.DomUtil.create("div", "bulk", content);
    this._bulk = L.DomUtil.create("input", "checkbox-input", bulk);
    this._bulk.type = "checkbox";

    this._comment = L.DomUtil.create("input", null, content);
    this._comment.placeholder = wX("SET_COMMENT");

    await this.update();

    const addMarkerButton = L.DomUtil.create("button", null, content);
    addMarkerButton.textContent = wX("ADD");

    L.DomEvent.on(addMarkerButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (WasabeeMarker.markerTypes.has(this._type.value))
        this._addMarker(
          this._type.value,
          this._comment.value,
          this._zones.value,
          this._assign.value
        );
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("ADD MARKER TITLE"),
      html: content,
      width: "auto",
      dialogClass: "markeradd",
      buttons: buttons,
      id: statics.dialogNames.markerButton,
    });
  },

  _addMarker: async function (selectedType, comment, zone, assign) {
    const operation = getSelectedOperation();

    const options = {
      comment: comment,
      assign: assign,
      zone: zone,
    };

    // XXX remove comment from args in 0.20
    if (operation.addMarker(selectedType, PortalUI.getSelected(), options)) {
      localStorage[window.plugin.wasabee.static.constants.LAST_MARKER_KEY] =
        selectedType;
      if (WasabeeMarker.isDestructMarkerType(selectedType))
        WasabeeBlocker.removePortal(operation, PortalUI.getSelected().id);
      await this.update();
    } else displayError(wX("ALREADY_HAS_MARKER"));
  },

  _getAgentMenu: async function () {
    const options = [];
    const option = L.DomUtil.create("option", null);
    option.value = "";
    option.textContent = wX("UNASSIGNED");
    options.push(option);

    if (!WasabeeMe.isLoggedIn()) return options;

    const operation = getSelectedOperation();
    if (!operation.isOnCurrentServer()) return options;

    const alreadyAdded = new Set();
    const me = await getMe();
    const teams = await getTeams(
      operation.teamlist.map((t) => t.teamid).filter((id) => me.teamJoined(id)),
      5 * 60
    );
    for (const team of teams) {
      for (const a of team.agents) {
        if (!alreadyAdded.has(a.id)) {
          alreadyAdded.add(a.id);
          const option = L.DomUtil.create("option");
          option.value = a.id;
          option.textContent = a.getName();
          options.push(option);
        }
      }
    }
    return options;
  },
});

export default MarkerAddDialog;
