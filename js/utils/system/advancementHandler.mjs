export class AdvancementHandler {
    /**
     * add advancement to this actor.
     * @param {import("foundry-vtt).Actor} characterActor the actor item
     * @param {String} advancementType "talent","characteristic",or"skill"
     * @param {Number} advancementXPValue how much XP expected to be spent here, this is checked, and may not be truthful.
     * @param {String} advancementUUID the uuid of the talent, OR eitgher "skill.<skillname>" or "characteristic.<characteristicname>"
     * @param {Number} advancementLevel level of the advancement. should be between 1->4
     * @param {Boolean} isBypassed is set to true, if the xp cost should be bypassed for the purpose of this advancement (adding an archetype will trigger this, etc)
     * @returns 
     */
    static async advance(characterActor, advancementType, advancementXPValue, advancementUUID, advancementLevel, isBypassed) {
        if (!characterActor || characterActor.type !== "character") return false;

        let currentAdvancements = foundry.utils.deepClone(characterActor.system.advancements);
        currentAdvancements = this.sanitize(currentAdvancements);
        const pushableadvancement = {
            type: advancementType,
            value: advancementXPValue,
            identifier: advancementUUID,
            level: advancementLevel
        }
        currentAdvancements.push(pushableadvancement);
        //not pushing to the actor document just yet.
        await characterActor.update({ "system.advancements": currentAdvancements })
        return true;
    }
    /**
     * SHOULD ONLY BE USED WITH ARCHETYPES OR OTHER THINGS THAT GRANT MULTIPLE ADVANCEMENTS AT ONCE.
     * @param {Array} ArrayofAdvancements 
     */
    static async batchAdvance(Actor, ArrayofAdvancements) {
        if (!Actor || Actor.type !== "character") return false;
        const presan = [...Actor.system.advancements, ...ArrayofAdvancements];
        const sanitized = this.sanitize(presan);
        await Actor.update({ "system.advancements": sanitized });
        return true;
    }
    static async batchUnadvance(Actor, ArrayOfOldAdvancements) {
        if (!Actor || Actor.type !== "character") return false;

        let currentAdvancements = foundry.utils.deepClone(Actor.system.advancements);
        let totalXPRefund = 0;
        for (const oldEntry of ArrayOfOldAdvancements) {
            if (oldEntry.type === "talent") {
                const matchingEntryIndex = currentAdvancements.findIndex(adv => 
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level
                );
                if(matchingEntryIndex !== -1){
                    currentAdvancements.splice(matchingEntryIndex, 1);
                }
                if(oldEntry.level > 0)
                {
                    const higherAdvancements = currentAdvancements.filter(adv =>
                        adv.identifier === oldEntry.identifier &&
                        adv.level >= oldEntry
                    )
                    for(const advancement of higherAdvancements)
                    {
                        totalXPRefund += (Number(advancement.value) || 0);
                        currentAdvancements = currentAdvancements.filter(adv => adv !== advancement)
                    }
                }
                
                currentAdvancements = currentAdvancements.filter(adv => adv.identifier !== oldEntry.identifier);
            } else if (oldEntry.type === "skill") {
                // For skills, look for the entry matching "skill.name"
                const matchingSkillIndex = currentAdvancements.findIndex(adv => 
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level
                );
                if (matchingSkillIndex !== -1) {
                    currentAdvancements.splice(matchingSkillIndex, 1);
                    if(oldEntry.level > 0){
                        const higherAdvancements = currentAdvancements.filter(adv =>
                            adv.identifier === oldEntry.identifier &&
                            adv.level > oldEntry.level  
                        );
                        for(const advance of higherAdvancements){
                            totalXPRefund += (Number(advance.value) || 0);
                            currentAdvancements = currentAdvancements.filter(adv => adv !== advance)
                        }
                    }
                }
            }
        }
        if (totalXPRefund > 0) {
        console.log(`Archetype rollback: Refunding ${totalXPRefund} XP to ${Actor.name}`);
        
        // Adjust this path ("system.details.xp.unspent" etc.) to match your actual XP DataModel path
        const currentUnspentXp = Number(Actor.system?.experience) || 0;
        updateData["system.experience"] = currentUnspentXp + totalXPRefund;
        
        ui.notifications.info(`Archetype removed: ${totalXPRefund} XP has been refunded to your sheet.`);
        }
        const sanitized = this.sanitize(currentAdvancements);

        await Actor.update({ "system.advancements": sanitized });
        return true;
    }
    /**
     * removes the advancement that matches ALL of the data entered.
     * @param {import("foundry-vtt).Actor} characterActor the actor item
     * @param {String} advancementType "talent","characteristic",or"skill"
     * @param {Number} advancementXPValue how much XP expected to be spent here, this is checked, and may not be truthful.
     * @param {String} advancementUUID the uuid of the talent, OR eitgher "skill.<skillname>" or "characteristic.<characteristicname>"
     * @param {Number} advancementLevel level of the advancement. should be between 1->4
     * @param {Boolean} isBypassed is set to true, if the xp cost should be bypassed for the purpose of this advancement (adding an archetype will trigger this, etc)
     * @returns 
     */
    static async unadvance(characterActor, advancementType, advancementXPValue, advancementUUID, advancementLevel, isBypassed) {

    }
    static sanitize(arrayofadvancemnts) {
        let sanitized = [];
        for (const entry of arrayofadvancemnts) {
            if (entry.type !== "characteristic" && entry.type !== "talent" && entry.type !== "skill") continue;
            if (entry.value < 0 || entry.value > 2500) continue;
            const isStringId = (entry.identifier.startsWith("characteristic.") || entry.identifier.startsWith("skill."))
            if (!isStringId) {
                const item = fromUuidSync(entry.identifier);
                if (!item) continue;
            } else {
                const nameseg = entry.identifier.split(".")[1];
                if (!nameseg || nameseg.trim() === "") continue;
            }
            if (entry.level < 0 || entry.level > 4) continue;
            sanitized.push(entry);
        }
        return sanitized;
    }
}


