import { WTooltip, WButton } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { postToFirebase } from "../firebase/logger";
import { constants } from "../static";

import { WasabeeOp, WasabeePortal } from "../model";
import { MultiLayer } from "./quickdraw/multilayer";
import { SingleLink } from "./quickdraw/singlelink";
import { StarBurst } from "./quickdraw/starburst";
import { Burst } from "./quickdraw/burst";

import type { QuickDrawMode } from "./quickdraw/mode";
import type {
  LatLng,
  LeafletEvent,
  LeafletKeyboardEvent,
  LeafletMouseEvent,
} from "leaflet";

class QuickdrawButton extends WButton {
  static TYPE = "QuickdrawButton";

  needWritePermission = true;

  handler: QuickDrawHandler;
  picker: HTMLInputElement;

  constructor(container: HTMLElement) {
    super(container);
    this.title = wX("QD TITLE");
    this.handler = new QuickDrawHandler({ button: this });
    this._container = container;
    this.type = QuickdrawButton.TYPE;

    this.button = this._createButton({
      title: this.title,
      container: container,
      className: "wasabee-toolbar-quickdraw",
      callback: () => {
        this.picker.value = "#000000";
        this.handler.enable();
      },
      context: this.handler,
    });

    this.picker = L.DomUtil.create("input", "hidden-color-picker");
    this.picker.type = "color";
    this.picker.value = "#000000"; // just need a default value that is not in the displayed list
    this.picker.setAttribute("list", "wasabee-colors-datalist");

    L.DomEvent.on(this.picker, "change", (ev) => {
      this.handler._nextDrawnLinksColor = (ev.target as HTMLInputElement).value;
    });

    this.setSubActions(this.getSubActions());

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("QD TITLE");
      this.setSubActions(this.getSubActions());
      this.handler.updateTooltip();
    });

    this.update();
  }

  getSubActions() {
    const changeColorSubAction = {
      title: wX("QD BUTTON CHANGE COLOR"),
      text: wX("QD CHANGE COLOR"),
      html: this.picker,
      callback: () => {
        this.picker.click();
      },
      context: null,
    };

    const toggleModeSubAction = {
      title: wX("QD BUTTON TOGGLE MODE"),
      text: wX("toolbar.quick_draw.toggle.text", {
        mode: this.handler.getMode().getName(),
      }),
      callback: () => {
        this.handler._toggleMode();
      },
      context: null,
    };

    const endSubAction = {
      title: wX("QD BUTTON END"),
      text: wX("QD END"),
      callback: this.handler.disable,
      context: this.handler,
    };

    return [toggleModeSubAction, changeColorSubAction, endSubAction];
  }

  enable() {
    WButton.prototype.enable.call(this);
    this.button.classList.add("active");
  }

  disable() {
    WButton.prototype.disable.call(this);
    if (this.handler.enabled()) this.handler.disable.call(this.handler);
    this.button.classList.remove("active");
  }
}

class QuickDrawHandler extends L.Handler {
  options: {
    button: QuickdrawButton;
  };

  _modes: { new (op: WasabeeOp): QuickDrawMode }[];
  _tooltip: WTooltip;
  _guideLayerGroup: L.LayerGroup;
  _map: L.Map;
  _operation: WasabeeOp;
  _nextDrawnLinksColor: string;
  _opID: OpID;
  _currentMode: QuickDrawMode;

  constructor(options: { button: QuickdrawButton }) {
    super(window.map);
    L.setOptions(this, options);

    this._modes = [MultiLayer, SingleLink, StarBurst, Burst];
  }

  enable() {
    if (this.enabled()) {
      this.disable();
      return this;
    }
    super.enable();
    this.options.button.enable();
    postToFirebase({ id: "analytics", action: "quickdrawStart" });
    return this;
  }

  disable() {
    if (!this.enabled()) return this;
    super.disable();
    this.options.button.disable();
    postToFirebase({ id: "analytics", action: "quickdrawEnd" });
    return this;
  }

