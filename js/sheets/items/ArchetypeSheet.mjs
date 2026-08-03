import { CHARACTERISTIC_MANIFEST, SKILL_MANIFEST } from "../../utils/sys-const.mjs";
import { GlobalJsonEditor } from "../../utils/GlobalEditor.mjs";

export class ArchetypeSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    #dragDrop;
    #tabs;
    #editor = null;
    static DEFAULT_OPTIONS = {
        id: "archetype-sheet",
        classes: ["fantasy-hammer", "sheet", "item", "archetype"],
        tag: "form",
        window: {
            resizable: true
        },
        position: {
            width: 750,
            height: 330
        },
        actions: {
            editImage: this._onEditImage,
            addBonusSkill: this._onAddBonusSkill,
            deleteBonusSkill: this._onDeleteBonusSkill,
            addSkillArray: this._onAddArray,
            addSkillArrayEntry: this._onAddArrayEntry,
            deleteSkillArrayEntry: this._onDeleteArrayEntry,
            deleteSkillArray: this._onDeleteArray,
            addChar: this._onAddChar,
            deleteChar: this._onDeleteChar,
            deleteFlatTalent: this._onDeleteFlatTalent,
            addTalentPool:this._onAddTalentPool,
            deleteTalentPoolEntry: this._onDeleteTalentPoolEntry,
            deleteTalentPool: this._onDeleteTalentPool,
            addGearPool: this._onAddGearPool,
            deleteFlatGear: this._onDeleteFlatGear,
            deleteGearPoolEntry: this._onDeleteGearPoolEntry,
            deleteGearPool:this._onDeleteGearPool
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        dragDrop: [{
            dragSelector: '[data-drag="true"]',
            dropSelector: '.drop-zone'
        }]
    };
    static PARTS = {
        form: {
            template: "systems/fantasy-hammer/html/sheets/items/archetypesheet.html"
        }
    };
    get title() {
        const localizedprefix = game.i18n.localize("TYPES.Item.archetype.label");
        const item = this.document;
        const itemName = item.name;
        const headerBar = `${localizedprefix} | ${itemName}`;
        return headerBar;
    }
    _onFirstRender(context, options) {
        super._onFirstRender(context, options);

        // Initialize Foundry's DragDrop class manually
        this._dragDropHandler = new foundry.applications.ux.DragDrop.implementation({
            dragSelector: ".item", // Change this to your draggable CSS class
            dropSelector: ".droppable", // Change this to your droppable container CSS class
            permissions: {
                dragstart: () => this.document?.isOwner && this.isEditable,
                drop: () => this.document?.isOwner && this.isEditable
            },
            callbacks: {
                //dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
        });
    }
    _onRender(context, options) {
        super._onRender(context, options);
        const htmlContainer = this.element;
        if (!htmlContainer) return;

        if (this.element && this._dragDropHandler) {
            this._dragDropHandler.bind(this.element);
        }
        const startingTab = "stats";
        this.#tabs = new foundry.applications.ux.Tabs({ 
            navSelector: ".archetype-sheet-tabs",
            contentSelector: ".archetype-body",
            initial: startingTab,
            group: "item-archetype-primary-tabs" 
        });
        this.#tabs.bind(this.element);
        
        GlobalJsonEditor.attach(this.element, this);
    }
    async _processSubmitData(event, form, formData) {
        GlobalJsonEditor.processSubmit(form, formData, "system.customJSON");
        return super._processSubmitData(event, form, formData);
    }
    async _onDragOver(event){
        //console.log(event)
    }
    async _handleGear(event, data, droppedItem)
    {
        const dropZone = event.target.closest(".gear-drop-zone");
        if (!dropZone) return false;

        const targetType = dropZone.dataset.targetType;
        if (targetType === "flat") {
            const path = "system.gearGranted";
            const currentList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path)) || [];
            if (currentList.includes(droppedItem.uuid)) return false;

            currentList.push(droppedItem.uuid);
            await this.document.update({ [path]: currentList });
            ui.notifications.info(`Starting Gear Added: ${droppedItem.name}`);
            
        }else if (targetType === "pool") {
            const poolIndex = parseInt(dropZone.dataset.poolIndex);
            if (isNaN(poolIndex)) return false;

            const path = "system.gearChoices";
            const currentTotalList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path)) || [];
            if (!currentTotalList[poolIndex]) currentTotalList[poolIndex] = [];

            currentTotalList[poolIndex].push(droppedItem.uuid);
            await this.document.update({ [path]: currentTotalList });
            ui.notifications.info(`Added to Pool #${poolIndex + 1}: ${droppedItem.name}`);
        }
    }
    async _handleTalent(event, data, droppedItem)
    {
        const dropZone = event.target.closest(".talent-drop-zone");
        if (!dropZone) return false;

        const targetType = dropZone.dataset.targetType;
        if (targetType === "flat") {
            const path = "system.talentsGranted";
            const currentList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path)) || [];
            if (currentList.includes(droppedItem.uuid)) return false;

            currentList.push(droppedItem.uuid);
            await this.document.update({ [path]: currentList });
            ui.notifications.info(`Granted Talent Added: ${droppedItem.name}`);
            
        }else if (targetType === "pool") {
            const poolIndex = parseInt(dropZone.dataset.poolIndex);
            if (isNaN(poolIndex)) return false;

            const path = "system.talentChoices";
            const currentTotalList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path)) || [];
            if (!currentTotalList[poolIndex]) currentTotalList[poolIndex] = [];

            currentTotalList[poolIndex].push(droppedItem.uuid);
            await this.document.update({ [path]: currentTotalList });
            ui.notifications.info(`Added to Pool #${poolIndex + 1}: ${droppedItem.name}`);
        }
    }
    async _handleTrait(event, data, droppedItem){
        const dropZone = event.target.closest(".trait-drop-zone");
        if (!dropZone) return false;
        const path = "system.traitsGranted";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path));
        if(currentList.includes(droppedItem.uuid)) return false;
        currentList.push(droppedItem.uuid);
        await this.document.update({[path]:currentList});
        ui.notifications.info(`Successfully added trait: ${droppedItem.name}`);
        return true;
    }
    async _onDrop(event){
        event.preventDefault();
        if (!this.isEditable) return false;

        let data;
        try { 
            data = JSON.parse(event.dataTransfer.getData("text/plain")); 
        } catch (err) { 
            return false; 
        }
        const droppedItem = await Item.fromDropData(data);
        if (!droppedItem || (droppedItem.type !== "gear" && droppedItem.type !== "talent" && droppedItem.type !== "trait")){ 
            ui.notifications.warn("You can only drop Talent, Trait, or Gear items here.");
            return false;
        }
        console.log(droppedItem.type);
        if (droppedItem.type == "gear"){
            this._handleGear(event, data, droppedItem)
        }
        if (droppedItem.type == "talent") {
            this._handleTalent(event, data, droppedItem)
        }
        if (droppedItem.type == "trait") {
            this._handleTrait(event, data, droppedItem)
        }
    }
    static async _onAddTalentPool(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const path = "system.talentChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];
        currentList.push([]); 
        await document.update({ [path]: currentList });
    }
    static async _onDeleteTalentPool(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const index = parseInt(target.dataset.poolIndex);
        const path = "system.talentChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this choice set?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        currentList.splice(index, 1);
        await document.update({ [path]: currentList });
    }
    static async _onDeleteTalentPoolEntry(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const poolIndex = parseInt(target.dataset.poolIndex);
        const optionIndex = parseInt(target.dataset.optionIndex);
        const path = "system.talentChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this Talent Entry?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        currentList[poolIndex].splice(optionIndex, 1);
        await document.update({ [path]: currentList });
    }
    static async _onDeleteFlatTalent(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const index = parseInt(target.dataset.index);
        const path = "system.talentsGranted";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this talent?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        console.log(currentList);
        currentList.splice(index, 1);
        await document.update({ [path]: currentList });
    }
    static async _onEditImage(event, target) {
        const field = target.dataset.field || "img";
        const current = foundry.utils.getProperty(this.document, field);

        // Manually trigger the FilePicker
        const fp = new foundry.applications.apps.FilePicker({
            type: "image",
            current: current,
            callback: path => {
                // Update the document data field directly
                this.document.update({ [field]: path });
            }
        });
        fp.browse();
    }
    async _preparePartContext(partId, context, options) {
        await super._preparePartContext(partId, context, options);
        context.item = this.document;
        context.system = this.document.system;
        context.isEditable = this.isEditable;
        context.isReadOnly = !this.isEditable;
        context.jsonString = JSON.stringify(this.document.system.customJSON, null, 2);
        context.fields = this.document.system.schema.fields;
        context.skillOptions = Object.entries(SKILL_MANIFEST).map(([slug, data]) => ({
            id: slug,
            label: game.i18n.localize(data.key)
        }))
        context.characteristicOptions = Object.entries(CHARACTERISTIC_MANIFEST).map(([slug, data]) => ({
            id: slug,
            label: game.i18n.localize(data.key)
        }))
        const talentMap = {};
        const flatTalents = this.document.system.talentsGranted || [];
        const choicePools = this.document.system.talentChoices || [];

        for (const uuid of flatTalents) {
            if (!uuid || talentMap[uuid]) continue;
            const doc = fromUuidSync(uuid);
            talentMap[uuid] = {
                uuid: uuid,
                name: doc ? doc.name : game.i18n.localize("Unknown Talent"),
                img: doc ? doc.img : "icons/svg/mystery-man.svg"
            };
        }
        for (const pool of choicePools) {
            for (const uuid of pool) {
                if (!uuid || talentMap[uuid]) continue;
                // Resolve the document from its string signature asynchronously or via cache
                const document = fromUuidSync(uuid);
                talentMap[uuid] = {
                    uuid: uuid,
                    name: document ? document.name : game.i18n.localize("Unknown Talent"),
                    img: document ? document.img : "icons/svg/mystery-man.svg"
                };
            }
        }
        context.talentMetadata = talentMap;
        console.log(context);
        return context;
    }
    static async _onAddChar(event, target) {
        event.preventDefault();
        const arrayPath = "system.characteristicsBonus"

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];
        console.log(currentOuterList);

        let newInnerList = [
            {
                characteristic: "ballisticSkill",
                value: 5
            }
        ];
        currentOuterList.push(newInnerList);

        const updates = {};
        updates[arrayPath] = currentOuterList;
        console.log(updates);
        await this.document.update(updates);
    }
    static async _onDeleteChar(event, target) {
        event.preventDefault();
        const dialog = `<p>Are you absolutely sure you want to delete this Characteristic Bonus?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        const arrayPath = "system.characteristicsBonus"
        const index = target.getAttribute("data-path");

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];

        let newList = currentOuterList.toSpliced(index, 1)

        const updates = {};
        foundry.utils.setProperty(updates, arrayPath, newList);
        await this.document.update(updates);
    }
    static async _onAddArray(event, target) {
        event.preventDefault();
        const arrayPath = target.getAttribute("data-array-path"); // should be "system.skillChoices"
        if (!arrayPath || arrayPath !== "system.skillChoices") return;

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];
        let newInnerList = ["forbiddenLore"];
        currentOuterList.push(newInnerList);

        const updates = {};
        updates[arrayPath] = currentOuterList;
        console.log(updates);
        await this.document.update(updates);

    }
    static async _onDeleteArray(event, target) {
        event.preventDefault();
        const arrayPath = target.getAttribute("data-array-path"); // should be "system.skillChoice.x"
        const basePath = "system.skillChoices";

        const dialog = `<p>Are you absolutely sure you want to delete this choice set?</p>`;

        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;
        let id = parseInt(arrayPath.split(".").pop());
        const currentTotalList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, basePath)) || [];
        const updatedList = currentTotalList.toSpliced(id, 1);



        let updates = {};
        foundry.utils.setProperty(updates, basePath, updatedList);
        await this.document.update(updates);
        ui.notifications.info(`successfully deleted skill choice set.`);
        return;
    }
    static async _onAddArrayEntry(event, target) {

        event.preventDefault();
        const arrayPath = target.getAttribute("data-array-path"); // should be "system.skillChoices.x"
        if (!arrayPath) return;
        const basePath = "system.skillChoices";

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, basePath)) || [];

        let newSkill = {id:"forbiddenLore",isAdvanced:false};
        let poolindex = parseInt(arrayPath.split(".").pop());
        if (isNaN(poolindex) || !currentOuterList[poolindex]) return;

        currentOuterList[poolindex].push(newSkill);

        const updates = {};
        foundry.utils.setProperty(updates, basePath, currentOuterList);
        console.log(updates);
        await this.document.update(updates);
    }
    static async _onDeleteArrayEntry(event, target) {
        event.preventDefault();

        const arrayPath = target.getAttribute("data-array-path"); // should be "system.skillChoice.x.x"
        if (!arrayPath) return;
        const basePath = "system.skillChoices";
        const currentTotalList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, basePath)) || [];
        if (!currentTotalList) return;

        const dialog = `<p>Are you absolutely sure you want to delete this choice set?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        let id = parseInt(arrayPath.split(".").at(-2));
        let poolindex = parseInt(arrayPath.split(".").at(-3));

        currentTotalList[poolindex].splice(id, 1);
        let updates = {};
        foundry.utils.setProperty(updates, basePath, currentTotalList);
        await this.document.update(updates);
    }
    static async _onAddBonusSkill(event, target) {
        event.preventDefault();
        const arrayPath = "system.skillBonus"

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];
        console.log(currentOuterList);

        currentOuterList.push({id:"forbiddenLore",isAdvanced:false});
        const updates = {};
        //updates[arrayPath] = currentOuterList;
        foundry.utils.setProperty(updates, arrayPath, currentOuterList);
        console.log(updates);
        await this.document.update(updates);
    }
    static async _onDeleteBonusSkill(event, target) {
        event.preventDefault();
        const dialog = `<p>Are you absolutely sure you want to delete this Granted Talent?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        const arrayPath = "system.skillBonus"
        const index = target.getAttribute("data-path");

        const currentOuterList = foundry.utils.deepClone(foundry.utils.getProperty(this.document, arrayPath)) || [];

        let newList = currentOuterList.toSpliced(index, 1)

        const updates = {};
        foundry.utils.setProperty(updates, arrayPath, newList);
        await this.document.update(updates);
    }
    static async _onAddGearPool(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const path = "system.gearChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];
        currentList.push([]); 
        await document.update({ [path]: currentList });
    }
    static async _onDeleteFlatGear(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const index = parseInt(target.dataset.index);
        const path = "system.gearGranted";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this talent?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        console.log(currentList);
        currentList.splice(index, 1);
        await document.update({ [path]: currentList });
    }
    static async _onDeleteGearPoolEntry(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const poolIndex = parseInt(target.dataset.poolIndex);
        const optionIndex = parseInt(target.dataset.optionIndex);
        const path = "system.gearChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this Talent Entry?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        currentList[poolIndex].splice(optionIndex, 1);
        await document.update({ [path]: currentList });
    }
    static async _onDeleteGearPool(event, target) {
        event.preventDefault();

        const document = target.closest("form")?.__formApplication?.document || this.document;
        const index = parseInt(target.dataset.poolIndex);
        const path = "system.gearChoices";
        const currentList = foundry.utils.deepClone(foundry.utils.getProperty(document, path)) || [];

        const dialog = `<p>Are you absolutely sure you want to delete this choice set?</p>`;
        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            window: { title: "Are you sure?" },
            content: dialog
        })
        if (!confirmDelete) return;

        currentList.splice(index, 1);
        await document.update({ [path]: currentList });
    }
}