const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;


import { executeD100Test, executeD100TestSilent } from "../../utils/system/rollEngine.mjs";
import { _targetedAttack, _rollAttackDialog, _selector, _triggerChoice, _triggerSpecChoice, _getModifiers, _rollBaseDialog } from "../../utils/system-helpers.mjs";
import { SKILL_MANIFEST, CHARACTERISTIC_MANIFEST, SYSTEM_ID } from "../../utils/sys-const.mjs";
import { AdvancementHandler } from "../../utils/system/advancementHandler.mjs";
import { InventoryHandler } from "../../utils/system/InventoryHandler.mjs";

export class CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    id: "character-sheet-id",
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
      //addArchetype: this._onAddArchetype,
      addSpecializedSkill: this._onAddSpecializedSkill,
      toggleSkillCheckbox: this._onToggleSkillCheckbox,
      rollCharacteristic: this._onRollCharacteristic,
      rollSkill: this._onRollSkill,
      toggleEquipped: this._toggleEquipment,
      toggleTalentExpand: this._onToggleTalentExpand,
      printToChat: this._onPrintToChat,
      openEmbeddedItem: this._onOpenEmbeddedItem,
      deleteEmbeddedItem: this._onDeleteEmbeddedItem,
      flipToPlay: this._onChangePlay,
      attackWith: this._onUseWeapon
    },
    //dragDrop: [{ dropSelector: ".talents-panel-section, .armor-droppable, .weapon-droppable" }]
  };
  static PARTS = {
    form: {
      template: "systems/fantasy-hammer/html/sheets/actors/charactersheet.html",
      scrollable: [".character-sheet-body"]
    }
  };
  static TABS = {
    characterTabs: {
      tabs: [
        { id: "attributes", label: "Attributes" },
        { id: "combat", label: "Combat" },
        { id: "psychic", label: "Psychic" },
        { id: "advancements", label: "Advancements" },
        { id: "biography", label: "Biography" },
        { id: "inventory", label: "Inventory" }
      ]
    }
  };
  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    const startingTab = options.isEditable ? "attributes" : "biography";
    options.tabs = {
      characterTabs: {
        initial: startingTab
      }
    };
    return options;
  }
  get title() {
    const localizedprefix = game.i18n.localize("TYPES.Actor.character.label");
    const actor = this.document;
    const itemName = actor.name;
    const headerBar = `${localizedprefix} | ${itemName}`;
    return headerBar;
  }
  async _onDrop(event) {
    event.preventDefault();
    if (!this.isEditable) return false;

    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return false;
    }
    const droppedItem = await Item.fromDropData(data);
    if (droppedItem.type == "archetype") {
      this._handleArchetype(event, data, droppedItem);
    }
    if (droppedItem.type == "talent") {
      this._handleTalent(event, data, droppedItem);
    }
    if (droppedItem.type == "trait") {
      this._handleTrait(event, data, droppedItem);
    }
    if (droppedItem.type == "passion") {
      this._handlePassion(event, data, droppedItem);
    }
    if (droppedItem.type == "weapon" || droppedItem.type == "armor" || droppedItem.type == "gear") {
      this._handleInventoryDrop(event, data, droppedItem);
    }
  }
  async _handleArchetype(event, data, droppedItem) {
    if (!this.document.system.characterCreationActive) {
      const warning = game.i18n.localize("global.warning.archetype.postcreation");
      ui.notifications.warn(`${this.document.name} ${warning}`);
      return false;
    }
    const dropped = droppedItem;

    const itemData = typeof droppedItem.toObject === 'function' ? droppedItem.toObject() : foundry.utils.deepClone(droppedItem);
    const currentEntry = this.document.items.find(item => item.type === "archetype");
    let spec = {
      parent: "",
      name: "",
      id: ""
    };
    let specSkills = itemData.system.skillBonus.filter(a => ["scholasticLore", "forbiddenLore", "commonLore"].includes(a.id));
    let currentBonusSpecs = [];
    let currentSpecs = foundry.utils.deepClone(this.document.system.skills.specializedSkills);
    let postChoice = [];
    for (const skillEntry of specSkills) {
      let skillArray = [...currentBonusSpecs, ...currentSpecs];
      spec = await _triggerSpecChoice(skillArray, skillEntry.id, skillEntry.isAdvanced ? 2 : 1)
      if (!spec || !spec.id) return false;
      const localized = game.i18n.localize(`sys-const.skills.${skillEntry.id}`);
      currentBonusSpecs.push({
        bonus: 0,
        id: spec.id,
        parentSkillName: skillEntry.id,
        readable: `${localized} (${spec.name})`,
        subSpecialtyName: spec.name,
        value: skillEntry.isAdvanced ? 2 : 1
      });
      postChoice.push({
        id: skillEntry.id,
        isAdvanced: skillEntry.isAdvanced,
        specialization: spec
      });
    }
    try {
      for (const entryArray of itemData.system.skillChoices) {
        const choice = await _triggerChoice(entryArray, itemData.system.skillBonus, "skill");
        if (!choice || choice.length == 0) return false;

        const selectedSkillConfig = entryArray.find(s => s.id === choice)
        const isAdvancedFlag = selectedSkillConfig?.isAdvanced ?? false;

        if (["scholasticLore", "forbiddenLore", "commonLore"].includes(choice)) {
          let skillChoices = [...this.document.system.skills.specializedSkills, ...choice];
          spec = await _triggerSpecChoice(skillChoices, choice, isAdvancedFlag ? 2 : 1);
          if (!spec || !spec.id) return false;
          choice = { id: choice, isAdvanced: isAdvancedFlag }
          postChoice.push({
            id: choice,
            isAdvanced: isAdvancedFlag,
            specialization: spec
          });
          continue;
        }
        postChoice.push({
          id: choice,
          isAdvanced: isAdvancedFlag,
        })
      }
      for (const entry of itemData.system.talentChoices) {
        const choice = await _triggerChoice(entry, itemData.system.talentsGranted, "talent");
        if (!choice || choice.length == 0) return false;
        itemData.system.talentsGranted.push(choice);

      }
      for (const entry of itemData.system.gearChoices) {
        const choice = await _triggerChoice(entry, itemData.system.gearGranted, "gear");
        if (!choice || choice.length == 0) return false;
        itemData.system.gearGranted.push(choice);
      }
    } catch (error) {
      console.log(`ERROR`);
    }


    itemData.system.skillBonus = itemData.system.skillBonus.filter(a => !["scholasticLore", "forbiddenLore", "commonLore"].includes(a.id))
    itemData.system.skillBonus = [...itemData.system.skillBonus, ...postChoice];


    let pendingAdvancements = [];
    let itemsToCreate = [];
    let skillspectocreate = [];

    const createdArchetypeDoc = await this.document.createEmbeddedDocuments("Item", [itemData]);
    const trueArchetypeDoc = createdArchetypeDoc[0];
    const trueArchetypeid = trueArchetypeDoc.id;

    for (const entry of itemData.system.talentsGranted) {
      const compendiumItem = await fromUuid(entry);
      if (!compendiumItem) throw new Error(`failed to resolve compendium item from uuid: ${entry}`);
      const preppedItem = compendiumItem.toObject();
      itemsToCreate.push(preppedItem);
      preppedItem.flags = foundry.utils.mergeObject(preppedItem.flags || {}, {
        [SYSTEM_ID]: { origin: trueArchetypeid }
      });
      pendingAdvancements.push({
        type: "talent",
        value: 0,
        identifier: entry,
        level: 1,
        origin: trueArchetypeid
      });
    }
    for (const entry of itemData.system.traitsGranted) {
      const compendiumItem = await fromUuid(entry);
      if (!compendiumItem) throw new Error(`failed to resolve compendium item from uuid: ${entry}`);
      const preppedItem = compendiumItem.toObject();
      itemsToCreate.push(preppedItem);
      preppedItem.flags = foundry.utils.mergeObject(preppedItem.flags || {}, {
        [SYSTEM_ID]: { origin: trueArchetypeid }
      });
    }
    for (const entry of itemData.system.skillBonus) {
      if (entry.specialization) {
        const skill = currentBonusSpecs.filter(a => a.id === entry.specialization.id);
        const localizedSkillname = game.i18n.localize(`sys-const.skills.${entry.specialization.parent}`);
        skillspectocreate.push({
          bonus: 0,
          id: entry.specialization.id,
          parentSkillname: entry.specialization.parent,
          readable: `${localizedSkillname} (${entry.specialization.name})`,
          subSpecialtyName: entry.specialization.name,
          value: entry.isAdvanced ? 2 : 1,
          origin: trueArchetypeid // <-- Tag it here!
        });
        pendingAdvancements.push({
          type: "skill",
          value: 0,
          identifier: `skill.${entry.id}.${entry.specialization.name}`,
          level: entry.isAdvanced ? 2 : 1,
          origin: trueArchetypeid
        });
        continue;
      }
      pendingAdvancements.push({
        type: "skill",
        value: 0,
        identifier: `skill.${entry.id}`,
        level: entry.isAdvanced ? 2 : 1,
        origin: trueArchetypeid
      });
    }
    for (const entry of itemData.system.gearGranted) {
      const compendiumItem = await fromUuid(entry);
      if (!compendiumItem) throw new Error(`failed to resolve compendium item from uuid: ${entry}`);
      const preppedItem = compendiumItem.toObject();
      preppedItem.flags = foundry.utils.mergeObject(preppedItem.flags || {}, {
        [SYSTEM_ID]: { origin: trueArchetypeid }
      });
      itemsToCreate.push(preppedItem);
    }
    if (currentEntry) {
      const documentInstance = currentEntry.value || currentEntry;
      const oldItemData = documentInstance.system;
      const currentSpecializedSkills = foundry.utils.deepClone(this.document.skills.specializedSkills);

      let pendingunadvancements = [];
      let pendingSkillChanges = [];
      let pendingdeleteditems = [documentInstance.id];
      for (const entry of oldItemData.skillBonus) {
        //hunt through skills to check for old skill ranks.
        pendingunadvancements.push({
          type: "skill",
          value: 0,
          identifier: `skill.${entry.id}`,
          level: entry.isAdvanced ? 2 : 1
        });
      }
      for (const entry of oldItemData.talentsGranted || []) {
        pendingunadvancements.push({
          type: "talent",
          value: 0,
          identifier: entry,
          level: 1
        });
      }
      for (const Item of this.document.items) {
        if (Item.type !== "talent" && Item.type !== "gear") continue;
        const itemDoc = Item.value || Item;
        const itemOrigin = itemDoc?.flags?.[SYSTEM_ID]?.origin;
        if (itemOrigin === documentInstance.id) {
          pendingdeleteditems.push(itemDoc.id);
        }
      }
      await this.document.update({ "system.skills.specializedSkills": newHighs });
      await AdvancementHandler.batchUnadvanceID(this.document, currentEntry.id);
      await this.document.deleteEmbeddedDocuments("Item", pendingdeleteditems);
    }

    const updatedspecs = [...currentSpecs, ...skillspectocreate];
    const highestValueSpecs = Object.values(
      updatedspecs.reduce((acc, currentItem) => {
        const existingItem = acc[currentItem.id];
        // If the id isn't in our accumulator yet, or if this new one has a higher value, keep it
        if (!existingItem || currentItem.value > existingItem.value) {
          acc[currentItem.id] = currentItem;
        }

        return acc;
      }, {})
    );
    //console.log(highestValueSpecs);
    await this.document.update({ "system.skills.specializedSkills": highestValueSpecs });
    console.log(pendingAdvancements);
    await AdvancementHandler.batchAdvance(this.document, pendingAdvancements);
    await this.document.createEmbeddedDocuments("Item", itemsToCreate);
    return true;
  }
  async _handlePassion(event, data, droppedItem) {
    if (!this.document.system.characterCreationActive) {
      const warning = game.i18n.localize("global.warning.passion.postcreation");
      ui.notifications.warn(`${this.document.name} ${warning}`);
      return false;
    }
    const itemData = typeof droppedItem.toObject === 'function' ? droppedItem.toObject() : foundry.utils.deepClone(droppedItem);
    if (!itemData) return false;
    const type = droppedItem.system.type;
    const currentEntry = this.document.items.find(item => {
      const documentInstance = item.value || item;
      return documentInstance.system.type === type;
    });
    let chosen = [];
    try {
      for (const entry of itemData.system.customJSON.modifiers) {
        for (const object of entry.characteristic) {
          if ("any" in object) {
            const choice = await _selector(chosen, object["any"]);
            if (choice.length == 0) return false;
            const value = object["any"];
            chosen.push(choice);
            delete object["any"];
            object[choice] = value;
          }
        }
      }
    } catch (error) {

    }
    if (currentEntry) {
      const documentInstance = currentEntry.value || currentEntry;
      await this.document.deleteEmbeddedDocuments("Item", [documentInstance.id]);
    }
    await this.document.createEmbeddedDocuments("Item", [itemData]);
    return true;
  }
  static async _onChangePlay(event, target) {
    event.preventDefault();

  }
  static async _onPrintToChat(event, target) {
    event.preventDefault();
    const itemId = target.closest(".item-row").getAttribute("data-item-id");
    const item = this.document.items.get(itemId);
    item.system.printToChat();
  }
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
    switch (item.type) {
      case "archetype":
        this._onAddArchetype(event, item)
        break;
      case "talent":
      case "trait":
        this._handleTalentTraitDrop(event, item);
        break;
      case "weapon":
      case "armor":
        this._handleInventoryDrop(event, item);
        break;
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
  static async _toggleEquipment(event, target) {
    event.preventDefault();
    const itemId = target.closest(".item-row").getAttribute("data-item-id");
    const gaineditem = this.document.items.get(itemId);
    if (!gaineditem) return;
    const isCurrentlyEquipped = gaineditem.system.equipped ?? false;
    const updates = {};
    updates[`system.equipped`] = !isCurrentlyEquipped;
    await gaineditem.update(updates);
  }
  async _handleInventoryDrop(event, data, item) {
    
    const dropped = await Item.fromDropData(item);
    if (!dropped) return false;
    const successfultest = await InventoryHandler._HandleDrop(this.document,item)
    if(!successfultest) return false;
    await this.document.createEmbeddedDocuments("Item", [dropped.toObject()]);
    ui.notifications.info(`Successfully added item: ${dropped.name} to inventory`);
    return true;
  }
  async _handleTrait(event, data, item) {
    const alreadyThere = this.document.items.some(existingItem => existingItem.uuid === item.uuid);
    if (alreadyThere) return false;
    await this.document.createEmbeddedDocuments("Item", [item.toObject()]);
    return true;
  }
  async _handleTalent(event, data, item) {
    // make sure we are not duplicating talents.
    const allowsDup = item.system.allowsDuplication === true;
    const isSpecialized = item.system.specialized === true;
    const targetSubName = item.system.specializationName?.trim() || "";

    if (!allowsDup) {
      const alreadyHasMatch = this.document.items.some(ownedItem => {
        if (ownedItem.name.toLowerCase() !== item.name.toLowerCase()) return false;
        if (isSpecialized) {
          return ownedItem.system.specializationName?.toLowerCase() === targetSubName.toLowerCase();
        }
        return true;
      });
      if (alreadyHasMatch) {
        const errorMsg = isSpecialized && targetSubName
          ? `This character already possesses the ${item.name} (${targetSubName}) specialization.`
          : `This character already possesses the ${item.name} talent/trait and cannot take it multiple times.`;
        ui.notifications.warn(errorMsg);
        return false;
      }
    }
    const gotItem = await Item.fromDropData(item);
    if (!gotItem) return false;
    const prereqList = gotItem.system.prerequisites || [];
    for (let req of prereqList) {
      if (req.type === "characteristic" && req.targetKey && req.minValue > 0) {
        const actorStat = this.document.system.characteristics[req.targetKey]?.value ?? 0;
        if (actorStat < req.minValue) {
          const charConfig = CHARACTERISTIC_MANIFEST[req.targetKey];
          const cleanName = charConfig ? game.i18n.localize(charConfig.key) : req.targetKey.toUpperCase();
          ui.notifications.error(
            `Prerequisite Failed: ${gotItem.name} requires a minimum ${cleanName} score of ${req.minValue}+ (Current: ${actorStat})`
          );
          return false;
        }
      }
      if (req.type === "talent" && req.targetKey) {
        const hasRequiredTalent = this.document.items.some(
          i => (i.type === "talent" || i.type === "trait") && i.name.toLowerCase() === req.targetKey.toLowerCase()
        );
        if (!hasRequiredTalent) {
          ui.notifications.error(
            `Prerequisite Failed: ${gotItem.name} requires the character to possess the "${req.targetKey}" talent/trait first.`
          );
          return false;
        }
      }
      if (req.type === "actorSubtype" && req.targetKey) {
        if (this.document.type !== req.targetKey) {
          ui.notifications.error(
            `Prerequisite Failed: The "${gotItem.name}" talent/trait is strictly restricted to ${req.targetKey} data sheets.`
          );
          return false;
        }
      }

    }
    await this.document.createEmbeddedDocuments("Item", [gotItem.toObject()]);

    ui.notifications.info(`Successfully added talent: ${gotItem.name}`);
    return true;
  }
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.tabs = this._prepareTabs("characterTabs");
    const hasActive = Object.values(context.tabs).some(t => t.cssClass === "active");
    if (!hasActive) {
      const defaultTab = this.isEditable ? "attributes" : "biography";
      if (context.tabs[defaultTab]) {
        context.tabs[defaultTab].cssClass = "active";
      }
    }
    return context;
  }
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options);

    context.actor = this.document;
    context.system = this.document.system;
    context.advancements = this.document.system.advancements;
    const rawCharacteristics = this.document.system.characteristics;
    context.isGM = game.user.isGM;
    const psycherTrait = this.document.items.find(e => {
      if (e.type !== "trait") return false;
      const json = e.system.customJSON;
      if(!json || !json.flags) return false;
      const flagObj = json.flags.find(f=> f && Object.hasOwn(f,"isPsyker"));
      if(flagObj){
        return true;
      }
      return json.flags.some(f=> f && Object.hasOwn(f,"isPysker"));
    });
    context.isPsyker = psycherTrait ? Boolean(psycherTrait.system.customJSON.flags.find(f => Object.hasOwn(f, "isPsyker"))?.isPsyker) : false;
    context.itemList = this.document.items;
    let calculatedCharacteristics = [];
    let calculatedSkills = [];
    let charBonusBonus = [];
    let collectedArmorItems = [];
    let collectedWeaponItems = [];
    let collectedTraitItems = [];
    let collectedTalentItems = [];
    let collectedArchetype = [];
    let collectedPride = [];
    let collectedMotivation = [];
    let collectedDisgrace = [];
    const calculatedArmor = {
      head: 0,
      leftarm: 0,
      body: 0,
      rightarm: 0,
      leftleg: 0,
      rightleg: 0,
    }
    for (const item of this.document.items) {
      if (item.type == "passion") {
        if (item.system.type == "pride") { collectedPride = item.id; }
        if (item.system.type == "motivation") { collectedMotivation = item.id; }
        if (item.system.type == "disgrace") { collectedDisgrace = item.id; }
        const data = item.system.customJSON;
        if (!data.modifiers || !Array.isArray(data.modifiers) || data.modifiers.length === 0) continue;
        for (const modifier of data.modifiers) {
          const characteristicArray = modifier?.characteristic ?? [];
          const skillArray = modifier?.skill ?? [];
          const playermod = modifier?.playermod ?? [];
          for (const characteristic of characteristicArray) {
            for (const [key, value] of Object.entries(characteristic)) {
              if (calculatedCharacteristics[key] === undefined) calculatedCharacteristics[key] = 0;
              calculatedCharacteristics[key] += Number(value);
            }
          }
          for (const skill of skillArray) {
            for (const [key, value] of Object.entries(skill)) {
              if (calculatedSkills[key] === undefined) calculatedSkills[key] = 0;
              calculatedSkills[key] += Number(value);
            }
          }
          for (const mod of playermod) {
            if (mod === "corruption") {

            } else if (mod === "wounds") {

            } else if (mod === "tohit") {

            }
          }
        }
      }
      if (item.type == "armor") {
        collectedArmorItems.push(item.id);
        if (!item.system.equipped) continue;
        for (const slot of Object.keys(calculatedArmor)) {
          const itemValue = item.system.coverage?.[slot];
          if (calculatedArmor[slot] < itemValue) {
            calculatedArmor[slot] = itemValue;
          }
        }
      }
      if (item.type == "weapon") collectedWeaponItems.push(item.id);

      if (item.type == "talent") collectedTalentItems.push(item.id);

      if (item.type == "trait") collectedTraitItems.push(item.id);

      if (item.type == "archetype") {
        collectedArchetype = item.id;
        const data = item.system.characteristicsBonus;
        for (const entry of data) {
          if (calculatedCharacteristics[entry.characteristic] === undefined) calculatedCharacteristics[entry.characteristic] = 0;
          calculatedCharacteristics[entry.characteristic] += entry.value;
        }
      }
    }
    context.archetypeItem = this.actor.items.get(collectedArchetype);
    context.prideItem = this.actor.items.get(collectedPride);
    context.motivationItem = this.actor.items.get(collectedMotivation);
    context.disgraceItem = this.actor.items.get(collectedDisgrace);
    context.armorItems = collectedArmorItems
      .map(id => this.actor.items.get(id))
      .filter(Boolean);
    context.weaponItems = collectedWeaponItems
      .map(id => this.actor.items.get(id))
      .filter(Boolean);;
    context.talentItems = collectedTalentItems
      .map(id => this.actor.items.get(id))
      .filter(Boolean);;
    context.traitItems = collectedTraitItems
      .map(id => this.actor.items.get(id))
      .filter(Boolean);;
    context.calcArmor = calculatedArmor;
    context.isCreationActive = this.document.system.characterCreationActive;
    context.isEditable = this.isEditable;
    context.characteristicsList = Object.entries(CHARACTERISTIC_MANIFEST).map(([charkey, config]) => {
      const dbRecord = rawCharacteristics[charkey];
      const scoreValue = dbRecord?.value ?? 0;;
      const finalValue = scoreValue + (calculatedCharacteristics[charkey] || 0);
      const translatedName = game.i18n.localize(config.key);
      const translatedShort = game.i18n.localize(config.short);
      return {
        key: charkey,
        name: translatedName,
        short: translatedShort,
        baseValue: scoreValue,
        displayValue: finalValue,
        bonus: Math.floor(finalValue / 10) + (charBonusBonus[charkey] || 0)
      }
    });
    let advancements = [];
    for (const entry of this.document.system.advancements) {
      if (entry.type === "talent") {
        let talent = await fromUuid(entry.identifier);
        if (!talent) continue;
        const origin = entry.value == 0 ? " (CC)" : "";
        let name = `${talent.name} to Level ${entry.level}${origin}.`
        advancements.push({
          type: entry.type,
          name: name,
          value: entry.value
        });

      } else if (entry.type === "characteristic") {
        let characteristic = entry.identifier.split(".").pop();
        const origin = entry.value == 0 ? " (CC)" : "";
        let level = AdvancementHandler.calculateLevel(entry.level, "characteristic");
        let previous = AdvancementHandler.calculateLevel(entry.level - 1, "characteristic");
        let name = `${skill} advanced from ${previous} to ${level}${origin}`;
        advancements.push({
          type: entry.type,
          name: name,
          value: entry.value
        });

      } else if (entry.type === "skill") {
        let skill = entry.identifier.split(".").pop();
        const origin = entry.value == 0 ? " (CC)" : "";
        let level = AdvancementHandler.calculateLevel(entry.level, "skill");
        let previous = AdvancementHandler.calculateLevel(entry.level - 1, "skill");
        let name = `${skill} advanced from ${previous} to ${level}${origin}`;
        advancements.push({
          type: entry.type,
          name: name,
          value: entry.value
        });

      } else {
        console.log(`malformed advancement in sheet ${this.document}`);
        continue;
      }
      //console.log(entry);
    }
    context.advancements = advancements;
    const rawSkills = this.document.system.skills;
    let displaySkills = [];
    context.displaySkills = Object.entries(SKILL_MANIFEST)
      .filter(([skillkey]) => !["forbiddenLore", "scholasticLore", "commonLore"].includes(skillkey))
      .map(([skillkey, config]) => {
        const dbRecord = rawSkills[skillkey];
        const currentValue = (dbRecord?.value) ?? 0;
        const currentBonus = ((dbRecord?.value || 0) + (calculatedSkills[skillkey] || 0)) ?? 0;
        const translatedName = game.i18n.localize(config.key);

        const shortLabel = CHARACTERISTIC_MANIFEST[config.char] ?
          game.i18n.localize(CHARACTERISTIC_MANIFEST[config.char].short) :
          "-";

        const checkBoxList = [];
        for (let i = 1; i <= 4; i++) {
          checkBoxList.push({
            level: i,
            isChecked: i <= currentValue
          })
        }
        let baseScore = (config.char === "none") ? 0 : context.system.characteristics[config.char]?.value ?? 0;
        let trainingBonus = (currentValue > 1) ? (currentValue - 1) * 10 : (currentValue === 0 ? -20 : 0);
        const computedTarget = baseScore + trainingBonus + currentBonus;
        return {
          propertyKey: skillkey,
          parent:skillkey,
          label: translatedName,
          isCustom: false,
          customId: null,
          characteristic: config.char,
          shortCharacteristic: shortLabel,
          value: currentValue,
          bonus: currentBonus,
          checkboxes: checkBoxList,
          targetNumber: Math.max(1, Math.min(100, computedTarget))
        }
      });

    const customSkills = rawSkills.specializedSkills || [];
    for (let customSkill of customSkills) {
      const parentKey = customSkill.parentSkillName; // e.g. "forbiddenLore"

      const parentConfig = SKILL_MANIFEST[parentKey];
      const linkedCharKey = parentConfig ? parentConfig.char : "intelligence";


      const shortLabel = CHARACTERISTIC_MANIFEST[linkedCharKey]
        ? game.i18n.localize(CHARACTERISTIC_MANIFEST[linkedCharKey].short)
        : "-";

      const currentLevel = customSkill.value || 0;
      const checkboxList = Array.from({ length: 4 }, (_, i) => ({
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
      if (!friendlyLabel || friendlyLabel.trim() === "") {
        const parent = parentConfig ? game.i18n.localize(parentConfig.key) : parentKey;
        friendlyLabel = `${parent} (${customSkill.subSpecialtyName})`;
      }
      //const friendlyLabel = customSkill.readable || `${game.i18n.localize(parentConfig?.key)} (${customSkill.subSpecialtyName})`;

      // Push your custom skill right into the unified array!
      context.displaySkills.push({
        propertyKey: compositeKey,
        parent:parentKey,
        subname:customSkill.subSpecialtyName,
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
    context.sortedSkillsList = displaySkills.sort((a, b) => a.label.localeCompare(b.label));

    console.log(context);
    return context;
  }
  _onRender(context, options) {
    super._onRender(context, options);
  }
  static async _onDeleteSpecializedSkill(event, target) {
    event.preventDefault();

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
  static async _onAddSpecializedSkill(event, target) {
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
    // 7. Execute the transaction database update
    await this.document.update({ "system.skills.specializedSkills": currentList });

    ui.notifications.info(`Successfully added skill: ${finalSubName}`);
    return true;
  }
  static async _onToggleSkillCheckbox(event, target) {
    event.stopPropagation();

    const container = target.closest(".skill-training-boxes");
    const isCustom = container.getAttribute("data-is-custom") === "true";
    if (!container) return false;
    const skillKey = container.getAttribute("data-skill");

    // get data level for the clicked box
    const clickedLevel = parseInt(target.getAttribute("data-level"));

    // get the level of the skill
    let currentLevel = foundry.utils.getProperty(this.document, `system.skills.${skillKey}.value`) ?? 0;

    let newLevel = clickedLevel;

    if (isCustom) {
      const customId = container.getAttribute("data-custom-id");
      const specizlizedList = foundry.utils.deepClone(this.document.system.skills.specializedSkills) || [];
      const targetSkill = specizlizedList.find(s => s.id === customId);
      if (!targetSkill) return;

      currentLevel = targetSkill.value || 0;
      if (clickedLevel === currentLevel) newLevel = clickedLevel - 1;
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
  static async _onRollSkill(event, target) {
    event.preventDefault();
    const skillName = target.getAttribute("data-name");
    const isCustom = Boolean(target.getAttribute("data-is-custom"));
    const parentSkill = target.getAttribute("data-parent");
    const subName = target.getAttribute("data-subName");
    console.log(skillName,isCustom,parentSkill,subName);
    let modifiers = [];
    let testName;
    if(!isCustom){
      modifiers = await _getModifiers(this.document,{type:"skill",id:`${parentSkill}`});
      testName = `skill:${parentSkill}`;
    } else {
      modifiers = await _getModifiers(this.document, {type:"skill",id:`${parentSkill}.${subName}`});
      testName = `skill:${parentSkill}:${subName}`;
    }
    const premods = await _rollBaseDialog(this.document,`${skillName}`);
    modifiers = [...modifiers,...premods];
    await executeD100TestSilent(this.document,testName,modifiers);
  }
  static async _onRollCharacteristic(event, target) {
    event.preventDefault();
    const charName = target.getAttribute("data-name");
    console.log(charName);
    const premods = await _rollBaseDialog(this.document,charName);
    if(!premods || premods.length === 0) return false;
    let modifiers = await _getModifiers(this.document,{type:"characteristic",id:charName});
    modifiers = [...modifiers, ...premods];
    await executeD100TestSilent(this.document,`char:${charName}`,modifiers);
  }
  static async _onOpenEmbeddedItem(event, target) {
    event.preventDefault();
    const itemId = target.closest(".talent-item-row").getAttribute("data-item-id");
    const item = this.document.items.get(itemId);

    if (item) item.sheet.render(true); // Pops open the sub-item view configuration box tool
  }
  static async _onDeleteEmbeddedItem(event, target) {
    event.preventDefault();
    const itemId = target.closest(".item-row").getAttribute("data-item-id");

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
  static async _onUseWeapon(event, target) {
    const actor = this.actor;
    const selfToken = actor.token?.object || canvas.tokens.placeables.find(t => t.actor?.id === actor.id);
    let distance = 0;
    if (!selfToken) {
      ui.notifications.warn(`No Token found on mcurrent active map for ${actor.name}`);
    }
    const weaponID = target.closest(".character-weapon-item").getAttribute("data-item-id");
    if (!weaponID) return;
    const weapon = this.document.items.get(weaponID);
    const attacker = this.document;
    const attacktoken = game.user.targets.first() ? game.user.targets.first() : null;
    if (!attacktoken) {
      distance = 0;
    } else {
      const path = [
        { x: selfToken.center.x, y: selfToken.center.y },
        { x: attacktoken.center.x, y: attacktoken.center.y }
      ];
      distance = canvas.grid.measurePath(path).distance;
    }
    const targeted = !attacktoken ? "void" : attacktoken?.actor;
    const options = await _rollAttackDialog(attacker, targeted, weapon, distance);
    _targetedAttack(attacker, targeted, weapon, options);
  }
}