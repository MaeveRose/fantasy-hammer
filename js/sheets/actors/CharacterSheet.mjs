const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

import { executeD100Test } from "../../utils/system-helpers.mjs";
import { SKILL_MANIFEST, CHARACTERISTIC_MANIFEST, PRIDE_MANIFEST, DISGRACE_MANIFEST, MOTIVATION_MANIFEST } from "../../utils/sys-const.mjs";

export class CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  #tabs;
  static DEFAULT_OPTIONS = {
    title: "FUCK SHIT MCGEE",
    classes: ["fantasy-hammer", "sheet", "actor"],     
    position:
    {
      width: 1012,
      height: 700
    },
    window: {
      icon: "fas fa-user-shield",
      resizable: true,
      minimizable: true,
    },
    tag: "form",
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      deleteSpecializedSkill: this._onDeleteSpecializedSkill,
      addSpecializedSkill: this._onAddSpecializedSkill,
      toggleSkillCheckbox: this._onToggleSkillCheckbox,
      rollCharacteristic: this._onRollCharacteristic,
      rollSkill: this._onRollSkill,
      toggleTalentExpand: this._onToggleTalentExpand,
      printToChat: this._onPrintToChat,

      openEmbeddedItem: this._onOpenEmbeddedItem,
      deleteEmbeddedItem: this._onDeleteEmbeddedItem,
      flipToPlay: this._onChangePlay,
    },
    dragDrop: [{ dropSelector: ".talents-panel-section" }]
  };
  get title(){
    const localizedprefix = game.i18n.localize("TYPES.Actor.character.label");
    const actor = this.document;
    const itemName = actor.name;
    const headerBar = `${localizedprefix} | ${itemName}`;
    return headerBar;
  }
  static PARTS = {
    form: {
      template: "systems/fantasy-hammer/html/sheets/actors/charactersheet.html",
      scrollable: [".sheet-body"] 
    }
  };
  static async _onChangePlay(event, target){
    event.preventDefault();

  }
  static async _onPrintToChat(event, target)
  {
    event.preventDefault();
    const itemId = target.closest(".js-talent-card").getAttribute("data-item-id");
    const item = this.document.items.get(itemId);

    item.system.printToChat();

    console.log(item.system);
  }
  //override
  static async _onToggleTalentExpand(event, target) {
    if (event.target.closest(".js-prevent-toggle") || event.target.closest("[data-action='deleteEmbeddedItem']") || event.target.closest("[data-action='openEmbeddedItem']")) {
      return;
    }

    event.preventDefault();
    const talentCard = target.closest(".js-talent-card");
    if (!talentCard) return;

    talentCard.classList.toggle("is-expanded");
  }
  async _onDropItem(event, data) {
    if (!this.isEditable) return false;
    const item = await Item.fromDropData(data);
    if (!item) return false;
    switch(item.type)
    {
      case "talent":
      case "trait":
        this._handleTalentTraitDrop(event, item);
        break;
      case "weapon":
      case "armor":
      case "spell":
      case "pride":
      case "disgrace":
      case "motivation":
      case "godgift":
      default:
        ui.notifications.warn(`The item type "${item.type}" does not have a drop handler configured yet.`);
        return false;
    }
  }
  async _handleTalentTraitDrop(event, item) {
  // make sure we are not duplicating talents.
    const allowsDup = item.system.allowsDuplication === true;
    const isSpecialized = item.system.specialized === true;
    const targetSubName = item.system.specializationName?.trim() || "";
    // If the talent explicitly allows duplication bypass duplicate check
    if (!allowsDup) {
      // Evaluate if the character already possesses a matching record
      const alreadyHasMatch = this.document.items.some(ownedItem => {
        // A. Verify the base talent name matches
        if (ownedItem.name.toLowerCase() !== item.name.toLowerCase()) return false;
        // B. RULE GATE 2: If it's specialized, block it ONLY if they have the exact same specialization name too!
        if (isSpecialized) {
          return ownedItem.system.specializationName?.toLowerCase() === targetSubName.toLowerCase();
        }
        // C. RULE GATE 3: If it's not specialized and doesn't allow duplication, block it entirely
        return true;
      });
      if (alreadyHasMatch) {
        const errorMsg = isSpecialized && targetSubName
        ? `This character already possesses the ${item.name} (${targetSubName}) specialization.`
        : `This character already possesses the ${item.name} talent/trait and cannot take it multiple times.`;
        ui.notifications.warn(errorMsg);
        return false; // Aborts the drag transaction instantly
      }
    }

    const gotItem = await Item.fromDropData(item);
    if (!gotItem) return false;
    // ... (Keep your item.type and duplicate validation checks identical here) ...

    // --- AUTOMATED MULTI-PREREQUISITE INTERCEPTOR LOOP ---
    const prereqList = gotItem.system.prerequisites || [];
    for (let req of prereqList) {
      // TYPE 1: Evaluation check for Core Characteristics (e.g. S 35, WP 35)
      if (req.type === "characteristic" && req.targetKey && req.minValue > 0) {
        const actorStat = this.document.system.characteristics[req.targetKey]?.value ?? 0;
        if (actorStat < req.minValue) {
          // Look up the clean name from your constants mapping tree to display a pristine error
          const charConfig = CHARACTERISTIC_MANIFEST[req.targetKey];
          const cleanName = charConfig ? game.i18n.localize(charConfig.key) : req.targetKey.toUpperCase();
          ui.notifications.error(
            `Prerequisite Failed: ${gotItem.name} requires a minimum ${cleanName} score of ${req.minValue}+ (Current: ${actorStat})`
          );
          return false; // HARD CEILING BRAKER: Halts the function and stops the drop transaction instantly!
        }
      }
      // TYPE 2: Evaluation check for Prior Talents or Traits (e.g. Requires Ambidextrous)
      if (req.type === "talent" && req.targetKey) {
        const hasRequiredTalent = this.document.items.some(
          i => (i.type === "talent" || i.type === "trait") && i.name.toLowerCase() === req.targetKey.toLowerCase()
        );
        if (!hasRequiredTalent) {
          ui.notifications.error(
            `Prerequisite Failed: ${gotItem.name} requires the character to possess the "${req.targetKey}" talent/trait first.`
          );
          return false; // HARD CEILING BRAKER: Aborts transaction
        }
      }
      // TYPE 3: Evaluation check for Character Sheet Sheet Subtype (e.g. Character vs NPC)
      if (req.type === "actorSubtype" && req.targetKey) {
        if (this.document.type !== req.targetKey) {
          ui.notifications.error(
          `Prerequisite Failed: The "${gotItem.name}" talent/trait is strictly restricted to ${req.targetKey} data sheets.`
          );
          return false; // HARD CEILING BRAKER: Aborts transaction
        }
      }

    }

    // 4. Transaction: Clone the data template straight into the Actor's database collection boundary
    // This updates the cloud, syncs clients, and auto-refreshes your sheet context view!
    await this.document.createEmbeddedDocuments("Item", [gotItem.toObject()]);
    
    ui.notifications.info(`Successfully added talent: ${gotItem.name}`);
    return true;
  } 
  // ... your getData() and activateListeners() methods live down here ...
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options);
   
    context.actor = this.document;
    context.system = this.document.system;
    const rawCharacteristics = this.document.system.characteristics;
    context.isGM = game.user.isGM;

    context.isCreationActive = this.document.system.characterCreationActive;
    context.isEditable = this.isEditable;
    context.characteristicsList = Object.entries(CHARACTERISTIC_MANIFEST).map(([charkey,config]) => {
      const dbRecord = rawCharacteristics[charkey];
      const scoreValue = dbRecord?.value ?? 0;
      const translatedName = game.i18n.localize(config.key);
      const translatedShort = game.i18n.localize(config.short);

      return{
         key: charkey,
         name: translatedName,
         short: translatedShort,
         value: scoreValue,
         bonus: Math.floor(scoreValue/10)
      }
    });
     
    const rawSkills = this.document.system.skills;
    let displaySkills = [];
    context.displaySkills = Object.entries(SKILL_MANIFEST).map(([skillkey,config]) =>{
      const dbRecord = rawSkills[skillkey];
      const currentValue = dbRecord?.value ?? 0;
      const currentBonus = dbRecord?.value ?? 0;
      const translatedName = game.i18n.localize(config.key);

      const shortLabel = CHARACTERISTIC_MANIFEST[config.char] ?
       game.i18n.localize(CHARACTERISTIC_MANIFEST[config.char].short) :
        "-";
      
      const checkBoxList = [];
      for (let i = 1; i <= 4; i++)
      {
        checkBoxList.push({
          level:i,
          isChecked: i <= currentValue
        })
      }
      let baseScore = (config.char === "none") ? 0 : context.system.characteristics[config.char]?.value ?? 0;
      let trainingBonus = (currentValue > 1) ? (currentValue - 1) * 10 : (currentValue === 0 ? -20 : 0);
      const computedTarget = baseScore + trainingBonus + currentBonus;
      return{
        propertyKey:skillkey,
        label:translatedName,
        isCustom:false,
        customId:null,
        characteristic: config.char,
        shortCharacteristic:shortLabel,
        value:currentValue,
        bonus:currentBonus,
        checkboxes:checkBoxList,
        targetNumber: Math.max(1, Math.min(100, computedTarget))
      }
    });

    const customSkills = rawSkills.specializedSkills || [];
    const prideOptions = Object.entries(PRIDE_MANIFEST).map(([slug,data])=>({
      id:slug,
      label:game.i18n.localize(slug)
    }));
    const motivationOptions = Object.entries(MOTIVATION_MANIFEST).map(([slug,data])=>({
      id:slug,
      label:game.i18n.localize(slug)
    }));
    const disgraceOptions = Object.entries(DISGRACE_MANIFEST).map(([slug,data])=>({
      id:slug,
      label:game.i18n.localize(slug)
    }));
    for (let customSkill of customSkills) {
      const parentKey = customSkill.parentSkillName; // e.g. "forbiddenLore"
      
      const parentConfig = SKILL_MANIFEST[parentKey];
      const linkedCharKey = parentConfig ? parentConfig.char : "intelligence";

      
      const shortLabel = CHARACTERISTIC_MANIFEST[linkedCharKey]
        ? game.i18n.localize(CHARACTERISTIC_MANIFEST[linkedCharKey].short)
        : "-";
      
      const currentLevel = customSkill.value || 0;
      const checkboxList = Array.from({length: 4}, (_, i) => ({ 
        level: i + 1, 
        isChecked: (i + 1) <= currentLevel 
      }));

      let baseScore = (linkedCharKey === "none") 
        ? 0 
        : (context.system.characteristics[linkedCharKey]?.value ?? 0);
    
      let trainingBonus = (currentLevel > 1) ? (currentLevel - 1) * 10 : (currentLevel === 0 ? -20 : 0);
      const computedTarget = baseScore + trainingBonus + customSkill.bonus;

      // We assign it a custom key signature format so your checkbox events can identify it
      const compositeKey = `custom-${customSkill.id}`;

      // Use your new dynamic 'readable' property string saved during item dialog creation!
      // Fall back to a raw text reconstruction just in case of stale historical test data
      let friendlyLabel = customSkill.readable;
      if (!friendlyLabel || friendlyLabel.trim() === "")
      {
        const parent = parentConfig ? game.i18n.localize(parentConfig.key) : parentKey;
        friendlyLabel = `${parent} (${customSkill.subSpecialtyName})`;
      }
      //const friendlyLabel = customSkill.readable || `${game.i18n.localize(parentConfig?.key)} (${customSkill.subSpecialtyName})`;

      // Push your custom skill right into the unified array!
      context.displaySkills.push({
        propertyKey: compositeKey,
        label: friendlyLabel,
        isCustom: true,
        customId: customSkill.id,
        characteristic: linkedCharKey,
        shortCharacteristic: shortLabel,
        value: currentLevel,
        bonus: customSkill.bonus,
        checkboxes: checkboxList,
        targetNumber: Math.max(1, Math.min(100, computedTarget))
      });      
    }

    // 3. UNIFIED ALPHABETICAL SORT: Organizes standard and custom skills together flawlessly
    context.sortedSkillsList = displaySkills.sort((a, b) => a.label.localeCompare(b.label));
    
    return context;
  }
 
  _onRender(context, options) {
    super._onRender(context, options);
    //if you can edit, you get punted to attributes when you first open the page, otherwise the biography tab
    const startingTab = this.isEditable ? "attributes" : "biography";

    this.#tabs = new foundry.applications.ux.Tabs({
      navSelector: ".character-sheet-tabs", 
      contentSelector: ".character-sheet-body", 
      initial: startingTab, 
      group: "actor-character-primary-tabs"
    });
    this.#tabs.bind(this.element);
  }
  static async _onDeleteSpecializedSkill(event, target) {
    event.preventDefault();
    //const trashBtn = event.target.closest(".js-delete-specialized-skill");
    //if (!trashBtn) return false; // Guard fallback

    //event.preventDefault();
    //event.stopPropagation();

    const customId = target.getAttribute("data-custom-id");
    const readableName = target.getAttribute("data-name");
    const dialog = `<p>Are you absolutely sure you want to delete ${readableName}?</p>`;
    
    const confirmDelete = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Are you sure?" },
      content: dialog
    })
    // Launch a modern prompt block to double-check their intent (stops accidental mouse slips!)
    //const confirmDelete = foundry.application.api.DialogV2.confirm(`Are you absolutely sure you want to delete ${readableName}?`);
    
    if (!confirmDelete) return; // Terminate early if they cancel

    // 1. Clone your active nested specializedSkills array dataset safely
    const currentList = foundry.utils.deepClone(this.document.system.skills.specializedSkills) || [];

    // 2. Java-style filtering: Construct a fresh list removing ONLY the matching record ID
    const updatedList = currentList.filter(skillRecord => skillRecord.id !== customId);

    // 3. Fire the database batch transaction update statement
    await this.document.update({ "system.skills.specializedSkills": updatedList });

    ui.notifications.info(`Successfully deleted skill: ${readableName}`);
    return;
  }
  static async _onAddSpecializedSkill(event, target)
  {
    event.preventDefault();

    const dialogHtml = `
      <div style="padding: 6px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-weight: bold;">Parent Skill Type:</label>
          <select name="parentChoice">
            <option value="forbiddenLore">Forbidden Lore</option>
            <option value="scholasticLore">Scholastic Lore</option>
            <option value="commonLore">Common Lore</option>
            <option value="trade">Trade</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-weight: bold;">Specialization Name:</label>
          <input type="text" name="subName" placeholder="e.g., Daemonology, Armourer, Underworld" autofocus />
        </div>
      </div>
    `;
    const formData = await foundry.applications.api.DialogV2.input({
      window: { title: "Add Custom Specialization" },
      content: dialogHtml,
      rejectClose: false, // If they close the window without clicking OK, it safely returns null instead of crashing
      ok: { label: "Create Skill" }
    });
    console.log(formData);
    if (!formData || !formData.subName || formData.subName.trim() === "") {
        ui.notifications.warn("Skill creation canceled or missing a name.");
      return true;
    }

    const chosenParent = formData.parentChoice;
    const finalSubName = formData.subName.trim();
    const skillConfig = SKILL_MANIFEST[chosenParent];

    const parentLocalized = skillConfig ? game.i18n.localize(skillConfig.key) : chosenParent;
    // 5. Clone your existing nested specializedSkills database collection array
    const currentList = foundry.utils.deepClone(this.document.system.skills.specializedSkills) || [];

    // 6. Build the fresh data payload matching your TypeDataModel SchemaField layout
    const freshSkillRecord = {
      id: foundry.utils.randomID(), 
      parentSkillName: chosenParent,
      subSpecialtyName: finalSubName,
      readable: `${parentLocalized} (${finalSubName})`,
      value: 0, // Starts at level 0 (untrained)
      bonus: 0
    };

    currentList.push(freshSkillRecord);
    console.log(this.document.system);
    // 7. Execute the transaction database update
    await this.document.update({ "system.skills.specializedSkills": currentList });

    ui.notifications.info(`Successfully added skill: ${finalSubName}`);
    return true;
  }
  static async _onToggleSkillCheckbox(event, target)
  {
    event.stopPropagation();

    console.log("event #onToggleSkillCheckbox Fired");

    //get parent and the skill it represents
    const container = target.closest(".skill-training-boxes");
    console.log(container);
    const isCustom = container.getAttribute("data-is-custom") === "true";
    if (!container) return false;
    const skillKey = container.getAttribute("data-skill");

    // get data level for the clicked box
    const clickedLevel = parseInt(target.getAttribute("data-level"));

    // get the level of the skill
    let currentLevel = foundry.utils.getProperty(this.document, `system.skills.${skillKey}.value`) ?? 0;

    let newLevel = clickedLevel;

    if(isCustom){
      const customId = container.getAttribute("data-custom-id");
      const specizlizedList = foundry.utils.deepClone(this.document.system.skills.specializedSkills) || [];
      const targetSkill = specizlizedList.find(s => s.id === customId);
      if(!targetSkill) return;

      currentLevel = targetSkill.value || 0;
      if(clickedLevel === currentLevel) newLevel = clickedLevel - 1;
      targetSkill.value = newLevel;
      await this.document.update({
        "system.skills.specializedSkills": specizlizedList
      });
      return;
    }
    // lower the level by 1 if they click the same one.
    if (clickedLevel === currentLevel) {
      newLevel = clickedLevel - 1;
    }
    
    const updates = {};
    updates[`system.skills.${skillKey}.value`] = newLevel;

    await this.document.update(updates);
    
    return true;
  }
  static async _onRollSkill(event, target)
  {
    event.preventDefault();
    const skillName = target.getAttribute("data-name");
    const targetScore = parseInt(target.getAttribute("data-target-number")) || 0;

    await executeD100Test(skillName, targetScore, this.document);
  }
  static async _onRollCharacteristic(event, target) {
      event.preventDefault();
      event.preventDefault();
      const charName = target.getAttribute("data-name");
    
      const targetScore = parseInt(target.closest(".characteristic-block").querySelector(".invisible-stat-input").value) || 0;

      await executeD100Test(charName, targetScore, this.document);  

  }
  static async _onOpenEmbeddedItem(event, target) {
    event.preventDefault();
    const itemId = target.closest(".talent-item-row").getAttribute("data-item-id");
    const item = this.document.items.get(itemId);
    
    if (item) item.sheet.render(true); // Pops open the sub-item view configuration box tool
  }
  static async _onDeleteEmbeddedItem(event, target) {
    event.preventDefault();
    const itemId = target.closest(".talent-item-row").getAttribute("data-item-id");
    const item = this.document.items.get(itemId);

    if (!item) return;

    // Crisp template literal backtick check prompt!

    const readableName = item.name;
    const dialog = `<p>Are you absolutely sure you want to delete ${readableName}?</p>`;
    
    const confirmDelete = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Are you sure?" },
      content: dialog
    })
    if (!confirmDelete) return;

    // Fire the embedded documents batch transaction update array
    await this.document.deleteEmbeddedDocuments("Item", [itemId]);
    ui.notifications.info(`Removed talent: ${item.name}`);
  }
}