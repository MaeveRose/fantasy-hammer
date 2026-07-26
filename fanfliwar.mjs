import { SystemValidator } from "./js/utils/system/validator.mjs";

import { CharacterSheet } from "./js/sheets/actors/CharacterSheet.mjs"
import { CharacterDataModel } from "./js/dataModels/actors/CharacterDataModel.mjs"

import { TalentDataModel } from "./js/dataModels/items/TalentDataModel.mjs"
import { TalentSheet } from "./js/sheets/items/TalentSheet.mjs";

import { WeaponDataModel } from "./js/dataModels/items/WeaponDataModel.mjs";
import { WeaponSheet} from "./js/sheets/items/WeaponSheet.mjs";

import { ArmorDataModel } from "./js/dataModels/items/ArmorDataModel.mjs"
import { ArmorSheet } from "./js/sheets/items/ArmorSheet.mjs";

import { GearDataModel } from "./js/dataModels/items/GearDataModel.mjs";
import { GearSheet } from "./js/sheets/items/GearSheet.mjs";

import { ArchetypeDataModel } from"./js/dataModels/items/ArchetypeDataModel.mjs";
import { ArchetypeSheet } from "./js/sheets/items/ArchetypeSheet.mjs";

import { TraitDataModel } from "./js/dataModels/items/TraitDataModel.mjs";
import { TraitSheet } from "./js/sheets/items/TraitSheet.mjs"

const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;
class FallbackDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {};
  }
  gatherRollOptions(){
	return ["fallback"];
  }
}
Hooks.once("init", () => {
	CONFIG.Actor.dataModels.character = CharacterDataModel;
	CONFIG.Actor.dataModels.npc = FallbackDataModel;
	CONFIG.Actor.dataModels.vehicle = FallbackDataModel;
	CONFIG.Item.dataModels ={
		talent: TalentDataModel,
		trait: TraitDataModel,
		weapon: WeaponDataModel,
		spell: FallbackDataModel, //tbc
		armor: ArmorDataModel,
		godgift: FallbackDataModel, //tbc
		gear: GearDataModel,
		archetype: ArchetypeDataModel
	};
	//KEEP THIS AFTER THE DATA MODELS
	SystemValidator.auditDataModels();
	// unregister generic sheet
	foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	// register new sheet 
	foundry.documents.collections.Actors.registerSheet("core",CharacterSheet,{
		types:["character"],
		makeDefault: true,
		label: "TYPES.Actor.character.label"
	});
	foundry.documents.collections.Items.registerSheet("core", TalentSheet, {
    	types: ["talent"], // Assign this builder window view to handle BOTH types cleanly!
    	makeDefault: true,
    	label: "TYPES.Item.talent.label"
  	});
	foundry.documents.collections.Items.registerSheet("core", WeaponSheet,{
		types: ["weapon"],
		makeDefault: true,
		label: "TYPES.Item.weapon.label"
	});
	foundry.documents.collections.Items.registerSheet("core", ArmorSheet,{
		types: ["armor"],
		makeDefault: true,
		label: "TYPES.Item.armor.label"
	});
	foundry.documents.collections.Items.registerSheet("core", GearSheet,{
		types: ["gear"],
		makeDefault: true,
		label: "TYPES.Item.gear.label"
	});
	foundry.documents.collections.Items.registerSheet("core", ArchetypeSheet,{
		types: ["archetype"],
		makeDefault: true,
		label: "TYPES.Item.archetype.label"
	});
	foundry.documents.collections.Items.registerSheet("core",TraitSheet,{
		types:["trait"],
		makeDefault:true,
		label:"TYPES.Item.archetype.label"
	});
	Handlebars.registerHelper("getStatDigit", function (totalValue, digitType){
		if (typeof totalValue !== "number") return 0;
        if (digitType === "tens") return Math.floor(totalValue / 10); // e.g. 12 -> 1
    	if (digitType === "ones") return totalValue % 10;            // e.g. 12 -> 2
    	if (digitType === "bonus") return Math.floor(totalValue / 10);
    	return 0;
	});
  	Handlebars.registerHelper("shortChar", function(characteristicKey) {
    	const mapping = {
      		weaponSkill: "WS",
      		ballisticSkill: "BS",
      		strength: "S",
      		toughness: "T",
      		agility: "AG",
      		intelligence: "INT",
      		perception: "PER",
      		willpower: "WP",
      		fellowship: "FEL",
      		infamy: "INF",
      		none: "-"
    	};
    	return mapping[characteristicKey] || "-";
  	});
	Handlebars.registerHelper("localizeItemType", (type, key) =>
	{
		return game.i18n.localize(`TYPES.Item.${type}.${key}`);
	});
	Handlebars.registerHelper("fromUuidProp", function(uuid, keyPath) {
        if (!uuid || typeof uuid !== "string") return "";
        
        // fromUuidSync safely fetches loaded world items, actors, or cached compendiums
        const doc = fromUuidSync(uuid);
        if (!doc) return keyPath === "img" ? "icons/svg/item-bag.svg" : "Unknown Talent";

        // foundry.utils.getProperty cleanly handles nested paths safely
        return foundry.utils.getProperty(doc, keyPath) ?? "";
    });
	Handlebars.registerHelper("add", function(value1, value2) {
    	return Number(value1) + Number(value2);
  	});
	Handlebars.registerHelper("sub", function(value1, value2){
		return Number(value1) - Number(value2);
	});


});



