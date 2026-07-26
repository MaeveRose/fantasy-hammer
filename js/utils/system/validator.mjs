import { SYSTEM_ID } from "../sys-const.mjs";
export class SystemValidator {
  /**
   * Scans all registered Actor and Item data models to ensure compliance.
   */
  static auditDataModels() {
    console.log(`[${SYSTEM_ID} INFO] Running startup data model architecture audit...`);

    this._checkRegistry(CONFIG.Actor.dataModels, "Actor");

    this._checkRegistry(CONFIG.Item.dataModels, "Item");

    console.log(`[${SYSTEM_ID} INFO] Architecture audit passed successfully!`);
  }

  static _checkRegistry(registry, documentType) {
    if (!registry) return;

    // Loop through every registered sub-type (e.g., "character", "npc", "weapon")
    for (const [subType, modelClass] of Object.entries(registry)) {
      
      // Ensure we are checking the prototype layout of the class
      const hasOwnMethod = modelClass.prototype.hasOwnProperty("gatherRollOptions");

      if (!hasOwnMethod) {
        throw new Error(
          `[${SYSTEM_ID} Architecture Failure]: The ${documentType} subclass registered for type '${subType}' (${modelClass.name}) is missing its own mandatory 'gatherRollOptions()' implementation.`
        );
      }
    }
  }
}