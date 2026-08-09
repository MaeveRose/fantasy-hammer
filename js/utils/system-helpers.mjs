import { CHARACTERISTIC_MANIFEST, FIREMODE_MANIFEST, RANGE_MANIFEST, SIZE_MANIFEST, SKILL_MANIFEST } from "./sys-const.mjs";

/**
 * @typedef {Object} RollOption
 * @property {string} id - The unique identifier.
 * @property {*} value - The value assigned to the option.
 */
export async function _printToChat(item, actorDocument) {
  //probably wont be used?
}
/**
* takes the attacker, defender weaponItem and rollOptions and runs the d100 test to determine if the attack hits or not.
* @param {import("foundry-vtt").Actor|uuid} attacker
* @param {import("foundry-vtt").Actor|uuid} defender
* @param {import("foundry-vtt").Weapon|uuid} weaponItem
* @param {RollOption[]} [rollOptions=[{}]]
* @returns {Promise<void>} 
* @throws {Error} if the attacker or defender type cannot resolve to an Actor, or if the weapon cannot resolve to a Weapon
*
**/
export async function _targetedAttack(attacker, defender, weaponItem, rollOptions = [{}]) {
  let attacking = attacker;
  if (!attacker.type || attacker.documentName !== "Actor") {
    attacking = await fromUuid(attacker);
    if (attacking.type !== "actor" || !attacking.type) throw new Error(`neither ${attacker} nor ${attacking} are of type actor. attacker must be either Actor or a UUID that resolves to an Actor`);
  }
  let defending = defender;
  let defendingOptions = [];
  if (defender !== "void") {
    if (typeof defender === "string" || !defender?.type || defender?.documentName !== "Actor") {
      let resolvedDoc = await fromUuid(defender);
      if (!resolvedDoc) throw new Error(`[MySystem] Combat Target Error: The UUID '${defender}' could not be found or resolved.`);
      const targetActor = resolvedDoc.actor || resolvedDoc.document?.actor || resolvedDoc;
      if (targetActor?.type !== "actor") {
        throw new Error(
          `Neither the input target nor its resolved reference match type 'actor'. ` +
          `Target must be an Actor Document, a Canvas Token, or a valid Actor/Token UUID.`
        );
      }
      defending = targetActor;
    }
    defendingOptions = defending.system.gatherRollOptions();
    //console.log(defendingOptions);
  } else {
    defendingOptions = ["the-void"];
  }
  let weapon = weaponItem;
  if (!weaponItem.type || weaponItem.type !== "weapon") {
    weapon = await fromUuid(weaponItem);
    if (weapon.type !== "weapon" || !weapon.type) throw new Error(`neither ${weaponItem} nor ${weapon} are of type "weapon". weaponItem must be either Weapon or a UUID that resolves to a Weapon`);
  }
  let options = [
    ...rollOptions,
    ...attacking.system.gatherRollOptions(),
    ...defendingOptions.map(o => `target:${o}`), //appends "target:"
    ...weapon.system.gatherRollOptions()
  ];
  const totalmodifier = calculateModifier(options);
  //executeD100Test(options);
  return true;
}
export async function _selector(chosen = [], value) {
  let chosenChars = chosen;
  const templateData = {
    characteristicValue: value,
    chosen: chosenChars
  }
  const title = game.i18n.localize("global.charselector.title");
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/charselector.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: `${title}` },
      content: dialogHTML,
      buttons: [
        {
          action: "confirm",
          label: title,
          class: "dialog-button-ok",
          callback: (event, button, target) => {
            const formdata = new foundry.applications.ux.FormDataExtended(button.form);
            const { selectedcharacteristic } = formdata.object;
            resolve(selectedcharacteristic);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve([])
        }
      ],
      close: () => resolve([])
    }).render(true);
  });
}
export async function _triggerChoice(entryArray, grantedItems, selectionType)
{
  let validOptions;
  let isAdvancedOption;
  if(selectionType === "skill"){
    validOptions = entryArray.filter(option =>{
    const alreadyHasSkill = grantedItems.some(b=>b.id === option.id);
    if (option.isAdvanced) {isAdvancedOption = true; return true;}
    return !alreadyHasSkill;
  });
  } else {
    validOptions = entryArray.filter(uuid => {
      const alreadyHasItem = grantedItems.some(b=>b.uuid === uuid);
      return !alreadyHasItem;
    })
  }
  if (validOptions.length === 0) {
    console.log("No valid choices left in this pool. Auto-skipping.");
    return "none"; // Or return a fallback string
  }
  const itemType = selectionType;
  const isString = typeof validOptions[0] === "string";
  const optionsWithLabels = validOptions.map(option =>{
    if(isString){
      const lastpart = option.split(".").pop();
      const docname = fromUuidSync(option)?.name || option.split(".").pop();
      return {
        id:option,
        label: docname
      };
    } else {
      return {
        ...option,
        label: game.i18n.localize(`sys-const.skills.${option.id}`)
      };
    }
  })
  const templateData = {
    isAdvanced: isAdvancedOption,
    type: game.i18n.localize(`TYPES.Item.${itemType}.label`),
    options: optionsWithLabels
  };
  const title = game.i18n.localize(`global.itemselector.${selectionType}.title`) || "Select a Thing";
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/itemselector.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: `${title}` },
      content: dialogHTML,
      buttons: [
        {
          action: "submit",
          label: "Confirm",
          class: "dialog-button-ok",
          callback: (event, button, target) => {
            const formdata = new foundry.applications.ux.FormDataExtended(button.form);
            const choice = formdata.object.selectedItem;
            resolve(choice);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve("")
        }
      ],
      close: () => resolve("")
    }).render(true);
  });
}
/**
 * @param {Array} arrayofdata the list of specialized skills already on the character.
 * @param {String} choice the parent skill
 * @param {Number} Level defaults to 1. the new level for the skill spec (should be 1 or 2 for adv skills)
 * @returns {Promise<String>} either returns the ID of the old skill concat with "id:", or a string of the new choice.
 */
