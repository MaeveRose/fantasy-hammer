const {JSONField, BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField} = foundry.data.fields;

import { SKILL_MANIFEST, CHARACTERISTIC_MANIFEST } from "../../utils/sys-const.mjs";

const skillBlueprint = (linkedCharacteristic, localizable) => new SchemaField({
      characteristic: new StringField({ required: true, initial: linkedCharacteristic }),
      readable: new StringField({required: true, initial: localizable}),
      value: new NumberField({ required: true, integer: true, min: 0, max: 4, initial: 0 }),
      bonus: new NumberField({ required: false, integer: true, min: -60, max: 60, initial: 0 })
    });
const charBlueprint = (localizable) => new SchemaField({
      readable: new StringField({required: true, initial: localizable}),
      value: new NumberField({ required: true, integer: true, min: 0, max: 100, initial: 0 })
    });

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    // All Actors have resources.
    const characteristicsSchema = {};
    for (let [charKey,config] of Object.entries(CHARACTERISTIC_MANIFEST)) {
      characteristicsSchema[charKey] = charBlueprint(config.key)
    }
    const skillsSchema = {};
    for (let [skillKey, config] of Object.entries(SKILL_MANIFEST)) {
      skillsSchema[skillKey] = skillBlueprint(config.char, config.key);
    }
    skillsSchema.specializedSkills = new ArrayField(
      new SchemaField({
        id: new StringField({ required: true, initial: () => foundry.utils.randomID() }),
        parentSkillName: new StringField({ required: true, initial: "forbiddenLore" }), 
        subSpecialtyName: new StringField({ required: true, initial: "New Specialization" }),   
        readable: new StringField({ required: true, initial: "" }),
        value: new NumberField({ required: true, integer: true, min: 0, max: 4, initial: 0 }),
        bonus: new NumberField({ required: false, integer: true, min: -60, max: 60, initial: 0 })
      }),
      { initial: [] }
    );
    return {
      characterCreationActive: new BooleanField({required:true, initial:true}),
      playerName: new StringField({required: false}),
      crusade: new SchemaField({
        archetype: new StringField({required: true, initial: ""}),
        rank: new StringField({required: true, initial: ""}),
        warband: new StringField({required: true, initial: ""}),
        pride: new StringField({required: true, initial: ""}),
        disgrace: new StringField({required: true, initial: ""}),
        motivation: new StringField({required: true, initial: ""}),
        isChaosMarine: new BooleanField({required: true, initial:false})
      }),
      characterDescription: new StringField({required: true, initial: ""}),
      characterBio: new HTMLField({required: true, initial:"<p>An Unknown Heratic</p>"}),
      characteristics: new SchemaField(characteristicsSchema),
      skills: new SchemaField(skillsSchema),
      characterModifiers: new JSONField({required:true, initial:{}})
    };
  }
}