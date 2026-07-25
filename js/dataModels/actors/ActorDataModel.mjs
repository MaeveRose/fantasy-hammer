export class BaseActorDataModel extends foundry.abstract.TypeDataModel{
    static defineSchema(){
        return{
            traits: new foundry.data.fields.ArrayField(
                foundry.data.fields.StringField({
                    required:true,
                }),{
                    initial: ["character","actor"]
                }
            )
        }
    }
}