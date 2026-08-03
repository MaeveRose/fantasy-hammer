import { SYSTEM_ID } from "../../utils/sys-const.mjs";
export class BaseActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            options: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({
                    required: true,
                }), {
                initial: ["character", "actor"]
            }
            )
        }
    }
    gatherAttackOptions(weaponItem, defender) {
        if(!weaponItem.equipped){
            return false;
        }
        let gatheredSet = new Set();
        if (!defender)
        {
            gatheredSet.add(`target:none:true`);
        } else {
            if (/* for some reason */ defender.type !== "actor") {
                throw new Error(`Somehow you have managed to make the defender of an attack, NOT an actor`);
            }
            let optionset = defender.system.gatherRollOptions();
            for(const option of optionset)
            {
                gatheredSet.add(`target:${option}`);
            }
        }
        if (weaponItem.type !== "weapon") {
            throw new Error(`${weaponItem} isnt a weapon?`);
        }

        optionset = weaponItem.system.gatherRollOptions();
        for (const option of optionset)
        {
            gatheredSet.add(option);
        }
        optionset = this.system.gatherRollOptions();
        for (const option of optionset)
        {
            gatheredSet.add(`self:${option}`);
        }
        return Array.from(gatheredSet);
    }
    gatherRollOptions() {
        const subclassPrototype = Object.getPrototypeOf(this);
        if (!subclassPrototype.hasOwnProperty("gatherRollOptions")) {
            throw new error(`[${SYSTEM_ID} FATAL] the subclass '${this.constructor.name}' must implement its own 'gatherRollOptions()' method.`);
        }
        return this.traits ? Array.from(this.traits) : [];
    }
}