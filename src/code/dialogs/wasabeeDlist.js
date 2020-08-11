import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import wX from "../wX";
import WasabeeMe from "../me";
import WasabeePortal from "../portal";
import { getPortalDetails } from "../uiCommands";
import { postToFirebase } from "../firebaseSupport";

const WasabeeDList = WDialog.extend({
  statics: {
    TYPE: "wasabeeDList",
  },

  initialize: function (map = window.map, options) {
    this.type = WasabeeDList.TYPE;
    this._me = WasabeeMe.get();
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: WasabeeDList.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._UIUpdateHook = () => {
      context.update();
    };
    this._displayDialog();
    window.addHook("portalDetailLoaded", this._UIUpdateHook);
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalDetailLoaded", this._UIUpdateHook);
  },

  update: function () {
    const table = this.getListDialogContent().table;
    this._dialog.html(table);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("WASABEE_D_LIST"),
      html: this.getListDialogContent().table,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-wasabeedlist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.wasabeeDList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  getListDialogContent: function () {
    const content = new Sortable();
    content.fields = [
      {
        name: wX("PORTAL"),
        value: (n) => {
          if (
            window.portals[n.PortalID] &&
            window.portals[n.PortalID].options.data.title
          )
            return window.portals[n.PortalID].options.data.title;
          return n.PortalID;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, n) => {
          if (
            window.portals[n.PortalID] &&
            window.portals[n.PortalID].options.data.title
          ) {
            const p = WasabeePortal.get(n.PortalID);
            cell.appendChild(p.displayFormat(this._smallScreen));
          } else {
            getPortalDetails(n.PortalID);
            cell.textContent = value;
          }
        },
      },
      {
        name: wX("COUNT"),
        value: (key) => key.Count,
        sort: (a, b) => a - b,
        format: (cell, value) => {
          cell.textContent = value;
        },
      },
      {
        name: wX("CAPSULE"),
        value: (key) => key.CapID,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          cell.textContent = value;
        },
      },
    ];
    content.sortBy = 0;

    const mylist = new Array();
    for (const [portalID, data] of window.plugin.wasabee._Dkeys) {
      for (const [gid, values] of data) {
        if (portalID && gid == this._me.GoogleID) {
          mylist.push(values);
        }
      }
    }

    content.items = mylist;
    return content;
  },
});

export default WasabeeDList;
