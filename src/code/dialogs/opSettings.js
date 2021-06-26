import { WDialog } from "../leafletClasses";
import { deleteOpPromise } from "../server";
import { clearAllItems, zoomToOperation } from "../uiCommands";
import ConfirmDialog from "./confirmDialog";
import ZoneDialog from "./zoneDialog";
import {
  getSelectedOperation,
  makeSelectedOperation,
  removeOperation,
  duplicateOperation,
  changeOpIfNeeded,
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";
import { addToColorList } from "../skin";
import WasabeeMe from "../model/me";

import { convertColorToHex } from "../auxiliar";

const OpSettingDialog = WDialog.extend({
  statics: {
    TYPE: "opSettingDialog",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
  },

  _displayDialog: function () {
    const content = this.makeContent();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("OP_SETTINGS_TITLE"),
      html: content,
      height: "auto",
      width: "auto",
      dialogClass: "op-settings",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.opSettings,
    });
  },

  update: function () {
    if (this._enabled) {
      this.setTitle(wX("OP_SETTINGS_TITLE"));
      const content = this.makeContent();
      this.setContent(content);
    }
  },

  makeContent: function () {
    const selectedOp = getSelectedOperation();
    const content = L.DomUtil.create("div");
    const topSet = L.DomUtil.create("div", "topset", content);

    const writable = selectedOp.canWrite();

    L.DomUtil.create("label", null, topSet).textContent = wX("OPER_NAME");
    const nameDisplay = L.DomUtil.create("div", null, topSet);
    if (writable) {
      const input = L.DomUtil.create("input", null, nameDisplay);
      input.value = selectedOp.name;
      L.DomEvent.on(input, "change", async (ev) => {
        L.DomEvent.stop(ev);
        if (!input.value || input.value == "") {
          alert(wX("USE_VALID_NAME"));
        } else {
          const so = getSelectedOperation();
          so.name = input.value;
          so.localchanged = true;
          await so.store();
          window.map.fire("wasabee:op:change");
        }
      });
    } else {
      nameDisplay.textContent = selectedOp.name;
    }

    if (writable) {
      L.DomUtil.create("label", null, topSet).textContent = wX("OPER_COLOR");

      const picker = L.DomUtil.create("input", "picker", topSet);
      picker.type = "color";
      picker.value = convertColorToHex(selectedOp.color);
      picker.setAttribute("list", "wasabee-colors-datalist");

      L.DomEvent.on(picker, "change", async (ev) => {
        L.DomEvent.stop(ev);
        const so = getSelectedOperation();
        so.color = picker.value;
        so.localchanged = true;
        await so.store();
        addToColorList(picker.value);
        window.map.fire("wasabee:op:change");
      });
    }

    if (writable) {
      const commentInput = L.DomUtil.create("textarea", null, topSet);
      commentInput.placeholder = "Op Comment";
      commentInput.value = selectedOp.comment;
      L.DomEvent.on(commentInput, "change", async (ev) => {
        L.DomEvent.stop(ev);
        const so = getSelectedOperation();
        so.comment = commentInput.value;
        so.localchanged = true;
        await so.store();
        window.map.fire("wasabee:op:change");
      });
    } else {
      const commentDisplay = L.DomUtil.create("p", "comment", topSet);
      commentDisplay.textContent = selectedOp.comment;
    }

    if (writable) {
      L.DomUtil.create("label", null, topSet).textContent =
        wX("REFERENCE_TIME");
      const rtInput = L.DomUtil.create("input", null, topSet);
      rtInput.size = 30;
      rtInput.placeholder = "Sun, 21 Oct 2018 12:16:24 GMT";
      rtInput.value = selectedOp.referencetime;
      L.DomEvent.on(rtInput, "change", async (ev) => {
        L.DomEvent.stop(ev);
        const so = getSelectedOperation();
        try {
          const d = new Date(rtInput.value); // accept whatever the JS engine can parse
          if (d == "Invalid Date" || isNaN(d)) throw d;
          so.referencetime = d.toUTCString(); // RFC 1123 format as expected by server
          rtInput.value = so.referencetime; // @Noodles, this is where you want to muck about with the display
          so.localchanged = true;
          await so.store();
          window.map.fire("wasabee:op:change");
        } catch (e) {
          console.log(e);
          alert("Invalid date format");
        }
      });
    } else {
      const commentDisplay = L.DomUtil.create("p", "comment", topSet);
      commentDisplay.textContent =
        wX("REFERENCE_TIME") + " " + selectedOp.referencetime;
    }

    const buttonSection = L.DomUtil.create("div", "buttonset", content);
    if (writable) {
      const clearOpDiv = L.DomUtil.create("div", null, buttonSection);
      const clearOpButton = L.DomUtil.create("button", null, clearOpDiv);
      // adding a comment so that github will let me create a pull request to fix the issue with CLEAR_EVERYTHING showing up on the button instead of the correct text. Scott, pleae double check the line below this - I left off the wX code in the previous version.
      clearOpButton.textContent = wX("CLEAR_EVERYTHING");
      L.DomEvent.on(clearOpButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const so = getSelectedOperation();
        clearAllItems(so);
      });
    }

    const deleteDiv = L.DomUtil.create("div", null, buttonSection);
    const deleteButton = L.DomUtil.create("button", null, deleteDiv);
    if (selectedOp.isServerOp()) {
      if (
        WasabeeMe.isLoggedIn() &&
        selectedOp.isOwnedOp() &&
        selectedOp.isOnCurrentServer()
      )
        deleteButton.textContent =
          wX("DELETE_OP", { opName: selectedOp.name }) + wX("LOCFRMSER");
      else
        deleteButton.textContent = wX("REM_LOC_CP", {
          opName: selectedOp.name,
        });
    } else {
      deleteButton.textContent = wX("DELETE_OP", { opName: selectedOp.name });
    }
    L.DomEvent.on(deleteButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      // this should be moved to uiCommands
      const so = getSelectedOperation();
      const con = new ConfirmDialog({
        title: wX("CON_DEL", { opName: so.name }),
        label: wX("YESNO_DEL", { opName: so.name }),
        type: "operation",
        callback: async () => {
          if (
            WasabeeMe.isLoggedIn() &&
            so.isOwnedOp() &&
            so.isOnCurrentServer()
          ) {
            try {
              await deleteOpPromise(so.ID);
              console.log("delete from server successful");
            } catch (e) {
              console.error(e);
              alert(e.toString());
            }
          }
          await removeOperation(so.ID);
          const newop = await changeOpIfNeeded();
          zoomToOperation(newop);
          // changeOpIfNeeded fires all the required UI events
        },
      });
      con.enable();
    });

    if (selectedOp.isServerOp()) {
      const permsDiv = L.DomUtil.create("div", null, buttonSection);
      const permsButton = L.DomUtil.create("button", null, permsDiv);
      permsButton.textContent = wX("OP_PERMS");
      L.DomEvent.on(permsButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const opl = new OpPermList();
        opl.enable();
      });
    }

    const zoneDiv = L.DomUtil.create("div", null, buttonSection);
    const zoneButton = L.DomUtil.create("button", null, zoneDiv);
    zoneButton.textContent = "Zones";
    L.DomEvent.on(zoneButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const z = new ZoneDialog();
      z.enable();
    });

    const dupeDiv = L.DomUtil.create("div", null, buttonSection);
    const dupeButton = L.DomUtil.create("button", null, dupeDiv);
    dupeButton.textContent = wX("DUPE_OP");
    L.DomEvent.on(dupeButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      const so = getSelectedOperation();
      const newop = await duplicateOperation(so.ID);
      await makeSelectedOperation(newop.ID);
    });

    return content;
  },
});

export default OpSettingDialog;
