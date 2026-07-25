import {
    AVAILABILITY_MANIFEST,
    QUALITY_MANIFEST,
    ARMORTYPE_MANIFEST } from "../../sys-const.mjs";

const { JSONField, StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class ArmorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
        customJSON: new JSONField({required:true, initial:"{}"}),
        type: new StringField({required:true, initial:"primative", choices: Object.keys(ARMORTYPE_MANIFEST)}),
        coverage: new SchemaField({
            head: new NumberField({required:true, initial:0}),
            rightarm: new NumberField({required:true, initial:0}),
            leftarm: new NumberField({required:true, initial:0}),
            body: new NumberField({required:true, initial:0}),
            leftleg: new NumberField({required:true, initial:0}),
            rightleg: new NumberField({required:true, initial:0})
        }),
        weight: new NumberField({required: true, initial: 0}),
        availability: new StringField({
                required: true,
                blank: false,
                initial: "average",
                choices: Object.keys(AVAILABILITY_MANIFEST) 
        }),
        craftsmanship: new StringField({required: true, initial:"poor", choices: Object.keys(QUALITY_MANIFEST)})
    };
  }
}