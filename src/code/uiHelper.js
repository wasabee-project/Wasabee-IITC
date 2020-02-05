import WasabeePortal from "./portal";

//This method helps with commonly used UI data getting functions
const UiHelper = {
  getPortal: id => {
    if (window.portals[id] && window.portals[id].options.data.title) {
      var data = window.portals[id].options.data;
      return new WasabeePortal(
        id,
        data.title,
        (data.latE6 / 1e6).toFixed(6).toString(),
        (data.lngE6 / 1e6).toFixed(6).toString()
      );
    }
    return null;
  },
  getSelectedPortal: () =>
    window.selectedPortal ? UiHelper.getPortal(window.selectedPortal) : null,
};

export default UiHelper;
