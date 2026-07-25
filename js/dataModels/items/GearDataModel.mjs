const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

import { AVAILABILITY_MANIFEST } from "../../../js/sys-const.mjs";
import { DAMAGETYPE_MANIFEST } from "../../../js/sys-const.mjs";
import { WEAPONCLASS_MANIFEST } from "../../../js/sys-const.mjs";
import { WEAPONTYPE_MANIFEST } from "../../../js/sys-const.mjs";
import { QUALITY_MANIFEST } from "../../../js/sys-const.mjs";

export class GearDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({required:true, initial:""}),
            weight: new NumberField({required:true, intial:0})           
        }
    }
}