import { postToFirebase } from "./firebaseSupport";
import WasabeeMe from "./model/me";
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
  return r ? new WasabeeMe(r) : WasabeeMe.waitGet(true);
}

/** wrap ott to get me */
export async function sendOneTimeToken(token: string) {
  const r = await oneTimeToken(token);
  if (r && r.jwt) {
    storeJWT(r.jwt);
  }
  return WasabeeMe.waitGet(true);
}

/** GAPI */

/**  */
export function isAuthAvailable() {
  return !!window.gapi.auth2.getAuthInstance();
}

/** Get access token from google */
export function getAccessToken(selectAccount = false) {
  return new Promise<string>((resolve, reject) => {
    const options = {
      client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
      scope: "email profile openid",
      response_type: "id_token permission",
      prompt: selectAccount ? "select_account" : "none",
    };

    window.gapi.auth2.authorize(options, (response) => {
      if (response.error) {
        postToFirebase({ id: "exception", error: response.error });
        if (response.error === "idpiframe_initialization_failed") {
          return reject("You need enable cookies or allow [*.]google.com");
        }
        if (!selectAccount) {
          if (
            response.error == "user_logged_out" ||
            response.error == "immediate_failed"
          ) {
            // retry with account selection
            return resolve(getAccessToken(true));
          }
        }

        const err = `error from gapiAuth: ${response.error}: ${response.error_subtype}`;
        postToFirebase({ id: "exception", error: err });
        return reject(err);
      }

      return resolve(response.access_token);
    });
  });
}
