import WasabeePortal from "../model/portal";
import { IITC } from "../../types/iitc";

export function fromIITC(p: IITC.Portal): WasabeePortal;

export function team(portal: any): string;

export function displayName(portal: any): any;

export function displayFormat(
  portal: any,
  shortName?: boolean
): HTMLAnchorElement;

export function get(id: any): WasabeePortal;

export function getSelected(): WasabeePortal;
