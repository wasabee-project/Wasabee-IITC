import { WButton } from "../leafletClasses";
import wX from "../wX";

import type { Wasabee } from "../init";
import type { WLMarker } from "../ui/marker";
import type { WLLink } from "../ui/link";
import type { LeafletMouseEvent } from "leaflet";
import { getSelectedOperation } from "../selectedOp";
import type { WLAnchor } from "../ui/anchor";

const W: Wasabee = window.plugin.wasabee;

class QuickDeleteButton extends WButton {
  static TYPE = "QuickdeleteButton";

  needWritePermission: true;

  handler: QuickDeleteHandler;
  state: "off" | "on" | "instant";

  constructor(container: HTMLElement) {
    super(container);

    this.title = wX("toolbar.quick_delete.title");
    this.type = QuickDeleteButton.TYPE;

    this.handler = new QuickDeleteHandler(this);

    this.button = this._createButton({
      title: this.title,
      container: container,
      className: "wasabee-toolbar-quickdelete",
      context: this,
      callback: this.toggleActions,
    });
    this.state = "off";

    this.actionsContainer = this._createSubActions(this.getSubActions());

    this._container.appendChild(this.actionsContainer);

    window.map.on("wasabee:op:change", this.opChange, this);

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

  opChange() {
    if (this.state == 'on') this.disable();
    else if (this.state == 'instant') {
      this.handler.disable();
      this.handler.enable();
    }
  }

  toggleActions() {
    if (this.state == "off") {
      this.enable();
      this.state = "on";
    } else if (this.state == "on") {
      this.disable();
      this.enable();
      this.state = "instant";
      this.button.classList.add("blink");
    } else {
      this.disable();
    }
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
    super.enable();
    this.button.classList.add("active");
    this.handler.enable();
    return this;
  }

  disable() {
    super.disable();
    this.button.classList.remove("active");
    this.button.classList.remove("blink");
    this.handler.disable();
    this.state = "off";
    return this;
  }
}

class QuickDeleteHandler extends L.Handler {
  deletedMarker: Set<TaskID>;
  deletedLink: Set<TaskID>;

  control: QuickDeleteButton;

  constructor(control: QuickDeleteButton) {
    super(window.map);
    this.deletedMarker = new Set();
    this.deletedLink = new Set();
    this.control = control;
  }

  clickMarker(event: LeafletMouseEvent) {
    if (!this.enabled()) return;
    const layer = event.target as WLMarker;
    layer.closePopup();
    this.toggleMarker(layer);
  }

  toggleMarker(layer: WLMarker) {
    if (this.control.state == "instant") {
      const operation = getSelectedOperation();
      return operation.removeMarkerByID(layer.options.id);
    }

    if (this.deletedMarker.has(layer.options.id)) {
      this.deletedMarker.delete(layer.options.id);
      layer.setOpacity(1);
    } else {
      this.deletedMarker.add(layer.options.id);
      layer.setOpacity(0.5);
    }
  }

  clickLink(event: LeafletMouseEvent) {
    if (!this.enabled()) return;
    const layer = event.target as WLLink;
    layer.closePopup();
    this.toggleLink(layer);
  }

  toggleLink(layer: WLLink) {
    if (this.control.state == "instant") {
      const operation = getSelectedOperation();
      return operation.removeLinkByID(layer.options.linkID);
    }

    if (this.deletedLink.has(layer.options.linkID)) {
      this.deletedLink.delete(layer.options.linkID);
      layer.setStyle({
        opacity: window.plugin.wasabee.skin.linkStyle.opacity || 1,
      });
    } else {
      this.deletedLink.add(layer.options.linkID);
      layer.setStyle({
        opacity: 0.5 * (window.plugin.wasabee.skin.linkStyle.opacity || 1),
      });
    }
  }

  clickAnchor(event: LeafletMouseEvent) {
    if (!this.enabled()) return;
    const layer = event.target as WLAnchor;
    layer.closePopup();
    this.toggleAnchor(layer);
  }

  toggleAnchor(layer: WLAnchor) {
    const operation = getSelectedOperation();
    if (this.control.state == "instant")
      return operation.removeAnchor(layer.options.portalId);

    const portal = operation.getPortal(layer.options.portalId);
    const links = operation.getLinkListFromPortal(portal);
    // toggle all links if all deleted
    if (links.every((l) => this.deletedLink.has(l.ID))) {
      W.linkLayerGroup.eachLayer((layer: WLLink) => {
        if (links.find((l) => l.ID == layer.options.linkID))
          this.toggleLink(layer);
      });
    } else {
      // delete all links
      W.linkLayerGroup.eachLayer((layer: WLLink) => {
        if (!this.deletedLink.has(layer.options.linkID))
          if (links.find((l) => l.ID == layer.options.linkID))
            this.toggleLink(layer);
      });
    }
  }

  keyUpListener(e) {
    if (!this.enabled()) return;

    // [esc]
    if (e.originalEvent.keyCode === 27) {
      this.control.disable();
    }
  }

  addHooks() {
    W.portalLayerGroup.eachLayer((layer: WLAnchor) => {
      layer.on("spiderfiedclick", this.clickAnchor, this);
    });
    W.markerLayerGroup.eachLayer((layer: WLMarker) => {
      layer.on("spiderfiedclick", this.clickMarker, this);
    });
    W.linkLayerGroup.eachLayer((layer: WLLink) => {
      layer.on("click", this.clickLink, this);
    });
    window.map.on("keyup", this.keyUpListener, this);
  }

  removeHooks() {
    W.portalLayerGroup.eachLayer((layer: WLAnchor) => {
      layer.off("spiderfiedclick", this.clickAnchor, this);
    });
    W.markerLayerGroup.eachLayer((layer: WLMarker) => {
      layer.off("spiderfiedclick", this.clickMarker, this);
      layer.setOpacity(1);
    });
    W.linkLayerGroup.eachLayer((layer: WLLink) => {
      layer.off("click", this.clickLink, this);
      layer.setStyle({
        opacity: window.plugin.wasabee.skin.linkStyle.opacity || 1,
      });
    });
    window.map.off("keyup", this.keyUpListener, this);
  }
}

export default QuickDeleteButton;
