/** New ToolBox API */
export {};

declare global {
  namespace IITC.toolbox {
    interface ButtonArgs {
      id?: string; // Optional. The ID of the button.
      label: string | undefined; // The label text of the button.
      action: () => any | undefined; // The onclick action for the button.
      class?: string; // Optional. The class(es) for the button.
      title?: string; // Optional. The title (tooltip) for the button.
      access_key?: string; // Optional. The access key for the button.
      mouseover?: () => any; // Optional. The mouseover event for the button.
      icon?: string; // Optional. Icon name from FontAwesome for the button.
    }

    /**
     * Adds a button to the toolbox.
     *
     * @param {ButtonArgs} buttonArgs - The arguments for the button.
     * @returns {string|null} The ID of the added button or null if required parameters are missing.
     *
     * @example
     * const buttonId = IITC.toolbox.addButton({
     *   label: 'AboutIITC',
     *   action: window.AboutIITC
     * });
     *
     * @example
     * const buttonId = IITC.toolbox.addButton({
     *   label: 'Test Button',
     *   action: () => alert('Clicked!')
     * });
     */
    function addButton(buttonArgs: ButtonArgs): number;

    /**
     * Updates an existing button in the toolbox.
     *
     * @param {string} buttonId - The ID of the button to update.
     * @param {ButtonArgs} newButtonArgs - The new arguments for the button.
     * @returns {boolean} True if the button is successfully updated, false otherwise.
     *
     * @example
     * const isUpdated = IITC.toolbox.updateButton(buttonId, { label: 'Updated Button', action: () => console.log('New Action') });
     */
    function updateButton(buttonId: number, newButtonArgs: Partial<ButtonArgs>);

    /**
     * Removes a button from the toolbox.
     *
     * @param {string} buttonId - The ID of the button to remove.
     * @returns {boolean} True if the button is successfully removed, false otherwise.
     *
     * @example
     * const isRemoved = IITC.toolbox.removeButton(buttonId);
     */
    function removeButton(buttonId: number);

    /**
     * Sets the sorting method for the toolbox buttons.
     *
     * @param {Function} sortMethod - The sorting method to be used.
     * @returns {void}
     *
     * @example
     * IITC.toolbox.setSortMethod((a, b) => a.label.localeCompare(b.label));
     */
    function setSortMethod(
      sortMethod: (a: ButtonArgs, b: ButtonArgs) => number
    );
  }
}
