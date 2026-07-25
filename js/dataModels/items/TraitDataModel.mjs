import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { ObjectField, StringField, JSONField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class TraitDataModel extends BaseItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new HTMLField({required:true, initial:""}),
        }
    }
}