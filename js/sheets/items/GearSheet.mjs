 import {
     AVAILABILITY_MANIFEST,
     QUALITY_MANIFEST,
     WEAPONCLASS_MANIFEST,
     DAMAGETYPE_MANIFEST,
     WEAPONTYPE_MANIFEST,
     ARMORTYPE_MANIFEST
 } from "../../utils/sys-const.mjs";
 
 export class GearSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
     static DEFAULT_OPTIONS = {
         id: "armor-sheet",
         classes: ["fantasy-hammer", "sheet", "item", "gear"],
         tag: "form",
         window: {
             resizable: true,
         },
         position: {
             width: 530,
             height: 390
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
         template: "systems/fantasy-hammer/html/sheets/items/gearsheet.html" /* ⚠️ Ensure this path points exactly to your system's template folder name! */
         }
     };
     get title() {
         const localizedprefix = game.i18n.localize("TYPES.Item.gear.label");
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
 
         context.availabilityOptions = Object.entries(AVAILABILITY_MANIFEST).map(([slug, data]) => ({
             id: slug,                             // e.g., "ubiquitous"
             label: game.i18n.localize(data.key)  // Translates the localization string immediately
         }));
         context.armorTypeOptions = Object.entries(QUALITY_MANIFEST).map(([slug,data]) =>({
             id: slug,
             label: game.i18n.localize(data.key)
         }));
         return context;
     }
 }