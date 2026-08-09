const { JSONField, BooleanField, ArrayField, HTMLField, NumberField, SchemaField, StringField, MappingField, ObjectField } = foundry.data.fields;

import { SKILL_MANIFEST, CHARACTERISTIC_MANIFEST, SIZE_MANIFEST, ADVANCEMENT_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseActorDataModel } from "./ActorDataModel.mjs";

const skillBlueprint = (linkedCharacteristic, localizable) => new SchemaField({
  characteristic: new StringField({ required: true, initial: linkedCharacteristic }),
  readable: new StringField({ required: true, initial: localizable }),
  value: new NumberField({ required: true, integer: true, min: 0, max: 4, initial: 0 }),
  bonus: new NumberField({ required: false, integer: true, min: -60, max: 60, initial: 0 })
});
const charBlueprint = (localizable) => new SchemaField({
  readable: new StringField({ required: true, initial: localizable }),
  value: new NumberField({ required: true, integer: true, min: 0, max: 100, initial: 25 })
});

export class CharacterDataModel extends BaseActorDataModel {
  static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField({ required: true }),
      {
        // Combine parent traits with child-specific traits
        initial: [...parentTraits, "player-character"]
      }
    );
    const characteristicsSchema = {};
    for (let [charKey, config] of Object.entries(CHARACTERISTIC_MANIFEST)) {
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
      ...baseFields,
      characterCreationActive: new BooleanField({ required: true, initial: true }),
      playerName: new StringField({ required: false }),
      crusade: new SchemaField({
        archetype: new StringField({ required: true, initial: "" }),
        rank: new StringField({ required: true, initial: "" }),
        warband: new StringField({ required: true, initial: "" }),
        pride: new StringField({ required: true, initial: "" }),
        disgrace: new StringField({ required: true, initial: "" }),
        motivation: new StringField({ required: true, initial: "" }),
        isChaosMarine: new BooleanField({ required: true, initial: false })
      }),
      characterDescription: new StringField({ required: true, initial: "" }),
      characterBio: new HTMLField({ required: true, initial: "<p>An Unknown Heratic</p>" }),
      characteristics: new SchemaField(characteristicsSchema),
      size: new StringField({required:true, initial:"average", choices: Object.keys(SIZE_MANIFEST)}),
      skills: new SchemaField(skillsSchema),
      characterModifiers: new ObjectField({
        required: true,
        initial: {}
      }),
      experience: new NumberField({required:true, initial:1000}),
      advancements: new ArrayField(
        new SchemaField({
          type:new StringField({required:true, initial:"skill", choices:Object.keys(ADVANCEMENT_MANIFEST)}),
          value:new NumberField({required:true, initial:0}),
          identifier:new StringField({required:true, initial:""}),
          level:new NumberField({required:true,initial:0,max:4}),
          origin: new StringField({required:true, initial:"player"})
        })
      )
    };
  }
  gatherRollOptions() {
    let option = [{}]
    if (!this.parent) {
      console.log(`no parent`);
      return;
    }
    for (const trait of this.traits) {
      option.push({id:trait,value:true});
    }
    const id = this.parent.uuid;
    option.push({id:`actor-uuid`,value:id});
    option.push({id:`actor-chaos-marine`,value:this.crusade.isChaosMarine});
    option.push({id:`size`,value:this.size});
    if (this.parent.items) {
      const archetype = this.parent.items.find(item => item.type === "archetype");
      const pride = this.parent.items.find(item => item.type === "pride")
      const motivation = this.parent.items.find(item => item.type === "motivation");
      const disgrace = this.parent.items.find(item => item.type === "disgrace");
      const traitItems = this.parent.items.filter(item => item.type === "trait");
      const talentItems = this.parent.items.filter(item => item.type === "talent");
      if(!archetype){
        option.push({id:`actor-archetype`,value:undefined});
      } else {
        const [uuid, slug] = archetype.system.gatherRollOptions();
        option.push({id:`actor-archetype-uuid` ,value:uuid});
        option.push({id:`actor-archetype-slug` ,value:slug});
      }
      if(!pride){
        option.push({id:`actor-pride`,value:undefined});
      } else {
        const [uuid, slug] = pride.gatherRollOptions();
        option.push({id:`actor-pride-uuid` ,value:uuid});
        option.push({id:`actor-pride-slug` ,value:slug});
      }
      if(!motivation){
        option.push({id:`actor-motivation` ,value:undefined});
      } else {
        const [uuid, slug] = motivation.gatherRollOptions();
        option.push({id:`actor-motivation-uuid` ,value:uuid});
        option.push({id:`actor-motivation-slug` ,value:slug});
      }
      if(!disgrace){
        option.push({id:`actor-disgrace` ,value:undefined});
      } else {
        const [uuid, slug] = disgrace.gatherRollOptions();
        option.push({id:`actor-disgrace-uuid` ,value:uuid});
        option.push({id:`actor-disgrace-slug` ,value:slug});
      }

      for (const item of traitItems) {
        let traitID = item.uuid;
        let traitSlug = item.system.slug ? item.system.slug : item.name.slugify();
        option.push({id:`actor-has-trait-uuid` ,value:traitID});
        option.push({id:`actor-has-trait-slug` ,value:traitSlug});
      }
      for (const item of talentItems) {
        let talentID = item.uuid;
        let talentSlug = item.system.slug ? item.system.slug : item.name.slugify();
        option.push({id:`actor-has-talent-uuid` ,value:talentID});
        option.push({id:`actor-has-talent-slug` ,value:talentSlug});
      }
    }
    console.log(option);
    return option;
  }
}