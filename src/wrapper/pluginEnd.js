// PLUGIN END ----------------------------------------------------------
var setup = window.plugin.wasabee.loadExternals;
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) {window.bootPlugins = [];}
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === "function") {setup();}