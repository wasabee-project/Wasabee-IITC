export default class Marker {
    constructor(type, portalId, comment) {
        this.ID = window.plugin.wasabee.generateId();
        this.portalId = portalId;
        this.type = type;
        this.comment = comment;
    }

    static create(obj) {
        var marker = new Marker();
        for (var prop in obj) {
            if (marker.hasOwnProperty(prop)) {
                marker[prop] = obj[prop];
            }
        }
        return marker;
    }
}