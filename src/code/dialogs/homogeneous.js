import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect } from "../crosslinks";
// import WasabeeLink from "../link";
import {
  clearAllLinks,
  getAllPortalsOnScreen,
  testPortal
} from "../uiCommands";
import wX from "../wX";

const HomogeneousDialog = WDialog.extend({
  statics: {
    TYPE: "HomogeneousDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    // requires newer leaflet, poke user to upgrade their IITC
    if (!this._map.distance) {
      alert("Requires IITC 0.30.1 or newer");
      return;
    }
    this._layerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee H-G Debug", this._layerGroup, true);
    this._displayDialog();
  },

  removeHooks: function() {
    window.removeLayerGroup(this._layerGroup);
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", "container");
    const description2 = L.DomUtil.create("div", "desc", container);
    description2.textContent = wX("H-GEN_INST");
    const anchorDisplay = L.DomUtil.create("span", null, container);
    anchorDisplay.textContent = "";

    const anchorLabelOne = L.DomUtil.create("label", null, container);
    anchorLabelOne.textContent = wX("ANCHOR_PORTAL");
    const anchorButtonOne = L.DomUtil.create("button", null, container);
    anchorButtonOne.textContent = wX("SET");
    this._anchorDisplayOne = L.DomUtil.create("span", null, container);
    if (this._anchorOne) {
      this._anchorDisplayOne.appendChild(
        this._anchorOne.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplayOne.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButtonOne, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchorOne = WasabeePortal.getSelected();
      if (this._anchorOne) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
        ] = JSON.stringify(this._anchorOne);
        this._anchorDisplayOne.textContent = "";
        this._anchorDisplayOne.appendChild(
          this._anchorOne.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const anchorLabelTwo = L.DomUtil.create("label", null, container);
    anchorLabelTwo.textContent = wX("ANCHOR_PORTAL2");
    const anchorButtonTwo = L.DomUtil.create("button", null, container);
    anchorButtonTwo.textContent = wX("SET");
    this._anchorDisplayTwo = L.DomUtil.create("span", null, container);
    if (this._anchorTwo) {
      this._anchorDisplayTwo.appendChild(
        this._anchorTwo.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplayTwo.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButtonTwo, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchorTwo = WasabeePortal.getSelected();
      if (this._anchorTwo) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
        ] = JSON.stringify(this._anchorTwo);
        this._anchorDisplayTwo.textContent = "";
        this._anchorDisplayTwo.appendChild(
          this._anchorTwo.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const anchorLabelThree = L.DomUtil.create("label", null, container);
    anchorLabelThree.textContent = wX("ANCHOR_PORTAL3");
    const anchorButtonThree = L.DomUtil.create("button", null, container);
    anchorButtonThree.textContent = wX("SET");
    this._anchorDisplayThree = L.DomUtil.create("span", null, container);
    if (this._anchorThree) {
      this._anchorDisplayThree.appendChild(
        this._anchorThree.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplayThree.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButtonThree, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchorThree = WasabeePortal.getSelected();
      if (this._anchorThree) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_THREE_KEY
        ] = JSON.stringify(this._anchorThree);
        this._anchorDisplayThree.textContent = "";
        this._anchorDisplayThree.appendChild(
          this._anchorThree.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const depthLabel = L.DomUtil.create("label", null, container);
    depthLabel.textContent = wX("MAX_SPLITS");
    this.depthMenu = L.DomUtil.create("select", null, container);
    let dc = 2;
    while (dc <= 6) {
      const depthOption = L.DomUtil.create("option", null, this.depthMenu);
      depthOption.vaue = dc;
      depthOption.textContent = dc;
      dc++;
    } // no need for an event, we will read the value directly below

    const placeholder = L.DomUtil.create("div", "null", container);
    placeholder.textContent = "\u2063";
    const placeholder2 = L.DomUtil.create("span", "null", container);
    placeholder2.textContent = "\u2063";

    // Bottom buttons bar

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("ONION");
    L.DomEvent.on(button, "click", ev => {
      L.DomEvent.stop(ev);
      this.hfield.call(this);
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this._dialog = window.dialog({
      title: "Homogeneous",
      html: container,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-homogeneous",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      }
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  initialize: function(map = window.map, options) {
    WDialog.prototype.initialize.call(this, map, options);
    this.type = HomogeneousDialog.TYPE;
    this.title = "Homogeneous";
    this.label = "Homogeneous";
    this._operation = getSelectedOperation();
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_THREE_KEY];
    if (p) this._anchorThree = WasabeePortal.create(p);

    this._urp = testPortal();
    this._failed = 0;
  },

  hfield: function() {
    this._failed = 0;
    this._layerGroup.clearLayers();

    if (!this._anchorOne || !this._anchorTwo || !this._anchorThree) {
      alert("please select three anchors");
      return;
    }
    this._colors = new Array();
    for (const [k, c] of window.plugin.wasabee.static.layerTypes) {
      this._colors.push(k);
      this._trash = c;
    }

    this._operation.startBatchMode();
    this._operation.addPortal(this._anchorOne);
    this._operation.addPortal(this._anchorTwo);
    this._operation.addPortal(this._anchorThree);
    this._operation.addLink(this._anchorOne, this._anchorTwo, "Outer 1");
    this._operation.addLink(this._anchorOne, this._anchorThree, "Outer 2");
    this._operation.addLink(this._anchorTwo, this._anchorThree, "Outer 3");
    this._operation.endBatchMode();
    const portals = new Array();
    for (const p of getAllPortalsOnScreen(this._operation)) {
      if (
        this._fieldCovers(
          this._anchorOne,
          this._anchorTwo,
          this._anchorThree,
          p
        )
      )
        portals.push(p);
    }
    this._operation.startBatchMode();
    this._recurser(
      1,
      portals,
      this._anchorOne,
      this._anchorTwo,
      this._anchorThree
    );
    this._operation.endBatchMode();

    // this._operation.cleanAnchorList();
    // now, remove the portals that are unused
    this._operation.cleanPortalList();
    if (this._failed > 0) {
      alert(
        `Unable to find ${this._failed} splits, try less depth or a different region`
      );
    }
  },

  _recurser: function(depth, portalsCovered, one, two, three) {
    if (depth >= this.depthMenu.value) return;
    this._color = this._colors[depth % this._colors.length];

    // console.log(depth, "portals in consideration", portalsCovered);

    // build a map of all portals coverd by field one,two,three
    // keyed by distance to the centeroid of the field
    // does this get us much in reality? doesn't seem like it
    const m = new Map();
    const center = this._getCenter(one, two, three);
    for (const p of portalsCovered) {
      if (p == one.id || p == two.id || p == three.id) continue;
      const cDist = this._map.distance(center, p.latLng || p._latlng);
      m.set(cDist, p);
    }
    // sort by distance to centeroid the field
    const sorted = new Map([...m.entries()].sort((a, b) => a[0] - b[0]));
    if (sorted.size == 0) {
      console.log("empty set");
      const latlngs = [one.latLng, two.latLng, three.latLng, one.latLng];
      const polygon = L.polygon(latlngs, { color: "red" });
      polygon.addTo(this._layerGroup);
      this._failed += (3 ** (this.depthMenu.value - depth) - 1) / 2;
      return;
    }

    // if there is exactly one portal, use it
    if (sorted.size == 1) {
      // console.log("one portal fast-path");
      const i = sorted.keys();
      const onlyp = sorted.get(i.next().value);
      let linkID = this._operation.addLink(one, onlyp);
      this._operation.setLinkColor(linkID, this._color);
      linkID = this._operation.addLink(two, onlyp);
      this._operation.setLinkColor(linkID, this._color);
      linkID = this._operation.addLink(three, onlyp);
      this._operation.setLinkColor(linkID, this._color);

      if (depth + 1 < this.depthMenu.value) {
        this._failed += (3 ** (this.depthMenu.value - depth) - 1) / 2 - 1;
        const latlngs = [one.latLng, two.latLng, three.latLng, one.latLng];
        const polygon = L.polygon(latlngs, { color: "orange" });
        polygon.addTo(this._layerGroup);
      }
      return;
    }

    // find the portal that divides the area into regions with the closest number of portals
    // starts at the center-most and works outwards
    let differential = portalsCovered.length;
    let best = [];
    let bestp = {};
    // for each of the portals in play
    for (const [k, wp] of sorted) {
      // silence lint
      this._trash = k;
      const subregions = this._getSubregions(
        wp,
        new Array(...portalsCovered),
        one,
        two,
        three
      );
      // one of the regions didn't have enough
      if (!subregions) continue;
      // is this one better than the previous?
      // smallest difference in the number of portals between the greatest and least, 0 being ideal
      const temp =
        Math.max(
          subregions[0].length,
          subregions[1].length,
          subregions[2].length
        ) -
        Math.min(
          subregions[0].length,
          subregions[1].length,
          subregions[2].length
        );
      if (temp < differential) {
        best = subregions;
        differential = temp;
        bestp = wp;
      }
      // found one with equal number of portals in all 3, quit digging
      // if (differential == 0) break;
    }

    if (best.length == 0) {
      console.log("hit bottom at: ", depth, one.name, two.name, three.name);
      this._failed += (3 ** (this.depthMenu.value - depth) - 1) / 2;
      const latlngs = [one.latLng, two.latLng, three.latLng, one.latLng];
      const polygon = L.polygon(latlngs, { color: "yellow" });
      polygon.addTo(this._layerGroup);
      return;
    }

    // console.log("best balance: ", bestp.name, differential, best);
    let linkID = this._operation.addLink(one, bestp);
    this._operation.setLinkColor(linkID, this._color);
    linkID = this._operation.addLink(two, bestp);
    this._operation.setLinkColor(linkID, this._color);
    linkID = this._operation.addLink(three, bestp);
    this._operation.setLinkColor(linkID, this._color);

    depth++;
    // console.log("going deeper");
    if (depth == this.depthMenu.value) return;

    if (best[0]) {
      // console.log("region one", one.name, two.name, bestp.name);
      this._recurser(depth, new Array(...best[0]), one, two, bestp);
    }
    if (best[1]) {
      // console.log("region two", two.name, three.name, bestp.name);
      this._recurser(depth, new Array(...best[1]), two, three, bestp);
    }
    if (best[2]) {
      // console.log("region three", three.name, one.name, bestp.name);
      this._recurser(depth, new Array(...best[2]), one, three, bestp);
    }
  },

  _getSubregions: function(centerPoint, possibles, one, two, three) {
    this._operation.addPortal(centerPoint);

    const possibleExceptAnchors = new Array();
    for (const p of possibles) {
      const guid = p.id || p.options.guid;
      if (
        guid !== centerPoint.id &&
        guid !== one.id &&
        guid !== two.id &&
        guid !== three.id
      )
        possibleExceptAnchors.push(p);
    }

    const onePortals = new Array();
    for (const p of possibleExceptAnchors) {
      if (this._fieldCovers(one, two, centerPoint, p)) onePortals.push(p);
    }

    const twoPortals = new Array();
    for (const p of possibleExceptAnchors) {
      if (this._fieldCovers(two, three, centerPoint, p)) twoPortals.push(p);
    }

    const threePortals = new Array();
    for (const p of possibleExceptAnchors) {
      if (this._fieldCovers(three, one, centerPoint, p)) threePortals.push(p);
    }

    return [onePortals, twoPortals, threePortals];
  },

  _getCenter: function(a, b, c) {
    const A = this._map.project(a.latLng || a._latlng);
    const B = this._map.project(b.latLng || b._latlng);
    const C = this._map.project(c.latLng || c._latlng);

    const point = L.point((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
    return this._map.unproject(point);
  },

  _fieldCovers: function(a, b, c, p) {
    const unreachableMapPoint = this._urp;

    const urp = L.polyline([unreachableMapPoint, p.latLng]);
    const lab = L.polyline([a.latLng, b.latLng]);
    const lac = L.polyline([a.latLng, c.latLng]);
    const lbc = L.polyline([c.latLng, b.latLng]);

    let crossings = 0;
    if (greatCircleArcIntersect(urp, lab)) crossings++;
    if (greatCircleArcIntersect(urp, lac)) crossings++;
    if (greatCircleArcIntersect(urp, lbc)) crossings++;
    return crossings == 1; // crossing 0 or 2 is OK, crossing 3 is impossible
  }
});

export default HomogeneousDialog;
