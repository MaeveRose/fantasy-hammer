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

import { _registerHelpers, _registerSettings, _registerSheets } from "./js/utils/system/preregister.mjs";

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
	_registerSheets();
	_registerHelpers();
	_registerSettings();
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



