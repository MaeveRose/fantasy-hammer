import { SYSTEM_ID } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";
const { BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField, EmbeddedDataField } = foundry.data.fields;

export class PassionDataModel extends BaseItemDataModel {
    static defineSchema() {
        const baseFields = super.defineSchema();
        const parentTraits = baseFields.traits?.options?.initial || [];
        baseFields.traits = new ArrayField(
            new StringField( // Inherit the StringField configuration exactly as the parent defined it
                {
                    required: true
                }),
            {
                initial: [...parentTraits, "item:passion", "passion"]
            }
        );
        return {
            ...baseFields,
            description: new HTMLField({ required: true, initial: "" }),
            type: new StringField({ required: true, initial: "pride" })
        }
    }
    gatherRollOptions() {
        let set = new Set();
        set.add(`passion:type:${this.type}`);
    }
}