import { convertColorToHex, appendFAIcon } from "../../auxiliar";
import { getSelectedOperation } from "../../selectedOp";
import { addToColorList } from "../../skin";
import wX from "../../wX";
import ConfirmDialog from "../confirmDialog";
import type { ZonedrawHandler } from "../zoneDrawHandler";
import ZoneSetColorDialog from "../zoneSetColor";

export function buildZoneList(
  zoneHandler?: ZonedrawHandler,
  container?: HTMLDivElement
) {
  const op = getSelectedOperation();
  const canWrite = op.getPermission() === "write";
  container = container || L.DomUtil.create("div");
  container.textContent = "";
  const tbody = L.DomUtil.create(
    "tbody",
    "",
    L.DomUtil.create("table", "wasabee-table", container)
  );
  const hr = L.DomUtil.create("tr", null, tbody);
  L.DomUtil.create("th", null, hr).textContent = wX("dialog.zones.id");
  L.DomUtil.create("th", null, hr).textContent = wX("dialog.common.name");
  L.DomUtil.create("th", null, hr).textContent = wX("dialog.zones.color");
  L.DomUtil.create("th", null, hr).textContent = wX("dialog.common.commands");

  for (const z of op.zones) {
    const tr = L.DomUtil.create("tr", null, tbody);
    const idcell = L.DomUtil.create("td", null, tr);
    idcell.textContent = "" + z.id;
    const namecell = L.DomUtil.create("td", null, tr);
    const nameinput = L.DomUtil.create("input", null, namecell);
    nameinput.type = "text";
    nameinput.value = z.name;

    const colorcell = L.DomUtil.create("td", null, tr);
    const picker = L.DomUtil.create("input", "picker", colorcell);
    picker.type = "color";
    picker.value = convertColorToHex(z.color);
    picker.setAttribute("list", "wasabee-colors-datalist");
    picker.disabled = !canWrite;

    L.DomEvent.on(picker, "change", (ev) => {
      L.DomEvent.stop(ev);
      z.color = picker.value;
      op.update();
      addToColorList(picker.value);
    });

    L.DomEvent.on(nameinput, "change", (ev) => {
      L.DomEvent.stop(ev);
      getSelectedOperation().renameZone(z.id, nameinput.value);
    });

    const commandcell = L.DomUtil.create("td", "actions", tr);
    if (z.points.length > 0) {
      const bounds = L.latLngBounds(z.points);
      const jump = L.DomUtil.create("a", null, commandcell);
      jump.href = "#";
      jump.title = wX("dialog.zones.jump_to");
      appendFAIcon("location-dot", jump);
      L.DomEvent.on(jump, "click", (ev) => {
        L.DomEvent.stop(ev);
        window.map.fitBounds(bounds);
      });
    }

    if (canWrite) {
      const color = L.DomUtil.create("a", null, commandcell);
      color.href = "#";
      color.title = wX("dialog.zones.color_links");
      appendFAIcon("palette", color);
      L.DomEvent.on(color, "click", (ev) => {
        L.DomEvent.stop(ev);
        const zoneSetColorDialog = new ZoneSetColorDialog({
          zone: z,
        });
        zoneSetColorDialog.enable();
      });
      if (z.id != 1) {
        const del = L.DomUtil.create("a", null, commandcell);
        del.href = "#";
        del.title = wX("dialog.common.delete");
        appendFAIcon("trash", del);
        L.DomEvent.on(del, "click", (ev) => {
          L.DomEvent.stop(ev);
          const con = new ConfirmDialog({
            title: wX("dialog.zones.delete.title", { zoneName: z.name }),
            label: wX("dialog.zones.delete.text", { zoneName: z.name }),
            type: "operation",
            callback: async () => {
              getSelectedOperation().removeZone(z.id);
            }
          });
          con.enable();
        });
      }
      if (zoneHandler && zoneHandler.zoneID === z.id && zoneHandler.enabled()) {
        const stopDrawing = L.DomUtil.create("a", null, commandcell);
        stopDrawing.href = "#";
        stopDrawing.title = wX("dialog.zones.stop_drawing");
        appendFAIcon("ban", stopDrawing);
        L.DomEvent.on(stopDrawing, "click", (ev) => {
          L.DomEvent.stop(ev);
          zoneHandler.disable();
          buildZoneList(zoneHandler, container);
        });
      } else {
        if (z.points.length == 0) {
          const addPoints = L.DomUtil.create("a", null, commandcell);
          addPoints.title = wX("dialog.zones.draw_zone_shape");
          appendFAIcon("pen", addPoints);
          addPoints.href = "#";
          L.DomEvent.on(addPoints, "click", (ev) => {
            L.DomEvent.stop(ev);
            zoneHandler.zoneID = z.id;
            zoneHandler.enable();
            buildZoneList(zoneHandler, container);
          });
        } else {
          const delPoints = L.DomUtil.create("a", null, commandcell);
          delPoints.title = wX("dialog.zones.delete_zone_shape");
          appendFAIcon("eraser", delPoints);
          delPoints.href = "#";
          L.DomEvent.on(delPoints, "click", (ev) => {
            L.DomEvent.stop(ev);
            getSelectedOperation().removeZonePoints(z.id);
          });
        }
      }
    }
  }

  return container;
}
