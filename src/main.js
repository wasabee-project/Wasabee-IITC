

function wrapper(plugin_info) {
	/* inject: ./wrapper/pluginStart.js				*/

	var Wasabee;
	Wasabee = window.plugin.Wasabee = function() {};
	
	// Code injection
	/* inject: ./code/wasabee.js                     */

	/* inject: ./wrapper/pluginEnd.js				*/
}
/*	   inject: ./wrapper/afterWrapper.js			*/