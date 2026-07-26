export class RollOptionsManager {
  
  /**
   * Compiles all active states into a single array of string flags
   * @param {Actor} attacker 
   * @param {Item} weapon 
   * @param {Token} [targetToken]
   * @returns {string[]}
   */
  static compile(attacker, weapon, targetToken = null) {
    const options = new Set();

    // 1. Gather Attacker (Self) Options
    options.add(`actor:id:${attacker.id}`);
    options.add(attacker.getTraits());
    if (attacker.system.attributes.health.value < 10) {
      options.add("actor:health:bloody");
    }

    // 2. Gather Weapon/Action Options
    options.add(`item:id:${weapon.id}`);
    options.add(`item:type:${weapon.system.weaponType}`); // e.g., "item:type:las"
    for (const trait of weapon.system.traits) {
      options.add(`item:trait:${trait}`); // e.g., "item:trait:laser-weapon"
    }

    // 3. Gather Target Options (Crucial for PF2e style logic)
    if (targetToken) {
      const targetActor = targetToken.actor;
      const actorTraits = targetActor.

      options.add(`target:type:${targetActor.type}`); // e.g., "target:type:monster"
      
      // Check if target has a specific trait
      if (targetActor.system.traits?.includes("cybernetic")) {
        options.add("target:trait:cybernetic");
      }
    }

    return Array.from(options);
  }
}