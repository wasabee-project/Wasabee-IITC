import { drawThings } from "./mapDrawing";
import LinkListDialog from "./linkListDialog";
import { MarkerDialog } from "./markerDialog";
import LinkDialog from "./linkDialog";

export function initOpsDialog() {
  // move to... init.js?
  window.plugin.wasabee.showMustAuthAlert = () => {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "In order to sync operations, you must log in.<br/>";
    var buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Visit Site";
    visitButton.addEventListener(
      "click",
      () => window.open("https://server.wasabee.rocks"),
      false
    );
    window.dialog({
      title: "You Must Authenticate",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      id: "wasabee-dialog-mustauth"
    });
  };

  // move to mapDrawing
  window.plugin.wasabee.updateVisual = op => {
    console.log("updateVisual");
    console.log("cleanPortalList");
    op.cleanPortalList();
    console.log("LinksDialog.update");
    LinkDialog.update(op, false);
    console.log("LinkListDialog.update");
    LinkListDialog.update(op, null, false);
    console.log("MarkerDialog.update");
    MarkerDialog.update(op, false, false);
    console.log("drawThings");
    drawThings(op);
  };
}
