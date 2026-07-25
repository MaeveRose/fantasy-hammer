const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;
import { BaseItemDataModel } from "./ItemDataModel.mjs";

export class GearDataModel extends BaseItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new HTMLField({required:true, initial:""}),
            weight: new NumberField({required:true, intial:0})           
        }
    }
}