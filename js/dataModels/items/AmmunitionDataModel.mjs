import { AVAILABILITY_MANIFEST } from "../../sys-const.mjs";

const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class AmmunitionDataModel extends foundry.abstract.TypeDataModel{
    static defineSchema() {
        return{
            description: new HTMLField({required: true, initial:""}),
            availability: new StringField({required: true, initial:"common", choices: Object.keys(AVAILABILITY_MANIFEST)})
        }
    }
}