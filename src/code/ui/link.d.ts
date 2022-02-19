import type WasabeeOp from "../model/operation";
import type WasabeeLink from "../model/link";

export function displayFormat(
  link: WasabeeLink,
  operation: WasabeeOp,
  smallScreen?: boolean
): HTMLDivElement;

export function minLevel(
  link: WasabeeLink,
  operation: WasabeeOp
): HTMLSpanElement;
