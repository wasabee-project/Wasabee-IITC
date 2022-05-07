import { WDialog } from "../leafletClasses";
import { WasabeePortal, WasabeeLink, WasabeeMarker } from "../model";
import wX from "../wX";

import * as PortalUI from "../ui/portal";
import * as LinkUI from "../ui/link";

export const SetCommentDialog = WDialog.extend({
  statics: {
    TYPE: "setCommentDialog",
  },

  needWritePermission: true,

  options: {
    // target
    // operation
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);

    if (this.options.target instanceof WasabeeLink) {
      this.commentType = "link";
      this.dialogTitle = wX("SET_LCOMMENT");
      this.portal = this.options.operation.getPortal(
        this.options.target.fmPortalId
      );
    }

    if (this.options.target instanceof WasabeeMarker) {
      this.commentType = "marker";
      this.portal = this.options.operation.getPortal(
        this.options.target.portalId
      );
      this.dialogTitle = wX("SET_MCOMMENT", {
        portalName: PortalUI.displayName(this.portal),
      });
    }

    if (this.options.target instanceof WasabeePortal) {
      this.commentType = "portal";
      this.dialogTitle = wX("SET_PCOMMENT", {
        portalName: PortalUI.displayName(this.options.target),
      });
      this.portal = this.options.target;
    }

    if (!this.commentType) {
      console.log("comment dialog requested for unknown type");
      console.log(this.options.target);
    }
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: this.dialogTitle,
      html: this._buildHtml(),
      width: "auto",
      dialogClass: "setcomment",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.setComment,
      autofocus: true,
    });
  },

  _buildHtml: function () {
    const container = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", container);
    const input = L.DomUtil.create("input", null, container);
    input.placeholder = wX("COMMENT");

    if (this.commentType == "link") {
      desc.textContent = wX("SET_LINK_COMMENT");
      desc.appendChild(
        LinkUI.displayFormat(this.options.target, this.options.operation)
      );
      if (this.options.target.comment)
        input.value = this.options.target.comment;
      input.addEventListener(
        "change",
        () => {
          this.options.operation.setLinkComment(
            this.options.target,
            input.value
          );
        },
        false
      );
    }

    if (this.commentType == "marker") {
      desc.textContent = wX("SET_MARKER_COMMENT");
      desc.appendChild(PortalUI.displayFormat(this.portal));

      if (this.options.target.comment)
        input.value = this.options.target.comment;
      input.addEventListener(
        "change",
        () => {
          this.options.operation.setMarkerComment(
            this.options.target,
            input.value
          );
        },
        false
      );
    }

    if (this.commentType == "portal") {
      desc.textContent = wX("SET_PORT_COMMENT");
      desc.appendChild(PortalUI.displayFormat(this.portal));

      if (this.portal.comment) input.value = this.portal.comment;
      input.addEventListener(
        "change",
        () => {
          this.options.operation.setPortalComment(
            this.options.target,
            input.value
          );
        },
        false
      );

      const hardnessInput = L.DomUtil.create("input", null, container);
      hardnessInput.placeholder = wX("dialog.setcomment.portal_hardness");
      if (this.portal.hardness) hardnessInput.value = this.portal.hardness;
      hardnessInput.addEventListener(
        "change",
        () => {
          this.options.operation.setPortalHardness(
            this.options.target,
            hardnessInput.value
          );
        },
        false
      );
    }

    return container;
  },
});

export default SetCommentDialog;
