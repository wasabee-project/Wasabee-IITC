import { Feature } from "./leafletDrawImports";
import UiHelper from "./uiHelper";

const MarkerButtonControl = Feature.extend({
  statics: {
    TYPE: "markerButton"
  },

  initialize: function(map, options) {
    this.type = MarkerButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    var content = document.createElement("div");
    var self = this;
    this._marker = null;
    this._type = $("<select>");
    window.plugin.Wasabee.markerTypes.forEach((a, k) => {
      self._type.append(
        $("<option>")
          .val(k)
          .text(a.label)
      );
    });
    this._type.val(window.plugin.Wasabee.Constants.DEFAULT_MARKER_TYPE);
    this._comment = $("<input>").attr("placeholder", "comment");
    /*  Uncomment this when adding specific targetting to agents
        this._agent = $('<select class="wasabee-agentselect"></select>').css({
          width : "100%",
          boxSizing : "border-box"
        });
        */
    var $element = $("<div>")
      .addClass("wasabee-markerselect")
      .text("To: ");
    this._markerLink = $("<strong>")
      .text("(not set)")
      .appendTo($element);
    $("<button>")
      .text("set")
      .click(() => self.setTarget(UiHelper.getSelectedPortal()))
      .appendTo($element);
    this._markerMenu = new window.plugin.Wasabee.OverflowMenu();
    this._markerMenu.button.firstElementChild.textContent = "\u25bc";
    $element.append(this._markerMenu.button);
    content = $("<div />")
      .append(
        $("<div>")
          .addClass("flex")
          .append(this._type)
          .append(this._comment)
      )
      .append(document.createTextNode(" "))
      .append(this._agent)
      .append($element);
    $element.hide(); //TODO remove this when create link alert added
    this._type.change(() => {
      //console.log("Changed to type -> " + self._type.val())
      /*
            self._preferences.save();
            if ("CreateLinkAlert" == self._type.val()) {
              $element.css("display", "");
            } else {
              $element.hide();
            }
            */
    });
    this._type.change();
    var mHandler = this;
    this._dialog = window.dialog({
      title: "Add Marker",
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center+30"
      },
      html: content,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: function() {
        mHandler.disable();
        delete mHandler._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.markerButton,
      buttons: {
        "Add Marker": () =>
          mHandler._addMarker(
            mHandler._type.val(),
            mHandler._operation,
            mHandler._comment.val()
          ),
        OK: () => {
          mHandler._dialog.dialog("close");
        }
      }
    });
  },

  _addMarker: function(selectedType, operation, comment) {
    operation.addMarker(selectedType, UiHelper.getSelectedPortal(), comment);
  }
});

export default MarkerButtonControl;
