import { Feature } from "../leafletDrawImports";

const ManageTeamDialog = Feature.extend({
  statics: {
    TYPE: "manageTeamDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ManageTeamDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  setup: function(team) {
    this._team = team;
    console.log(team);
  },

  _displayDialog: function() {
    const html = L.DomUtil.create("div", null);
    html.textContent =
      "list of agents, with remove buttons, add agent form, rename team";

    this._dialog = window.dialog({
      //title: wX("MANAGE ", this._team.Name),
      title: "MANAGE: " + this._team.Name,
      width: "auto",
      height: "auto",
      html: html,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      }
      // id: window.plugin.wasabee.static.dialogNames.linkList
    });
  }
});

export default ManageTeamDialog;
