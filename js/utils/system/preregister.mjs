import { CharacterSheet } from "../../sheets/actors/CharacterSheet.mjs";
import { TalentSheet } from "../../sheets/items/TalentSheet.mjs";
import { TraitSheet } from "../../sheets/items/TraitSheet.mjs";
import { WeaponSheet } from "../../sheets/items/WeaponSheet.mjs";
import { ArmorSheet } from "../../sheets/items/ArmorSheet.mjs";
import { PassionSheet } from "../../sheets/items/PassionSheet.mjs";
import { ArchetypeSheet } from "../../sheets/items/ArchetypeSheet.mjs";
import { GearSheet } from "../../sheets/items/GearSheet.mjs";

export function _registerHelpers() {
    Handlebars.registerHelper("getStatDigit", function (totalValue, digitType) {
        if (typeof totalValue !== "number") return 0;
        if (digitType === "tens") return Math.floor(totalValue / 10); // e.g. 12 -> 1
        if (digitType === "ones") return totalValue % 10;            // e.g. 12 -> 2
        if (digitType === "bonus") return Math.floor(totalValue / 10);
        return 0;
    });
    Handlebars.registerHelper("shortChar", function (characteristicKey) {
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
    Handlebars.registerHelper("localizeItemType", (type, key) => {
        return game.i18n.localize(`TYPES.Item.${type}.${key}`);
    });
    Handlebars.registerHelper("fromUuidProp", function (uuid, keyPath) {
        if (!uuid || typeof uuid !== "string") return "";
        const doc = fromUuidSync(uuid);
        if (!doc) return keyPath === "img" ? "icons/svg/item-bag.svg" : "Unknown Talent";
        return foundry.utils.getProperty(doc, keyPath) ?? "";
    });
    Handlebars.registerHelper("add", function (value1, value2) {
        return Number(value1) + Number(value2);
    });
    Handlebars.registerHelper("sub", function (value1, value2) {
        return Number(value1) - Number(value2);
    });
    Handlebars.registerHelper("contains", function (list, value) {
        if (!Array.isArray(list)) return false;
        return list.includes(value);
    });
    Handlebars.registerHelper("calculateAdvancementType", function (advancement) {
        if (!advancement) return "icons/svg/item-bag.svg";
        switch (advancement.type) {
            case "talent": return "systems/fantasy-hammer/ui/assets/advancementIcons/talent.svg";
            case "skill": return "systems/fantasy-hammer/ui/assets/advancementIcons/skill.svg";
            case "characteristic": return "systems/fantasy-hammer/ui/assets/advancementIcons/characteristic.svg";
        }
    });
}
export function _registerSettings(){
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
    game.settings.register("fantasy-hammer", "critwindow",{
        name:"sys-const.settings.critwindow",
        scope: "world",
        config:true,
        type:Number,
        default:1,
        range:{
            min:0,
            max:51,
            step:1
        },
        onChange: value =>{
            const basefail = 100;
            const modifiedFail = 100-(value-1);
            const baseSuccess = 1;
            const modifiedSuccess = 1 + (value-1);
            console.log(`Crit Window is now ${value}(${modifiedFail}-${basefail} is automatic failure, ${baseSuccess}-${modifiedSuccess} is automatic success)`);
        }
    });
	game.settings.register("fantasy-hammer", "disablemodifiercap",{
		name: "sys-const.settings.disablemodifiercap",
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
		onChange: value =>{
			console.log(`Modifiers will ${value ? 'not be' : 'be'} clamped to +/- 60`)
		}
	});
}
export function _registerSheets(){
    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet("core", CharacterSheet,{
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
	});
}
