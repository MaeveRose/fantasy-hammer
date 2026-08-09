import { CHARACTERISTIC_MANIFEST, SKILL_MANIFEST } from "../sys-const.mjs";
import { _getModifiers } from "../system-helpers.mjs";
/**
 * THIS FUNCTION WILL NOT DO ANY ROLL OPTIONS,
 * IT WILL HOWEVER, CLAMP MODIFIER TO +/- 60, UNLESS A SETTING DICTATES OTHERWISE.
 * it will return the result as an array.
 * @param {import("foundry-vtt").Actor} actorDocument the actor performing the test, not strictly needed 
 * @param {String} target {type:<skill/characteristic>,value:skillname/Charname}.
 * @param {RollOption[]} modifiers the array of RollOptions
 * @returns {Array[Boolean,Boolean,Number,Number]} [0]: true for success, false for failure. [1]:is true if it is a critical, [2] is the degrees of success, [3] is the rolledNumber
 */
export async function executeD100TestSilent(actorDocument, target, modifiers) {
  // 1. Launch Foundry's native ApplicationV2 Dialog input window
  if(!actorDocument || actorDocument.documentName !== "Actor") throw new Error(`${actorDocument} is not an actor, or is undefined`);
  
  const critWindow = game.settings.get("fantasy-hammer", "critwindow");
  const modcapped = !Boolean(game.settings.get("fantasy-hammer", "disablemodifiercap"));
  const modcappedhigh = game.i18n.localize("sys-const.roll.modcappedhigh");
  const modcappedlow = game.i18n.localize("sys-const.roll.modcappedlow");

  console.log(modifiers);
  const targetArray = target.split(":");
  const targetprefix = targetArray[0].trim(); // "skill","char","sskill"
  const targettype = targetArray[1].trim();
  const targetspec = targetArray[2].trim();
  let targetNumber = 0;
  let TESTNAME;
  let allModifiers = [];
  console.log(targetArray,targetprefix,targettype,targetspec);
  if(targetprefix === "skill"){
    const char = actorDocument.system.skills[targettype].characteristic
    targetNumber = actorDocument.system.characteristics[char].value;
    targetNumber += _skillRead(actorDocument.system.skills[targettype].value); // this is the NUMBER OF PIPS -> targetNumberModifier (0:-20, 1:0 etc.)
    console.log(targetNumber);
    if(typeof targetNumber !== "number") throw new Error(`target skill: ${target} does not exist or is malformed`);
    TESTNAME = game.i18n.localize(SKILL_MANIFEST[targettype].key);

  } else if(targetprefix === "sskill"){

    const targetSkill = actorDocument.system.skills.specializedSkills.find(e => e.subSpecialtyName === targetspec);
    if(!targetSkill) throw new Error(`target specialized skill: ${target} does not exist or is malformed`);
    const parentSkill = actorDocument.system.skills[targetSkill.parentSkill];
    if(!parentSkill) throw new Error(`target parent skill: ${target} does not exist or is malformed`);
    const characteristic = parentSkill.characteristic;
    console.log(targetSkill,parentSkill,characteristic);
    for(const entry of modifiers)
    {
      if(typeof entry.value !== "number") continue;
      targetNumber += Number(entry.value);
    }
    allModifiers = [...allModifiers, temp];
    TESTNAME = targetSkill.readable;

  } else if(targetprefix === "char"){
    targetNumber = Number(actorDocument.system.characteristics[targettype].value);
    console.log(targetNumber);
    if(typeof targetNumber !== "number") throw new Error(`target skill: ${target} does note exist or is malformed`);
    TESTNAME = game.i18n.localize(CHARACTERISTIC_MANIFEST[targettype].key);
  }
  let totalmod = 0;
  for(const entry of modifiers)
  {
    console.log(entry);
    totalmod += entry.value;
  }
  
  if(modcapped){
    if(totalmod > 60){
      totalmod = 60;
      ui.notifications.warn(`${modcappedhigh} ${totalmod}`);
    } else if(totalmod < -60){
      totalmod = -60
      ui.notifications.warn(`${modcappedlow} ${totalmod}`);
    }
  }
  let finalTargetNumber = targetNumber + totalmod;
  const roll = await new Roll("1d100").evaluate();
  const diceResult = roll.total;
  if(finalTargetNumber <= 0){
    finalTargetNumber = 0;
  } else if(finalTargetNumber > 100){
    finalTargetNumber = 100; 
  }
  
  let outcome;
  let isSuccess = diceResult <= finalTargetNumber;
  let isCrit = false;
  if(isSuccess){
    outcome = "success";
  } else {
    outcome = "failure";
  }

  if (diceResult <= 1+(critWindow-1)){
    isSuccess = true;
    outcome = "critical success";
    isCrit = true;
  }
  if (diceResult >= 100-(critWindow-1)){
    isSuccess = false;
    outcome = "critical failure";
    isCrit = false;
  }
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
  const TEST = game.i18n.localize("sys-const.rollresults.TEST");

  console.log(TESTNAME,TEST,targetNumber,finalTargetNumber,diceResult,outcome);
  const templateData = {
    testName: `${TESTNAME} ${TEST}`,
    degrees: `${degreesCount}`,
    baseTarget: `${targetNumber}`,
    totalCombinedModifier: totalmod,
    finalTargetNumber: `${finalTargetNumber}`,
    diceResult: `${diceResult}`,
    outcome: `${outcome}`

  }
  const chatContent = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/chatRoll.hbs', templateData);
  console.log(chatContent);
  // 5. Broadcast out to the global chat logs using the passed actor document instance
  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: actorDocument }),
    content: chatContent,
    roll: roll,
    flags:{
      "fantasy-hammer":{
        rollOptions: modifiers
      }
    }
  });
  return [isSuccess,isCrit,degreesCount,diceResult];
}
/**
 * @deprecated will be removed in later editions in favor of executeD100TestSilent()
 * @param {*} testName 
 * @param {*} baseTarget 
 * @param {*} actorDocument 
 * @returns 
 */
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
function _skillRead(number)
{
  switch (number){
    case 0:
      return -20;
    case 1:
      return 0;
    case 2:
      return 10;
    case 3:
      return 20;
    case 4:
      return 30;
    default:
      return -20;
  }
}