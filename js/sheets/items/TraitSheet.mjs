import { GlobalJsonEditor } from "../../utils/GlobalEditor.mjs";

export class TraitSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

    #tabs;
    #editor = null;
    /** @override */
    static DEFAULT_OPTIONS = {
        id: "talent-sheet",
        classes: ["fantasy-hammer", "sheet", "item", "talent", "draggable"],
        tag: "form",
        window: {
            resizable: true,
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
    get title() {
        const localizedprefix = game.i18n.localize("TYPES.Item.talent.label");
        const item = this.document;
        const itemName = item.name;
        const headerBar = `${localizedprefix} | ${itemName}`;
        return headerBar;
    }
    /** @override */
    static PARTS = {
        form: {
            template: "systems/fantasy-hammer/html/sheets/items/traitsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
        }
    };

    /** @override */
    async _preparePartContext(partId, context, options) {
        await super._preparePartContext(partId, context, options);

        // Bind shortcuts to the data model fields so Handlebars can access them cleanly
        context.item = this.document;
        context.system = this.document.system;
        context.isEditable = this.isEditable;
        context.jsonString = JSON.stringify(this.document.system.customJSON, null, 2);
        context.fields = this.document.system.schema.fields;

        console.log(context);
        return context;
    }
    async _processSubmitData(event, form, formData) {
        // 1. Find the actual textarea element inside the form DOM
        GlobalJsonEditor.processSubmit(form, formData, "system.customJSON");

        return super._processSubmitData(event, form, formData);
    }
    _onRender(context, options) {
        super._onRender(context, options);
        
        const startingTab = this.isEditable ? "edit" : "view"
        this.#tabs = new foundry.applications.ux.Tabs({ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: startingTab, group: "primary-tabs" });
        this.#tabs.bind(this.element);

        GlobalJsonEditor.attach(this.element, this);
        
    }
}