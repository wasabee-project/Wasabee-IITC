// the counter-op / defensive tools are Wasabee-D
import { GetWasabeeServer } from "./server";
import WasabeeMe from "./me";

// setup function
export const initWasabeeD = () => {
  window.plugin.wasabee._dEnabled = false;
  //
};

export const isDenabled = () => {
  return window.plugin.wasabee._dEnabled;
};

export const Denable = () => {
  window.plugin.wasabee._dEnabled = true;
};

export const Ddisable = () => {
  window.plugin.wasabee._dEnabled = false;
};

// This is the primary hook that is called on map refresh
export const drawWasabeeDkeys = () => {
  const server = GetWasabeeServer();

  if (!isDenabled()) return;
  if (!WasabeeMe.isLoggedIn()) return;

  console.log("running drawWasabeeDkeys");
  console.log(server);
  //
};
