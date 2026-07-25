import {
    AVAILABILITY_MANIFEST,
    QUALITY_MANIFEST,
    WEAPONCLASS_MANIFEST,
    DAMAGETYPE_MANIFEST,
    WEAPONTYPE_MANIFEST
} from "../../sys-const.mjs";

export class AmmunitionSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        id: "ammo-sheet",
        classes: ["fantasy-hammer", "sheet", "item", "ammo"],
        tag: "form",
        window: {
            resizable: true,
            width: 750,
            height: 330,
            title: "TYPES.Item.ammo.label"
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
    get title() {
        const localizedprefix = game.i18n.localize("TYPES.Item.ammo.label");
        const item = this.document;
        const itemName = item.name;
        const headerBar = `${localizedprefix} | ${itemName}`;
        return headerBar;
    }
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
        context.item = this.document;
        context.system = this.document.system;
        context.isEditable = this.isEditable;
        context.isReadOnly = !this.isEditable;
        context.fields = this.document.system.schema.fields;
    }
}