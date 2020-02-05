// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
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
      this.portal = this.operation.getPortal(this.target.fmPortalId);
    }

    if (target instanceof WasabeeMarker) {
      this.commentType = "marker";
      this.portal = this.operation.getPortal(this.target.portalId);
      this.dialogTitle = "Set Marker Comment: " + this.portal.name;
    }

    if (target instanceof WasabeePortal) {
      this.commentType = "portal";
      this.dialogTitle = "Set Portal Comment: " + target.name;
      this.portal = this.target;
    }

    if (!this.commentType) {
      console.log("comment dialog requested for unknown type");
      console.log(target);
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
    if (!this.commentType) {
      console.log("SetupCommentDialog called before being setup");
      return;
    }
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
    const desc = container.appendChild(document.createElement("div"));
    const input = container.appendChild(document.createElement("input"));
    input.placeholder = "comment";

    if (this.commentType == "link") {
      desc.innerHTML = "Set comment for link: ";
      desc.appendChild(this.target.getLinkDisplay(this.operation));
      if (this.target.comment) input.value = this.target.description;
      input.addEventListener(
        "change",
        () => {
          this.operation.setLinkComment(this.target, input.value);
        },
        false
      );
    }

    if (this.commentType == "marker") {
      desc.innerHTML = "Set comment for marker on: ";
      desc.appendChild(this.portal.getPortalLink());

      if (this.target.comment) input.value = this.target.comment;
      input.addEventListener(
        "change",
        () => {
          this.operation.setMarkerComment(this.target, input.value);
        },
        false
      );
    }

    if (this.commentType == "portal") {
      desc.innerHTML = "Set comment for portal: ";
      desc.appendChild(this.portal.getPortalLink());

      if (this.portal.comment) input.value = this.portal.comment;
      input.addEventListener(
        "change",
        () => {
          this.operation.setPortalComment(this.target, input.value);
        },
        false
      );

      // add hardness here too
    }

    return container;
  }
});

export default SetCommentDialogControl;
