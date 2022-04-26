export function GetWasabeeServer() {
  // Wasabee-IITC, use the configured server
  if (window.plugin && window.plugin.wasabee) {
    let server =
      localStorage[window.plugin.wasabee.static.constants.SERVER_BASE_KEY];
    if (server == null) {
      server = window.plugin.wasabee.static.constants.SERVER_BASE_DEFAULT;
      localStorage[window.plugin.wasabee.static.constants.SERVER_BASE_KEY] =
        server;
    }
    return server;
  }
  // Wasabee-WebUI doesn't need to specify the server
  return "";
}
