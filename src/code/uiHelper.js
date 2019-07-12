//This methos helps with commonly used UI data getting functions
const UiHelper = {
    getPortal: function(id) {
        if (window.portals[id] && window.portals[id].options.data.title) {
            var data = window.portals[id].options.data;
            return {
                id: id,
                name: data.title,
                lat: (data.latE6 / 1E6).toFixed(6),
                lng: (data.lngE6 / 1E6).toFixed(6)
            };
        }
        return null;
    },
    getSelectedPortal: () => window.selectedPortal ? UiHelper.getPortal(window.selectedPortal) : null,
    toLatLng: (data, angle) => {
        return void 0 === angle && "object" == typeof data && (angle = data.lng, data = data.lat), L.latLng(parseFloat(data), parseFloat(angle));
    },
    getPortalLink: function(data) {
        var pt = UiHelper.toLatLng(data);
        var v = data.lat + "," + data.lng;
        var e = document.createElement("a");
        return e.appendChild(document.createTextNode(data.name)), e.title = data.name, e.href = "/intel?ll=" + v + "&pll=" + v, e.addEventListener("click", (event) => {
            return window.selectedPortal != data.id ? window.renderPortalDetails(data.id) : map.panTo(pt), event.preventDefault(), false;
        }, false), e.addEventListener("dblclick", (event) => {
            return map.getBounds().contains(pt) ? (window.portals[data.id] || window.renderPortalDetails(data.id), window.zoomToAndShowPortal(data.id, pt)) : (map.panTo(pt), window.renderPortalDetails(data.id)), event.preventDefault(), false;
        }, false), e;
    }
};

export default UiHelper;