import { WButton } from "../leafletClasses";
import wX from "../wX";

import type { Wasabee } from "../init";
import type { WLMarker } from "../ui/marker";
import type { WLLink } from "../ui/link";
import type { LeafletMouseEvent } from "leaflet";

const W: Wasabee = window.plugin.wasabee;

class QuickDeleteButton extends WButton {
  static TYPE = "QuickdeleteButton";

  needWritePermission: true;

  handler: L.Handler;

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

  getSubActions() {
    const applySubAction = {
      title: wX("toolbar.quick_delete.apply.title"),
      text: wX("toolbar.quick_delete.apply.text"),
      callback: () => {},
      context: null,
    };

    const cancelSubAction = {
      title: wX("toolbar.quick_delete.cancel.title"),
      text: wX("toolbar.quick_delete.cancel.title"),
      callback: () => {},
      context: null,
    };

    return [applySubAction, cancelSubAction];
  }

  enable() {
    WButton.prototype.enable.call(this);
    this.button.classList.add("active");
  }

  disable() {
    WButton.prototype.disable.call(this);
    this.button.classList.remove("active");
  }
}

class QuickDeleteHandler extends L.Handler {
  deletedMarker: Set<TaskID>;
  deletedLink: Set<TaskID>;

  constructor() {
    super(window.map);
  }

  toggleMarker(event: LeafletMouseEvent) {
    const layer = event.target as WLMarker;
    if (this.deletedMarker.has(layer.options.id))
      this.deletedMarker.delete(layer.options.id);
    else this.deletedMarker.add(layer.options.id);
  }

  toggleLink(event: LeafletMouseEvent) {
    const layer = event.target as WLLink;
    if (this.deletedLink.has(layer.options.linkID))
      this.deletedLink.delete(layer.options.linkID);
    else this.deletedLink.add(layer.options.linkID);
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
    });
    W.linkLayerGroup.eachLayer((layer: WLLink) => {
      layer.off("click", this.toggleLink, this);
    });
  }
}

export default QuickDeleteButton;
