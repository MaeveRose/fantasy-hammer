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
  const traits = actorDocument.gatherTraits();
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
  const isSuccess = diceResult <= finalTargetNumber;
  const degreeDelta = Math.abs(finalTargetNumber - diceResult);
  const degreesCount = Math.floor(degreeDelta / 10);

  let outcomeMessage = "";
  if (isSuccess) {
    outcomeMessage = `<span style="color: #2b8a3e; font-weight: bold;">SUCCESS</span> with <strong>${degreesCount} Degrees</strong>`;
  } else {
    outcomeMessage = `<span style="color: #c92a2a; font-weight: bold;">FAILURE</span> with <strong>${degreesCount} Degrees</strong>`;
  }

  // 4. THE MASTER CHAT CARD TEMPLATE
  const chatContent = `
    <div class="my-system-chat-card" style="border: 1px solid #5c4e43; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px;">
      <h3 style="border-bottom: 2px solid #5c4e43; margin: 0 0 6px 0; padding-bottom: 2px; font-weight: bold;">${testName} Test</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.9rem;">
        <span>Base Target: <strong>${baseTarget}</strong></span>
        <span>Modifier: <strong>${totalCombinedModifier >= 0 ? '+' : ''}${totalCombinedModifier}</strong></span>
      </div>
      <div style="background: rgba(0,0,0,0.3); padding: 6px; text-align: center; border-radius: 3px; font-size: 1.1rem; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.05);">
        Final Target: <strong style="color: #ffbc00;">${finalTargetNumber}</strong> | Rolled: <strong style="color: #e0e0e0;">${diceResult}</strong>
      </div>
      <div style="text-align: center; font-size: 0.95rem;">
        ${outcomeMessage}
      </div>
    </div>
  `;

  // 5. Broadcast out to the global chat logs using the passed actor document instance
  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: actorDocument }),
    content: chatContent,
    roll: roll
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
  console.log(rollOptions);
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
  ]
  //_rollAttackDialog(attacking, options);
  console.log(options);
}
/**
 * 
 * @param {import ("foundry-vtt").Actor } attacker 
 * @param {import ("foundry-vtt").Actor } defender
 * @param {import ("foundry-vtt").weapon } weapon 
 * @param {Number} distance
 * @returns {Promise<string[]>} of rollOptions
 */
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
  if (data.rollModifier) {
    rollOptions.push(`attack:modifier:rof:${data.rollModifier}`);
  }
  if (Number(data.customModifier)) {
    rollOptions.push(`attack:modifier:custom:${Number(data.customModifier)}`);
  }
  return rollOptions;
}