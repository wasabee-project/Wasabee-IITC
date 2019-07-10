/*** ARC THINGS */
const distance = (fromPortal, toPortal) => {
    //How far between portals.
    var R = 6367; // km

    lat1 = fromPortal.lat;
    lon1 = fromPortal.lng;
    lat2 = toPortal.lat;
    lon2 = toPortal.lng;

    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var lat1 = lat1 * Math.PI / 180;
    var lat2 = lat2 * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    d = Math.round(d * 1000) / 1000;
    return d;
};
//*** END ARC THINGS */
