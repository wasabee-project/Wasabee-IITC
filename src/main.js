

function wrapper(plugin_info) {
	/* inject: ./wrapper/pluginStart.js				*/

	var Wasabee;
	Wasabee = window.plugin.Wasabee = function () { };

	// Code injection

	/* inject: ./code/store.js                     */
	/* inject: ./code/markdown.js                     */
	/* inject: ./code/scopes.js                     */
	/* inject: ./code/init.js                     */
	/* inject: ./code/markerDialog.js                     */
	/* inject: ./code/exportDialog.js                     */
	/* inject: ./code/paste.js                     */
	/* inject: ./code/leftBar.js                     */
	/* inject: ./code/opDialog.js                     */
	/* inject: ./code/mapDrawing.js                     */
	/* inject: ./code/server.js                     */

	/* inject: ./code/wasabee.js                     */

	/* inject: ./code/operation.js                     */
	/* inject: ./code/marker.js                     */
	/* inject: ./code/link.js                     */
	/* inject: ./code/arc.js                     */
	/* inject: ./code/crosslinks.js                     */

	/* inject: ./wrapper/pluginEnd.js				*/
}
/*	   inject: ./wrapper/afterWrapper.js			*/