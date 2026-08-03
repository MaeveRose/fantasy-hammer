import { SystemValidator } from "./js/utils/system/validator.mjs";
import { _displayAuditWindow } from "./js/utils/system-helpers.mjs";

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

import { PassionDataModel } from "./js/dataModels/items/PassionDataModel.mjs";
import { PassionSheet } from "./js/sheets/items/PassionSheet.mjs";


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
Hooks.on("renderChatLog", (app, html, data) => {
  // Use a native click event listener on the base container
  html.addEventListener("click", async (event) => {
    // Look for the specific selector inside your target click path
    const targetLink = event.target.closest(".chat-card-item-link");
    if (!targetLink) return; // Ignore if they clicked somewhere else on the card

    event.preventDefault();
    
    // Extract parameters directly from the native element's dataset
    const actorId = targetLink.getAttribute("data-actor-id");
    const itemId = targetLink.getAttribute("data-item-id");
	console.log(itemId);
    // 1. Resolve if owned by an Actor
    if (actorId) {
      const item = await fromUuid(itemId);
	  console.log(item);
	  console.log()
      if (item) {
        item.sheet.render(true);
		return;
      }
    } 

    // 2. Resolve if a global Sidebar/World Item
    const worldItem = await fromUuid(itemId);
    if (worldItem) {
      return worldItem.sheet.render(true);
    }

    ui.notifications.warn("The original item file or owner could not be found.");
  });
});
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
		passion: PassionDataModel,
		godgift: FallbackDataModel, //tbc
		gear: GearDataModel,
		archetype: ArchetypeDataModel
	};
	CONFIG.Actor.documentClass.prototype._onCreate = function (data, options, userId) {
    	if (game.user.id === userId) {
      		this.update({
        		"prototypeToken.lockRotation": true
      		});
    	}
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
	foundry.documents.collections.Items.registerSheet("core",PassionSheet,{
		types:["passion"],
		makeDefault: true,
		label:"Types.Item.passion.label"
	})
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
	Handlebars.registerHelper("contains", function(list, value){
		if(!Array.isArray(list)) return false;
		return list.includes(value);
	})
	game.settings.register("fantasy-hammer", "enablehombrew", {
		name: "enable homebrew",
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
		onChange: value =>{
			console.log(`Homebrew is now ${value}`);
		}
	});
});
Hooks.on("getChatMessageContextOptions", (html, options) => {
  options.push({
    name: game.i18n.localize("global.chat.options.gatherRollOptions"),
    icon: '<i class="fas fa-list-check"></i>',

    condition: li => {
      const messageId = li.getAttribute("data-message-id");
      const message = game.messages.get(messageId);
      return !!message?.getFlag("fantasy-hammer", "rollOptions");
    },

    callback: li => {
      const messageId = li.getAttribute("data-message-id");
      const message = game.messages.get(messageId);
      const auditOptions = message.getFlag("fantasy-hammer", "rollOptions");
      const modifiers = message.getFlag("fantasy-hammer", "auditModifiers") || {};


      _displayAuditWindow(message, auditOptions, modifiers);
    }
  });
});



