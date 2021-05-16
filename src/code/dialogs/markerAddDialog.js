import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import WasabeeMe from "../me";
import WasabeeTeam from "../team";
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

    this._displayDialog(); // async, but no need to await
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  update: async function () {
    this._type.innerHTML = "";

    // zones can be populated even if portal not selected
    this._zones.innerHTML = ""; // do we need to do this every time? the zone list can change while this dialog is open.
    const zoneAll = L.DomUtil.create("option", null, this._zones);
    zoneAll.value = 0;
    zoneAll.textContent = "All"; // wX this
    for (const z of getSelectedOperation().zones) {
      const o = L.DomUtil.create("option", null, this._zones);
      o.value = z.ID;
      o.textContent = z.name;
    }

    // clean and rebuild
    this._assign.innerHTML = "";
    await this._getAgentMenu(this._assign);

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

  _displayDialog: async function () {
    this._marker = null;

    const content = L.DomUtil.create("div", "content");
    this._portal = L.DomUtil.create("div", "portal", content);

    this._type = L.DomUtil.create("select", null, content);
    this._comment = L.DomUtil.create("input", null, content);
    this._comment.placeholder = "Input comment";

    this._zones = L.DomUtil.create("select", null, content);
    this._assign = L.DomUtil.create("select", null, content);
    await this.update();

    const addMarkerButton = L.DomUtil.create("button", null, content);
    addMarkerButton.textContent = wX("ADD_MARKER2");

    L.DomEvent.on(addMarkerButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (window.plugin.wasabee.static.markerTypes.has(this._type.value))
        this._addMarker(
          this._type.value,
          this._comment.value,
          this._zones.value,
          this._assign.value
        );
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
      id: window.plugin.wasabee.static.dialogNames.markerButton,
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
    operation.addMarker(selectedType, WasabeePortal.getSelected(), options);
    await this.update();
    localStorage[window.plugin.wasabee.static.constants.LAST_MARKER_KEY] =
      selectedType;
  },

  _getAgentMenu: async function (menu) {
    let option = menu.appendChild(L.DomUtil.create("option", null));
    option.value = "";
    option.textContent = wX("UNASSIGNED");
    const alreadyAdded = new Set();

    const me = await WasabeeMe.waitGet();
    for (const t of getSelectedOperation().teamlist) {
      if (me.teamJoined(t.teamid) == false) continue;
      try {
        // allow teams to be 5 minutes cached
        const tt = await WasabeeTeam.get(t.teamid, 5 * 60);
        const agents = tt.getAgents();
        for (const a of agents) {
          if (!alreadyAdded.has(a.id)) {
            alreadyAdded.add(a.id);
            option = L.DomUtil.create("option");
            option.value = a.id;
            option.textContent = a.name;
            menu.appendChild(option);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
});

export default MarkerAddDialog;
