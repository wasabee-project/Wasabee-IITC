import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import wX from "../wX";

export const SetCommentDialog = WDialog.extend({
  setup: function (target, operation) {
    this.operation = operation;
    this.target = target;

    if (target instanceof WasabeeLink) {
      this.commentType = "link";
      this.dialogTitle = wX("SET_LCOMMENT");
      this.portal = this.operation.getPortal(this.target.fmPortalId);
    }

    if (target instanceof WasabeeMarker) {
      this.commentType = "marker";
      this.portal = this.operation.getPortal(this.target.portalId);
      this.dialogTitle = wX("SET_MCOMMENT", this.portal.displayName);
    }

    if (target instanceof WasabeePortal) {
      this.commentType = "portal";
      this.dialogTitle = wX("SET_PCOMMENT", target.displayName);
      this.portal = this.target;
    }

    if (!this.commentType) {
      console.log("comment dialog requested for unknown type");
      console.log(target);
    }
  },

  statics: {
    TYPE: "setCommentDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = SetCommentDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this.dialogTitle,
      html: this._buildHtml(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-setcomment",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.setComment,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _buildHtml: function () {
    const container = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", container);
    const input = L.DomUtil.create("input", null, container);
    input.placeholder = "comment";

    if (this.commentType == "link") {
      desc.textContent = wX("SET_LINK_COMMENT");
      desc.appendChild(
        this.target.displayFormat(this.operation, this._smallScreen)
      );
      if (this.target.comment) input.value = this.target.comment;
      input.addEventListener(
        "change",
        () => {
          this.operation.setLinkComment(this.target, input.value);
        },
        false
      );
    }

    if (this.commentType == "marker") {
      desc.textContent = wX("SET_MARKER_COMMENT");
      desc.appendChild(this.portal.displayFormat(this.operation));

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
      desc.textContent = wX("SET_PORT_COMMENT");
      desc.appendChild(this.portal.displayFormat(this._smallScreen));

      if (this.portal.comment) input.value = this.portal.comment;
      input.addEventListener(
        "change",
        () => {
          this.operation.setPortalComment(this.target, input.value);
        },
        false
      );

      const hardnessInput = L.DomUtil.create("input", null, container);
      hardnessInput.placeholder = "hardness";
      if (this.portal.hardness) hardnessInput.value = this.portal.hardness;
      hardnessInput.addEventListener(
        "change",
        () => {
          this.operation.setPortalHardness(this.target, hardnessInput.value);
        },
        false
      );
    }

    return container;
  },
});

export default SetCommentDialog;
