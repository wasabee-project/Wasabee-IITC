import { WButton } from "../leafletClasses";
import wX from "../wX";

class QuickDeleteButton extends WButton {
  static TYPE = "QuickdeleteButton";

  needWritePermission: true;

  constructor(container: HTMLElement) {
    super(container);

    this.title = wX("toolbar.quick_delete.title");
    this.type = QuickDeleteButton.TYPE;

    this.button = this._createButton({
      title: this.title,
      container: container,
      className: "wasabee-toolbar-quickdelete",
      context: this,
      callback: this._toggleActions,
    });

    this.actionsContainer = this._createSubActions(this.getSubActions());

    this._container.appendChild(this.actionsContainer);

    // update text
    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("toolbar.quick_delete.title");
      const newSubActions = this._createSubActions(this.getSubActions());
      this._container.replaceChild(newSubActions, this.actionsContainer);
      newSubActions.style.display = this.actionsContainer.style.display;
      this.actionsContainer = newSubActions;
    });

    this.update();
  }

  getSubActions() {
    const applySubAction = {
      title: wX("toolbar.quick_delete.apply.title"),
      text: wX("toolbar.quick_delete.apply.text"),
      callback: () => {},
      context: null,
    };

    const cancelSubAction = {
      title: wX("toolbar.quick_delete.cancel.title"),
      text: wX("toolbar.quick_delete.cancel.title"),
      callback: () => {},
      context: null,
    };

    return [applySubAction, cancelSubAction];
  }

  enable() {
    WButton.prototype.enable.call(this);
    this.button.classList.add("active");
  }

  disable() {
    WButton.prototype.disable.call(this);
    this.button.classList.remove("active");
  }
}

export default QuickDeleteButton;
