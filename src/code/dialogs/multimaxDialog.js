import { WDialog } from "../leafletClasses";
import multimax from "../multimax";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { getAllPortalsOnScreen } from "../uiCommands";

const MultimaxDialog = WDialog.extend({
  statics: {
    TYPE: "multimaxDialog"
  },

  addHooks: function() {
    if (!this._map) return;
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
    description.textContent = wX("SELECT_INSTRUCTIONS");

    const anchorOneLabel = L.DomUtil.create("label", null, container);
    anchorOneLabel.textContent = wX("ANCHOR1");
    const anchorOneButton = L.DomUtil.create("button", null, container);
    anchorOneButton.textContent = wX("SET");
    this._anchorOneDisplay = L.DomUtil.create("span", null, container);
    if (this._anchorOne) {
      this._anchorOneDisplay.appendChild(this._anchorOne.displayFormat());
    } else {
      this._anchorOneDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorOneButton, "click", () => {
      this._anchorOne = WasabeePortal.getSelected();
      if (this._anchorOne) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchorOne);
        this._anchorOneDisplay.textContent = "";
        this._anchorOneDisplay.appendChild(this._anchorOne.displayFormat());
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const anchorTwoLabel = L.DomUtil.create("label", null, container);
    anchorTwoLabel.textContent = wX("ANCHOR2");
    const anchorTwoButton = L.DomUtil.create("button", null, container);
    anchorTwoButton.textContent = wX("SET");
    this._anchorTwoDisplay = L.DomUtil.create("span", null, container);
    if (this._anchorTwo) {
      this._anchorTwoDisplay.appendChild(this._anchorTwo.displayFormat());
    } else {
      this._anchorTwoDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorTwoButton, "click", () => {
      this._anchorTwo = WasabeePortal.getSelected();
      if (this._anchorTwo) {
        localStorage["wasabee-anchor-2"] = JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(this._anchorTwo.displayFormat());
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
    button.textContent = wX("MULTI_M");
    L.DomEvent.on(button, "click", async () => {
      const context = this;

      this.doMultimax(context).then(
        total => {
          alert(`Multimax found ${total} layers`);
          this._dialog.dialog("close");
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

    // const context = this;
    this._dialog = window.dialog({
      title: wX("MULTI_M"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-multimax",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.multimaxButton
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MultimaxDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("MULTI_M");
    this.label = wX("MULTI_M");
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage["wasabee-anchor-2"];
    if (p) this._anchorTwo = WasabeePortal.create(p);
  },

  doMultimax: context => {
    return new Promise((resolve, reject) => {
      const A = this._anchorOne;
      const B = this._anchorTwo;
      if (!A || !B) reject(wX("SEL_PORT_FIRST"));
      const portalsOnScreen = getAllPortalsOnScreen(context._operation);

      // Calculate the multimax
      multimax(A, B, portalsOnScreen).then(
        sequence => {
          if (!Array.isArray(sequence) || !sequence.length)
            reject("No layers found");

          let order = sequence.length * (context._flcheck ? 3 : 2);
          let prev = null;

          context._operation.startBatchMode(); // bypass save and crosslinks checks
          context._operation.addLink(A, B, "multimax base", 1);

          for (const node of sequence) {
            let p = WasabeePortal.get(node);
            if (context._flcheck.checked && prev) {
              context._operation.addLink(
                prev,
                p,
                "multimax generated back link",
                order + 3
              );
              order--;
            }
            if (!p) {
              console.log("skipping: " + node);
              continue;
              // const ll = node.getLatLng(); p = WasabeePortal.fake(ll.lat, ll.lng, node);
            }
            context._operation.addLink(
              p,
              A,
              "multimax generated link",
              order--
            );
            context._operation.addLink(
              p,
              B,
              "multimax generated link",
              order--
            );
            prev = p;
          }
          context._operation.endBatchMode(); // save and run crosslinks
          resolve(sequence.length);
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  }
});

export default MultimaxDialog;
