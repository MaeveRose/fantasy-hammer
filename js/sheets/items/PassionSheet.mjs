import { GlobalJsonEditor } from "../../utils/GlobalEditor.mjs";
export class PassionSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        id: "passion-sheet",
        classes: ["fantasy-hammer", "sheet", "item", "passion"],
        tag: "form",
        window: {
            resizable: true,
        },
        position: {
            width: 530,
            height: 390
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
            template: "systems/fantasy-hammer/html/sheets/items/passionsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
        }
    };
    static TABS = {
        passionTabs: {
            tabs: [
                { id: "description", label: "global.tabLabels.description" },
                { id: "json-entry", label: "global.tabLabels.json" }
            ]
        }
    };
    get title() {
        const type = this.document.system.type;
        const localizedprefix = game.i18n.localize(`TYPES.Item.${type}.label`);
        const item = this.document;
        const itemName = item.name;
        const headerBar = `${localizedprefix} | ${itemName}`;
        return headerBar;
    }
    _initializeApplicationOptions(options) {
        options = super._initializeApplicationOptions(options);
        const startingTab = "description";
        options.tabs = {
            passionTabs: {
                initial: startingTab
            }
        };
        return options;
    }
    _processSubmitData(event, form, formData) {
        const submitDataPromise = super._processSubmitData(event, form, formData);
        return submitDataPromise.then(() => {

            GlobalJsonEditor.processSubmit(form, formData, "system.customJSON");

            console.log("Saving Resolved Object:", formData);

            return foundry.utils.expandObject(formData);
        });
    }
    static async #onSubmit(event, form, formdata) {
        await this.document.update(formdata.Object);
        this.render();
    }
    static async #onEditImage(event, target) {
        const field = target.dataset.field || "img";
        const current = foundry.utils.getProperty(this.document, field);

        const fp = new foundry.applications.apps.FilePicker({
            type: "image",
            current: current,
            callback: path => {
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
        context.jsonString = JSON.stringify(this.document.system.customJSON, null, 2);
        return context;
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.tabs = this._prepareTabs("passionTabs");
        const hasActive = Object.values(context.tabs).some(t => t.cssClass === "active");
        if (!hasActive) {
            const defaultTab = "description";
            if (context.tabs[defaultTab]) {
                context.tabs[defaultTab].cssClass = "active";
            }
        }
        return context;
    }
    _onRender(context, options) {
        super._onRender(context, options);
        GlobalJsonEditor.attach(this.element, this);
    }
}