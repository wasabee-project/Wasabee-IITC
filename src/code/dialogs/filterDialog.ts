import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getTeam } from "../model/cache";
import { getSelectedOperation } from "../selectedOp";
import { Filter, isFiltered, resetFilter, setFilter } from "../filter";
import { displayError } from "../error";
import { convertColorToHex } from "../auxiliar";
import { addToColorList } from "../skin";
import { displayFormat as displayPortal, getSelected } from "../ui/portal";
import type { TaskState } from "../model/task";
import type { WasabeePortal } from "../model";

interface LocalFilter<T> {
  enabled: boolean;
  selected: T;
  toFilter(selected: T): Filter;
}

/******    Bulk setters    ******/
function setLinksColor(color: string) {
  const op = getSelectedOperation();
  for (const t of op.links) {
    if (isFiltered(t)) t.color = color;
  }
  op.update();
  addToColorList(color);
}

function setTasksAssign(gid: GoogleID) {
  const op = getSelectedOperation();
  for (const t of op.links) {
    if (isFiltered(t)) t.assign(gid);
  }
  for (const t of op.markers) {
    if (isFiltered(t)) t.assign(gid);
  }
  op.update();
}

function setTasksZone(zone: ZoneID) {
  const op = getSelectedOperation();
  zone = zone || 0;
  for (const t of op.links) {
    if (isFiltered(t)) t.zone = zone;
  }
  for (const t of op.markers) {
    if (isFiltered(t)) t.zone = zone;
  }
  op.update();
}

function setTasksState(state: TaskState) {
  const op = getSelectedOperation();
  for (const t of op.links) {
    if (isFiltered(t)) t.state = state;
  }
  for (const t of op.markers) {
    if (isFiltered(t)) t.state = state;
  }
  op.update();
}
/********************************/

export default class FilterDialog extends WDialog {
  static TYPE = "settings";

  _filters: { [key: string]: LocalFilter<string[] | WasabeePortal> };
  _activeTab: number;

  addHooks() {
    super.addHooks();
    this._filters = {};
    this._activeTab = 0;

    window.map.on("wasabee:op:select", this.update, this);
    window.map.on("wasabee:teams", this.update, this);
    this._displayDialog();
  }

  removeHooks() {
    super.removeHooks();
    window.map.off("wasabee:op:select", this.update, this);
    window.map.off("wasabee:teams", this.update, this);
    resetFilter();
    window.map.fire("wasabee:filter");
  }

  async update() {
    this.setContent(await this._getContent());
    this.setTitle(wX("dialog.filter.title"));
  }

  _createSelect<T extends string>(options: [string, T][], current?: T) {
    return this._createSelectMultiple(
      options,
      current !== undefined ? [current] : [],
      true
    );
  }

  _createSelectMultiple<T extends string>(
    options: [string, T][],
    current: T[],
    single?: boolean
  ) {
    const select = L.DomUtil.create("select");
    select.multiple = !single;
    for (const [k, v] of options) {
      const option = L.DomUtil.create("option", null, select);
      option.textContent = k;
      option.value = v;
      if (current && current.includes(v)) option.selected = true;
    }
    return select;
  }

