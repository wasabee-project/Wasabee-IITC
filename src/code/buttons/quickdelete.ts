import { WButton } from "../leafletClasses";
import wX from "../wX";

import type { Wasabee } from "../init";
import type { WLMarker } from "../ui/marker";
import type { WLLink } from "../ui/link";
import type { LeafletMouseEvent } from "leaflet";
import { getSelectedOperation } from "../selectedOp";

const W: Wasabee = window.plugin.wasabee;

class QuickDeleteButton extends WButton {
  static TYPE = "QuickdeleteButton";

  needWritePermission: true;

  handler: QuickDeleteHandler;

  constructor(container: HTMLElement) {
    super(container);

    this.title = wX("toolbar.quick_delete.title");
    this.type = QuickDeleteButton.TYPE;

    this.handler = new QuickDeleteHandler();

    this.button = this._createButton({
      title: this.title,
      container: container,
      className: "wasabee-toolbar-quickdelete",
      context: this,
      callback: this._toggleActions,
    });

    this.actionsContainer = this._createSubActions(this.getSubActions());

    this._container.appendChild(this.actionsContainer);

    window.map.on("wasabee:op:change", () => this.disable());

    // update text
    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("toolbar.quick_delete.title");
      const newSubActions = this._createSubActions(this.getSubActions());
      this._container.replaceChild(newSubActions, this.actionsContainer);
      newSubActions.style.display = this.actionsContainer.style.display;
      this.actionsContainer = newSubActions;
    });

    this.update();
  }

  actionApply() {
    const operation = getSelectedOperation();
    operation.markers = operation.markers.filter(
      (m) => !this.handler.deletedMarker.has(m.ID)
    );
    operation.links = operation.links.filter(
      (l) => !this.handler.deletedLink.has(l.ID)
    );
    operation.cleanAnchorList();
    operation.cleanPortalList();
    operation.update(true);
    operation.updateBlockers();
    this.disable();
  }

  actionCancel() {
    this.disable();
  }

  getSubActions() {
    const applySubAction = {
      title: wX("toolbar.quick_delete.apply.title"),
      text: wX("toolbar.quick_delete.apply.text"),
      callback: this.actionApply,
      context: this,
    };

    const cancelSubAction = {
      title: wX("toolbar.quick_delete.cancel.title"),
      text: wX("toolbar.quick_delete.cancel.title"),
      callback: this.actionCancel,
      context: this,
    };

    return [applySubAction, cancelSubAction];
  }

  enable() {
    WButton.prototype.enable.call(this);
    this.button.classList.add("active");
    this.handler.enable();
  }

  disable() {
    WButton.prototype.disable.call(this);
    this.button.classList.remove("active");
    this.handler.disable();
  }
}

class QuickDeleteHandler extends L.Handler {
  deletedMarker: Set<TaskID>;
  deletedLink: Set<TaskID>;

  constructor() {
    super(window.map);
    this.deletedMarker = new Set();
    this.deletedLink = new Set();
  }

  toggleMarker(event: LeafletMouseEvent) {
    const layer = event.target as WLMarker;
    layer.closePopup();
    if (this.deletedMarker.has(layer.options.id)) {
      this.deletedMarker.delete(layer.options.id);
      layer.setOpacity(1);
    } else {
      this.deletedMarker.add(layer.options.id);
      layer.setOpacity(0.5);
    }
  }

  toggleLink(event: LeafletMouseEvent) {
    const layer = event.target as WLLink;
    layer.closePopup();
    if (this.deletedLink.has(layer.options.linkID)) {
      this.deletedLink.delete(layer.options.linkID);
      layer.setStyle({
        opacity: 1,
      });
    } else {
      this.deletedLink.add(layer.options.linkID);
      layer.setStyle({
        opacity: 0.5,
      });
    }
  }

  addHooks() {
    W.markerLayerGroup.eachLayer((layer: WLMarker) => {
      layer.on("click", this.toggleMarker, this);
    });
    W.linkLayerGroup.eachLayer((layer: WLLink) => {
      layer.on("click", this.toggleLink, this);
    });
  }

  removeHooks() {
    W.markerLayerGroup.eachLayer((layer: WLMarker) => {
      layer.off("click", this.toggleMarker, this);
      layer.setOpacity(1);
    });
    W.linkLayerGroup.eachLayer((layer: WLLink) => {
      layer.off("click", this.toggleLink, this);
      layer.setStyle({
        opacity: 1,
      });
    });
  }
}

export default QuickDeleteButton;
