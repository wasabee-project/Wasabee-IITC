export default function() {
  // now unused
  window.plugin.wasabee.addScriptToBase = function(scriptUrl) {
    console.log("Script URL -> " + scriptUrl);
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = scriptUrl;
    var baseNode = document.getElementsByTagName("script")[0];
    baseNode.parentNode.insertBefore(script, baseNode);
    console.log("Added -> " + JSON.stringify(script));
  };
}
