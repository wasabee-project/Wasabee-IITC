import { postToFirebase } from "./firebase/logger";
import { getMe } from "./model/cache";
import { WasabeeMe } from "./model";
import { oneTimeToken, SendAccessTokenAsync } from "./server";

const JWT_KEY = "wasabee-jwt";

function storeJWT(jwt) {
  localStorage[JWT_KEY] = jwt;
}

export function deleteJWT() {
  localStorage.removeItem(JWT_KEY);
}

export function getJWT() {
  return localStorage.getItem(JWT_KEY);
}

/** wrap send access token to get me */
export async function sendAccessToken(token: string) {
  const r = await SendAccessTokenAsync(token);
  if (r && r.jwt) {
    storeJWT(r.jwt);
  }
  return r ? new WasabeeMe(r) : getMe(true);
}

/** wrap ott to get me */
export async function sendOneTimeToken(token: string) {
  const r = await oneTimeToken(token);
  if (r && r.jwt) {
    storeJWT(r.jwt);
  }
  return r ? new WasabeeMe(r) : getMe(true);
}

/** GAPI */

const googleClient: any = {};
export function initGoogleClient() {
  googleClient.client = google.accounts.oauth2.initTokenClient({
    client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
    scope: "email profile openid",
    callback: (response) => {
      const { resolve, reject } = googleClient;
      delete googleClient.resolve;
      delete googleClient.reject;
      if (!resolve || !reject) return;
      if (response.error) {
        return reject(response);
      }
      return resolve(response.access_token);
    },
  });
}

/** Get access token from google */
export function getAccessToken(selectAccount = false) {
  return new Promise<string>((resolve, reject) => {
    googleClient.resolve = resolve;
    googleClient.reject = reject;
    googleClient.client.requestAccessToken({
      prompt: selectAccount ? "consent" : "",
    });
  }).catch((response) => {
    postToFirebase({ id: "exception", error: response.error });
    if (response.error === "idpiframe_initialization_failed") {
      return Promise.reject("You need enable cookies or allow [*.]google.com");
    }
    if (!selectAccount) {
      if (
        response.error == "user_logged_out" ||
        response.error == "immediate_failed"
      ) {
        // retry with account selection
        return getAccessToken(true);
      }
    }
  });
}

export function getGoogleAuthURL(selectAccount = false) {
  const state = crypto.randomUUID();
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID}&redirect_uri=https%3A//intel.ingress.com&response_type=token&scope=profile&access_type=online&state=${state}`;
  if (selectAccount) return { state, url: url + "&prompt=select_account" };
  return { state, url };
}

export async function getAccessTokenFromRedirect() {
  const state = localStorage["wasabee-auth-state"];
  if (!state) return;
  // https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#example
  const fragmentString = location.hash.substring(1);
  // Parse query string to see if page request is coming from OAuth 2.0 server.
  const params = {};
  const regex = /([^&=]+)=([^&]*)/g;
  let m;
  while ((m = regex.exec(fragmentString))) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  if (params["state"] === state && params["access_token"]) {
    delete localStorage["wasabee-auth-state"];
    location.hash = "";
    const token = params["access_token"];
    const me = await sendAccessToken(token);
    postToFirebase({ id: "wasabeeLogin", method: "oauth2" });
    return me;
  }
}