  addHooks() {
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(this._map);
    this._guideLayerGroup = new L.LayerGroup();
    window.addLayerGroup(
      "Wasabee Quickdraw Guide",
      this._guideLayerGroup,
      window.isSmartphone()
    );

    this._operation = getSelectedOperation();
    this._nextDrawnLinksColor = this._operation.color;
    this._opID = this._operation.ID;
    // start last mode
    this._currentMode = new this._modes[0](this._operation);
    this._tooltip.updateContent(this._currentMode.getTooltip());

    window.map.on("wasabee:portal:click", this._portalClicked, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
    window.map.on("mousemove", this._onMouseMove, this);
  }

  removeHooks() {
    window.removeLayerGroup(this._guideLayerGroup);

    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("wasabee:portal:click", this._portalClicked, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
    window.map.off("mousemove", this._onMouseMove, this);
  }

  getMode() {
    if (!this._currentMode)
      this._currentMode = new this._modes[0](this._operation);
    return this._currentMode;
  }

  updateTooltip() {
    if (!this.enabled()) return;
    this._tooltip.updateContent(this._currentMode.getTooltip());
  }

  _opchange() {
    if (!this.enabled()) return;

    if (getSelectedOperation().ID != this._opID) {
      console.log("operation changed mid-quickdraw - disabling");
      this.disable();
    }
  }

  _keyUpListener(e: LeafletKeyboardEvent) {
    if (!this.enabled()) return;

    // [esc]
    switch (e.originalEvent.key) {
      case "Escape":
      case "Esc":
        this.disable();
        break;
      case "/":
      case "g":
        postToFirebase({ id: "analytics", action: "quickdrawGuides" });
        this._guideLayerToggle();
        break;
      case "t":
      case "m":
        postToFirebase({ id: "analytics", action: "quickdrawMode" });
        this._toggleMode();
        break;
      case "X":
        postToFirebase({ id: "analytics", action: "quickdrawClearAll" });
        this._operation.clearAllLinks();
        window.map.fire("wasabee:crosslinks");
        break;
      default:
    }
  }

  _onMouseMove(e: LeafletMouseEvent) {
    if (e.latlng) {
      this._guideUpdate(e);
    }
  }

  _guideUpdate(e: LeafletMouseEvent) {
    this._guideLayerGroup.clearLayers();
    for (const lls of this._currentMode.getGuides(e.latlng)) {
      L.polyline(lls, constants.QUICKDRAW_GUIDE_STYLE).addTo(
        this._guideLayerGroup
      );
    }
    const dist = [];
    for (const l of this._guideLayerGroup.getLayers() as L.Polyline[]) {
      const d = (l.getLatLngs()[0] as LatLng).distanceTo(
        l.getLatLngs()[1] as LatLng
      );
      dist.push(d > 1e3 ? (d * 1e-3).toFixed(2) + " km" : d.toFixed(0) + " m");
    }
    if (dist.length === 0) return;
    const frag = document.createDocumentFragment();
    frag.append(
      dist.join(" / "),
      L.DomUtil.create("br"),
      this._currentMode.getTooltip()
    );
    this._tooltip.updateContent(frag, true);
  }

  _guideLayerToggle() {
    if (window.map.hasLayer(this._guideLayerGroup))
      this._guideLayerGroup.remove();
    else {
      this._guideLayerGroup.addTo(window.map);
      window.mapDataRequest.render.bringPortalsToFront();
    }
  }

  _portalClicked(ev: LeafletEvent & { portal: WasabeePortal }) {
    const selectedPortal = ev.portal;
    if (!(selectedPortal instanceof WasabeePortal)) {
      this._tooltip.updateContent(wX("toolbar.quick_draw.tooltip.portal_fail"));
      return;
    }
    this._currentMode.onPortalClick(this._operation, selectedPortal, {
      color: this._nextDrawnLinksColor,
    });
    this._tooltip.updateContent(this._currentMode.getTooltip());
  }

  _toggleMode() {
    this._modes.push(this._modes.shift());
    this._currentMode = new this._modes[0](this._operation);

    this._guideLayerGroup.clearLayers();
    this._tooltip.updateContent(this._currentMode.getTooltip());
    this.options.button.setSubActions(this.options.button.getSubActions());
  }
}

export default QuickdrawButton;
