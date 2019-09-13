import { Feature } from "./leafletDrawImports";

const NewopButtonControl = Feature.extend({
  statics: {
    TYPE: "newopButton"
  },

  initialize: function(map, options) {
    this.type = NewopButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function() {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "New Op";
    var noHandler = this;
    this._dialog = window.dialog({
      title: "New Operation",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        noHandler.disable();
        delete noHandler._dialog;
      },
      id: "wasabee-newop"
    });
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default NewopButtonControl;
