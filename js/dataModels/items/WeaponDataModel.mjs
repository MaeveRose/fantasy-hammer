const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

import { AVAILABILITY_MANIFEST, DAMAGETYPE_MANIFEST, WEAPONCLASS_MANIFEST, WEAPONTYPE_MANIFEST, QUALITY_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

export class WeaponDataModel extends BaseItemDataModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new HTMLField({required:true, initial:""}),
            class: new StringField({required:true, initial:"melee", choices: Object.keys(WEAPONCLASS_MANIFEST)}),
            type: new StringField({required:true, initial:"las", choices: Object.keys(WEAPONTYPE_MANIFEST)}),
            craftsmanship: new StringField({required: true, initial:"poor", choices: Object.keys(QUALITY_MANIFEST)}),
            range: new NumberField({required:true, initial:0}),
            rateOfFire: new SchemaField({
                single: new StringField({required:true, initial:false}),
                semi: new NumberField({required:true, initial:0}),
                full: new NumberField({required:true, initial:0})
            }),
            isMelee: new BooleanField({required:true, initial:false}),
            damage: new SchemaField({
                value: new StringField({required:true, initial:"0d10+0"}),
                type: new StringField({
                    required: true,
                    blank: false,
                    initial: "E",
                    choices: Object.keys(DAMAGETYPE_MANIFEST)
                })
            }),
            pen: new NumberField({required:true, integer:true, min:0, initial:0}),
            clip: new SchemaField({
                current: new NumberField({required:true, integer:true, min: 0, initial:0}),
                max: new NumberField({required:true, integer:true, min:0, initial: 0})
            }),
            reload: new StringField({required:true, integer:true, initial:"half"}),
            special: new StringField({required:false, initial:""}),
            weight: new NumberField({required:true, integer:true, min:0, initial:0}),
            availability: new StringField({
                required: true,
                blank: false,
                initial: "average",
                choices: Object.keys(AVAILABILITY_MANIFEST) 
            })
        };
    }
}