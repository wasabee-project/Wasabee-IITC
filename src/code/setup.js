const Wasabee = window.plugin.Wasabee || {};

Wasabee.setup = {};

Wasabee.setup.run = function() {
  this.css();
  // this.leafletLayer();

  // Examplebutton
  Wasabee.gui.exampleButton.insert();

  // Module setup
  // Wasabee.module.setup();

  // Other possible setup calls
  // Wasabee.storage.load();
};

Wasabee.setup.css = function() {
  $("<style>")
    .prop("type", "text/css")
    .html(Wasabee.static.css)
    .appendTo("head");
};

/*
Wasabee.setup.leafletLayer = function() {
	Wasabee.data.leafletLayer = new L.LayerGroup();
	// FIXME: create Wasabee.data object to store layer reference
	// FIXME: change Layer name
	window.addLayerGroup('Layer name', Wasabee.data.leafletLayer, false);
};
*/

// wrapper to follow the "standard" way of doing iitc plugins
/* eslint-disable no-unused-vars */
var setup = function() {
  Wasabee.setup.run();
};
