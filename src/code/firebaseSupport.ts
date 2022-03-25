/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */
import { drawSingleTeam } from "./mapDrawing";
import {
  opPromise,
  GetWasabeeServer,
  getLinkPromise,
  getMarkerPromise,
} from "./server";
import {
  makeSelectedOperation,
  removeOperation,
  changeOpIfNeeded,
  getSelectedOperation,
} from "./selectedOp";
import { updateLocalOp } from "./uiCommands";
import WasabeeOp from "./model/operation";
import WasabeePortal from "./model/portal";

import PortalUI from "./ui/portal";
import { displayInfo, displayWarning } from "./error";
import WasabeeAgent from "./model/agent";
import { getJWT } from "./auth";
import WasabeeMe from "./model/me";
import { constants } from "./static";
import WasabeeLink from "./model/link";
import WasabeeMarker from "./model/marker";
import wX from "./wX";

// TODO: use a dedicated message channel: https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging

const frameID = "wasabeeFirebaseFrame";

const channel = new MessageChannel();
const port = channel.port1;

export function initFirebase() {
  const iframe = L.DomUtil.create("iframe");
  iframe.width = "0";
  iframe.height = "0";
  iframe.src = constants.FIREBASE_IFRAME;
  iframe.id = frameID;

  iframe.addEventListener("load", () => {
    port.onmessage = (ev) => {
      if (ev.data === "ready") {
        port.onmessage = onMessage;
        if (WasabeeMe.isLoggedIn()) {
          postToFirebase({
            id: "wasabeeLogin",
            method: "auto",
          });
        }
      }
    };
    iframe.contentWindow.postMessage("init", "*", [channel.port2]);
  });

  $(document.body).append(iframe);
}

