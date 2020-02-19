import { Feature } from "../leafletDrawImports";
import UiCommands from "../uiCommands.js";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";

const LinkDialog = Feature.extend({
  statics: {
    TYPE: "linkdialogButton"
  },

  initialize: function(map, options) {
    this.type = LinkDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  _displayDialog: function() {
    var self = this;
    self._clearLocalPortalSelections();
    this._portals = {};
    this._links = [];
    const container = L.DomUtil.create("div", "");
    this._desc = L.DomUtil.create("textarea", "desc", container);
    this._desc.placeholder = "Description (optional)";
    let node;
    const rdnTable = L.DomUtil.create("table", "", container);

    // XXX WHY? DEAR GOD WHY!?
    [0, 1, 2].forEach(string => {
      let type = 0 == string ? "src" : "dst-" + string;
      const tr = rdnTable.insertRow();
      tr.setAttribute("data-portal", type);
      node = tr.insertCell();
      if (string != 0) {
        const filter = L.DomUtil.create("input", "", node);
        filter.checked = true;
        filter.value = type;
        self._links.push(filter);
      }
      node = tr.insertCell();
      node.textContent = 0 == string ? "from" : "to (#" + string + ")";
      node = tr.insertCell();
      const button = L.DomUtil.create("button", "", node);
      button.textContent = "set";
      button.addEventListener("click", arg => self._setPortal(arg), false);
      node = tr.insertCell();
      if (string != 0) {
        const addbutton = L.DomUtil.create("button", "", node);
        addbutton.textContent = "add";
        L.DomEvent.on(
          addbutton,
          "click",
          other => self._addLinkTo(other, self._operation),
          false
        );
      }
      node = tr.insertCell();
      node.className = "portal portal-" + type;
      self._portals[type] = node;
      self._updatePortal(type);
    });
    const element = L.DomUtil.create("div", "buttonbar", container);
    const div = L.DomUtil.create("span", "arrow", element); // a span named div?
    const opt = L.DomUtil.create("span", "arrow", div);
    opt.textContent = "\u21b3";
    const button = L.DomUtil.create("button", "", div);
    button.textContent = "add all";
    L.DomEvent.on(
      button,
      "click",
      () => self._addAllLinks(self._operation),
      false
    );
    const cardHeader = L.DomUtil.create("label", "", element);
    this._reversed = L.DomUtil.create("input", "", cardHeader);
    this._reversed.type = "checkbox";
    cardHeader.appendChild(document.createTextNode(" reverse"));

    this._dialog = window.dialog({
      title: "Add Links",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        self.disable();
        self._clearLocalPortalSelections();
        delete self._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkDialogButton
    });
  },

  _onMessage: function(command) {
    if ("setPortal" === command.data.type) {
      this._updatePortal(command.data.name);
    }
    //***Function to clear local selections of portals for the dialog
  },

  _clearLocalPortalSelections: function() {
    delete localStorage["wasabee-portal-dst-1"];
    delete localStorage["wasabee-portal-dst-2"];
    delete localStorage["wasabee-portal-dst-3"];
    delete localStorage["wasabee-portal-src"];
    //***Function to set portal -- called from 'Set' Button
  },

  _setPortal: function(event) {
    const updateID = event.currentTarget.parentNode.parentNode.getAttribute(
      "data-portal"
    );
    const selectedPortal = WasabeePortal.getSelected();
    if (selectedPortal) {
      localStorage["wasabee-portal-" + updateID] = JSON.stringify(
        selectedPortal
      );
    } else {
      alert("No Portal Selected.");
      delete localStorage["wasabee-portal-" + updateID];
    }
    this._updatePortal(updateID);
    //***Function to get portal -- called in updatePortal, addLinkTo, and addAllLinks
  },

  _getPortal: function(name) {
    try {
      return WasabeePortal.create(
        JSON.parse(localStorage["wasabee-portal-" + name])
      );
    } catch (b) {
      return null;
    }
    //***Function to update portal in the dialog
  },

  _updatePortal: function(key) {
    var i = this._getPortal(key);
    var viewContainer = this._portals[key];
    $(viewContainer).empty();
    if (i) {
      viewContainer.appendChild(i.displayFormat(this._operation));
    }
    //***Function to add link between the portals -- called from 'Add' Button next to To portals
  },

  _addLinkTo: function(instance, operation) {
    var item = this;
    var server = instance.currentTarget.parentNode.parentNode.getAttribute(
      "data-portal"
    );
    var linkTo = this._getPortal(server);
    var source = this._getPortal("src");
    if (!source || !linkTo) {
      return void alert("Please select target and destination portals first!");
    }
    var isReversed = this._reversed.checked;
    if (source.id == linkTo.id) {
      return void alert("Target and destination portals must be different.");
    } else {
      Promise.all([
        item._addPortal(source),
        item._addPortal(linkTo),
        isReversed
          ? item._addLink(linkTo, source)
          : item._addLink(source, linkTo)
      ])
        .then(() => operation.update())
        .catch(data => {
          throw (alert(data.message), console.log(data), data);
        });
    }
    //***Function to add all the links between the from and all the to portals -- called from 'Add All Links' Button
  },

  _addAllLinks: function(operation) {
    var item = this;
    var source = this._getPortal("src");
    if (!source) {
      return void alert("Please select a target portal first!");
    }
    var resolvedSourceMapConfigs = this._links
      .map(b => (b.checked ? item._getPortal(b.value) : null))
      .filter(a => null != a);
    if (0 == resolvedSourceMapConfigs.length) {
      return void alert("Please select a destination portal first!");
    }
    var isReversedChecked = this._reversed.checked;
    var documentBodyPromise = this._addPortal(source);
    Promise.all(
      resolvedSourceMapConfigs.map(linkTo => {
        return Promise.all([
          documentBodyPromise,
          item._addPortal(linkTo),
          isReversedChecked
            ? item._addLink(linkTo, source)
            : item._addLink(source, linkTo)
        ]).then(() => operation.update());
      })
    ).catch(data => {
      throw (alert(data.message), console.log(data), data);
    });
    //***Function to add a portal -- called in addLinkTo and addAllLinks functions
  },

  _addPortal: function(sentPortal) {
    var resolvedLocalData = Promise.resolve(this._operation.opportals);
    return sentPortal
      ? this._operation.opportals.some(
          gotPortal => gotPortal.id == sentPortal.id
        )
        ? resolvedLocalData
        : UiCommands.addPortal(this._operation, sentPortal)
      : Promise.reject("no portal given");
  },

  //***Function to add a single link -- called in addLinkTo and addAllLinks functions
  _addLink: function(fromPortal, toPortal) {
    var description = this._desc.value;
    if (!toPortal || !fromPortal) {
      return Promise.reject("no portal given");
    }
    return this._operation.addLink(fromPortal, toPortal, description);
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default LinkDialog;
