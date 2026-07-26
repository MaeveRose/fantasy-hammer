import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { ObjectField, StringField, JSONField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class TraitDataModel extends BaseItemDataModel {
    static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:trait", "trait"]
      }
    );
        return {
            ...baseFields,
            description: new HTMLField({required:true, initial:""}),
        }
    }
    gatherRollOptions(){
        let set = new Set();
        const slug = this.slug ? this.slug : this.parent.name.slugify();
        const id = this.parent.uuid.replaceAll(".", "-");
        set.add(`item:slug:${slug}`);
        set.add(`item:uuid:${id}`);
        return Array.from(set);
    }
}