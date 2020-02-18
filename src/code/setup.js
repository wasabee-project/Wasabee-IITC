/* 
 * I think this file is unused
const Wasabee = window.plugin.wasabee || {};

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

// wrapper to follow the "standard" way of doing iitc plugins
const setup = function() {
  Wasabee.setup.run();
};
*/
