import { WasabeeLink, WasabeeMarker } from "./model";
import type Task from "./model/task";

interface IComplexFilter {
  op: "or" | "and" | "not";
  list: Filter[];
}

interface ISimpleFilter<T extends Task> {
  op: "in" | "==" | "kind" | "match" | "<=" | ">=";
  key?: keyof T;
  value: unknown;
}

export type Filter =
  | IComplexFilter
  | ISimpleFilter<WasabeeMarker>
  | ISimpleFilter<WasabeeLink>;

let currentFilter: Filter = null;

function computeFilter(task: Task, filter: Filter): boolean {
  if (filter.op === "and") {
    return filter.list.every((f) => computeFilter(task, f));
  } else if (filter.op === "or") {
    return filter.list.some((f) => computeFilter(task, f));
  } else if (filter.op === "not") {
    return !computeFilter(task, filter.list[0]);
  } else if (filter.op === "kind") {
    if (filter.value === "link") {
      return task instanceof WasabeeLink;
    }
    if (filter.value === "marker") {
      return task instanceof WasabeeMarker;
    }
    return false;
  } else if (filter.op === "in" && filter.key) {
    const values =
      filter.value instanceof Array ? filter.value : [filter.value];
    return filter.key in task && values.includes(task[filter.key]);
  } else if (filter.op === "match" && filter.key) {
    return (
      filter.key in task &&
      typeof filter.value === "string" &&
      typeof task[filter.key] === "string" &&
      task[filter.key].toLowerCase().includes(filter.value.toLocaleLowerCase())
    );
  } else if (filter.op === "==" && filter.key) {
    return filter.key in task && task[filter.key] === filter.value;
  } else if (filter.op === "<=" && filter.key) {
    return filter.key in task && task[filter.key] <= filter.value;
  } else if (filter.op === ">=" && filter.key) {
    return filter.key in task && task[filter.key] >= filter.value;
  }

  return false;
}

function validateFilterAux(filter: Filter): boolean {
  if (filter.op === "and" || filter.op === "or") {
    return (
      filter.list instanceof Array &&
      filter.list.every((f) => validateFilterAux(f))
    );
  } else if (filter.op === "not") {
    return (
      filter.list instanceof Array &&
      filter.list.length == 1 &&
      validateFilterAux(filter.list[0])
    );
  } else if (filter.op === "kind") {
    return filter.value === "link" || filter.value === "marker";
  } else if (filter.op === "in") {
    return filter.key && filter.value instanceof Array;
  } else if (filter.op === "match") {
    return filter.key && typeof filter.value === "string";
  } else if (filter.op === "==") {
    return !!filter.key;
  } else if (filter.op === "<=" || filter.op === ">=") {
    return filter.key && typeof(filter.value) === "number";
  }
  return false;
}

function validateFilter(filter: Filter) {
  try {
    return validateFilterAux(filter);
  } catch {
    return false;
  }
}

/**
 * Check if a task is filtered by the current filter
 *
 * @param task
 * @returns `true` if the task must appears, `false` if the task is filtered and may be ignored
 */
export function isFiltered(task: Task) {
  if (!currentFilter) return true;
  return computeFilter(task, currentFilter);
}

export function resetFilter() {
  currentFilter = null;
}

export function setFilter(filter: Filter) {
  if (validateFilter(filter)) {
    currentFilter = filter;
    return true;
  }
  return false;
}
