import ExportDialog from "./exportDialog";

export default function() {
  var Wasabee = window.plugin.Wasabee;

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

  /** this checks the expiration on a paste link and returns a boolean */
  window.plugin.wasabee.isPasteLinkExpired = function(expireDate) {
    return Date.now() > expireDate;
  };

  /** this processes a qbin link */
  window.plugin.wasabee.gotQbinLink = function(link, operation) {
    var key = link.substring(link.lastIndexOf("/")).replace("/", "");
    operation.pasteKey = key;
    operation.pasteExpireDate =
      Date.now() + Wasabee.Constants.CURRENT_EXPIRE_NUMERIC;
    window.plugin.wasabee.loadOp(operation.ID);
    ExportDialog.show(operation);
  };

  window.plugin.wasabee.viewOpSummary = function(operation) {
    var arcForm = document.createElement("form");
    arcForm.target = "_blank";
    arcForm.method = "POST";
    arcForm.name = "form1";
    arcForm.action =
      "http://wasabee.rocks/opsummary?drawKey=" + operation.pasteKey;
    document.body.appendChild(arcForm);
    arcForm.submit();
  };

  //** this saves a paste and returns a link */
  window.plugin.wasabee.qbin_put = Q =>
    $.ajax({
      url: Wasabee.Constants.SERVER_BASE_KEY + "/simple",
      type: "POST",
      data: Q,
      crossDomain: true,
      async: true,
      cache: false,
      contentType: "text/plain",
      xhrFields: {
        withCredentials: true
      }
    })
      .done(function(response) {
        console.log("response -> " + JSON.stringify(response));
      })
      .fail(function(jqXHR, textStatus) {
        alert(
          "Paste Creation Failed -> " +
            textStatus +
            " - jqXHR -> " +
            JSON.stringify(jqXHR)
        );
      });

  //** this gets paste json raw */
  window.plugin.wasabee.qbin_get = pasteID =>
    $.ajax({
      url: Wasabee.Constants.SERVER_BASE_KEY + "/simple/" + pasteID,
      crossDomain: true,
      method: "GET"
    })
      .done(function(response) {
        var decodedResponse = atob(response);
        window.plugin.wasabee.saveImportString(decodedResponse);
      })
      .fail(function(jqXHR, textStatus) {
        alert("Paste Creation Failed -> " + textStatus);
      });

  window.plugin.wasabee.getUrlParams = function(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
      urlparameter = window.plugin.wasabee.getUrlVars()[parameter];
    }
    return urlparameter;
  };

  window.plugin.wasabee.getUrlVars = function() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
      m,
      key,
      value
    ) {
      vars[key] = value;
    });
    return vars;
  };
}