  _createPortal(current: WasabeePortal, callback?: (p: WasabeePortal) => void) {
    const container = L.DomUtil.create("div", "set-portal-small");
    const display = L.DomUtil.create("span", "set-portal-display", container);
    const button = L.DomUtil.create("button", "set-portal-button", container);
    button.textContent = wX("SET");
    if (current) {
      display.appendChild(displayPortal(current));
    } else {
      display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(button, "click", () => {
      const portal = getSelected();
      if (portal) {
        display.textContent = "";
        display.appendChild(displayPortal(portal));
        if (callback) callback(portal);
      }
    });
    return container;
  }

  _addFieldPortal(
    container: HTMLElement,
    filterKey: string,
    field: { label: string; toFilter: (p: WasabeePortal) => Filter }
  ) {
    /* Data init */
    if (!this._filters[filterKey]) {
      this._filters[filterKey] = {
        enabled: false,
        selected: null,
        toFilter: field.toFilter,
      } as LocalFilter<WasabeePortal>;
    }
    const filter = this._filters[filterKey] as LocalFilter<WasabeePortal>;

    /* [x] Label */
    const title = L.DomUtil.create("label", "checkbox", container);
    const check = L.DomUtil.create("input", "", title);
    check.type = "checkbox";
    check.checked = filter.enabled;
    L.DomUtil.create("span", "", title).textContent = field.label;

    /* [Input field] */
    const portalPicker = this._createPortal(
      filter.selected as WasabeePortal,
      (portal) => {
        filter.selected = portal;
        // enable only if the checkbox is checked and a portal is selected
        filter.enabled = check.checked && !!filter.selected;
      }
    );
    container.appendChild(portalPicker);

    L.DomEvent.on(check, "change", (ev) => {
      L.DomEvent.stop(ev);
      // enable only if the checkbox is checked and a portal is selected
      filter.enabled = check.checked && !!filter.selected;
    });
  }

  _addField<T extends string>(
    container: HTMLElement,
    filterKey: string,
    field: {
      label: string;
      options: [string, T][];
      toFilter: (s: T[]) => Filter;
    }
  ) {
    /* Data init */
    if (!this._filters[filterKey]) {
      this._filters[filterKey] = {
        enabled: false,
        selected: [],
        toFilter: field.toFilter,
      } as LocalFilter<T[]>;
    }
    const filter = this._filters[filterKey] as LocalFilter<T[]>;

    /* [x] Label */
    const title = L.DomUtil.create("label", "checkbox", container);
    const check = L.DomUtil.create("input", "", title);
    check.type = "checkbox";
    check.checked = filter.enabled;
    L.DomUtil.create("span", "", title).textContent = field.label;

    /* [Input field] */
    const select = this._createSelectMultiple<T>(
      field.options,
      filter.selected
    );
    select.disabled = !filter.enabled;
    container.appendChild(select);

    L.DomEvent.on(check, "change", (ev) => {
      L.DomEvent.stop(ev);
      filter.enabled = check.checked;
      select.disabled = !check.checked;
    });

    L.DomEvent.on(select, "change", (ev) => {
      L.DomEvent.stop(ev);
      filter.selected = Array.from(select.selectedOptions).map(
        (e) => e.value as T
      );
    });
  }

  _addAction<T extends string>(
    container: HTMLElement,
    label: string,
    input: HTMLInputElement | HTMLSelectElement,
    text: string,
    action: (value: T) => void
  ) {
    const title = L.DomUtil.create("label", "", container);
    title.textContent = label;
    container.appendChild(input);

    const button = L.DomUtil.create("button", "", container);
    button.textContent = text;

    L.DomEvent.on(button, "click", () => action(input.value as T));
  }

  async _getFiltersTab() {
    const anchor = L.DomUtil.create("a");
    anchor.textContent = "Filters";
    const panel = L.DomUtil.create("div", "filters");

    const op = getSelectedOperation();
    const agentMap = new Map();
    for (const opteam of op.teamlist) {
      const team = await getTeam(opteam.teamid, 300);
      if (team) {
        for (const agent of team.agents) {
          agentMap.set(agent.id, agent.name);
        }
      }
    }

    /* assignedTo filter */
    const agents: [string, GoogleID][] = [];
    for (const [k, n] of agentMap) {
      agents.push([n, k]);
    }
    agents.sort((a, b) => a[0].localeCompare(b[0]));
    agents.unshift([wX("UNASSIGNED"), ""]);
    this._addField(panel, "assignedTo", {
      label: wX("ASS_TO"),
      options: agents,
      toFilter(ids: GoogleID[]) {
        return {
          op: "in",
          key: "assignedTo",
          value: ids.map((gid) => gid || null),
        } as Filter;
      },
    });

    /* zone filter */
    this._addField(panel, "zone", {
      label: wX("ZONE"),
      options: op.zones.map((z) => [z.name, "" + z.id]),
      toFilter(ids: string[]) {
        return {
          op: "in",
          key: "zone",
          value: ids.map((zid) => +zid),
        } as Filter;
      },
    });

    /* state filter */
    this._addField(panel, "state", {
      label: wX("STATE"),
      options: [
        [wX("pending"), "pending"],
        [wX("assigned"), "assigned"],
        [wX("acknowledged"), "acknowledged"],
        [wX("completed"), "completed"],
      ],
      toFilter(states: TaskState[]) {
        return {
          op: "in",
          key: "state",
          value: states,
        } as Filter;
      },
    });

    /* link/marker filter */
    this._addField(panel, "kind", {
      label: wX("dialog.filter.field.task"),
      options: [
        [wX("dialog.common.links"), "link"],
        [wX("dialog.common.markers"), "marker"],
      ],
      toFilter(kinds: string[]) {
        return {
          op: "or",
          list: kinds.map((k) => ({ op: "kind", value: k })),
        } as Filter;
      },
    });

    /* portalId/fromPortalId filter */
    this._addFieldPortal(panel, "fromPortal", {
      label: wX("FROM_PORT"),
      toFilter(p: WasabeePortal) {
        return {
          op: "or",
          list: (["fromPortalId", "portalId"] as const).map((k) => ({
            op: "==",
            key: k,
            value: p.id,
          })),
        } as Filter;
      },
    });

    /* toPortalId filter */
    this._addFieldPortal(panel, "toPortal", {
      label: wX("TO_PORT"),
      toFilter(p: WasabeePortal) {
        return {
          op: "==",
          key: "toPortalId",
          value: p.id,
        } as Filter;
      },
    });

    return [anchor, panel];
  }

  async _getActionsTab() {
    const anchor = L.DomUtil.create("a");
    anchor.textContent = "Actions";
    const panel = L.DomUtil.create("div", "actions");

    const op = getSelectedOperation();
    const agentMap = new Map();
    for (const opteam of op.teamlist) {
      const team = await getTeam(opteam.teamid, 300);
      if (team) {
        for (const agent of team.agents) {
          agentMap.set(agent.id, agent.name);
        }
      }
    }
    const agents: [string, GoogleID][] = [[wX("UNASSIGNED"), ""]];
    for (const [k, n] of agentMap) {
      agents.push([n, k]);
    }
    this._addAction<GoogleID>(
      panel,
      wX("ASS_TO"),
      this._createSelect<GoogleID>(agents),
      wX("SET"),
      setTasksAssign
    );

    this._addAction(
      panel,
      wX("ZONE"),
      this._createSelect(op.zones.map((z) => [z.name, "" + z.id])),
      wX("SET"),
      (z) => setTasksZone(+z)
    );

    this._addAction<TaskState>(
      panel,
      wX("STATE"),
      this._createSelect<TaskState>([
        [wX("pending"), "pending"],
        [wX("assigned"), "assigned"],
        [wX("acknowledged"), "acknowledged"],
        [wX("completed"), "completed"],
      ]),
      wX("SET"),
      setTasksState
    );

    const picker = L.DomUtil.create("input");
    picker.type = "color";
    picker.value = convertColorToHex(op.getColor());
    picker.setAttribute("list", "wasabee-colors-datalist");

    this._addAction(
      panel,
      wX("dialog.common.color"),
      picker,
      wX("SET"),
      setLinksColor
    );

    return [anchor, panel];
  }

  async _getContent() {
    const container = L.DomUtil.create("div", "container");
    const op = getSelectedOperation();

    const tabArray = [];
    tabArray.push(await this._getFiltersTab());
    if (op.canWrite()) tabArray.push(await this._getActionsTab());

    /* Create jquery-like tabs */
    const tabs = L.DomUtil.create("div", "ui-tabs tabs", container);
    const nav = L.DomUtil.create("ul", "ui-tabs-nav nav", tabs);
    for (let i = 0; i < tabArray.length; i++) {
      const [head, panel] = tabArray[i];
      L.DomUtil.create("li", "ui-tabs-tab", nav).appendChild(head);
      head.classList.add("ui-tabs-anchor");
      tabs.appendChild(panel);
      panel.classList.add("ui-tabs-panel");
      panel.style.display = "none";

      L.DomEvent.on(head, "click", () => {
        for (const hp of tabArray) {
          hp[0].parentElement.classList.remove("ui-tabs-active");
          hp[1].style.display = "none";
        }
        head.parentElement.classList.add("ui-tabs-active");
        panel.style.display = null;
        this._activeTab = i;
        this._applyFilter();
      });
    }

    /* initial active tab */
    if (this._activeTab >= tabArray.length) this._activeTab = 0;
    tabArray[this._activeTab][0].parentElement.classList.add("ui-tabs-active");
    tabArray[this._activeTab][1].style.display = null;

    return container;
  }

  _getFilter() {
    /* Build the AND of every enabled filters */
    const filter: Filter = {
      op: "and",
      list: [],
    };
    for (const k in this._filters) {
      const field = this._filters[k];
      if (field.enabled) {
        filter.list.push(field.toFilter(field.selected));
      }
    }
    return filter;
  }

  _applyFilter() {
    if (!setFilter(this._getFilter())) {
      displayError("filter invalid");
    } else {
      window.map.fire("wasabee:filter");
    }
  }

  async _displayDialog() {
    const container = await this._getContent();

    const buttons = {};
    buttons[wX("dialog.filter.apply")] = () => {
      this._applyFilter();
    };
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("dialog.filter.title"),
      html: container,
      width: "auto",
      dialogClass: "filter",
      buttons: buttons,
      id: "wasabee-filter",
    });
  }
}
