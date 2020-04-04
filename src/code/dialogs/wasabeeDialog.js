import { WDialog } from "../leafletClasses";
import WasabeeMe from "../me";
import Sortable from "../../lib/sortable";
import {
  GetWasabeeServer,
  SetWasabeeServer,
  SetTeamState,
  locationPromise,
  logoutPromise,
  leaveTeamPromise,
  newTeamPromise
} from "../server";
import PromptDialog from "./promptDialog";
import AuthDialog from "./authDialog";
import AboutDialog from "./about";
import TeamMembershipList from "./teamMembershipList";
import { getSelectedOperation } from "../selectedOp";
import ConfirmDialog from "./confirmDialog";
import ManageTeamDialog from "./manageTeamDialog";
import wX from "../wX";

const WasabeeDialog = WDialog.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = WasabeeDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: async function() {
    if (!this._map) return;
    this._me = await WasabeeMe.waitGet(true);
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
    // magic context incantation to make "this" work...
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  update: async function() {
    if (!this._enabled) return;
    // this._me = await WasabeeMe.waitGet(); // breaks logout
    this._dialog.html(this._buildContent());
  },

  _buildContent: function() {
    const teamlist = new Sortable();
    teamlist.fields = [
      {
        name: wX("TEAM_NAME"),
        value: team => team.Name,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, team) => {
          const link = L.DomUtil.create("a", null, row);
          link.href = "#";
          link.textContent = value;
          if (team.State == "On") {
            L.DomUtil.addClass(link, "enl");
            L.DomEvent.on(link, "click", () => {
              const td = new TeamMembershipList();
              td.setup(team.ID);
              td.enable();
            });
          }
        }
      },
      {
        name: wX("STATE"),
        value: team => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          let curstate = obj.State;
          link.textContent = curstate;
          if (curstate == "On") L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleTeam(obj.ID, curstate);
            this._me = await WasabeeMe.waitGet(true);
            window.runHooks("wasabeeUIUpdate", getSelectedOperation());
          };
        }
      },
      {
        name: wX("LEAVE"),
        value: team => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = wX("LEAVE");
          L.DomEvent.on(link, "click", () => {
            const cd = new ConfirmDialog();
            cd.setup(
              `Leave ${obj.Name}?`,
              `If you leave ${obj.Name} you cannot rejoin unless the owner re-adds you.`,
              () => {
                leaveTeamPromise(obj.ID).then(
                  async () => {
                    this._me = await WasabeeMe.waitGet(true);
                    window.runHooks("wasabeeUIUpdate", getSelectedOperation());
                  },
                  err => {
                    console.log(err);
                    alert(err);
                  }
                );
              }
            );
            cd.enable();
          });
        }
      },
      {
        name: wX("MANAGE"),
        value: team => team.ID,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          row.textContent = "";
          for (const ot of this._me.OwnedTeams) {
            if (obj.State == "On" && ot.ID == obj.ID) {
              const link = L.DomUtil.create("a", "enl", row);
              link.textContent = wX("MANAGE");
              L.DomEvent.on(link, "click", () => {
                const mtd = new ManageTeamDialog();
                mtd.setup(ot);
                mtd.enable();
              });
            }
          }
        }
      }
    ];
    teamlist.sortBy = 0;

    const container = L.DomUtil.create("div", "container");
    const serverInfo = L.DomUtil.create("button", "server", container);
    serverInfo.textContent = wX("WSERVER", GetWasabeeServer());
    serverInfo.href = "#";
    L.DomEvent.on(serverInfo, "click", this.setServer);

    const locbutton = L.DomUtil.create("button", "sendloc", container);
    locbutton.textContent = wX("SEND_LOC");
    L.DomEvent.on(locbutton, "click", () => {
      navigator.geolocation.getCurrentPosition(
        position => {
          locationPromise(
            position.coords.latitude,
            position.coords.longitude
          ).then(
            () => {
              alert(wX("LOC_PROC"));
            },
            err => {
              console.log(err);
            }
          );
        },
        err => {
          console.log(err);
        }
      );
    });

    container.appendChild(teamlist.table);
    teamlist.items = this._me.Teams;
    return container;
  },

  _displayDialog: function() {
    if (this._me) {
      this._dialog = window.dialog({
        title: wX("CUR_USER_INFO"),
        width: "auto",
        height: "auto",
        html: this._buildContent(),
        dialogClass: "wasabee-dialog wasabee-dialog-wasabee",
        buttons: {
          OK: () => {
            this._dialog.dialog("close");
          },
          About: () => {
            const ad = new AboutDialog();
            ad.enable();
          },
          "Log out": () => {
            localStorage[window.plugin.wasabee.static.constants.MODE_KEY] =
              "design";
            logoutPromise().then(
              () => {
                window.runHooks("wasabeeUIUpdate", getSelectedOperation());
                window.runHooks("wasabeeDkeys");
                this._dialog.dialog("close");
              },
              err => {
                alert(err);
                console.log(err);
              }
            );
          },
          "New Team": () => {
            const p = new PromptDialog(window.map);
            p.setup(wX("CREATE_NEW_TEAM"), wX("NTNAME"), () => {
              const newname = p.inputField.value;
              if (!newname) {
                alert(wX("NAME_REQ"));
                return;
              }
              newTeamPromise(newname).then(
                () => {
                  alert(wX("TEAM_CREATED", newname));
                  window.runHooks("wasabeeUIUpdate", getSelectedOperation());
                },
                reject => {
                  console.log(reject);
                  alert(reject);
                }
              );
            });
            p.current = wX("NEW_TEAM_NAME");
            p.placeholder = wX("AMAZ_TEAM_NAME");
            p.enable();
          }
        },

        closeCallback: () => {
          // window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
          this.disable();
          delete this._dialog;
        },
        id: window.plugin.wasabee.static.dialogNames.wasabeeButton
      });
    } else {
      this.disable();
      const ad = new AuthDialog();
      ad.enable();
    }
  },

  toggleTeam: async function(teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";

    await SetTeamState(teamID, newState);
    this._me = await WasabeeMe.waitGet(true);
    return newState;
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  setServer: function() {
    const serverDialog = new PromptDialog(window.map);
    serverDialog.setup(wX("CHANGE_WAS_SERVER"), wX("NEW_WAS_SERVER"), () => {
      if (serverDialog.inputField.value) {
        SetWasabeeServer(serverDialog.inputField.value);
        WasabeeMe.purge();
      }
    });
    serverDialog.current = GetWasabeeServer();
    serverDialog.placeholder =
      window.plugin.wasabee.static.constants.SERVER_BASE_DEFAULT;
    serverDialog.enable();
  }
});

export default WasabeeDialog;
