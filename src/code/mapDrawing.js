var markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import { getColorHex } from "./markerDialog";
import { checkAllLinks } from "./crosslinks";
import WasabeeMe from "./me";

var Wasabee = window.plugin.Wasabee;

//** This function draws things on the layers */
export const drawThings = () => {
  window.plugin.wasabee.resetAllPortals();
  resetAllTargets();
  resetAllLinks();
  checkAllLinks();
};

//** This function adds all the Targets to the layer */
const addAllTargets = () => {
  var targetList = window.plugin.wasabee.getSelectedOperation().markers;
  if (targetList != null) {
    targetList.forEach(target => addTarget(target));
  }
};

//** This function resets all the Targets and calls addAllTargets to add them */
const resetAllTargets = () => {
  for (var guid in window.plugin.wasabee.targetLayers) {
    var targetInLayer = window.plugin.wasabee.targetLayers[guid];
    window.plugin.wasabee.targetLayerGroup.removeLayer(targetInLayer);
    delete window.plugin.wasabee.targetLayers[guid];
  }
  addAllTargets();
};

/** This function adds a Targets to the target layer group */
const addTarget = target => {
  var targetPortal = window.plugin.wasabee
    .getSelectedOperation()
    .getPortal(target.portalId);
  var latLng = new L.LatLng(targetPortal.lat, targetPortal.lng);
  var marker = L.marker(latLng, {
    title: targetPortal.name,
    icon: L.icon({
      iconUrl: getImageFromMarker(target),
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48)
    })
  });

  window.registerMarkerForOMS(marker);
  marker.bindPopup(getMarkerPopup(marker, target, targetPortal));
  marker.off("click", marker.togglePopup, marker);
  marker.on("spiderfiedclick", marker.togglePopup, marker);
  window.plugin.wasabee.targetLayers[target["ID"]] = marker;
  marker.addTo(window.plugin.wasabee.targetLayerGroup);
};

const getMarkerPopup = (marker, target, portal) => {
  marker.className = "wasabee-dialog wasabee-dialog-ops";
  var content = document.createElement("div");
  var title = content.appendChild(document.createElement("div"));
  title.className = "desc";
  title.innerHTML = markdown.toHTML(getPopupBodyWithType(portal, target));
  var buttonSet = content.appendChild(document.createElement("div"));
  buttonSet.className = "temp-op-dialog";
  var deleteButton = buttonSet.appendChild(document.createElement("a"));
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener(
    "click",
    () => {
      UiCommands.deleteMarker(
        window.plugin.wasabee.getSelectedOperation(),
        target,
        portal
      );
      marker.closePopup();
    },
    false
  );
  return content;
};

export const getPopupBodyWithType = (portal, target) => {
  var title = "";
  switch (target.type) {
    case Wasabee.Constants.MARKER_TYPE_DECAY:
      title = "Let Decay";
      break;
    case Wasabee.Constants.MARKER_TYPE_DESTROY:
      title = "Destroy";
      break;
    case Wasabee.Constants.MARKER_TYPE_FARM:
      title = "Farm";
      break;
    case Wasabee.Constants.MARKER_TYPE_GOTO:
      title = "Go To";
      break;
    case Wasabee.Constants.MARKER_TYPE_KEY:
      title = "Get Keys";
      break;
    case Wasabee.Constants.MARKER_TYPE_LINK:
      title = "Establish Link";
      break;
    case Wasabee.Constants.MARKER_TYPE_MEETAGENT:
      title = "Meet agent";
      break;
    case Wasabee.Constants.MARKER_TYPE_OTHER:
      title = "Other";
      break;
    case Wasabee.Constants.MARKER_TYPE_RECHARGE:
      title = "Recharge";
      break;
    case Wasabee.Constants.MARKER_TYPE_UPGRADE:
      title = "Upgrade";
      break;
    case Wasabee.Constants.MARKER_TYPE_VIRUS:
      title = "Virus";
      break;
    default:
      title = "Unknown";
  }
  title = title + " - " + portal.name;
  if (target.comment) title = title + "\n\n" + target.comment;
  if (target.state != "completed" && target.assignedNickname)
    title = title + "\n\nAssigned To: " + target.assignedNickname;
  if (target.state == "completed" && target.completedBy)
    title = title + "\n\nCompleted By: " + target.completedBy;
  return title;
};

