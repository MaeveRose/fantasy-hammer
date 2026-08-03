import { GlobalJsonEditor } from "../../utils/GlobalEditor.mjs";

import {
    AVAILABILITY_MANIFEST,
    QUALITY_MANIFEST,
    WEAPONCLASS_MANIFEST,
    DAMAGETYPE_MANIFEST,
    WEAPONTYPE_MANIFEST,
    ARMORTYPE_MANIFEST
} from "../../utils/sys-const.mjs";

export class ArmorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    #tabs;
    #editor=null;
    static DEFAULT_OPTIONS = {
        id: "armor-sheet",
        classes: ["fantasy-hammer", "sheet", "item", "armor"],
        tag: "form",
        window: {
            resizable: true,
        },
        position: {
            width: 530,
            height: 700
        },
        actions: {
            saveJSON: GlobalJsonEditor.onSaveAction,
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
        template: "systems/fantasy-hammer/html/sheets/items/armorsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
        }
    };
    get title() {
        const localizedprefix = game.i18n.localize("TYPES.Item.armor.label");
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

        context.availabilityOptions = Object.entries(AVAILABILITY_MANIFEST).map(([slug, data]) => ({
            id: slug,                             // e.g., "ubiquitous"
            label: game.i18n.localize(data.key)  // Translates the localization string immediately
        }));
        context.armorTypeOptions = Object.entries(ARMORTYPE_MANIFEST).map(([slug,data]) =>({
            id: slug,
            label: game.i18n.localize(data.key)
        }));
        context.jsonString = JSON.stringify(this.document.system.customJSON, null, 2);
        context.fields = this.document.system.schema.fields;
        console.log(context);
        return context;
    }
    _processSubmitData(event, form, formData) {
        const submitDataPromise = super._processSubmitData(event, form, formData);
        console.log(submitDataPromise);
        return submitDataPromise.then(() => {
        
        // 3. Process your custom code editor payload using the clean resolved data object
        GlobalJsonEditor.processSubmit(form, formData, "system.customJSON");
        
        console.log("Saving Resolved Object:", formData);
        
        // 4. Return the expanded data tree structure to the database layer
        return foundry.utils.expandObject(formData);
        });
    }
    _onRender(context, options){
        super._onRender(context, options);

        console.log("SHEET ELEMENT TYPE:", this.element.tagName, this.element);
        const startingTab = this.isEditable ? "armor-stat" : "view-noedit";

        this.#tabs = new foundry.applications.ux.Tabs({
            navSelector: ".armor-sheet-tabs", 
            contentSelector: ".armor-sheet-body", 
            initial: startingTab, 
            group: "actor-armor-primary-tabs"
        });
        this.#tabs.bind(this.element);

        GlobalJsonEditor.attach(this.element, this);
    }
}