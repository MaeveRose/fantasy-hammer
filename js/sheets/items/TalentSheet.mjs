export class TalentSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  #tabs;
  /** @override */
  static DEFAULT_OPTIONS = {
    id: "talent-sheet",
    classes: ["fantasy-hammer", "sheet", "item", "talent", "draggable"],
    tag: "form",
    window: {
      resizable: true,
      width: 450,
      height: 550,
      title:"TYPES.Item.talent.label"
    },
    actions: {
      // Register custom actions for managing our dynamic array blocks
      addArrayEntry: this._onAddArrayEntry,
      deleteArrayEntry: this._onDeleteArrayEntry
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };
  get title(){
    const localizedprefix = game.i18n.localize("TYPES.Item.talent.label");
    const item = this.document;
    const itemName = item.name;
    const headerBar = `${localizedprefix} | ${itemName}`;
    return headerBar;
  }
  /** @override */
  static PARTS = {
    form: {
      template: "systems/fantasy-hammer/html/sheets/items/talentsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
    }
  };

  /** @override */
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options);
    
    // Bind shortcuts to the data model fields so Handlebars can access them cleanly
    context.item = this.document;
    context.system = this.document.system;
    context.isEditable = this.isEditable;

    context.fields = this.document.system.schema.fields;

    console.log(context);
    return context;
  }
  _onRender(context, options)
  {
    super._onRender(context, options);
    const startingTab = this.isEditable ? "edit" : "view"
    this.#tabs = new foundry.applications.ux.Tabs({navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: startingTab, group: "primary-tabs"});
    this.#tabs.bind(this.element);
  }
  /**
   * Action handler to inject a fresh empty requirement or modifier into our data arrays
   */
  static async _onAddArrayEntry(event, target) {
    event.preventDefault();
    const arrayPath = target.getAttribute("data-array-path"); // "system.prerequisites" or "system.modifiers"
    const entryType = target.getAttribute("data-entry-type"); // "prereq" or "modifier"

    // Deep clone the array out of the database safely
    const currentList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];

    // Construct a blank starting payload matching your schema expectations
    let freshPayload = {};
    if (entryType === "prereq") {
      freshPayload = { type: "characteristic", targetKey: "strength", minValue: 30 };
    } else if (entryType === "modifier") {
      freshPayload = { targetType: "skill", targetKey: "athletics", modifierValue: 10 };
    }

    currentList.push(freshPayload);

    // Save the entire updated array back to the system data layer atomically
    const updates = {};
    updates[arrayPath] = currentList;
    await this.document.update(updates);
  }

  /**
   * Action handler to prune an element out of our arrays based on its loop index
   */
  static async _onDeleteArrayEntry(event, target) {
    event.preventDefault();
    const arrayPath = target.getAttribute("data-array-path");
    const indexToRemove = parseInt(target.getAttribute("data-index"));

    const currentList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];
    currentList.splice(indexToRemove, 1); // Drop the targeted element index out of the array

    const updates = {};
    updates[arrayPath] = currentList;
    await this.document.update(updates);
  }
}