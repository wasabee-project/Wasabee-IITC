// import WasabeeOp from "./operation";
// import WasabeePortal from "./portal";
import WasabeeLink from "./link";
import WasabeeMarker from "./marker";
import { Feature } from "./leafletDrawImports";

export const SetCommentDialogControl = Feature.extend({
  setup: function(target, operation) {
    this.operation = operation;
    this.target = target;
    if (target instanceof WasabeeLink) {
      this.commentType = "link";
      this.dialogTitle = "Set Link Comment";
    }
    if (target instanceof WasabeeMarker) {
      this.commentType = "marker";
      const portal = this.operation.getPortal(this.target.portalId);
      this.dialogTitle = "Set Marker Comment: " + portal.name;
    }
  },

  statics: {
    TYPE: "setCommentDialog"
  },

  initialize: function(map, options) {
    this.type = SetCommentDialogControl.TYPE;
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
    const setCommentHandler = this;
    this._dialog = window.dialog({
      title: this.dialogTitle,
      width: "auto",
      height: "auto",
      html: this._buildHtml(),
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: () => {
        setCommentHandler.disable();
        delete setCommentHandler._dialog;
      }
      // id: window.plugin.Wasabee.static.dialogNames.XXX
    });
  },

  _buildHtml: function() {
    const container = document.createElement("div");
    container.className = "wasabee-dialog wasabee-dialog-ops";
    const desc = document.createElement("div");
    const input = container.appendChild(document.createElement("input"));
    input.placeholder = "comment";

    if (this.commentType == "link") {
      desc.innerHTML = "Set comment for link";
      if (this.target.comment) input.value = this.target.comment;
    } else {
      desc.innerHTML = "Set comment for marker on: " + this.target.name;
      if (this.target.comment) input.value = this.target.comment;
      input.addEventListener(
        "change",
        () => {
          this.operation.setMarkerComment(this.target, input.value);
        },
        false
      );
    }
    return container;
  }
});

export default SetCommentDialogControl;
