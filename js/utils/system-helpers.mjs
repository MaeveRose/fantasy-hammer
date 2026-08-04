import { FIREMODE_MANIFEST, RANGE_MANIFEST, SIZE_MANIFEST } from "./sys-const.mjs";

export async function executeD100Test(testName, baseTarget, actorDocument) {
  // 1. Launch Foundry's native ApplicationV2 Dialog input window
  const dialogHtml = `
    <div style="padding: 6px; display: flex; flex-direction: column; gap: 8px;">
      <p style="margin: 0; font-size: 0.9rem;">Select the active difficulty adjustment for this <strong>${testName}</strong> test:</p>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label style="font-weight: bold;">Difficulty Modifier:</label>
        <select name="rollModifier">
          <option value="30">+30 (Trivial)</option>
          <option value="20">+20 (Easy)</option>
          <option value="10">+10 (Routine)</option>
          <option value="0" selected>+0 (Ordinary)</option>
          <option value="-10">-10 (Challenging)</option>
          <option value="-20">-20 (Difficult)</option>
          <option value="-30">-30 (Hard)</option>
        </select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label style="font-weight: bold;">Additional Modifier:</label>
        <input type="number" 
               name="customModifier" 
               placeholder="e.g., +5, -15" 
               value="0" 
               style="text-align: center;" />
        <small style="opacity: 0.6; font-style: italic;">Enter any situational bonuses or penalties here.</small>
      </div>
    </div>
  `;
  const traits = actorDocument.system.gatherRollOptions();
  const formData = await foundry.applications.api.DialogV2.input({
    window: { title: `${testName} Test Modifiers` },
    content: dialogHtml,
    rejectClose: false,
    ok: { label: "Execute Roll" }
  });

  if (!formData) return; // Exit cleanly if they cancel or close the window

  const chosenModifier = parseInt(formData.rollModifier) || 0;

  const customModifier = parseInt(formData.customModifier) || 0;
  const rawCombinedModifier = chosenModifier + customModifier;
  // Clamp the final score safely between standard 1 and 100 game rule boundaries
  const totalCombinedModifier = Math.max(-60, Math.min(60, rawCombinedModifier));

  const hitModifierCap = rawCombinedModifier !== totalCombinedModifier;

  if (hitModifierCap) {
    // Displays a sleek, native warning card in the upper right corner of the screen
    ui.notifications.warn(
      `Total test modifier (${rawCombinedModifier >= 0 ? '+' : ''}${rawCombinedModifier}) exceeded rule limits. Clamped to ${totalCombinedModifier >= 0 ? '+' : ''}${totalCombinedModifier}.`
    );
  }

  const finalTargetNumber = Math.max(1, Math.min(100, baseTarget + totalCombinedModifier));

  // 2. Fire the asynchronous d100 Roll transaction
  const roll = await new Roll("1d100").evaluate();
  const diceResult = roll.total;
  
  // 3. THE UNIFIED WARHAMMER MATH ENGINE
  let isSuccess = diceResult <= finalTargetNumber;
  if (diceResult <= 5) isSuccess = true;
  if (diceResult >= 95) isSuccess = false;
  const degreeDelta = Math.abs(finalTargetNumber - diceResult);
  let degreesCount = Math.floor(degreeDelta / 10);
  if(isSuccess) {
    if (diceResult > finalTargetNumber) {
      degreesCount = 1;
    } else {
      degreesCount = Math.max(1, degreesCount);
    }
  } else {
    if (diceResult <= finalTargetNumber) {
      degreesCount = 1;
    } else {
      degreesCount = Math.max(1, degreesCount);
    }
  }
  let outcomeMessage = "";
  if (isSuccess) {
    if (diceResult <= 5) {
      outcomeMessage = `<span class = "critical-success">CRITICAL SUCCESS</span> with <strong>${degreesCount} Degrees</strong>`;
    } else {
      outcomeMessage = `<span class = "success">SUCCESS</span> with <strong>${degreesCount} Degrees</strong>`;
    }
  } else { 
    if (diceResult >= 95) {
      outcomeMessage = `<span class="critical-failure">CRITICAL FAILURE</span> with <strong>${degreesCount} Degrees</strong>`;
    } else {
      outcomeMessage = `<span class="failure">FAILURE</span> with <strong>${degreesCount} Degrees</strong>`;
    }
  }

  // 4. THE MASTER CHAT CARD TEMPLATE
  const chatContent = `
    <div class="fantasy-hammer-chat-content">
      <span class = "chat-box-test-result-header">${testName} Test</span]>
      <div class = "target-modifier-wrapper">
        <span>Base Target: <strong>${baseTarget}</strong></span>
        <span>Modifier: <strong>${totalCombinedModifier >= 0 ? '+' : ''}${totalCombinedModifier}</strong></span>
      </div>
      <div class = "final-target-results">
        Final Target: <strong style="color: #ffbc00;">${finalTargetNumber}</strong> | Rolled: <strong style="color: #e0e0e0;">${diceResult}</strong>
      </div>
      <div class="outcome-message">
        ${outcomeMessage}
      </div>
    </div>
  `;

  // 5. Broadcast out to the global chat logs using the passed actor document instance
  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: actorDocument }),
    content: chatContent,
    roll: roll,
    flags: {
      "fantasy-hammer": {
        rollOptions: traits
      }
    }
  });
}
export async function _printToChat(item, actorDocument) {
  //probably wont be used?
}
/**
* takes the attacker, defender weaponItem and rollOptions and runs the d100 test to determine if the attack hits or not.
* @param {import("foundry-vtt").Actor|uuid} attacker
* @param {import("foundry-vtt").Actor|uuid} defender
* @param {import("foundry-vtt").Weapon|uuid} weaponItem
* @param {string[]} [rollOptions =[]]
* @returns {Promise<void>} 
* @throws {Error} if the attacker or defender type cannot resolve to an Actor, or if the weapon cannot resolve to a Weapon
*
**/
export async function _targetedAttack(attacker, defender, weaponItem, rollOptions = []) {
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
            const choice = formdata.object.selectedSkill;
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
export async function calculateModifier(options) {
  if (!options) return 0;
  console.log(options);
  let runningTotal = 0;
  for (const option of options) {
    let prefix = "attack:modifier:"
    if (option.includes(prefix)) {
      let index = option.indexOf(prefix)
      const substring = option.substring(index + prefix.length);

      const key = substring.substring(0, substring.indexOf(":"));
      const value = substring.substring(substring.indexOf(":") + 1);
      if (key == "firemode") {
        console.log(FIREMODE_MANIFEST[value]);
        runningTotal += Number(FIREMODE_MANIFEST[value].value);
      }
      if (key == "range-increment") {
        runningTotal += Number(RANGE_MANIFEST[value].value);
      }
    }
    prefix = "target:size:";
    if (option.includes(prefix)) {
      const value = option.substring(option.indexOf(prefix) + prefix.length);
      const manifest = SIZE_MANIFEST;
      console.log(manifest);
    }
  }
  return runningTotal;
}
/**
 * 
 * @param {import ("foundry-vtt").Actor } attacker 
 * @param {import ("foundry-vtt").Actor } defender
 * @param {import ("foundry-vtt").weapon } weapon 
 * @param {Number} distance
 * @returns {Promise<string[]>} of rollOptions
 */
export async function _displayAuditWindow(message, auditOptions, modifiers) {
  console.log(message);
  console.log(auditOptions);
  console.log(modifiers);
  let rollOptions = {};

  for (const option of auditOptions) {
    const lastColonIndex = option.lastIndexOf(":");
    let key;
    let value;
    if (lastColonIndex == -1) {
      key = option;
      value = "";
    } else {
      key = option.slice(0, lastColonIndex);
      value = option.slice(lastColonIndex + 1);
    }
    rollOptions[key] = value;
  }
  console.log(rollOptions);
  const templateData = {
    rollOption: Object.entries(rollOptions).map(([key, value]) => {
      return { key: key, value: value };
    }),
    "message-id": message.uuid
  }
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/rollOptionsAudit.hbs', templateData);
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("global.roll-option-audit.headerLabel") },
      content: dialogHTML,
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
  const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/rollDialog.hbs', templateData);
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