/* eslint-disable */
function wrapper(plugin_info) {
  /* inject: ./wrapper/pluginStart.js				*/

  window.plugin.Wasabee = window.plugin.wasabee = {};

  // Code injection
  let setup = function() {
    /* inject: ../dist/static-bundle.js                     */

    /* inject: ../dist/init-bundle.js                     */

    window.plugin.wasabee.init();
  };

  /* inject: ./wrapper/pluginEnd.js				*/
}
/*   inject: ./wrapper/afterWrapper.js			*/
