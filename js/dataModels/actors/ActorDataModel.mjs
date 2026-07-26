import { SYSTEM_ID } from "../../utils/sys-const.mjs";
export class BaseActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            traits: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({
                    required: true,
                }), {
                initial: ["character", "actor"]
            }
            )
        }
    }
    gatherRollOptions() {
        const subclassPrototype = Object.getPrototypeOf(this);
        if (!subclassPrototype.hasOwnProperty("gatherRollOptions")) {
            throw new error(`[${SYSTEM_ID} FATAL] the subclass '${this.constructor.name}' must implement its own 'gatherRollOptions()' method.`);
        }
        return this.traits ? Array.from(this.traits) : [];
    }
}