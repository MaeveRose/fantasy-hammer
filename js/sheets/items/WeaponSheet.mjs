import {
  AVAILABILITY_MANIFEST,
  QUALITY_MANIFEST,
  WEAPONCLASS_MANIFEST,
  DAMAGETYPE_MANIFEST,
  WEAPONTYPE_MANIFEST
} from "../../utils/sys-const.mjs";

export class WeaponSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  #tabs;
  /** @override */
  static DEFAULT_OPTIONS = {
    id: "weapon-sheet",
    classes: ["fantasy-hammer", "sheet", "item", "weapon"],
    tag: "form",
    window: {
      resizable: true,
      width: 750,
      height: 330,
      title: "TYPES.Item.weapon.label"
    },
    position: {
      width: 750,
      height: 330
    },
    actions: {
      editImage: this.#onEditImage
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/fantasy-hammer/html/sheets/items/weaponsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
    }
  };
  static async #onEditImage(event, target) {
    const field = target.dataset.field || "img";
    const current = foundry.utils.getProperty(this.document, field);

    // Manually trigger the FilePicker
    const fp = new foundry.applications.apps.FilePicker({
      type: "image",
      current: current,
      callback: path => {
        // Update the document data field directly
        this.document.update({ [field]: path });
      }
    });
    fp.browse();
  }
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options);

    // Bind shortcuts to the data model fields so Handlebars can access them cleanly
    context.item = this.document;
    context.system = this.document.system;
    context.isEditable = this.isEditable;
    context.isReadOnly = !this.isEditable;
    context.damageTypeOptions = Object.entries(DAMAGETYPE_MANIFEST).map(([slug, data]) => ({
      id: slug,
      label: game.i18n.localize(data.key + ".full"),
      short: game.i18n.localize(data.key + ".short")
    }));
    context.availabilityOptions = Object.entries(AVAILABILITY_MANIFEST).map(([slug, data]) => ({
      id: slug,                             // e.g., "ubiquitous"
      label: game.i18n.localize(data.key)  // Translates the localization string immediately
    }));
    context.craftsmanshipOptions = Object.entries(QUALITY_MANIFEST).map(([slug, data]) => ({
      id: slug,
      label: game.i18n.localize(data.key)
    }));
    context.weaponClassOptions = Object.entries(WEAPONCLASS_MANIFEST).map(([slug, data]) => ({
      id: slug,
      label: game.i18n.localize(data.key)
    }))
    context.weaponTypeOptions = Object.entries(WEAPONTYPE_MANIFEST).map(([slug, data]) => ({
      id: slug,
      label: game.i18n.localize(data.key)
    }))
    context.fields = this.document.system.schema.fields;

    console.log(context);
    return context;
  }
  get title() {
    const localizedprefix = game.i18n.localize("TYPES.Item.weapon.label");
    const item = this.document;
    const itemName = item.name;
    const headerBar = `${localizedprefix} | ${itemName}`;
    return headerBar;
  }
  _onRender(context, options) {
    super._onFirstRender(context, options);
  }
  /** @Override */
  _onChangeForm(config, event) {
    console.log(event);
    if (event.target.name == "system.rateOfFire.single") {
      let val = event.target.value.trim().toUpperCase();
      if (val !== "S" && val !== "-") {
        event.target.value = "-";
        ui.notifications.info(`${val} is not a valid single fire mode.`);
      }
    }
    return super._onChangeForm(config, event);
  }
}