export async function _triggerSpecChoice(arrayofdata, choice, level = 1)
{
  if(level < 0 || level > 4) return;
  //if(!arrayofdata) return;
  if(!choice || (choice !== "scholasticLore" && choice !== "forbiddenLore" && choice !== "commonLore")) return false;

  const currentSpecialized = arrayofdata.filter(a => (a.parentSkillName && a.parentSkillName === choice));
  console.log(currentSpecialized);
  // this should filter out anything that wouldnt be able to take the level up.
  const levelFiltered = currentSpecialized.filter(a => (a.value + 1) == level);
  console.log(level, levelFiltered);
  const optionsWithLabels = levelFiltered.map(option =>({id: option.id, label: option.readable, sub: option.subSpecialtyName}));
  const title = game.i18n.localize("global.skillselector.title");
  const templateData = {
    options: optionsWithLabels,
    parentSkill: game.i18n.localize(`sys-const.skills.${choice}`)
  }
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/specializedskillselector.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: `${title}` },
      content: dialogHTML,
      buttons: [
        {
          action: "submit",
          label: "Confirm",
          class: "dialog-button-ok",
          callback: (event, button, target) => {
            const formdata = new foundry.applications.ux.FormDataExtended(button.form);
            console.log(formdata);
            const submittedLabel = formdata.object.tempStorage;
            const matchedOption = optionsWithLabels.find(opt => opt.label === submittedLabel);
            let skillData = {
              parent: "",
              name: "",
              id: ""
            };
            let Id = "";
            if(matchedOption)
            {
              Id = matchedOption.id;
              skillData = {
                parent: choice,
                name: matchedOption.sub,
                id: Id
              }
            } else {
              Id = foundry.utils.randomID();
              skillData = {
                parent: choice,
                name: submittedLabel,
                id: Id
              };
            }

            resolve(skillData);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve({})
        }
      ],
      close: () => resolve({})
    }).render(true);
  });
}
/**
 * THIS FUNCTION DOES NOT CLAMP THE TOTAL MODIFIER
 * @param {RollOption[]} options list of RollOptions 
 * @returns 
 */
