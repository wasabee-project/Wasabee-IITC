import { WButton } from "../leafletClasses";
import WasabeeMe from "../me";
import { fullSync } from "../uiCommands";
import wX from "../wX";

const SyncButton = WButton.extend({
  statics: {
    TYPE: "syncButton",
  },

  Wupdate: function () {
    // takes container & operation, not needed here
    const loggedIn = WasabeeMe.isLoggedIn();
    if (loggedIn) {
      this._syncbutton.style.display = "block";
    } else {
      this._syncbutton.style.display = "none";
    }
  },

  initialize: function (map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = SyncButton.TYPE;
    // this.handler = null; // no handler since we do it all in this.Wupdate()
    this.title = wX("SYNC");

    this._syncbutton = this._createButton({
      container: container,
      className: "wasabee-toolbar-sync",
      context: this,
      title: this.title,
      callback: fullSync(),
    });

    // hide or show depeneding on logged in state
    this.Wupdate(); // container & operation not needed
  },
});

export default SyncButton;
