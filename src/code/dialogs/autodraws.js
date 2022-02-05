import { WDialog } from "../leafletClasses";
import wX from "../wX";
import MultimaxDialog from "./autodraws/multimaxDialog";
import FanfieldDialog from "./autodraws/fanfield";
import StarburstDialog from "./autodraws/starburst";
import SaveLinksDialog from "./autodraws/saveLinks";
import OnionfieldDialog from "./autodraws/onionfield";
import HomogeneousDialog from "./autodraws/homogeneous";
import MadridDialog from "./autodraws/madrid";
import FlipFlopDialog from "./autodraws/flipflop";

// This file documents the minimum requirements of a dialog in wasabee
const AutodrawsDialog = WDialog.extend({
  // not strictly necessary, but good style
  statics: {
    TYPE: "autodraws",
  },

  needWritePermission: true,

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    this.menuItems = [
      {
        text: wX("MM"),
        callback: () => {
          this.closeDialog();
          const mm = new MultimaxDialog();
          mm.enable();
        },
      },
      {
        text: wX("MAX"),
        callback: () => {
          this.closeDialog();
          const ff = new FanfieldDialog();
          ff.enable();
        },
      },
      {
        text: wX("STARBURST"),
        callback: () => {
          this.closeDialog();
          const sb = new StarburstDialog();
          sb.enable();
        },
      },
      {
        text: wX("ONION_WAS_TAKEN"),
        callback: () => {
          this.closeDialog();
          const o = new OnionfieldDialog();
          o.enable();
        },
      },
      {
        text: wX("HG"),
        callback: () => {
          this.closeDialog();
          const h = new HomogeneousDialog();
          h.enable();
        },
      },
      {
        text: wX("MADRID_WAS_TAKEN"),
        callback: () => {
          this.closeDialog();
          const m = new MadridDialog();
          m.enable();
        },
      },
      {
        text: wX("SAVELINKS"),
        callback: () => {
          this._dialog.dialog("close");
          const sl = new SaveLinksDialog();
          sl.enable();
        },
      },
      {
        text: wX("FLIP_FLOP_NAME"),
        callback: () => {
          this.closeDialog();
          const ff = new FlipFlopDialog();
          ff.enable();
        },
      },
    ];
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const html = L.DomUtil.create("div", "container");
    for (const i of this.menuItems) {
      const link = L.DomUtil.create("a", null, html);
      link.href = "#";
      link.textContent = i.text;
      L.DomEvent.on(link, "click", L.DomEvent.stopPropagation)
        .on(link, "mousedown", L.DomEvent.stopPropagation)
        .on(link, "dblclick", L.DomEvent.stopPropagation)
        .on(link, "click", L.DomEvent.preventDefault)
        .on(link, "click", i.callback, this);
    }

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("AUTODRAWS"),
      html: html,
      width: "auto",
      dialogClass: "autodraws",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.autodraws,
    });
  },
});

export default AutodrawsDialog;