//** This function returns the appropriate image for a marker type */
const getImageFromMarker = target => {
  switch (target.state) {
    case "pending":
      switch (target.type) {
        case Wasabee.Constants.MARKER_TYPE_DECAY:
          return Wasabee.static.images.marker_alert_decay;
        case Wasabee.Constants.MARKER_TYPE_DESTROY:
          return Wasabee.static.images.marker_alert_destroy;
        case Wasabee.Constants.MARKER_TYPE_FARM:
          return Wasabee.static.images.marker_alert_farm;
        case Wasabee.Constants.MARKER_TYPE_GOTO:
          return Wasabee.static.images.marker_alert_goto;
        case Wasabee.Constants.MARKER_TYPE_KEY:
          return Wasabee.static.images.marker_alert_key;
        case Wasabee.Constants.MARKER_TYPE_LINK:
          return Wasabee.static.images.marker_alert_link;
        case Wasabee.Constants.MARKER_TYPE_MEETAGENT:
          return Wasabee.static.images.marker_alert_meetagent;
        case Wasabee.Constants.MARKER_TYPE_OTHER:
          return Wasabee.static.images.marker_alert_other;
        case Wasabee.Constants.MARKER_TYPE_RECHARGE:
          return Wasabee.static.images.marker_alert_recharge;
        case Wasabee.Constants.MARKER_TYPE_UPGRADE:
          return Wasabee.static.images.marker_alert_upgrade;
        case Wasabee.Constants.MARKER_TYPE_VIRUS:
          return Wasabee.static.images.marker_alert_virus;
      }
      break;
    case "assigned":
      switch (target.type) {
        case Wasabee.Constants.MARKER_TYPE_DECAY:
          return Wasabee.static.images.marker_alert_decay_assigned;
        case Wasabee.Constants.MARKER_TYPE_DESTROY:
          return Wasabee.static.images.marker_alert_destroy_assigned;
        case Wasabee.Constants.MARKER_TYPE_FARM:
          return Wasabee.static.images.marker_alert_farm_assigned;
        case Wasabee.Constants.MARKER_TYPE_GOTO:
          return Wasabee.static.images.marker_alert_goto_assigned;
        case Wasabee.Constants.MARKER_TYPE_KEY:
          return Wasabee.static.images.marker_alert_key_assigned;
        case Wasabee.Constants.MARKER_TYPE_LINK:
          return Wasabee.static.images.marker_alert_link_assigned;
        case Wasabee.Constants.MARKER_TYPE_MEETAGENT:
          return Wasabee.static.images.marker_alert_meetagent_assigned;
        case Wasabee.Constants.MARKER_TYPE_OTHER:
          return Wasabee.static.images.marker_alert_other_assigned;
        case Wasabee.Constants.MARKER_TYPE_RECHARGE:
          return Wasabee.static.images.marker_alert_recharge_assigned;
        case Wasabee.Constants.MARKER_TYPE_UPGRADE:
          return Wasabee.static.images.marker_alert_upgrade_assigned;
        case Wasabee.Constants.MARKER_TYPE_VIRUS:
          return Wasabee.static.images.marker_alert_virus_assigned;
      }
      break;
    case "completed":
      switch (target.type) {
        case Wasabee.Constants.MARKER_TYPE_DECAY:
          return Wasabee.static.images.marker_alert_decay_done;
        case Wasabee.Constants.MARKER_TYPE_DESTROY:
          return Wasabee.static.images.marker_alert_destroy_done;
        case Wasabee.Constants.MARKER_TYPE_FARM:
          return Wasabee.static.images.marker_alert_farm_done;
        case Wasabee.Constants.MARKER_TYPE_GOTO:
          return Wasabee.static.images.marker_alert_goto_done;
        case Wasabee.Constants.MARKER_TYPE_KEY:
          return Wasabee.static.images.marker_alert_key_done;
        case Wasabee.Constants.MARKER_TYPE_LINK:
          return Wasabee.static.images.marker_alert_link_done;
        case Wasabee.Constants.MARKER_TYPE_MEETAGENT:
          return Wasabee.static.images.marker_alert_meetagent_done;
        case Wasabee.Constants.MARKER_TYPE_OTHER:
          return Wasabee.static.images.marker_alert_other_done;
        case Wasabee.Constants.MARKER_TYPE_RECHARGE:
          return Wasabee.static.images.marker_alert_recharge_done;
        case Wasabee.Constants.MARKER_TYPE_UPGRADE:
          return Wasabee.static.images.marker_alert_upgrade_done;
        case Wasabee.Constants.MARKER_TYPE_VIRUS:
          return Wasabee.static.images.marker_alert_virus_done;
      }
      break;
  }
  return Wasabee.static.images.marker_alert_other;
};

