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
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
    this._layerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee Onion Field Debug", this._layerGroup, true);
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeLayerGroup(this._layerGroup);
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
    let urp =
      localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ];
    if (!urp) {
      urp = '{"lat":-74.2,"lng":-143.4}';
      localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ] = urp;
    }
    this._urp = JSON.parse(urp);
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
    this._portalsRemaining = getAllPortalsOnScreen(this._operation);
    this._order = 1;

    this._operation.startBatchMode();
    this._addLabel(this._anchor);
    this._recurser(this._anchor);
    this._operation.endBatchMode();
  },

  _removeFromList: function(guid) {
    const x = new Array();
    for (const p of this._portalsRemaining) {
      if (p.options.guid != guid) x.push(p);
    }
    this._portalsRemaining = x;
  },

  _recurser: function(one, two, three) {
    this._colorIterator = (this._colorIterator + 1) % this._colors.length;
    this._color = this._colors[this._colorIterator];

    if (this._order > 40) {
      console.log("went too deep, stopping");
      return;
    }

    const m = new Map();
    for (const p of this._portalsRemaining) {
      if (p.options.guid == one.id) {
        this._removeFromList(p.options.guid);
        continue;
      }
      if (two && p.options.guid == two.id) {
        this._removeFromList(p.options.guid);
        continue;
      }
      if (three && p.options.guid == three.id) {
        this._removeFromList(p.options.guid);
        continue;
      }

      const pDist = window.map.distance(one.latLng, p._latlng);
      m.set(pDist, p.options.guid);
    }
    const sorted = new Map([...m.entries()].sort((a, b) => a[0] - b[0]));
    if (sorted.length == 0) return;

    for (const [k, v] of sorted) {
      this._trash = k;
      const wp = WasabeePortal.get(v);

      // do the intial field
      if (!two) {
        this._removeFromList(v);
        this._addLabel(wp);
        const aID = this._operation.addLink(
          one,
          wp,
          "First Link",
          this._order++
        );
        this._operation.setLinkColor(aID, this._color);
        return this._recurser(one, wp);
      }
      if (!three) {
        this._removeFromList(v);
        this._addLabel(wp);
        const aID = this._operation.addLink(
          two,
          wp,
          "Second Link",
          this._order++
        );
        this._operation.setLinkColor(aID, this._color);
        const bID = this._operation.addLink(
          wp,
          one,
          "Third Link",
          this._order++
        );
        this._operation.setLinkColor(bID, this._color);
        return this._recurser(one, two, wp);
      }
      // initial field done

      this._operation.addPortal(wp);
      const a = new WasabeeLink(this._operation, one.id, wp.id);
      if (!a._ofsrc) a._ofsrc = one;
      const b = new WasabeeLink(this._operation, two.id, wp.id);
      if (!b._ofsrc) b._ofsrc = two;
      const c = new WasabeeLink(this._operation, three.id, wp.id);
      if (!c._ofsrc) c._ofsrc = three;
      const aBlock = this._testBlock(a);
      const bBlock = this._testBlock(b);
      const cBlock = this._testBlock(c);

      if (!aBlock && !bBlock && !cBlock) {
        this._removeFromList(v);
        this._addLabel(wp);
        // console.log(wp.name, "worked");

        // the longer two get added
        const longest = [a, b, c].sort(
          (a, b) => a.length(this._operation) - b.length(this.operation)
        );

        const aID = this._operation.addLink(
          longest[2]._ofsrc,
          wp,
          null,
          this._order++
        );
        this._operation.setLinkColor(aID, this._color);
        const bID = this._operation.addLink(
          longest[1]._ofsrc,
          wp,
          null,
          this._order++
        );
        this._operation.setLinkColor(bID, this._color);

        // instead of just returing here, taking the first path it finds
        // run both 1 and 0 first and see which goes deeper
        return this._recurser(longest[2]._ofsrc, longest[1]._ofsrc, wp);
      }
      // console.log(wp.name, "didn't work, trying next closest portal");
    }
    // console.log("hit bottom");
    return;
  },

  _addLabel: function(p) {
    if (!this._curLabel) this._curLabel = 1;
    const label = L.marker(p.latLng, {
      icon: L.divIcon({
        className: "plugin-portal-names",
        iconAnchor: [15],
        iconSize: [30, 12],
        html: this._curLabel
      }),
      guid: p.id
    });
    label.addTo(this._layerGroup);
    this._curLabel += 1;
  },

  _testBlock: function(incoming) {
    for (const against of this._operation.links) {
      if (greatCircleArcIntersect(against, incoming)) return true;
    }
    return false;
  }
});

export default OnionfieldDialog;
