const {BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField} = foundry.data.fields;
import { CHARACTERISTIC_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

export class PsychicPowerDataModel extends BaseItemDataModel {
    static defineSchema(){
        return{
            ...super.defineSchema(),
        }
    }
}