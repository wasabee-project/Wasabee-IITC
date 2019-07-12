function wrapper(plugin_info) {
    /* inject: ./wrapper/pluginStart.js				*/

    var Wasabee;
    Wasabee = window.plugin.Wasabee = {};
    window.plugin.wasabee = {};

    // Code injection

    /* inject: ../dist/static-bundle.js                     */
    /* inject: ./code/scopes.js                     */
    /* inject: ../dist/init-bundle.js                     */

    window.plugin.wasabee.init();

    /* inject: ./wrapper/pluginEnd.js				*/
}
/*	   inject: ./wrapper/afterWrapper.js			*/
