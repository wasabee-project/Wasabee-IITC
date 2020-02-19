// the counter-op / defensive tools are Wasabee-D
import WasabeeMe from "./me";

// setup function
export const initWasabeeD = () => {
  // things which take place no matter what
};

export const isDenabled = () => {
  return window.isLayerGroupDisplayed("Wasabee-D Keys");
};

// This is the primary hook that is called on map refresh
export const drawWasabeeDkeys = () => {
  if (!isDenabled()) return;
  if (!WasabeeMe.isLoggedIn()) return;

  console.log("running drawWasabeeDkeys");
};
