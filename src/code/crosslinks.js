//*** CROSSLINK THINGS */
window.plugin.wasabee.greatCircleArcIntersect = (ta0, ta1, tb0, tb1) => {
    // based on the formula at http://williams.best.vwh.net/avform.htm#Int

    // method:
    // check to ensure no line segment is zero length - if so, cannot cross
    // check to see if either of the lines start/end at the same point. if so, then they cannot cross
    // check to see if the line segments overlap in longitude. if not, no crossing
    // if overlap, clip each line to the overlapping longitudes, then see if latitudes cross

    // anti-meridian handling. this code will not sensibly handle a case where one point is
    // close to -180 degrees and the other +180 degrees. unwrap coordinates in this case, so one point
    // is beyond +-180 degrees. this is already true in IITC
    // FIXME? if the two lines have been 'unwrapped' differently - one positive, one negative - it will fail

    //Dimand: Lets fix the date line issue.
    //always work in the eastern hemisphere. so += 360

    //fuck this object scope

    a0 = {};
    a1 = {};
    b0 = {};
    b1 = {};
    a0.lng = ta0.lng;
    a0.lat = ta0.lat;
    a1.lng = ta1.lng;
    a1.lat = ta1.lat;
    b0.lng = tb0.lng;
    b0.lat = tb0.lat;
    b1.lng = tb1.lng;
    b1.lat = tb1.lat;
    //debugger;
    // zero length line tests
    if ((a0.lat == a1.lat) && (a0.lng == a1.lng)) return false;
    if ((b0.lat == b1.lat) && (b0.lng == b1.lng)) return false;

    // lines have a common point
    if ((a0.lat == b0.lat) && (a0.lng == b0.lng)) return false;
    if ((a0.lat == b1.lat) && (a0.lng == b1.lng)) return false;
    if ((a1.lat == b0.lat) && (a1.lng == b0.lng)) return false;
    if ((a1.lat == b1.lat) && (a1.lng == b1.lng)) return false;

    // a0.lng<=-90 && a1.lng>=90 dosent suffice... a link from -70 to 179 still crosses
    //if a0.lng-a1.lng >180 or <-180 there is a cross!
    var aCross = false;
    var bCross = false;
    //this is the real link
    if ((a0.lng - a1.lng) < -180 || (a0.lng - a1.lng) > 180) {	//we have a dateline cross
        //console.log('DateLine Cross!');
        //move everything in the eastern hemisphere to the extended eastern one
        aCross = true;
        if (a0.lng < 0) {
            a0.lng += 360;
        }
        if (a1.lng < 0) {
            a1.lng += 360;
        }
    }
    //this is the arc
    if ((b0.lng - b1.lng) < -180 || (b0.lng - b1.lng) > 180) {
        //console.log('DateLine Cross!');
        bCross = true;
        if (b0.lng < 0) {
            b0.lng += 360;
        }
        if (b1.lng < 0) {
            b1.lng += 360;
        }
    }
    //now corrected both a and b for date line crosses.
    //now if link is entirely in the west we need to move it to the east.
    if (bCross && aCross) {
        //both got moved. all should be good.
        //do nothing
    }
    else if (aCross) {
        //now we need to move any links in the west of the main one
        if (Math.max(b0.lng, b1.lng) < Math.min(a0.lng, a1.lng)) {
            //console.log('arc shift');
            b0.lng += 360;
            b1.lng += 360;
        }
    }
    else if (bCross) {
        //now we need to move any links in the west of the main one
        if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) {
            //console.log('link shift');
            a0.lng += 360;
            a1.lng += 360;
            //console.log(a0);
            //console.log(a1);
            //console.log(b0);
            //console.log(b1);
        }
    }

    // check for 'horizontal' overlap in longitude
    if (Math.min(a0.lng, a1.lng) > Math.max(b0.lng, b1.lng)) return false;
    if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) return false;

    // ok, our two lines have some horizontal overlap in longitude
    // 1. calculate the overlapping min/max longitude
    // 2. calculate each line latitude at each point
    // 3. if latitudes change place between overlapping range, the lines cross
    // class to hold the pre-calculated maths for a geodesic line
    // TODO: move this outside this function, so it can be pre-calculated once for each line we test
    class GeodesicLine {
        constructor(start, end) {
            var d2r = Math.PI / 180.0;
            var r2d = 180.0 / Math.PI;
            // maths based on http://williams.best.vwh.net/avform.htm#Int
            if (start.lng == end.lng) {
                throw 'Error: cannot calculate latitude for meridians';
            }
            // only the variables needed to calculate a latitude for a given longitude are stored in 'this'
            this.lat1 = start.lat * d2r;
            this.lat2 = end.lat * d2r;
            this.lng1 = start.lng * d2r;
            this.lng2 = end.lng * d2r;
            var dLng = this.lng1 - this.lng2;
            var sinLat1 = Math.sin(this.lat1);
            var sinLat2 = Math.sin(this.lat2);
            var cosLat1 = Math.cos(this.lat1);
            var cosLat2 = Math.cos(this.lat2);
            this.sinLat1CosLat2 = sinLat1 * cosLat2;
            this.sinLat2CosLat1 = sinLat2 * cosLat1;
            this.cosLat1CosLat2SinDLng = cosLat1 * cosLat2 * Math.sin(dLng);
        }
        isMeridian() {
            return this.lng1 == this.lng2;
        }
        latAtLng(lng) {
            lng = lng * Math.PI / 180; //to radians
            var lat;
            // if we're testing the start/end point, return that directly rather than calculating
            // 1. this may be fractionally faster, no complex maths
            // 2. there's odd rounding issues that occur on some browsers (noticed on IITC MObile) for very short links - this may help
            if (lng == this.lng1) {
                lat = this.lat1;
            }
            else if (lng == this.lng2) {
                lat = this.lat2;
            }
            else {
                lat = Math.atan((this.sinLat1CosLat2 * Math.sin(lng - this.lng2) - this.sinLat2CosLat1 * Math.sin(lng - this.lng1)) / this.cosLat1CosLat2SinDLng);
            }
            return lat * 180 / Math.PI; // return value in degrees
        }
    }





    // calculate the longitude of the overlapping region
    var leftLng = Math.max(Math.min(a0.lng, a1.lng), Math.min(b0.lng, b1.lng));
    var rightLng = Math.min(Math.max(a0.lng, a1.lng), Math.max(b0.lng, b1.lng));
    //console.log(leftLng);
    //console.log(rightLng);

    // calculate the latitudes for each line at left + right longitudes
    // NOTE: need a special case for meridians - as GeodesicLine.latAtLng method is invalid in that case
    var aLeftLat, aRightLat;
    if (a0.lng == a1.lng) {
        // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
        aLeftLat = a0.lat;
        aRightLat = a1.lat;
    } else {
        var aGeo = new GeodesicLine(a0, a1);
        aLeftLat = aGeo.latAtLng(leftLng);
        aRightLat = aGeo.latAtLng(rightLng);
    }

    var bLeftLat, bRightLat;
    if (b0.lng == b1.lng) {
        // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
        bLeftLat = b0.lat;
        bRightLat = b1.lat;
    } else {
        var bGeo = new GeodesicLine(b0, b1);
        bLeftLat = bGeo.latAtLng(leftLng);
        bRightLat = bGeo.latAtLng(rightLng);
    }
    //console.log(aLeftLat);
    //console.log(aRightLat);
    //console.log(bLeftLat);
    //console.log(bRightLat);
    // if both a are less or greater than both b, then lines do not cross

    if (aLeftLat < bLeftLat && aRightLat < bRightLat) return false;
    if (aLeftLat > bLeftLat && aRightLat > bRightLat) return false;

    // latitudes cross between left and right - so geodesic lines cross
    //console.log('Xlink!');
    return true;
};

