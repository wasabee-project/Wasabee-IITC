import type WasabeeLink from "../../model/link";
import type WasabeeOp from "../../model/operation";
import type WasabeePortal from "../../model/portal";

// get the list of links from a spine to anchors
function getSpineLinks(
  anchor1: WasabeePortal,
  anchor2: WasabeePortal,
  spine: WasabeePortal[],
  options: {
    backlink?: boolean;
  } = {}
) {
  const linksDesc: {
    from: WasabeePortal;
    to: WasabeePortal;
    back?: boolean;
  }[] = [];
  let prev = null;
  for (const p of spine) {
    linksDesc.push({ from: p, to: anchor1 });
    linksDesc.push({ from: p, to: anchor2 });
    if (options.backlink && prev)
      linksDesc.push({ from: p, to: prev, back: true });
  }
  return linksDesc;
}

// insert an array of wasabee link into an draw after the given order
export function insertLinks(
  op: WasabeeOp,
  links: WasabeeLink[],
  order: number,
  noShift = false
) {
  for (const l of links) l.order = 0;
  // shift current op tasks order
  if (!noShift && order < op.nextOrder - 1) {
    for (const l of op.links) if (l.order > order) l.order += links.length;
    for (const m of op.markers) if (m.order > order) m.order += links.length;
  }
  for (const l of links) l.order = ++order;
  return order;
}

// draw a spine into an op, with order and comment
export function drawSpine(
  op: WasabeeOp,
  anchor1: WasabeePortal,
  anchor2: WasabeePortal,
  spine: WasabeePortal[],
  order: number,
  options: {
    backlink?: boolean;
    commentPrefix?: string;
    noShift?: boolean;
  } = {}
) {
  const links = getSpineLinks(anchor1, anchor2, spine, options);

  const commentPrefix = options.commentPrefix || "";
  const wlinks = links
    .map((l) =>
      op.addLink(l.from, l.to, {
        description: commentPrefix + (l.back ? "backlink" : "link"),
      })
    )
    .filter((l) => l);

  return insertLinks(op, wlinks, order, options.noShift);
}
