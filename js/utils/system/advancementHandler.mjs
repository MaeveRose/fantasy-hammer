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

    static async batchUnadvanceID(Actor, originId) {
        if (!Actor || Actor.type !== "character" || !originId) return false;

        let currentAdvancements = foundry.utils.deepClone(Actor.system.advancements || []);
        
        // Gather only the entries explicitly tagged as originating from this specific archetype
        const advancementsToRemove = currentAdvancements.filter(adv => adv.origin === originId);
        if (advancementsToRemove.length === 0) return true;

        let totalXPRefund = 0;
        let updateData = {};

        for (const oldEntry of advancementsToRemove) {
            if (oldEntry.type === "talent") {
                const matchingEntryIndex = currentAdvancements.findIndex(adv =>
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level &&
                    adv.origin === originId
                );

                if (matchingEntryIndex !== -1) {
                    totalXPRefund += (Number(currentAdvancements[matchingEntryIndex].value) || 0);
                    currentAdvancements.splice(matchingEntryIndex, 1);
                }

                if (oldEntry.level > 0) {
                    const higherAdvancements = currentAdvancements.filter(adv =>
                        adv.identifier === oldEntry.identifier &&
                        adv.level >= oldEntry.level
                    );
                    for (const advancement of higherAdvancements) {
                        totalXPRefund += (Number(advancement.value) || 0);
                        currentAdvancements = currentAdvancements.filter(adv => adv !== advancement);
                    }
                }

            } else if (oldEntry.type === "skill") {
                const matchingSkillIndex = currentAdvancements.findIndex(adv =>
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level &&
                    adv.origin === originId
                );

                if (matchingSkillIndex !== -1) {
                    totalXPRefund += (Number(currentAdvancements[matchingSkillIndex].value) || 0);
                    currentAdvancements.splice(matchingSkillIndex, 1);

                    if (oldEntry.level > 0) {
                        const higherAdvancements = currentAdvancements.filter(adv =>
                            adv.identifier === oldEntry.identifier &&
                            adv.level > oldEntry.level
                        );
                        for (const advance of higherAdvancements) {
                            totalXPRefund += (Number(advance.value) || 0);
                            currentAdvancements = currentAdvancements.filter(adv => adv !== advance);
                        }
                    }
                }
            }
        }

        if (totalXPRefund > 0) {
            console.log(`Archetype rollback: Refunding ${totalXPRefund} XP to ${Actor.name}`);
            const currentUnspentXp = Number(Actor.system?.experience) || 0;
            updateData["system.experience"] = currentUnspentXp + totalXPRefund;
            ui.notifications.info(`Archetype removed: ${totalXPRefund} XP has been refunded to your sheet.`);
        }

        // Pass through your sanitization function
        updateData["system.advancements"] = this.sanitize(currentAdvancements);

        await Actor.update(updateData);
        return true;
    }
    /**
     * 
     * @param {*} Actor 
     * @param {*} ArrayOfOldAdvancements 
     * @returns 
     * @deprecated this function should not be used, in its place use batchUnadvanceID(Actor, ID);
     */
    static async batchUnadvance(Actor, ArrayOfOldAdvancements) {
        if (!Actor || Actor.type !== "character") return false;

        let currentAdvancements = foundry.utils.deepClone(Actor.system.advancements);
        let totalXPRefund = 0;
        let updateData = {};
        for (const oldEntry of ArrayOfOldAdvancements) {
            if (oldEntry.type === "talent") {
                const matchingEntryIndex = currentAdvancements.findIndex(adv =>
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level
                );
                if (matchingEntryIndex !== -1) {
                    totalXPRefund += (Number(currentAdvancements[matchingEntryIndex].value) || 0);
                    currentAdvancements.splice(matchingEntryIndex, 1);
                }
                if (oldEntry.level > 0) {
                    const higherAdvancements = currentAdvancements.filter(adv =>
                        adv.identifier === oldEntry.identifier &&
                        adv.level >= oldEntry.level
                    )
                    for (const advancement of higherAdvancements) {
                        totalXPRefund += (Number(advancement.value) || 0);
                        currentAdvancements = currentAdvancements.filter(adv => adv !== advancement)
                    }
                }

                //currentAdvancements = currentAdvancements.filter(adv => adv.identifier !== oldEntry.identifier);
            } else if (oldEntry.type === "skill") {
                // For skills, look for the entry matching "skill.name"
                const matchingSkillIndex = currentAdvancements.findIndex(adv =>
                    adv.identifier === oldEntry.identifier &&
                    adv.level === oldEntry.level
                );
                if (matchingSkillIndex !== -1) {
                    totalXPRefund += (Number(currentAdvancements[matchingSkillIndex].value) || 0);
                    currentAdvancements.splice(matchingSkillIndex, 1);
                    if (oldEntry.level > 0) {
                        const higherAdvancements = currentAdvancements.filter(adv =>
                            adv.identifier === oldEntry.identifier &&
                            adv.level > oldEntry.level
                        );
                        for (const advance of higherAdvancements) {
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
        updateData["system.advancements"] = sanitized;
        await Actor.update({ "system.advancements": sanitized });
        return true;
    }
    /**
     * 
     * @param {Number} level of advancement (0,1,2,3,4) 
     * @param {String} type of advancment ("characteristic","skill","talent")
     * @returns the string "name" of the current level header.
     */
    static calculateLevel(level, type) {
        if (level < 0 || !type) return `${level}`;
        if (type === "talent") {
            return `Level ${level}`;
        }
        switch (level) {
            case 0:
                return (type === "skill") ? "unknown" : "none";
            case 1:
                return (type === "skill") ? "known" : "simple";
            case 2:
                return (type === "skill") ? "trained" : "intermediate";
            case 3:
                return (type === "skill") ? "experienced" : "trained";
            case 4:
                return (type === "skill") ? "veteren" : "expert";
            default:
                return "Unknown Advancement Level";
        }
        return "Advanced";
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
        console.log(sanitized);
        return sanitized;
    }
}