window.plugin.wasabee.testPolyLine = function (drawnLink, link, markers, operation) {
    var a = link.getLatLngs(operation);
    var start = {};
    var end = {};
    var fromPortal = operation.getPortal(drawnLink.fromPortalId)
    var toPortal = operation.getPortal(drawnLink.toPortalId)
    start.lat = fromPortal.lat;
    start.lng = fromPortal.lng;
    end.lat = toPortal.lat;
    end.lng = toPortal.lng;

    if (window.plugin.wasabee.greatCircleArcIntersect(a[0], a[1], start, end)) {
        for (i = 0; i < markers.length; i++) {
            var marker = markers[i];
            if (marker.type == Wasabee.Constants.MARKER_TYPE_DESTROY || marker.type == Wasabee.Constants.MARKER_TYPE_VIRUS || marker.type == Wasabee.Constants.MARKER_TYPE_DECAY) {
                if (window.plugin.wasabee.checkMarkerAgainstLink(marker, link, operation)) {
                    console.log("FOUND MARKER TO NOT SHOW CROSSLINK -> " + marker.ID)
                    return false;
                }
            }
        }
        return true;
    }
    return false;
};

/** This checks if a marker is on either side of a link */
window.plugin.wasabee.checkMarkerAgainstLink = function (marker, link, operation) {
    var latlngs = link.getLatLngs(operation);
    var markerPortal = operation.getPortal(marker.portalId)
    var v = latlngs[0];
    var center = latlngs[1];
    var view = markerPortal;
    return view ? view.lng == v.lng && view.lat == v.lat ? true : view.lng == center.lng && view.lat == center.lat ? true : false : false;
}

