import { WDialog } from "../leafletClasses";
import { deleteOpPromise } from "../server";
import { zoomToOperation } from "../ui/operation";
import ConfirmDialog from "./confirmDialog";
import ExportDialog from "./exportDialog";
import { ZonedrawHandler } from "./zoneDrawHandler";
import {
  getSelectedOperation,
  makeSelectedOperation,
  removeOperation,
  duplicateOperation,
  changeOpIfNeeded,
  opsList,
} from "../selectedOp";
import wX from "../wX";
import { addToColorList } from "../skin";
import { WasabeeMe, WasabeeOp } from "../model";

import { convertColorToHex } from "../auxiliar";
import { displayError } from "../error";
import { clearAllItems } from "../ui/operation";
import { buildZoneList } from "./components/zoneList";
import { setLinksToZones, setMarkersToZones } from "../ui/zone";
import { buildPermList } from "./components/permList";
import ConflictDialog from "./conflictDialog";

class OpSettingDialog extends WDialog {
  static TYPE = "opSettingDialog";

  _activeTab: number;
  _zoneHandler: ZonedrawHandler;

  addHooks() {
    super.addHooks();
    this._zoneHandler = new ZonedrawHandler(window.map, { parent: this });
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    this._activeTab = 0;
    this._displayDialog();
  }

  removeHooks() {
    super.removeHooks();
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
  }

  _displayDialog() {
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
  }

  update() {
    if (this.enabled()) {
      this.setTitle(wX("OP_SETTINGS_TITLE"));
      const content = this.makeContent();
      this.setContent(content);
    }
  }

  buildZoneTab(): [HTMLAnchorElement, HTMLDivElement] {
    const head = L.DomUtil.create("a");
    head.textContent = wX("dialog.op_settings.zones");

    const tab = L.DomUtil.create("div");
    tab.appendChild(buildZoneList(this._zoneHandler));

    const buttonSection = L.DomUtil.create("div", "buttonset", tab);
    const buttons: { [label: string]: () => void } = {};
    buttons[wX("ADD_ZONE")] = () => {
      if (getSelectedOperation().canWrite()) getSelectedOperation().addZone();
    };
    buttons[wX("SET_MARKERS_ZONES")] = () => {
      if (getSelectedOperation().canWrite()) setMarkersToZones();
    };
    buttons[wX("SET_LINKS_ZONES")] = () => {
      if (getSelectedOperation().canWrite()) setLinksToZones();
    };
    for (const label in buttons) {
      const button = L.DomUtil.create("button", null, buttonSection);
      button.textContent = label;
      L.DomEvent.on(button, "click", buttons[label]);
    }

    return [head, tab];
  }

  buildPermTab(): [HTMLAnchorElement, HTMLDivElement] {
    const selectedOp = getSelectedOperation();

    const head = L.DomUtil.create("a");
    head.textContent = wX("OP_PERMS");

    const tab = L.DomUtil.create("div");
    tab.appendChild(buildPermList(selectedOp, WasabeeMe.cacheGet()));
    return [head, tab];
  }

  buildAdvancedTab(): [HTMLAnchorElement, HTMLDivElement] {
    const selectedOp = getSelectedOperation();

    const head = L.DomUtil.create("a");
    head.textContent = wX("dialog.op_settings.advanced");

    const tab = L.DomUtil.create("div", "advanced");
    if (selectedOp.canWrite()) {
      const desc = L.DomUtil.create("div", "desc", tab);
      desc.textContent = wX("dialog.op_settings.import.desc");


      const labelSelect = L.DomUtil.create("label", null, tab);
      labelSelect.textContent = wX("dialog.op_settings.import.select_op");

      const opMenu = L.DomUtil.create("select", null, tab);
      opsList().then(async (opIDs) => {
        const ops = await Promise.all(opIDs.map(WasabeeOp.load));
        const options = ops.map((op) => [op.ID, op.name]);
        options.sort((a, b) => a[1].localeCompare(b[1]));
        for (const [id, name] of options) {
          if (id === selectedOp.ID) continue;
          const option = L.DomUtil.create("option", null, opMenu);
          option.value = id;
          option.textContent = name;
        }
      });

      const labelColor = L.DomUtil.create("label", null, tab);
      labelColor.textContent = wX("dialog.op_settings.import.select_color");

      const picker = L.DomUtil.create("input", "picker", tab);
      picker.type = "color";
      picker.value = convertColorToHex(selectedOp.color);
      picker.setAttribute("list", "wasabee-colors-datalist");

      const button = L.DomUtil.create("button", "import", tab);
      button.textContent = wX("dialog.op_settings.import.button");
      L.DomEvent.on(button, "click", async () => {
        const importOp = await WasabeeOp.load(opMenu.value);
        delete importOp.fetchedOp;
        if (picker.value !== convertColorToHex(selectedOp.color)) {
          for (const link of importOp.links) {
            if (link.color === "main" || link.color === importOp.color) {
              link.color = picker.value;
            }
          }
        }
        importOp.ID = getSelectedOperation().ID;
        const md = new ConflictDialog({
          opOwn: importOp,
          opRemote: getSelectedOperation(),
        });
        md.enable();
      });
    }

    return [head, tab];
  }

