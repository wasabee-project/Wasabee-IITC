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