window.plugin.wasabee.showCrossLink = function (link, operation) {

    var blocked = L.geodesicPolyline(link.getLatLngs(operation), {
        color: '#d22',
        opacity: 0.7,
        weight: 5,
        clickable: false,
        dashArray: [8, 8],
        guid: link.options.guid
    });

    blocked.addTo(window.plugin.wasabee.crossLinkLayers);
    window.plugin.wasabee.crossLinkLayerGroup[link.options.guid] = blocked;
}

window.plugin.wasabee.testLink = function (drawnLinks, drawnMarkers, link, operation) {
    if (window.plugin.wasabee.crossLinkLayerGroup[link.options.guid]) return;
    try {
        drawnLinks.forEach(function (drawnLink) {
            var shouldShowCrosslink = plugin.wasabee.testPolyLine(drawnLink, link, drawnMarkers, operation);
            if (shouldShowCrosslink) {
                plugin.wasabee.showCrossLink(link, operation);
                throw Wasabee.Constants.BREAK_EXCEPTION;
            }
        });
    } catch (e) {
        if (e !== Wasabee.Constants.BREAK_EXCEPTION) throw e;
    }
};

window.plugin.wasabee.checkAllLinks = function () {
    window.plugin.wasabee.crossLinkLayers.clearLayers();
    plugin.wasabee.crossLinkLayerGroup = {};

    var operation = window.plugin.wasabee.getSelectedOperation();
    var drawnLinks = operation.links;
    var drawnMarkers = operation.markers;

    $.each(window.links, function (guid, link) {
        window.plugin.wasabee.doLinkTest(link, drawnLinks, drawnMarkers, operation);
    });
}

window.plugin.wasabee.onLinkAdded = function (data) {
    var operation = window.plugin.wasabee.getSelectedOperation();
    var drawnLinks = operation.links;
    var drawnMarkers = operation.markers;
    plugin.wasabee.doLinkTest(data.link, drawnLinks, drawnMarkers, operation);
}

window.plugin.wasabee.doLinkTest = function (finalLink, drawnLinks, drawnMarkers, operation) {
    plugin.wasabee.testLink(drawnLinks, drawnMarkers, finalLink, operation);
}

window.plugin.wasabee.testForDeletedLinks = function () {
    window.plugin.wasabee.crossLinkLayers.eachLayer(function (layer) {
        var guid = layer.options.guid;
        if (!window.links[guid]) {
            plugin.wasabee.crossLinkLayers.removeLayer(layer);
            delete plugin.wasabee.crossLinkLayerGroup[guid];
        }
    });
}

window.plugin.wasabee.onMapDataRefreshEnd = function () {
    window.plugin.wasabee.crossLinkLayers.bringToFront();
    window.plugin.wasabee.testForDeletedLinks();
}

window.plugin.wasabee.initCrossLinks = function () {
    window.plugin.wasabee.crossLinkLayers = new L.FeatureGroup();
    window.plugin.wasabee.crossLinkLayerGroup = {};
    window.addLayerGroup('Wasabee Cross Links', window.plugin.wasabee.crossLinkLayers, true);

    map.on('layeradd', function (obj) {
        if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
            window.plugin.wasabee.checkAllLinks();
        }
    });
    map.on('layerremove', function (obj) {
        if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
            window.plugin.wasabee.crossLinkLayers.clearLayers();
            window.plugin.wasabee.crossLinkLayerGroup = {};
        }
    });

    window.addHook('linkAdded', window.plugin.wasabee.onLinkAdded);
    window.addHook('mapDataRefreshEnd', window.plugin.wasabee.onMapDataRefreshEnd);
}

//*** END CROSSLINK THINGS */