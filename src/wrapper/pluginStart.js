// ensure plugin framework is there, even if iitc is not yet loaded
if (window.plugin !== undefined && typeof window.plugin !== "function") { window.plugin = function () { }; }


// PLUGIN START --------------------------------------------------------
