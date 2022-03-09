import statics from "./static";

let strings = statics.strings;
const defaultLang = statics.constants.DEFAULT_LANGUAGE;
const localStoreKey = statics.constants.LANGUAGE_KEY;

const templateRe = /\{ *([\w_ -]+) *\}/g;

export function wX(key: string): string;
export function wX(
  key: "ASSIGN LINK PROMPT",
  data: { portalName: string }
): string;
export function wX(
  key: "ASSIGN MARKER PROMPT",
  data: { portalName: string }
): string;
export function wX(
  key: "ASSIGN OUTBOUND PROMPT",
  data: { portalName: string }
): string;
export function wX(key: "AUTH TOKEN REJECTED", data: { error: string }): string;
export function wX(
  key: "autodraw.fanfield.result",
  data: { ap: number; fields: number; links: number }
): string;
export function wX(
  key: "autodraw.flipflop.result",
  data: { count: number }
): string;
export function wX(
  key: "autodraw.homogeneous.missing_split",
  data: { count: number }
): string;
export function wX(
  key: "autodraw.homogeneous.portals_required",
  data: { count: number }
): string;
export function wX(
  key: "autodraw.madrid.result",
  data: { count: number }
): string;
export function wX(
  key: "autodraw.multimax.result",
  data: { count: number }
): string;
export function wX(
  key: "autodraw.multimax.result_both_side",
  data: { count1: number; count2: number }
): string;
export function wX(key: "COMPLETED BY", data: { agentName: string }): string;
export function wX(key: "CON_DEL", data: { opName: string }): string;
export function wX(key: "DEFAULT OP NAME", data: { date: string }): string;
export function wX(key: "DELETE_OP", data: { opName: string }): string;
export function wX(
  key: "dialog.agent_comment.title",
  data: { agentName: string }
): string;
export function wX(key: "dialog.auth.ott.text", data: { url: string }): string;
export function wX(
  key: "dialog.clear_all.text",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.clear_all.title",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.clear_links.text",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.clear_links.title",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.clear_markers.text",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.clear_markers.title",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.checklist.count_fields.no_empty",
  data: { fieldCount: number }
): string;
export function wX(
  key: "dialog.checklist.count_fields.with_empty",
  data: { emptyCount: number; fieldCount: number; linkCount: number }
): string;
export function wX(
  key: "dialog.checklist.count_fields.link_from_inside",
  data: { count: number }
): string;
export function wX(
  key: "dialog.checklist.count_fields.link_from_inside.covered_at_order",
  data: { order: number }
): string;
export function wX(key: "dialog.firebase.setup", data: { url: string }): string;
export function wX(
  key: "dialog.import.success_message",
  data: { count: number; faked: number }
): string;
export function wX(
  key: "dialog.leave_team.text",
  data: { teamName: string }
): string;
export function wX(
  key: "dialog.leave_team.title",
  data: { teamName: string }
): string;
export function wX(key: "dialog.merge.zone", data: { name: string }): string;
export function wX(
  key: "dialog.ops_list.download",
  data: { opName: string }
): string;
export function wX(
  key: "dialog.ops_list.last_fetched",
  data: { date: string }
): string;
export function wX(
  key: "dialog.remove_agent.text",
  data: { agentName: string; teamName: string }
): string;
export function wX(
  key: "dialog.remove_agent.title",
  data: { agentName: string }
): string;
export function wX(
  key: "dialog.team_message",
  data: { message: string; sender: string }
): string;
export function wX(
  key: "dialog.zone_color.text",
  data: { zoneName: string }
): string;
export function wX(key: "FAKED", data: { portalId: string }): string;
export function wX(key: "HOURS", data: { hours: number }): string;
export function wX(key: "IMP_NOPE", data: { error: string }): string;
export function wX(key: "IMPORT_OP_SUCCESS", data: { opName: string }): string;
export function wX(key: "IMPORT_OP_TITLE", data: { date: string }): string;
export function wX(key: "KEY_LIST2", data: { opName: string }): string;
export function wX(key: "KNOWN_BLOCK", data: { opName: string }): string;
export function wX(
  key: "LINKS2",
  data: { portalName: string; incoming: number; outgoing: number }
): string;
export function wX(key: "LOADING1", data: { portalGuid: string }): string;
export function wX(key: "MANAGE_TEAM", data: { teamName: string }): string;
export function wX(key: "MARKER_LIST", data: { opName: string }): string;
export function wX(key: "MINUTES", data: { minutes: number }): string;
export function wX(key: "MM_SET_KEYS_ZONE", data: { zoneName: string }): string;
export function wX(key: "NO LONGER AVAILABLE", data: { error: string }): string;
export function wX(key: "NOT LOGGED IN", data: { error: string }): string;
export function wX(key: "OP DELETED", data: { opID: string }): string;
export function wX(key: "OP PERM DENIED", data: { opID: string }): string;
export function wX(key: "OP_CHECKLIST", data: { opName: string }): string;
export function wX(key: "PERM DENIED", data: { error: string }): string;
export function wX(key: "PERMS", data: { opName: string }): string;
export function wX(
  key: "popup.anchor.keys",
  data: { onHand: number; required: number }
): string;
export function wX(
  key: "PORTAL KEY LIST",
  data: { portalName: string }
): string;
export function wX(key: "PORTAL_COUNT", data: { count: number }): string;
export function wX(key: "REM_LOC_CP", data: { opName: string }): string;
export function wX(
  key: "REMOVE_TEAM_CONFIRM_LABEL",
  data: { teamName: string }
): string;
export function wX(
  key: "REMOVE_TEAM_CONFIRM_TITLE",
  data: { teamName: string }
): string;
export function wX(key: "SECONDS", data: { seconds: number }): string;
export function wX(
  key: "SEND TARGET CONFIRM",
  data: { agent: string; portalName: string }
): string;
export function wX(key: "SET_MCOMMENT", data: { portalName: string }): string;
export function wX(key: "SET_PCOMMENT", data: { portalName: string }): string;
export function wX(key: "SKINS_AVAILABLE", data: { count: number }): string;
export function wX(key: "TEAM_CREATED", data: { teamName: string }): string;
export function wX(key: "TRAWL_REMAINING", data: { count: number }): string;
export function wX(key: "UPDATE HOVER", data: { opName: string }): string;
export function wX(
  key: "UPLOAD BUTTON HOVER",
  data: { opName: string }
): string;
export function wX(key: "WSERVER", data: { url: string }): string;
export function wX(key: "YESNO_DEL", data: { opName: string }): string;
export function wX(key: string, data?: { [key: string]: number | string }) {
  const lang = getLanguage();

  // if the skin system is initialized, switch to it
  if (window.plugin.wasabee.skin && window.plugin.wasabee.skin.strings)
    strings = window.plugin.wasabee.skin.strings;

  let s: string = null;
  if (strings[lang] && strings[lang][key]) s = strings[lang][key];
  if (!s && strings[defaultLang] && strings[defaultLang][key])
    s = strings[defaultLang][key];

  // detect smallScreen here
  let smallScreen = false;
  if (window.plugin.userLocation) smallScreen = true;
  if (smallScreen) {
    if (
      strings[lang] &&
      strings[lang].smallScreen &&
      strings[lang].smallScreen[key]
    )
      s = strings[lang].smallScreen[key];
  }
  if (!s) s = `${key} not in ${lang} or ${defaultLang}`;

  if (!data) return s;

  return s.replace(templateRe, function (str, key) {
    const value = data[key];
    if (value === undefined) return `{${key}}`;
    return "" + value;
  });
}

export function getLanguage() {
  // if the skin system is initialized, switch to it
  if (window.plugin.wasabee.skin && window.plugin.wasabee.skin.strings)
    strings = window.plugin.wasabee.skin.strings;

  // load the selected language, or use DEFAULT_LANGUAGE if not set
  let lang = localStorage[localStoreKey];
  if (!lang) {
    lang = defaultLang;
    localStorage[localStoreKey] = defaultLang;
    console.log("no language set, using default");
  }

  // if the langauge doesn't exist in either list, clear it and use DEFAULT_LANGUAGE
  if (!strings[lang]) {
    lang = defaultLang;
    localStorage[localStoreKey] = defaultLang;
    console.log("invalid language set, changing to default");
  }

  return lang;
}

export default wX;
