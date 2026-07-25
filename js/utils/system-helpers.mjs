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
export async function _printToChat(item, actorDocument)
{
  //probably wont be used?
}