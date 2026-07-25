export class CodeEvalucator
{
  static evaluate(rollOptions, predicateArray) {
    if (!predicateArray || !Array.isArray(predicateArray) || predicateArray.length === 0) return true;

    // By default, every item in the predicate array must match (AND condition logic)
    return predicateArray.every(condition => {
      
      // 1. Handle Complex Math Operators (e.g., {"lt": {"self:wounds": 12}})
      if (condition && typeof condition === "object") {
        const operation = Object.keys(condition)[0]; // Extracts "lt", "gt", "or", etc.
        const body = condition[operation];

        switch (operation) {
          case "lt": return this._evaluateMath(rollOptions, body, (a, b) => a < b);
          case "gt": return this._evaluateMath(rollOptions, body, (a, b) => a > b);
          case "eq": return this._evaluateMath(rollOptions, body, (a, b) => a === b);
          
          case "or":
            // Optional structural layout: {"or": ["target:quality:undead", "target:quality:demon"]}
            return Array.isArray(body) ? body.some(sub => rollOptions.includes(sub)) : false;
            
          default:
            return false;
        }
      }
      return rollOptions.includes(condition);
    });
  }
}