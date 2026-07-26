import { AVAILABILITY_MANIFEST } from "../../sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class AmmunitionDataModel extends BaseItemDataModel {
  static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:ammunition", "ammunition"]
      }
    );
    return {
      ...baseFields,
      description: new HTMLField({ required: true, initial: "" }),
      availability: new StringField({ required: true, initial: "common", choices: Object.keys(AVAILABILITY_MANIFEST) })
    }
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
    return Array.from(set);
  }
}