//** This function adds all the Links to the layer */
const addAllLinks = () => {
  var operation = window.plugin.wasabee.getSelectedOperation();
  var linkList = operation.links;
  linkList.forEach(link => addLink(link, operation.color, operation));
};

//** This function resets all the Links and calls addAllLinks to add them */
const resetAllLinks = () => {
  for (var guid in window.plugin.wasabee.linkLayers) {
    var linkInLayer = window.plugin.wasabee.linkLayers[guid];
    window.plugin.wasabee.linkLayerGroup.removeLayer(linkInLayer);
    delete window.plugin.wasabee.linkLayers[guid];
  }
  addAllLinks();
};

/** This function adds a portal to the portal layer group */
const addLink = (link, color, operation) => {
  const colorHex = getColorHex(color);
  var options = {
    dashArray: [5, 5, 1, 5],
    color: colorHex ? colorHex : "#ff6600",
    opacity: 1,
    weight: 2
  };
  var latLngs = link.getLatLngs(operation);
  if (latLngs != null) {
    var link_ = new L.GeodesicPolyline(latLngs, options);

    window.plugin.wasabee.linkLayers[link["ID"]] = link_;
    link_.addTo(window.plugin.wasabee.linkLayerGroup);
  } else {
    console.log("LATLNGS WAS NULL?!");
  }
};

/** this function fetches and displays agent location */
export const drawAgents = () => {
  var me = WasabeeMe.get();
  if (me == null) {
    // not logged in, do nothing
    return;
  }
  var operation = window.plugin.wasabee.getSelectedOperation();

  /* each pull resets these teams  -- put rate limiting here, don't fetch if less than 60 seconds old */
  operation.teamlist.forEach(function(t) {
    if (Wasabee.teams.size != 0 && Wasabee.teams.has(t.teamid)) {
      Wasabee.teams.delete(t.teamid);
    }

    /* this fetches the team into Wasabee.teams */
    window.plugin.wasabee.teamPromise(t.teamid).then(
      function(team) {
        team.agents.forEach(function(agent) {
          var agentInLayer = window.plugin.wasabee.agentLayers[agent.id];
          if (agentInLayer != null) {
            window.plugin.wasabee.agentLayerGroup.removeLayer(agentInLayer);
            delete window.plugin.wasabee.agentLayers[agent.id];
          }
          if (agent.lat != 0) {
            var latLng = new L.LatLng(agent.lat, agent.lng);
            var a_ = L.marker(latLng, {
              title: agent.name,
              icon: L.icon({
                iconUrl: agent.pic,
                shadowUrl: null,
                iconSize: L.point(41, 41),
                iconAnchor: L.point(25, 41),
                popupAnchor: L.point(-1, -48)
              })
            });
            window.registerMarkerForOMS(a_);
            a_.bindPopup(getAgentPopup(agent));
            a_.off("click", agent.togglePopup, agent);
            a_.on("spiderfiedclick", a_.togglePopup, a_);
            window.plugin.wasabee.agentLayers[agent.id] = a_;
            a_.addTo(window.plugin.wasabee.agentLayerGroup);
          }
        });
      },
      function(err) {
        console.log(err); // promise rejected
        // you may not have access to every team on the op -- ignore the problems
      }
    );
  }); // forEach team
  // redraw target popup menus
  // window.plugin.wasabee.resetAllTargets();
  // create new window.plugin.wasabee.updateAllTargets
};

const getAgentPopup = agent => {
  agent.className = "wasabee-dialog wasabee-dialog-ops";
  var content = document.createElement("div");
  var title = content.appendChild(document.createElement("div"));
  title.className = "desc";
  title.id = agent.id;
  title.innerHTML = markdown.toHTML(agent.name);
  var date = content.appendChild(document.createElement("span"));
  date.innerHTML = markdown.toHTML("Last update: " + agent.date);
  return content;
};
