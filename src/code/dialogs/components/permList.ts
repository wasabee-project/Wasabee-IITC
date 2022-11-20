import { displayError } from "../../error";
import { WasabeeMe, WasabeeOp } from "../../model";
import { getSelectedOperation } from "../../selectedOp";
import { addPermPromise, delPermPromise } from "../../server";
import { getTeam } from "../../model/cache";
import Sortable, { SortableField } from "../../sortable";
import wX from "../../wX";
import type { OpPermItem } from "../../model/operation";

export function buildPermList(operation: WasabeeOp, me: WasabeeMe) {
  const isOwner = me && operation.isOwnedOp() && operation.isOnCurrentServer();
  /* Footer */
  const teamMenu = isOwner ? L.DomUtil.create("select") : null;
  const permMenu = isOwner ? L.DomUtil.create("select") : null;
  const zoneMenu = isOwner ? L.DomUtil.create("select") : null;
  if (isOwner) {
    for (const t of me.Teams) {
      const o = L.DomUtil.create("option", null, teamMenu);
      o.value = t.ID;
      o.textContent = t.Name;
    }

    const read = L.DomUtil.create("option", null, permMenu);
    read.value = "read";
    read.textContent = wX("READ");
    const write = L.DomUtil.create("option", null, permMenu);
    write.value = "write";
    write.textContent = wX("WRITE");
    const ao = L.DomUtil.create("option", null, permMenu);
    ao.value = "assignedonly";
    ao.textContent = wX("ASSIGNED_ONLY");

    const zoneAll = L.DomUtil.create("option", null, zoneMenu);
    zoneAll.value = "0";
    zoneAll.textContent = wX("dialog.common.zone_all");
    for (const oz of operation.zones) {
      const z = L.DomUtil.create("option", null, zoneMenu);
      z.value = "" + oz.id;
      z.textContent = oz.name;
    }
  }

  const sortable = new Sortable<OpPermItem>();
  const fields: SortableField<OpPermItem>[] = [
    {
      name: wX("TEAM"),
      value: async (perm) => {
        if (
          me &&
          operation.isOnCurrentServer() &&
          me.teamJoined(perm.teamid)
        ) {
          // try the team cache first
          const t = await getTeam(perm.teamid);
          if (t) return t.name;
          // check the "me" list
          if (me) {
            for (const mt of me.Teams) {
              if (mt.ID == perm.teamid) return mt.Name;
            }
          }
        }
        // default to the id
        return "[" + perm.teamid + "]";
      },
      sort: (a: string, b: string) => a.localeCompare(b),
      // , format: (cell, value) => (cell.textContent = value)
      foot: (cell) => {
        if (isOwner) cell.append(teamMenu);
      },
    },
    {
      name: wX("ROLE"),
      value: (perm) => perm.role,
      sort: (a: string, b: string) => a.localeCompare(b),
      // , format: (cell, value) => (cell.textContent = value)
      foot: (cell) => {
        if (isOwner) cell.append(permMenu);
      },
    },
    {
      name: wX("ZONE"),
      value: (perm) => {
        if (perm.zone === 0) return wX("dialog.common.zone_all");
        return operation.zoneName(perm.zone);
      },
      sort: (a: string, b: string) => a.localeCompare(b),
      // , format: (cell, value) => (cell.textContent = value)
      foot: (cell) => {
        if (isOwner) cell.append(zoneMenu);
      },
    },
  ];

  if (!isOwner) {
    for (const field of fields) delete field.foot;
  } else {
    fields.push({
      name: wX("dialog.common.commands"),
      value: () => wX("REMOVE"),
      format: (cell, value: string, obj) => {
        const link = L.DomUtil.create("a", null, cell);
        link.href = "#";
        link.textContent = value;
        L.DomEvent.on(link, "click", (ev) => {
          L.DomEvent.stop(ev);
          delPerm(obj); // calls wasabee:op:change -- async but no need to await
        });
      },
      foot: (cell) => {
        const link = L.DomUtil.create("a", null, cell);
        link.href = "#";
        link.textContent = wX("ADD");
        L.DomEvent.on(link, "click", (ev) => {
          L.DomEvent.stop(ev);
          addPerm(
            teamMenu.value,
            permMenu.value as OpPermItem["role"],
            +zoneMenu.value
          );
        });
      },
    });
  }

  sortable.fields = fields;
  sortable.sortBy = 0;
  sortable.items = operation.teamlist;

  return sortable.table;
}

async function addPerm(teamID: TeamID, role: OpPermItem["role"], zone: ZoneID) {
  if (!WasabeeMe.isLoggedIn()) {
    displayError(wX("NOT LOGGED IN SHORT"));
    return;
  }
  const operation = getSelectedOperation();
  if (!operation.isOwnedOp()) return;

  for (const p of operation.teamlist) {
    if (p.teamid == teamID && p.role == role && p.zone == zone) {
      console.debug("not adding duplicate permission");
      return;
    }
  }

  try {
    await addPermPromise(operation.ID, teamID, role, zone);
    // add locally for display
    operation.teamlist.push({ teamid: teamID, role: role, zone: zone });
    await operation.store();
    window.map.fire("wasabee:op:change");
  } catch (e) {
    console.error(e);
    displayError(e);
  }
}

async function delPerm(obj: OpPermItem) {
  if (!WasabeeMe.isLoggedIn()) {
    displayError(wX("NOT LOGGED IN SHORT"));
    return;
  }
  const operation = getSelectedOperation();
  if (!operation.isOwnedOp()) return;

  try {
    await delPermPromise(operation.ID, obj.teamid, obj.role, obj.zone);
    const n: WasabeeOp["teamlist"] = [];
    for (const p of operation.teamlist) {
      if (p.teamid != obj.teamid || p.role != obj.role || p.zone != obj.zone)
        n.push(p);
    }
    operation.teamlist = n;
    await operation.store();
    window.map.fire("wasabee:op:change");
  } catch (e) {
    console.error(e);
    displayError(e);
  }
}
