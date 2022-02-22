const metaURL = "https://cdn2.wasabee.rocks/iitcplugin/prod/wasabee.meta.js";

function getCurrentVersion() {
  return window.plugin.wasabee.info.version;
}

function simpleSemVer(a: string, b: string) {
  const av = a.split(".", 3);
  const bv = b.split(".", 3);
  return +av[0] < +bv[0] || (+av[0] == +bv[0] && +av[1] < +bv[1]);
}

export async function checkVersion() {
  const data = await (await fetch(metaURL)).text();
  for (const line of data.split("\n")) {
    if (line.startsWith("// @version")) {
      const version = line.slice(11).trim();
      const curVer = getCurrentVersion();
      return simpleSemVer(curVer, version);
    }
  }
  return false;
}