export async function calculateModifier(options) {
  if (!options) return 0;
  console.log(options);
  let runningTotal = 0;
  for (const option of options) {
    let prefix = "attack:modifier:"
    let option = options.find(e=> "attack-modifier".includes(e.id))
    if(option)
    {
      const key = option.id;
      const value = option.value;
      if(option.includes("firemode")) {
        runningTotal += Number(FIREMODE_MANIFEST[value].value)
      } else if (option.includes("range-increment")){
        runningTotal += Number(RANGE_MANIFEST[value].value)
      }
    }
    option = options.find(e=>e.id.includes('target-size'));
    if(option)
    {
      const value = option.value;
      runningTotal += Number(SIZE_MANIFEST[value].value);
    }
  }
  return runningTotal;
}
/**
 * 
 * @param {String} message id of the chat message
 * @param {RollOption[]} auditOptions array of Objects representing the id-value pairs fo the auditable roll options
 * @returns {Promise<string[]>} of rollOptions
 */
export async function _displayAuditWindow(message, auditOptions) {
  console.log(message);
  console.log(auditOptions);
  const rollOptions = auditOptions;
  console.log(rollOptions);
  const templateData = {
    rollOption: rollOptions,
    "message-id": message.uuid
  }
  console.log(templateData);
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/rollOptionsAudit.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("global.roll-option-audit.headerLabel") },
      content: dialogHTML,
      position: {
        width: 555,  // Adjust width in pixels as needed
        height: 400  // Adjust max default height in pixels as needed
      },
      buttons: [
        {
          action: "close",
          label: "close",
          callback: () => resolve([])
        }
      ],
      close: () => resolve([])
    }).render(true);
  });
}
export async function _rollBaseDialog(Actor, testName, defaultmod = 0)
{
  let testNameLocal = testName;
  if(CHARACTERISTIC_MANIFEST[testName])
  {
    testNameLocal = game.i18n.localize(CHARACTERISTIC_MANIFEST[testName].key);
  } else if (SKILL_MANIFEST[testName]) {
    testNameLocal = game.i18n.localize(SKILL_MANIFEST[testName].key);
  }
  const headlabel = `${game.i18n.localize("global.baserolldialog.label.headerlabel")} ${testNameLocal}`;
  const templateData = {
    "header-label": headlabel,
  }
  const dialogHTML = await foundry.applications.handlebars.renderTemplate(`systems/fantasy-hammer/html/sheets/common/baseRollDialog.hbs`, templateData);
  console.log(dialogHTML);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: headlabel },
      content: dialogHTML,
      buttons: [
        {
          action: "roll",
          label: "Roll",
          class: "dialog-button-ok",
          callback: (event, button, target) => {
            const formData = new foundry.applications.ux.FormDataExtended(button.form);
            const results = [];
            console.log(formData, formData.object.rollModifier, formData.object.customModifier);
            results.push({id:`player-difficulty-band-modifier`,value:Number(formData.object.rollModifier)});
            results.push({id:`gm-difficulty-misc-modifier`,value:Number(formData.object.customModifier)});
            resolve(results);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve([])
        }
      ],
      close: () => resolve([])
    }).render(true);
  });
}
export async function _rollAttackDialog(attacker, defender, weapon, distance = -1) {
  const weaponType = game.i18n.localize(`sys-const.weapontype.${weapon.system.type}`);
  const weaponClass = game.i18n.localize(`sys-const.weaponclass.${weapon.system.class}`)
  const skillTest = weapon.system.class === "melee" ? game.i18n.localize(`sys-const.characteristic.weaponSkill`) : game.i18n.localize(`sys-const.characteristic.ballisticSkill`);
  const weaponRangeBracket = weapon.system.range;
  console.log(weapon.system.range);
  let weaponrange = "";
  if (distance != -1) {
    if (distance <= 2) {
      weaponrange = "pointblank";
    } else if (distance <= (0.5 * weaponRangeBracket)) {
      weaponrange = "short";
    } else if (distance <= weaponRangeBracket) {
      weaponrange = "standard";
    } else if (distance <= (weaponRangeBracket * 2)) {
      weaponrange = "long";
    } else if (distance <= (weaponRangeBracket * 4)) {
      weaponrange = "extreme";
    } else {
      ui.notifications.warn(`attempting attack beyond extreme range for ${weapon.name}.`);
      weaponrange = "outofrange";
    }
  }
  console.log(weapon.system.rateOfFire.single);
  console.log(weapon.system.rateOfFire.semi);
  console.log(weapon.system.rateOfFire.full);
  const templateData = {
    distance: distance,
    rangeIncrement: weaponrange,
    weaponName: weapon.name,
    notarget: defender == "void",
    target: defender,
    isMelee: (weapon.system.class === "melee"),
    semi: weapon.system.rateOfFire.semi,
    full: weapon.system.rateOfFire.full,
    single: weapon.system.rateOfFire.single,
    weaponClass: game.i18n.localize(`sys-const.weaponclass.${weapon.system.class}`),
    weaponType: game.i18n.localize(`sys-const.weapontype.${weapon.system.type}`),
    diffMod: game.i18n.localize(`sys-const.dialog.weaponAttackRoll.label.modifiers`),
    fullcombat: game.i18n.localize(`sys-const.dialog.weaponAttackRoll.label.full`),
    burstcombat: game.i18n.localize(`sys-const.dialog.weaponAttackRoll.label.semi`),
    semicombat: game.i18n.localize(`sys-const.dialog.weaponAttackRoll.label.single`)
  }
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/AttackRollDialog.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: `${weapon.name} ${skillTest} Test` },
      content: dialogHTML,
      buttons: [
        {
          action: "roll",
          label: "Roll Attack",
          class: "dialog-button-ok",
          callback: (event, button, target) => {
            const results = _processAttackFormData(button.form);
            resolve(results);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve([])
        }
      ],
      close: () => resolve([])
    }).render(true);
  });
}
export function _processAttackFormData(formElement) {
  const formData = new foundry.applications.ux.FormDataExtended(formElement);
  const data = formData.object;
  const rollOptions = [];
  console.log(data);
  if (data.firemode) {
    rollOptions.push(`attack:modifier:firemode:${data.firemode}`);
  }
  if (data.rangeincrement) {
    rollOptions.push(`attack:modifier:range-increment:${data.rangeincrement}`)
  }
  if (Number(data.customModifier)) {
    rollOptions.push(`attack:modifier:custom:${Number(data.customModifier)}`);
  }
  return rollOptions;
}
/**
 * iterates through every item on the provided actor, for any modifications to the provided characteristic, sums them all topgether, and returns it.
 * @param {String} characteristic to check for
 * @param {import("foundry-vtt").Actor} Actor to check on
 * @returns 
 */
