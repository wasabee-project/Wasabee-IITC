//This function helps with commonly used UI data getting functions
Wasabee.UiHelper = {
    getPortal: (id) => {
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
    getSelectedPortal: () => window.selectedPortal ? Wasabee.UiHelper.getPortal(window.selectedPortal) : null,
    toLatLng: (data, angle) => {
        return void 0 === angle && "object" == typeof data && (angle = data.lng, data = data.lat), L.latLng(parseFloat(data), parseFloat(angle));
    },
    getPortalLink: (data) => {
        var pt = Wasabee.UiHelper.toLatLng(data);
        var v = data.lat + "," + data.lng;
        var e = document.createElement("a");
        return e.appendChild(document.createTextNode(data.name)), e.title = data.name, e.href = "/intel?ll=" + v + "&pll=" + v, e.addEventListener("click", (event) => {
            return window.selectedPortal != data.id ? window.renderPortalDetails(data.id) : map.panTo(pt), event.preventDefault(), false;
        }, false), e.addEventListener("dblclick", (event) => {
            return map.getBounds().contains(pt) ? (window.portals[data.id] || window.renderPortalDetails(data.id), window.zoomToAndShowPortal(data.id, pt)) : (map.panTo(pt), window.renderPortalDetails(data.id)), event.preventDefault(), false;
        }, false), e;
    }
};

//This function deals with modifying objects on map layers
Wasabee.UiCommands = {
    addPortal: (operation, sentPortal, options, anyContent) => {
        if (void 0 === options && (options = ""), void 0 === anyContent && (anyContent = false), !sentPortal) {
            return void alert("Please select a portal first!");
        }

        if (operation instanceof Operation) {
            operation.addPortal(sentPortal);
        }
        else {
            alert("Operation Invalid");
        }
    },
    editPortal: (instance, obj, key, value, options) => {
        //return obj.layerName = key, obj.description = value, obj.keysFarmed = options, instance.portalService.editPortal(obj, PLAYER.nickname);
    },
    swapPortal: (operation, portal) => {
        var selectedPortal = Wasabee.UiHelper.getSelectedPortal();
        if (selectedPortal !== undefined) {
            if (confirm("Do you really want to swap these two portals?\n\n" + portal.name + "\n" + selectedPortal.name)) {
                Promise.all([operation.swapPortal(portal, selectedPortal)]).then(() => {
                    operation.update();
                }).catch((data) => {
                    throw alert(data.message), console.log(data), data;
                });
            }
        } else
            {alert("You must select a new portal!");}
    },
    deletePortal : (operation, portal) =>{
        if (confirm("Do you really want to delete this anchor, including all incoming and outgoing links?\n\n" + portal.name)) {
            operation.removeAnchor(portal.id);
        }
    },
    deleteMarker : (operation, marker, portal) =>{
        if (confirm("Do you really want to delete this marker? Marking it complete?\n\n" + window.plugin.wasabee.getPopupBodyWithType(portal, marker))) {
            operation.removeMarker(marker);
        }
    },
    showLinksDialog : (operation, portal)=> {
        Wasabee.LinkListDialog.update(operation, portal, true);
    }
};