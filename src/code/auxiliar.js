//** This function does something for the generate ID function */
const dec2hex = function(dec) {
  return ("0" + dec.toString(16)).substr(-2);
};

//** This function generates a unique ID for an object */
export const generateId = function(len) {
  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
};

//** This function copies whatever value is sent into the function to the clipboard */
//** Also, this is very hacky, find some better way? (ALSO IT DOESN'T WORK!? */
export const copyToClipboard = function(val) {
  var dummy = document.createElement("input");
  document.body.appendChild(dummy);
  $(dummy).css("display", "none");
  dummy.setAttribute("id", "dummy_id");
  document.getElementById("dummy_id").value = val;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  alert("Copied to clipboard.");
};