export async function _getSkillModifiers(skill, Actor)
{
  for (const item of Actor.items)
  {
    if(item.system.customJSON)
    {
      try{
        const config = typeof item.system.customJSON === "string" ? JSON.parse(item.system.customJSON) : item.system.customJSON;
        const skillBlock = config.modifiers.find(e=>"skill" in e)
        if(skillBlock && Array.isArray(skillBlock)){
          const specSkill = skillBlock.skill.find(e => skill in e)
          if(specSkill)
          {
            const skillValue = specSkill[skill];
            const predicate = specSkill.predicate;
            if(predicate) console.log(predicate);
            totalmodifier =+ Number(skillValue);
          }
        }
      } catch (error)
      {

      }
    }
  }
  return 0;
}
/**
 * 
 * @param {import("foundry-vtt").Actor} Actor the actor to search for modifiers
 * @param {Object} thing the skill or characteristic to get the modifiers of in { type:"<string>", id:"<string>"}
 */
export async function _getModifiers(Actor, thing){
  //each thing is formatted like this 
  //{
  // type:skill
  // id:forbiddenLore.Daemonology
  //}
  let modifierArray = [];
  const id = thing.id;
  for(const item of Actor.items){
    if(thing.type === "characteristic"){
      modifierArray = _getCharMods(id, Actor);
    } else if(thing.type === "skill"){
      modifierArray = _getSkillMods(id, Actor);
    }
  }
  return modifierArray;
}
export async function _getCharMods(characteristic, Actor)
{
  let totalmodifier = [];
  for(const item of Actor.items){
    if(item.type === "talent") {
      //shouldnt modifiy characteristics, but imma leave this if just in case that changes in the future.
    } else if (item.type === "passion" || item.type === "weapon" || item.type === "armor" || item.type === "trait"){
      if(item.system.customJSON)
      {
        try{
          const config = typeof item.system.customJSON === "string" ? JSON.parse(item.system.customJSON) : item.system.customJSON;
          if(!config.modifiers) continue;
          const charBlock = config.modifiers.find(e => "characteristic" in e);
     
          if(charBlock.characteristic && Array.isArray(charBlock.characteristic)){
            
            const specchar = charBlock.characteristic.find(e => characteristic in e)
            if(specchar)
            {
              totalmodifier.push({
                id:`item-${item.type}-${item.system.customJSON.id}-modifier-${characteristic}`,
                value:specchar[characteristic]
              });
            }
          }
        } catch (error)
        {
          console.log(error);
        }
      }
    } else if (item.type === "archetype"){
      const archBonus = item.system.characteristicsBonus.find(e => characteristic in e)
      if(archBonus) totalmodifier.push({id:`item-archetype-${item.name}-modifier-${characteristic}`,value:Number(archBonus.value)});
    }
  }
  return totalmodifier;
} 
export async function _getSkillMods(skill, Actor)
{
  let exactSkill = [];
  const parsed = skill.split(".");
  if(parsed.length == 1)
  {
    exactSkill[0] = parsed[0].trim();
  } else {
    exactSkill[0] = parsed[0].trim();
    exactSkill[1] = parsed[1].trim();
  }
  let totalmodifier = [];
  for(const item of Actor.items){
    if(item.type === "talent") {
      if(item.system.modifiers.length === 0) continue;
      const mod = item.system.modifiers.find(e => e.targetKey === exactSkill[0]);
      if(mod)
      {
        totalmodifier.push({id:`talent-${item.name}-${skill}-modifier`,value:mod.modifierValue});
      }
      //shouldnt modifiy characteristics, but imma leave this if just in case that changes in the future.
    } else if (item.type === "passion" || item.type === "weapon" || item.type === "armor" || item.type === "trait"){
      if(item.system.customJSON)
      {
        try{
          const config = typeof item.system.customJSON === "string" ? JSON.parse(item.system.customJSON) : item.system.customJSON;
          const skillBlock = config.modifiers.find(e => "skill" in e);
          if(skillBlock && Array.isArray(skillBlock)){
            const thisSkill = skillBlock.skill.find(e => exactSkill[0] in e)
            if(thisSkill)
            {
              if(!thisSkill.special || thisSkill.special === exactSkill[1] || thisSkill.special === "all")
              {
                totalmodifier.push({
                  id: thisSkill.key,
                  value: thisSkill.value
                })
              }
            }
          }
        } catch (error)
        {

        }
      }
    }
  }
  return totalmodifier;
} 