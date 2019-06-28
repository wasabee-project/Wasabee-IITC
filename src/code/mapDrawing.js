//** This function draws things on the layers */
window.plugin.wasabee.drawThings = function () {
    window.plugin.wasabee.resetAllPortals();
    window.plugin.wasabee.resetAllTargets();
    window.plugin.wasabee.resetAllLinks();
    window.plugin.wasabee.checkAllLinks();
}

//** This function adds all the Targets to the layer */
window.plugin.wasabee.addAllTargets = function () {
    var targetList = window.plugin.wasabee.getSelectedOperation().markers;
    if (targetList != null) {
        targetList.forEach(function (target) {
            window.plugin.wasabee.addTarget(target);
        });
    }
}

//** This function resets all the Targets and calls addAllTargets to add them */
window.plugin.wasabee.resetAllTargets = function () {
    for (guid in window.plugin.wasabee.targetLayers) {
        var targetInLayer = window.plugin.wasabee.targetLayers[guid];
        window.plugin.wasabee.targetLayerGroup.removeLayer(targetInLayer);
        delete window.plugin.wasabee.targetLayers[guid];
    }
    window.plugin.wasabee.addAllTargets();
}

/** This function adds a Targets to the target layer group */
window.plugin.wasabee.addTarget = function (target) {
    var targetPortal = window.plugin.wasabee.getSelectedOperation().getPortal(target.portalId)
    var latLng = new L.LatLng(targetPortal.lat, targetPortal.lng);
    var marker = L.marker(latLng, {
        title: targetPortal.name,
        icon: L.icon({
            iconUrl: window.plugin.wasabee.getImageFromMarkerType(target.type),
            shadowUrl: null,
            iconSize: L.point(25, 41),
            iconAnchor: L.point(25, 41),
            popupAnchor: L.point(-1, -48)
        })
    });

    window.registerMarkerForOMS(marker);
    marker.bindPopup(window.plugin.wasabee.getMarkerPopup(marker, target, targetPortal));
    marker.off("click", marker.togglePopup, marker);
    marker.on('spiderfiedclick', marker.togglePopup, marker);
    window.plugin.wasabee.targetLayers[target["ID"]] = marker;
    marker.addTo(window.plugin.wasabee.targetLayerGroup);
}

window.plugin.wasabee.getMarkerPopup = function (marker, target, portal) {
    marker.className = "wasabee-dialog wasabee-dialog-ops"
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = window.markdown.toHTML(window.plugin.wasabee.getPopupBodyWithType(portal, target));
    buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var deleteButton = buttonSet.appendChild(document.createElement("a"));
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
        Wasabee.UiCommands.deleteMarker(window.plugin.wasabee.getSelectedOperation(), target, portal)
        marker.closePopup();
    }, false);
    return content;
}

window.plugin.wasabee.getPopupBodyWithType = function (portal, target) {
    var title = ""
    var comment = target.comment
    switch (target.type) {
        case Wasabee.Constants.MARKER_TYPE_DESTROY:
            title = "Destroy"
            break;
        case Wasabee.Constants.MARKER_TYPE_DECAY:
            title = "Let Decay"
            break;
        case Wasabee.Constants.MARKER_TYPE_VIRUS:
            title = "Virus"
            break;
        default:
            title = "Unknown"
    }
    title = title + " - " + portal.name
    if (!comment)
        return title
    else
        return title + "\n\n" + comment
}

//** This function returns the appropriate image for a marker type */
window.plugin.wasabee.getImageFromMarkerType = function (type) {
    switch (type) {
        case Wasabee.Constants.MARKER_TYPE_VIRUS:
            return Wasabee.Images.marker_alert_virus;
        case Wasabee.Constants.MARKER_TYPE_DESTROY:
            return Wasabee.Images.marker_alert_destroy;
        case Wasabee.Constants.MARKER_TYPE_DECAY:
            return Wasabee.Images.marker_alert_decay;
        default:
            return Wasabee.Images.marker_alert_unknown;
    }
}

//** This function adds all the Links to the layer */
window.plugin.wasabee.addAllLinks = function () {
    var operation = window.plugin.wasabee.getSelectedOperation()
    var linkList = operation.links;
    linkList.forEach(function (link) {
        window.plugin.wasabee.addLink(link, operation.color, operation);
    });
}

//** This function resets all the Links and calls addAllLinks to add them */
window.plugin.wasabee.resetAllLinks = function () {
    for (guid in window.plugin.wasabee.linkLayers) {
        var linkInLayer = window.plugin.wasabee.linkLayers[guid];
        window.plugin.wasabee.linkLayerGroup.removeLayer(linkInLayer);
        delete window.plugin.wasabee.linkLayers[guid];
    }
    window.plugin.wasabee.addAllLinks();
}

/** This function adds a portal to the portal layer group */
window.plugin.wasabee.addLink = function (link, color, operation) {
    var color = window.plugin.wasabee.getColorHex(color)
    var options = {
        dashArray: [5, 5, 1, 5],
        color: color ? color : "#ff6600",
        opacity: 1,
        weight: 2
    };
    var latLngs = link.getLatLngs(operation);
    if (latLngs != null) {
        var fromPortal = operation.getPortal(link.fromPortalId)
        var toPortal = operation.getPortal(link.toPortalId)
        var startCoord = new window.plugin.wasabee.arc.Coord(latLngs[0].lng, latLngs[0].lat);
        var endCoord = new window.plugin.wasabee.arc.Coord(latLngs[1].lng, latLngs[1].lat);
        var gc = new window.plugin.wasabee.arc.GreatCircle(startCoord, endCoord);
        var distance = window.plugin.wasabee.distance(fromPortal, toPortal);
        var geojson_feature = gc.Arc(Math.round(distance)).json();

        var link_ = new L.geoJson(geojson_feature, options);

        window.plugin.wasabee.linkLayers[link["ID"]] = link_;
        link_.addTo(window.plugin.wasabee.linkLayerGroup);
    } else
        console.log("LATLNGS WAS NULL?!")
}