  buildMainTab(): [HTMLAnchorElement, HTMLDivElement] {
    const selectedOp = getSelectedOperation();
    const writable = selectedOp.canWrite();

    const head = L.DomUtil.create("a");
    head.textContent = wX("dialog.op_settings.setting");

    const tab = L.DomUtil.create("div");
    const topSet = L.DomUtil.create("div", "topset", tab);

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
          if (d.toString() === "Invalid Date" || isNaN(+d)) throw d;
          so.referencetime = d.toUTCString(); // RFC 1123 format as expected by server
          rtInput.value = so.referencetime; // @Noodles, this is where you want to muck about with the display
          so.localchanged = true;
          await so.store();
          window.map.fire("wasabee:op:change");
        } catch (e) {
          console.log(e);
          displayError("Invalid date format");
        }
      });
    } else {
      const commentDisplay = L.DomUtil.create("p", "comment", topSet);
      commentDisplay.textContent =
        wX("REFERENCE_TIME") + " " + selectedOp.referencetime;
    }

    const buttonSection = L.DomUtil.create("div", "buttonset", tab);
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
              displayError(e);
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

    const dupeDiv = L.DomUtil.create("div", null, buttonSection);
    const dupeButton = L.DomUtil.create("button", null, dupeDiv);
    dupeButton.textContent = wX("DUPE_OP");
    L.DomEvent.on(dupeButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      const so = getSelectedOperation();
      const newop = await duplicateOperation(so.ID);
      await makeSelectedOperation(newop.ID);
    });

    const exportDiv = L.DomUtil.create("div", null, buttonSection);
    const exportButton = L.DomUtil.create("button", null, exportDiv);
    exportButton.textContent = wX("EXPORT OP");
    L.DomEvent.on(exportButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ed = new ExportDialog();
      ed.enable();
    });

    return [head, tab];
  }

  makeContent() {
    const selectedOp = getSelectedOperation();
    const writable = selectedOp.canWrite();

    const content = L.DomUtil.create("div");
    const topSet = L.DomUtil.create("div", "topset", content);

    L.DomUtil.create("label", null, topSet).textContent = wX("OPER_NAME");
    if (writable) {
      const input = L.DomUtil.create("input", null, topSet);
      input.value = selectedOp.name;
      L.DomEvent.on(input, "change", async (ev) => {
        L.DomEvent.stop(ev);
        if (!input.value || input.value == "") {
          displayError(wX("USE_VALID_NAME"));
        } else {
          const so = getSelectedOperation();
          so.name = input.value;
          so.localchanged = true;
          await so.store();
          window.map.fire("wasabee:op:change");
        }
      });
    } else {
      const nameDisplay = L.DomUtil.create("div", null, topSet);
      nameDisplay.textContent = selectedOp.name;
    }

    const tabArray: [HTMLAnchorElement, HTMLDivElement][] = [];
    tabArray.push(this.buildMainTab());
    tabArray.push(this.buildZoneTab());
    if (selectedOp.isServerOp()) {
      tabArray.push(this.buildPermTab());
    }
    tabArray.push(this.buildAdvancedTab());

    /* Create jquery-like tabs */
    const tabs = L.DomUtil.create("div", "ui-tabs tabs", content);
    const nav = L.DomUtil.create("ul", "ui-tabs-nav nav", tabs);
    for (let i = 0; i < tabArray.length; i++) {
      const [head, panel] = tabArray[i];
      L.DomUtil.create("li", "ui-tabs-tab", nav).appendChild(head);
      head.classList.add("ui-tabs-anchor");
      tabs.appendChild(panel);
      panel.classList.add("ui-tabs-panel");
      panel.style.display = "none";

      L.DomEvent.on(head, "click", () => {
        for (const hp of tabArray) {
          hp[0].parentElement.classList.remove("ui-tabs-active");
          hp[1].style.display = "none";
        }
        head.parentElement.classList.add("ui-tabs-active");
        panel.style.display = null;
        this._activeTab = i;
      });
    }

    /* initial active tab */
    if (this._activeTab >= tabArray.length) this._activeTab = 0;
    tabArray[this._activeTab][0].parentElement.classList.add("ui-tabs-active");
    tabArray[this._activeTab][1].style.display = null;

    return content;
  }
}

export default OpSettingDialog;
