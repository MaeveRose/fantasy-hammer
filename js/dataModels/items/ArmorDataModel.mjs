import { AVAILABILITY_MANIFEST, QUALITY_MANIFEST, ARMORTYPE_MANIFEST } from "../../utils/sys-const.mjs";

import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { JSONField, StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class ArmorDataModel extends BaseItemDataModel {
  static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:weapon", "weapon"]
      }
    );
    return {
      ...baseFields,
      customJSON: new JSONField({ required: true, initial: "{}" }),
      type: new StringField({ required: true, initial: "primative", choices: Object.keys(ARMORTYPE_MANIFEST) }),
      coverage: new SchemaField({
        head: new NumberField({ required: true, initial: 0 }),
        rightarm: new NumberField({ required: true, initial: 0 }),
        leftarm: new NumberField({ required: true, initial: 0 }),
        body: new NumberField({ required: true, initial: 0 }),
        leftleg: new NumberField({ required: true, initial: 0 }),
        rightleg: new NumberField({ required: true, initial: 0 })
      }),
      weight: new NumberField({ required: true, initial: 0 }),
      availability: new StringField({
        required: true,
        blank: false,
        initial: "average",
        choices: Object.keys(AVAILABILITY_MANIFEST)
      }),
      craftsmanship: new StringField({ required: true, initial: "poor", choices: Object.keys(QUALITY_MANIFEST) })
    };
  }
  gatherRollOptions() {
    let set = new Set();
    for (const trait of this.traits) {
      set.add(trait);
    }
    const slug = this.slug ? this.slug : this.parent.name.slugify();
    const id = this.parent.uuid.replaceAll(".", "-");
    set.add(`item:slug:${slug}`);
    set.add(`item:uuid:${id}`);
    const typeconfig = ARMORTYPE_MANIFEST[this.type];
    const availconfig = AVAILABILITY_MANIFEST[this.availability];
    const craftconfig = QUALITY_MANIFEST[this.craftsmanship];
    set.add(`item:armor:type:${typeconfig.traits}`);
    set.add(`item:armor:availability:${availconfig}`);
    set.add(`item:armor:craftsmanship:${craftconfig}`);
    set.add(`item:armor:coverage:head:${this.coverage.head}`);
    set.add(`item:armor:coverage:rightarm:${this.coverage.rightarm}`)
    set.add(`item:armor:coverage:leftarm:${this.coverage.leftarm}`)
    set.add(`item:armor:coverage:body:${this.coverage.body}`)
    set.add(`item:armor:coverage:leftleg:${this.coverage.leftleg}`)
    set.add(`item:armor:coverage:rightleg:${this.coverage.rightleg}`)
    return Array.from(set);
  }
}