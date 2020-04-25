import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect } from "../crosslinks";
import WasabeeLink from "../link";
import { clearAllLinks, getAllPortalsOnScreen } from "../uiCommands";
import wX from "../wX";

const OnionfieldDialog = WDialog.extend({
  statics: {
    TYPE: "OnionDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    // requires newer leaflet, poke user to upgrade their IITC
    if (!this._map.distance) {
      alert("Requires IITC 0.30.1 or newer");
      return;
    }
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_ONION_PORTALS");

    const anchorLabel = L.DomUtil.create("label", null, container);
    anchorLabel.textContent = wX("ANCHOR_PORTAL");
    const anchorButton = L.DomUtil.create("button", null, container);
    anchorButton.textContent = wX("SET");
    this._anchorDisplay = L.DomUtil.create("span", null, container);
    if (this._anchor) {
      this._anchorDisplay.appendChild(
        this._anchor.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(
          this._anchor.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    // Bottom buttons bar
    // Enter arrow
    const opt = L.DomUtil.create("label", "arrow", container);
    opt.textContent = "\u21b3";
    // Go button
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("ONION");
    L.DomEvent.on(button, "click", ev => {
      L.DomEvent.stop(ev);
      this.onion.call(this);
    });

    this._dialog = window.dialog({
      title: "Onion/Rose",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-onion",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Clear Links": () => {
          clearAllLinks(getSelectedOperation());
        }
      }
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OnionfieldDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = "Onion/Rose";
    this.label = "Onion/Rose";
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = WasabeePortal.create(p);
  },

  onion: function() {
    // where we put the links
    this._links = new Map();

    if (!this._anchor) {
      alert("no anchor selected");
      return;
    }
    this._colors = new Array();
    for (const [k, c] of window.plugin.wasabee.static.layerTypes) {
      this._colors.push(k);
      this._trash = c;
    }
    this._colorIterator = 0;
    this._color = this._colors[this._colorIterator];
    // this should be a map type
    const allPortals = getAllPortalsOnScreen(this._operation);

    this._operation.startBatchMode();
    this._operation.addPortal(this._anchor);
    const onion = this._recurser(allPortals, [], this._anchor);
    // XXX there is probably some cute JS construct to do this more quickly
    for (const link of onion) {
      this._operation.links.push(link);
    }
    this._operation.cleanPortalList();
    this._operation.endBatchMode();
  },

  // no longer operates on a a class var, different paths have different lists
  _removeFromList: function(portalsRemaining, guid) {
    const x = new Array();
    for (const p of portalsRemaining) {
      if (p.options.guid != guid) x.push(p);
    }
    return x;
  },

  _recurser: function(portalsRemaining, thisPath, one, two, three) {
    this._colorIterator = (this._colorIterator + 1) % this._colors.length;
    this._color = this._colors[this._colorIterator];

    const m = new Map();
    for (const p of portalsRemaining) {
      if (p.options.guid == one.id) {
        portalsRemaining = this._removeFromList(
          portalsRemaining,
          p.options.guid
        );
        continue;
      }
      if (two && p.options.guid == two.id) {
        portalsRemaining = this._removeFromList(
          portalsRemaining,
          p.options.guid
        );
        continue;
      }
      if (three && p.options.guid == three.id) {
        portalsRemaining = this._removeFromList(
          portalsRemaining,
          p.options.guid
        );
        continue;
      }

      const pDist = this._map.distance(one.latLng, p._latlng);
      m.set(pDist, p.options.guid);
    }
    // sort by distance
    const sorted = new Map([...m.entries()].sort((a, b) => a[0] - b[0]));
    if (sorted.length == 0) return;

    for (const [k, v] of sorted) {
      this._trash = k;
      const wp = WasabeePortal.get(v);
      if (!wp || !wp.id) {
        console.log("IITC confused again..?", wp);
        continue;
      }
      this._operation.addPortal(wp);

      // do the intial field
      if (!two) {
        portalsRemaining = this._removeFromList(portalsRemaining, v);
        const a = new WasabeeLink(this._operation, one.id, wp.id);
        a.color = this._color;
        a.throwOrderPos = 1;
        thisPath.push(a);
        return this._recurser(portalsRemaining, thisPath, one, wp);
      }
      if (!three) {
        portalsRemaining = this._removeFromList(portalsRemaining, v);
        const a = new WasabeeLink(this._operation, one.id, wp.id);
        a.color = this._color;
        a.throwOrderPos = 2;
        thisPath.push(a);
        const b = new WasabeeLink(this._operation, two.id, wp.id);
        b.color = this._color;
        b.throwOrderPos = 3;
        thisPath.push(b);
        // now we are bootstrapped, dive in
        return this._recurser(portalsRemaining, thisPath, one, two, wp);
      }
      // initial field done

      const a = new WasabeeLink(this._operation, one.id, wp.id);
      const b = new WasabeeLink(this._operation, two.id, wp.id);
      const c = new WasabeeLink(this._operation, three.id, wp.id);
      a.color = this._color;
      b.color = this._color;
      c.color = this._color;
      const aBlock = this._testBlock(thisPath, a);
      const bBlock = this._testBlock(thisPath, b);
      const cBlock = this._testBlock(thisPath, c);

      if (!aBlock && !bBlock && !cBlock) {
        portalsRemaining = this._removeFromList(portalsRemaining, v);

        let Y = one;
        let Z = two;
        const angOneTwo = this._angle(wp, one, two);
        const angTwoThree = this._angle(wp, two, three);
        const angThreeOne = this._angle(wp, three, one);
        if (angOneTwo >= angTwoThree && angOneTwo >= angThreeOne) {
          Y = one;
          Z = two;
          thisPath.push(a);
          a.throwOrderPos = thisPath.length;
          thisPath.push(b);
          b.throwOrderPos = thisPath.length;
        } else if (angTwoThree >= angThreeOne) {
          Y = two;
          Z = three;
          thisPath.push(b);
          b.throwOrderPos = thisPath.length;
          thisPath.push(c);
          c.throwOrderPos = thisPath.length;
        } else {
          Y = three;
          Z = one;
          thisPath.push(c);
          c.throwOrderPos = thisPath.length;
          thisPath.push(a);
          a.throwOrderPos = thisPath.length;
        }

        // allow users to turn this on if they want...
        if (
          localStorage["feelingStupid"] &&
          localStorage["feelingStupid"] == "I feel stupid!"
        ) {
          // you might find 2 or 3 more layers on a small field, but it takes an hour to run
          // two is enough, three gets crazy even with a small number of portals
          const pathOne = this._recurser(
            new Array(...portalsRemaining),
            new Array(...thisPath),
            Y,
            Z,
            wp
          );
          const pathTwo = this._recurser(
            new Array(...portalsRemaining),
            new Array(...thisPath),
            Z,
            Y,
            wp
          );
          // console.log(pathOne.length, pathTwo.length);
          if (pathTwo.length > pathOne.lenght) return pathTwo;
          return pathOne;
        }
        return this._recurser(portalsRemaining, thisPath, Y, Z, wp);
      }
    }
    // console.log("hit bottom", thisPath.length);
    return thisPath;
  },

  _testBlock: function(current, testing) {
    for (const against of current) {
      if (greatCircleArcIntersect(against, testing)) return true;
    }
    return false;
  },

  // angle a<bc
  _angle: function(a, b, c) {
    // this formua finds b, swap a&b for our purposes
    const A = this._map.project(b.latLng || b._latlng);
    const B = this._map.project(a.latLng || a._latlng);
    const C = this._map.project(c.latLng || c._latlng);

    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    const Z = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    return Z;
  }
});

export default OnionfieldDialog;
