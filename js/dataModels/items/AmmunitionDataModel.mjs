import { AVAILABILITY_MANIFEST } from "../../sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class AmmunitionDataModel extends BaseItemDataModel{
    static defineSchema() {
        return{
            ...super.defineSchema(),
            description: new HTMLField({required: true, initial:""}),
            availability: new StringField({required: true, initial:"common", choices: Object.keys(AVAILABILITY_MANIFEST)})
        }
    }
}