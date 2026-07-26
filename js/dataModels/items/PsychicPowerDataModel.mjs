const { BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField } = foundry.data.fields;
import { CHARACTERISTIC_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

export class PsychicPowerDataModel extends BaseItemDataModel {
  static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:psychic-power", "psychic-power"]
      }
    );
    return {
      ...baseFields,
    }
  }
  gatherRollOptions() {
    let set = new Set();
    const slug = this.slug ? this.slug : this.parent.name.slugify();
    const id = this.parent.uuid.replaceAll(".", "-");
    set.add(`item:slug:${slug}`);
    set.add(`item:uuid:${id}`);
    return Array.from(set);
  }
}