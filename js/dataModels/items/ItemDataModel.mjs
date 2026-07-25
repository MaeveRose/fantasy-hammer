export class BaseItemDataModel extends foundry.abstract.TypeDataModel{
    static defineSchema(){
        return{
            customJSON: new foundry.data.fields.ObjectField({
                required: true,
                initial:{}
            })
        }
    }
}