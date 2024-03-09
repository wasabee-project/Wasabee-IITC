import AboutDialog from "./dialogs/about";
import SettingsDialog from "./dialogs/settingsDialog";
import OnlineAgentList from "./dialogs/onlineAgentList";
import wX from "./wX";
import { locationPromise } from "./server";
import { displayInfo } from "./error";

/* This function adds the Wasabee options to the IITC toolbox */
export function setupToolbox() {
  const aboutId = IITC.toolbox.addButton({
    label: wX("ABOUT_WASABEE"),
    action: () => {
      const ad = new AboutDialog();
      ad.enable();
    }
  });

  const settingId = IITC.toolbox.addButton({
    label: wX("SETTINGS_TOOLBOX"),
    action: () => {
      const sd = new SettingsDialog();
      sd.enable();
    }
  });

  const sendLocId = IITC.toolbox.addButton({
    label: wX("SEND_LOC"),
    action: () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await locationPromise(
              position.coords.latitude,
              position.coords.longitude
            );
            displayInfo(wX("LOC_PROC"));
          } catch (e) {
            console.error(e);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  });

  const onlineteammatesId = IITC.toolbox.addButton({
    label: wX("toolbox.teammates"),
    action: () => {
      const oll = new OnlineAgentList();
      oll.enable();
    }
  });

  window.map.on("wasabee:ui:lang", () => {
    IITC.toolbox.updateButton(aboutId, {
      label: wX("ABOUT_WASABEE"),
    })
    IITC.toolbox.updateButton(settingId, {
      label: wX("SETTINGS_TOOLBOX"),
    })
    IITC.toolbox.updateButton(sendLocId, {
      label: wX("SEND_LOC"),
    })
    IITC.toolbox.updateButton(onlineteammatesId, {
      label: wX("toolbox.teammates"),
    })
  });
}
