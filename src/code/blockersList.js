import { Feature } from "./leafletDrawImports";

// generic confirmation screen w/ ok and cancel buttons

const BlockerList = Feature.extend({
  statics: {
    TYPE: "blockerList"
  },

  initialize: function(map, options) {
    this.type = BlockerList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const blockerList = this;
    this._dialog = window.dialog({
      title: "Blockers",
      width: "auto",
      height: "auto",
      html: this._buildContent(),
      dialogClass: "wasabee-dialog",
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Auto-Mark": () => {
          alert(
            "Auto-Mark does not work yet... but how awesome will it be to have it?!"
          );
        }
      },
      closeCallback: () => {
        // window.runHooks( "wasabeeUIUpdate", window.plugin.wasabee.getSelectedOperation());
        blockerList.disable();
        delete blockerList._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.blockerList
    });
  },

  _buildContent: function() {
    const content = document.createElement("div");
    content.innerText = "This will be a sortable list of all known blockers";
    return content;
  }
});

export default BlockerList;
