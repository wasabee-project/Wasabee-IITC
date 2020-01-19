import UiHelper from "./uiHelper.js";
import { getPopupBodyWithType } from "./mapDrawing";
import WasabeeOp from "./operation";
import LinkListDialog from "./linkListDialog";

//This methos helps with commonly used UI data getting functions
export default {
  addPortal: (operation, sentPortal, options, anyContent) => {
    if (
      (void 0 === options && (options = ""),
      void 0 === anyContent && (anyContent = false),
      !sentPortal)
    ) {
      return void alert("Please select a portal first!");
    }

    if (operation instanceof WasabeeOp) {
      operation.addPortal(sentPortal);
    } else {
      alert("Operation Invalid");
    }
  },
  /* eslint-disable no-unused-vars */
  editPortal: (instance, obj, key, value, options) => {
    /* eslint-enable no-unused-vars */
    //return obj.layerName = key, obj.description = value, obj.keysFarmed = options, instance.portalService.editPortal(obj, PLAYER.nickname);
  },
  swapPortal: (operation, portal) => {
    var selectedPortal = UiHelper.getSelectedPortal();
    if (selectedPortal !== undefined) {
      if (portal.id === selectedPortal.id) {
        alert("Cannot swap a portal with itself! Select a different portal.");
        return;
      }
      if (
        confirm(
          "Do you really want to swap these two portals?\n\n" +
            portal.name +
            "\n" +
            selectedPortal.name
        )
      ) {
        Promise.all([operation.swapPortal(portal, selectedPortal)])
          .then(() => {
            operation.update();
          })
          .catch(data => {
            throw (alert(data.message), console.log(data), data);
          });
      }
    } else {
      alert("You must select a new portal!");
    }
  },
  deletePortal: (operation, portal) => {
    if (
      confirm(
        "Do you really want to delete this anchor, including all incoming and outgoing links?\n\n" +
          portal.name
      )
    ) {
      operation.removeAnchor(portal.id);
    }
  },
  deleteMarker: (operation, marker, portal) => {
    if (
      confirm(
        "Do you really want to delete this marker? Marking it complete?\n\n" +
          getPopupBodyWithType(portal, marker)
      )
    ) {
      operation.removeMarker(marker);
    }
  },
  showLinksDialog: (operation, portal) => {
    LinkListDialog.showDialog(operation, portal, true);
  }
};
