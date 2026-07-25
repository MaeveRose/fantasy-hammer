const { ObjectField, StringField, JSONField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class TraitDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({required:true, initial:""}),
            customJSON: new JSONField({required:true,initial:"{}"})
        }
    }
}