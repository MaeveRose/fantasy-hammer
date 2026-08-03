const { BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField, EmbeddedDataField } = foundry.data.fields;
import { CHARACTERISTIC_MANIFEST, SKILL_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";
import { TraitDataModel } from "./TraitDataModel.mjs";

export class ArchetypeDataModel extends BaseItemDataModel {
    static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:archetype", "archetype"]
      }
    );
        return {
            ...baseFields,
            description: new HTMLField({ required: true, initial: "<p></p>" }),
            characteristicsBonus: new ArrayField(
                new SchemaField({
                    characteristic: new StringField({
                        required: true,
                        initial: "weaponSkill",
                        choices: Object.keys(CHARACTERISTIC_MANIFEST)
                    }),
                    value: new NumberField({ required: true, initial: 0 })
                })
            ),
            skillBonus: new ArrayField(
                new SchemaField({
                    id: new StringField({ required: true, initial: "forbiddenLore", choices: Object.keys(SKILL_MANIFEST) }),
                    isAdvanced: new BooleanField({ required: true, initial: false })
                })
            ),
            skillChoices: new ArrayField(
                new ArrayField(
                    new SchemaField({
                        id: new StringField({ required: true, initial: "forbiddenLore", choices: Object.keys(SKILL_MANIFEST) }),
                        isAdvanced: new BooleanField({ required: true, initial: false })
                    })
                )
            ),
            traitsGranted: new ArrayField(
                new StringField({
                    required:true,
                    initial:""
                })
            ),
            talentsGranted: new ArrayField(
                new StringField({
                    required: true,
                    initial: ""
                })
            ),
            talentChoices: new ArrayField(
                new ArrayField(
                    new StringField({
                        required: true,
                        initial: ""
                    })
                )
            ),
            traitsGranted: new ArrayField(
                new StringField({
                    required:true,
                    initial: ""
                })
            ),
            gearGranted: new ArrayField(
                new StringField({
                    required: true,
                    iniitlal: ""
                })
            ),
            gearChoices: new ArrayField(
                new ArrayField(
                    new StringField({
                        required: true,
                        initial: ""
                    })
                )
            ),
            wounds: new StringField({ required: true, initial: "0d10+0" }),
            specialAbility: new SchemaField({
                name: new StringField({ required: true, initial: "" }),
                description: new HTMLField({ required: true, initial: "<p></p>" })
            }),
        }
    }
    gatherRollOptions() {
        let set = new Set();
        const slug = this.slug ? this.slug : this.parent.name.slugify();
        const id = this.parent.uuid;
        set.add(`${id}`);
        set.add(`${slug}`);
        return Array.from(set);
    }
}