async function onMessage(
  event: MessageEvent<{ data: WMessage } | "permission-blocked">
) {
  if (event.data === "permission-blocked") {
    displayWarning(
      wX("dialog.firebase.setup", {
        url: `<a href="${constants.FIREBASE_IFRAME}">${constants.FIREBASE_IFRAME}</a>`,
      }),
      true
    );
    return;
  }
  const data = event.data.data;
  switch (data.cmd) {
    case "Agent Location Change":
      console.debug("firebase update of whole team location: ", data);
      drawSingleTeam(data.msg);
      break;
    case "Delete":
      console.warn("server requested op delete: ", data.opID);
      await removeOperation(data.opID);
      await changeOpIfNeeded();
      break;
    case "Generic Message":
      {
        const agent = await WasabeeAgent.get(data.sender);
        const name = agent ? agent.name : "[unknown sender]";
        displayInfo(
          wX("dialog.team_message", { message: data.msg, sender: name })
        );
      }
      break;
    case "Login":
      console.debug("server reported teammate login: ", data.gid);
      window.map.fire("wasabee:agentlocations");
      break;
    case "Link Assignment Change":
    // fallthrough
    case "Link Status Change":
    // fallthrough
    case "Marker Assignment Change":
    // fallthrough
    case "Task Status Change":
    // fallthrough
    case "Task Assignment Change":
    // fallthrough
    case "Marker Status Change":
    // fallthrough
    case "Map Change":
      opDataChange(data);
      break;
    case "Target":
      try {
        const target = JSON.parse(data.msg);
        const raw = {
          id: target.ID,
          name: target.Name,
          lat: target.Lat,
          lng: target.Lon,
        };
        const portal = new WasabeePortal(raw);
        const f = PortalUI.displayFormat(portal);
        displayInfo(f.outerHTML + "<br>Sent by: " + target.Sender, true);
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      console.warn("unknown firebase command: ", data);
  }
}

async function opDataChange(
  data:
    | LinkAssignment
    | LinkState
    | MarkerAssignment
    | MarkerState
    | TaskAssignment
    | TaskState
    | OpChange
) {
  let uid = data.updateID;
  if (data.cmd !== "Map Change") uid += data.cmd;

  if (window.plugin.wasabee._updateList.has(uid)) {
    console.debug(
      "skipping firebase requested update of op since it was our change",
      data.cmd,
      data.updateID
    );
    return;
  }
  // update the list to avoid race from slow network
  window.plugin.wasabee._updateList.set(uid, Date.now());
  const operation = WasabeeOp.load(data.opID);
  if (!operation) {
    console.warn("Got operation change for an unknown op", data.opID);
    return;
  }

  const sop = getSelectedOperation();
  const cur = sop.ID === data.opID;

  switch (data.cmd) {
    case "Link Assignment Change":
      if (cur) handleLinkAssignement(sop, data);
      console.log(data);
      break;
    case "Link Status Change":
      if (cur) handleLinkStatus(sop, data);
      console.log(data);
      break;
    case "Marker Assignment Change":
      if (cur) handleMarkerAssignement(sop, data);
      console.log(data);
      break;
    case "Marker Status Change":
      if (cur) handleMarkerStatus(sop, data);
      console.log(data);
      break;
    case "Map Change":
      try {
        const localop = await WasabeeOp.load(data.opID);
        const refreshed = await opPromise(data.opID);
        const reloadSOp = await updateLocalOp(localop, refreshed);
        if (reloadSOp) {
          console.log("firebase trigger reload of current op: ", data);
          await makeSelectedOperation(refreshed.ID);
        } else {
          console.debug("firebase trigger update of op", data.opID);
        }
      } catch (e) {
        console.error(e);
      }
      break;
    default:
      console.log(data);
  }
}

async function handleLinkAssignement(
  operation: WasabeeOp,
  data: LinkAssignment
) {
  const link = new WasabeeLink(await getLinkPromise(data.opID, data.linkID));
  operation.assignLink(link.ID, link.assignedTo);
}

async function handleLinkStatus(operation: WasabeeOp, data: LinkState) {
  const link = new WasabeeLink(await getLinkPromise(data.opID, data.linkID));
  operation.setLinkState(link.ID, link.state);
}

async function handleMarkerAssignement(
  operation: WasabeeOp,
  data: MarkerAssignment
) {
  const marker = new WasabeeMarker(
    await getMarkerPromise(data.opID, data.markerID)
  );
  operation.assignMarker(marker.ID, marker.assignedTo);
}

async function handleMarkerStatus(operation: WasabeeOp, data: MarkerState) {
  const marker = new WasabeeMarker(
    await getMarkerPromise(data.opID, data.markerID)
  );
  operation.setMarkerState(marker.ID, marker.state);
}

type AgentLocation = {
  cmd: "Agent Location Change";
  msg: TeamID;
};

type Annoucement = {
  cmd: "Generic Message";
  msg: string;
  sender: GoogleID;
};

type Target = {
  cmd: "Target";
  msg: string;
};

type Login = {
  cmd: "Login";
  gid: GoogleID;
};

type DeleteOp = {
  cmd: "Delete";
  opID: OpID;
};

type Update = {
  updateID: string;
};

type LinkAssignment = Update & {
  cmd: "Link Assignment Change";
  opID: OpID;
  linkID: LinkID;
  msg: string;
};

type LinkState = Update & {
  cmd: "Link Status Change";
  opID: OpID;
  linkID: LinkID;
  msg: string;
};

type MarkerAssignment = Update & {
  cmd: "Marker Assignment Change";
  opID: OpID;
  markerID: MarkerID;
  msg: string;
};

type MarkerState = Update & {
  cmd: "Marker Status Change";
  opID: OpID;
  markerID: MarkerID;
  msg: string;
};

type TaskAssignment = Update & {
  cmd: "Task Assignment Change";
  opID: OpID;
  taskID: TaskID;
  msg: string;
};

type TaskState = Update & {
  cmd: "Task Status Change";
  opID: OpID;
  taskID: TaskID;
  msg: string;
};

type OpChange = Update & {
  cmd: "Map Change";
  opID: OpID;
};

type WMessage =
  | AgentLocation
  | Annoucement
  | Target
  | Login
  | DeleteOp
  | LinkAssignment
  | LinkState
  | MarkerAssignment
  | MarkerState
  | TaskAssignment
  | TaskState
  | OpChange;

interface FirebaseMessage {
  id: string;
  method: string;
  action: string;
  error: string;
  app_name: string;
  app_version: string;
  server: string;
  jwt: string;
}

export function postToFirebase(message: Partial<FirebaseMessage>) {
  // prevent analytics data from being sent if not enabled by the user: GPDR
  if (
    message.id == "analytics" &&
    localStorage[window.plugin.wasabee.static.constants.SEND_ANALYTICS_KEY] !=
      "true"
  )
    return;

  if (message.id == "wasabeeLogin") {
    message.server = GetWasabeeServer();
    message.jwt = getJWT();
  }

  message.app_name = "Wasabee-IITC";
  message.app_version = window.plugin.wasabee.info.version;

  port.postMessage(message);
}
