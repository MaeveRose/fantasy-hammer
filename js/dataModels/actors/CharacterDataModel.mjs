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
          level:new NumberField({required:true,initial:0,max:4})
        })
      )
    };
  }
  gatherRollOptions() {
    let set = new Set();
    if (!this.parent) {
      console.log(`no parent`);
      return;
    }
    for (const trait of this.traits) {
      set.add(trait);
    }
    const id = this.parent.uuid;
    set.add(`actor:uuid:${id}`);

    set.add(`actor:chaos-marine:${this.crusade.isChaosMarine}`);
    set.add(`size:${this.size}`);
    if (this.parent.items) {
      const archetype = this.parent.items.find(item => item.type === "archetype");
      const pride = this.parent.items.find(item => item.type === "pride")
      const motivation = this.parent.items.find(item => item.type === "motivation");
      const disgrace = this.parent.items.find(item => item.type === "disgrace");
      const traitItems = this.parent.items.filter(item => item.type === "trait");
      const talentItems = this.parent.items.filter(item => item.type === "talent");
      if(!archetype){
        set.add(`actor:archetype:void`) 
      } else {
        const [uuid, slug] = archetype.system.gatherRollOptions();
        set.add(`actor:archetype:uuid:${uuid}`);
        set.add(`actor:archetype:slug:${slug}`);
      }
      if(!pride){
        set.add(`actor:pride:void`) 
      } else {
        const [uuid, slug] = pride.gatherRollOptions();
        set.add(`actor:pride:uuid:${uuid}`);
        set.add(`actor:pride:slug:${slug}`);
      }
      if(!motivation){
        set.add(`actor:motivation:void`) 
      } else {
        const [uuid, slug] = motivation.gatherRollOptions();
        set.add(`actor:motivation:uuid:${uuid}`);
        set.add(`actor:motivation:slug:${slug}`);
      }
      if(!disgrace){
        set.add(`actor:disgrace:void`) 
      } else {
        const [uuid, slug] = disgrace.gatherRollOptions();
        set.add(`actor:disgrace:uuid:${uuid}`);
        set.add(`actor:disgrace:slug:${slug}`);
      }

      for (const item of traitItems) {
        let traitID = item.uuid;
        let traitSlug = item.system.slug ? item.system.slug : item.name.slugify();

        set.add(`actor:has-trait:uuid:${traitID}`);
        set.add(`actor:has-trait:slug:${traitSlug}`);
      }
      for (const item of talentItems) {
        console.log(item);
        console.log(this.parent.items);
        let talentID = item.uuid;
        let talentSlug = item.system.slug ? item.system.slug : item.name.slugify();

        set.add(`actor:has-talent:uuid:${talentID}`);
        set.add(`actor:has-talent:slug:${talentSlug}`);
      }
    }
    return Array.from(set);
  }
}