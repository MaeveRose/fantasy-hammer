import { SYSTEM_ID } from "../../utils/sys-const.mjs";
export class BaseItemDataModel extends foundry.abstract.TypeDataModel{
    static defineSchema(){
        return{
            options: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField({
                    required:true
                }),
                {
                    initial: ["item"]
                }
            ),
            customJSON: new foundry.data.fields.ObjectField({
                required: true,
                initial:{}
            }),
            slug: new foundry.data.fields.StringField({required:true, initial:""}),
        }
    }
    async printToChat(){
        const subclassPrototype = Object.getPrototypeOf(this);
        if (!subclassPrototype.hasOwnProperty("printToChat")){
            throw new Error(`[${SYSTEM_ID} FATAL] the subclass '${this.constructor.name}' must implement its own 'printToChat()' method.`);
        }
        return false; 
    } 
    getIDs()
    {
        return [this.uuid, this.slug];
    }
    gatherRollOptions()
    {
        const subclassPrototype = Object.getPrototypeOf(this);
        if (!subclassPrototype.hasOwnProperty("gatherRollOptions")){
            throw new Error(`[${SYSTEM_ID} FATAL] the subclass '${this.constructor.name}' must implement its own 'gatherRollOptions()' method.`);
        }
        return this.traits ? Array.from(this.traits) : [];    
    }
}