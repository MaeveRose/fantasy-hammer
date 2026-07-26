export const SYSTEM_ID = "fantasy-hammer";
export const SKILL_MANIFEST = {
  acrobatics:{ 
    char: "agility",
    key: "sys-const.skills.acrobatics",
    traits:["skill","skill:acrobatics"]
  },
  athletics:{ 
    char: "strength",
    key: "sys-const.skills.athletics",
    traits:["skill","skill:athletics"]
  },
  awareness:{ 
    char: "perception",
    key: "sys-const.skills.awareness",
    traits:["skill","skill:awareness"]
  },
  charm:{ 
    char: "fellowship",
    key: "sys-const.skills.charm",
    traits:["skill","skill:charm"]
  },
  command:{ 
    char: "fellowship",
    key: "sys-const.skills.command",
    traits:["skill","skill:command"]
  },
  commerce:{ 
    char: "intelligence",
    key: "sys-const.skills.commerce",
    traits:["skill","skill:commerce"]
  },
  commonLore:{ 
    char: "none",
    key: "sys-const.skills.commonLore",
    traits:["skill","skill:common-lore"]
  },
  deceive:{ 
    char: "fellowship",
    key: "sys-const.skills.deceive",
    traits:["skill","skill:deceive"]
  },
  dodge:{ 
    char: "agility",
    key: "sys-const.skills.dodge",
    traits:["skill","skill:dodge"]
  },
  forbiddenLore:{ 
    char: "intelligence",
    key: "sys-const.skills.forbiddenLore",
    traits:["skill","skill:forbidden-lore"]
  },
  inquiry:{ 
    char: "fellowship",
    key: "sys-const.skills.inquiry",
    traits:["skill","skill:inquiry"]
  },
  intimidate:{ 
    char: "willpower",
    key: "sys-const.skills.intimidate",
    traits:["skill","skill:intimidate"]
  },
  linguistics:{ 
    char: "intelligence",
    key: "sys-const.skills.linguistics",
    traits:["skill","skill:linguistics"]
  },
  logic:{ 
    char: "intelligence",
    key: "sys-const.skills.logic",
    traits:["skill","skill:logic"]
  },
  medicae:{ 
    char: "intelligence",
    key: "sys-const.skills.medicae",
    traits:["skill","skill:medicae"]
  },
  navigationSurface:{ 
    char: "intelligence",
    key: "sys-const.skills.navigationSurface",
    traits:["skill","skill:navigation-surface"]
  },
  navigationStellar:{ 
    char: "intelligence",
    key: "sys-const.skills.navigationStellar",
    traits:["skill","skill:navigation-stellar"]
  },
  navigationWarp:   { 
    char: "intelligence",
    key: "sys-const.skills.navigationWarp",
    traits:["skill","skill:navigation-warp"]
  },
  operateAeronautica:{ 
    char: "agility",
    key: "sys-const.skills.operateAeronautica",
    traits:["skill","skill:operate-aeronautica"]
  },
  operateSurface:{ 
    char: "agility",
    key: "sys-const.skills.operateSurface",
    traits:["skill","skill:operate-surface"]
  },
  operateVoidship:{ 
    char: "agility",
    key: "sys-const.skills.operateVoidship",
    traits:["skill","skill:operate-voidship"]
  },
  parry:{ 
    char: "weaponSkill",
    key: "sys-const.skills.parry",
    traits:["skill","skill:parry"]
  },
  psyniscience:{ 
    char: "perception",
    key: "sys-const.skills.psyniscience",
    traits:["skill","skill:psyniscience"]
  },
  scholasticLore:{ 
    char: "intelligence",
    key: "sys-const.skills.scholasticLore",
    traits:["skill","skill:scholastic-lore"]
  },
  scrutiny:{ 
    char: "perception",
    key: "sys-const.skills.scrutiny",
    traits:["skill","skill:scrutiny"]
  },
  security:{ 
    char: "intelligence",
    key: "sys-const.skills.security",
    traits:["skill","skill:security"]
  },
  slightOfHand:{ 
    char: "agility",
    key: "sys-const.skills.slightOfHand",
    traits:["skill","skill:slight-of-hand"]
  },
  stealth:{ 
    char: "agility",
    key: "sys-const.skills.stealth",
    traits:["skill","skill:stealth"]
  },
  techUse:{ 
    char: "intelligence",
    key: "sys-const.skills.techUse",
    traits:["skill","skill:tech-use"]
  },
  tracking:{ 
    char: "intelligence",
    key: "sys-const.skills.tracking",
    traits:["skill","skill:tracking"]
  },
  trade:{ 
    char: "intelligence",
    key: "sys-const.skills.trade",
    traits:["skill","skill:trade"]
  }
}
export const CHARACTERISTIC_MANIFEST = {
    weaponSkill:        {
      key: "sys-const.characteristic.weaponSkill",
      short: "sys-const.characteristic.weaponSkill_short",
      traits:["characteristic","characteristic:weapon-skill"]
    },
    ballisticSkill:     {
      key: "sys-const.characteristic.ballisticSkill",
      short: "sys-const.characteristic.ballisticSkill_short",
      traits:["characteristic","characteristic:ballistic-skill"]
    },
    strength:           {
      key: "sys-const.characteristic.strength",
      short: "sys-const.characteristic.strength_short",
      traits:["characteristic","characteristic:strength"]
    },
    toughness:          {
      key: "sys-const.characteristic.toughness",
      short: "sys-const.characteristic.toughness_short",
      traits:["characteristic","characteristic:toughness"]
    },
    agility:            {
      key: "sys-const.characteristic.agility",
      short: "sys-const.characteristic.agility_short",
      traits:["characteristic","characteristic:agility"]
    },
    intelligence:       {
      key: "sys-const.characteristic.intelligence",
      short: "sys-const.characteristic.intelligence_short",
      traits:["characteristic","characteristic:intelligence"]
    },
    perception:         {
      key: "sys-const.characteristic.perception",
      short: "sys-const.characteristic.perception_short",
      traits:["characteristic","characteristic:perception"]
    },
    willpower:          {
      key: "sys-const.characteristic.willpower",
      short: "sys-const.characteristic.willpower_short",
      traits:["characteristic","characteristic:willpower"]
    },
    fellowship:         {
      key: "sys-const.characteristic.fellowship",
      short: "sys-const.characteristic.fellowship_short",
      traits:["characteristic","characteristic:fellowship"]
    },
    infamy:             {
      key: "sys-const.characteristic.infamy",
      short: "sys-const.characteristic.infamy_short",
      traits:["characteristic","characteristic:infamy"]
    }
}
export const AVAILABILITY_MANIFEST = {
  ubiquitous:{
    key: "sys-const.availability.ubiquitous",
    value: 70,
    traits:["availability","availability:ubiquitous"]
  },
  abundant:{
    key: "sys-const.availability.abundant",
    value: 50,
    traits:["availability","availability:abundant"]
  },
  plentiful:{
    key: "sys-const.availability.plentiful",
    value: 30,
    traits:["availability","availability:plentiful"]
  },
  common:{
    key: "sys-const.availability.common",
    value: 20,
    traits:["availability","availability:common"]
  },
  average:{
    key: "sys-const.availability.average",
    value: 10,
    traits:["availability","availability:average"]
  },
  scarce:{
    key: "sys-const.availability.scarce",
    value: 0,
    traits:["availability","availability:scarce"]
  },
  rare:{
    key: "sys-const.availability.rare",
    value: -10,
    traits:["availability","availability:rare"]
  },
  veryRare:{
    key: "sys-const.availability.veryRare",
    value: -20,
    traits:["availability","availability:very-rare"]
  },
  extremelyRare:{
    key: "sys-const.availability.extremelyRare",
    value: -30,
    traits:["availability","availability:extremely-rare"]
  },
  nearUnique:{
    key: "sys-const.availability.nearUnique",
    value: -50,
    traits:["availability","availability:near-unique"]
  },
  unique:{
    key: "sys-const.availability.unique",
    value: -70,
    traits:["availability","availability:unique"]
  }
}
export const DAMAGETYPE_MANIFEST = {
  energy:     {
    key:"sys-const.damageType.energy",
    short:"E",
    traits:["energy"]
  },
  explosive:  {
    key:"sys-const.damageType.explosive",
    short:"X",
    traits:["explosive"]
  },
  rending:    {
    key:"sys-const.damageType.rending",
    short:"R",
    traits:["rending"]
  },
  impact:     {
    key:"sys-const.damageType.impact",
    short:"I",
    traits:["impact"]
  }
}
export const WEAPONCLASS_MANIFEST = {
  melee: {
    key:"sys-const.weaponclass.melee",
    traits:["melee"]
  },
  thrown: {
    key:"sys-const.weaponclass.thrown",
    traits:["thrown"]
  },
  pistol: {
    key:"sys-const.weaponclass.pistol",
    traits:["pistol"]
  },
  basic: {
    key:"sys-const.weaponclass.basic",
    traits:["basic"]
  },
  heavy: {
    key:"sys-const.weaponclass.heavy",
    traits:["heavy"]
  },
  launch:{
    key:"sys-const.weaponclass.launch",
    traits:["launch"]
  },
  place:{
    key:"sys-const.weaponclass.place",
    traits:["place"]
  },
  vehicle:{
    key:"sys-const.weaponclass.vehicle",
    traits:["vehicle"]
  }
}
export const WEAPONTYPE_MANIFEST = {
  las: {
    key:"sys-const.weapontype.las",
    traits:["las"]
  },
  solid:{
    key:"sys-const.weapontype.solid",
    traits:["solid"]
  },
  bolt:{
    key:"sys-const.weapontype.bolt",
    traits:["bolt"]
  },
  melta:{
    key:"sys-const.weapontype.melta",
    traits:["melta"]
  },
  plasma:{
    key:"sys-const.weapontype.plasma",
    traits:["plasma"]
  },
  flame:{
    key:"sys-const.weapontype.flame",
    traits:["flame"]
  },
  launcher:{
    key:"sys-const.weapontype.launcher",
    traits:["launcher"]
  },
  grenade:{
    key:"sys-const.weapontype.grenade",
    traits:["granade"]
  },
  exotic:{
    key:"sys-const.weapontype.exotic",
    traits:["exotic"]
  },
  chain:{
    key:"sys-const.weapontype.chain",
    traits:["chain"]
  },
  power:{
    key:"sys-const.weapontype.power",
    traits:["power"]
  },
  force:{
    key:"sys-const.weapontype.force",
    traits:["force"]
  },
  shock:{
    key:"sys-const.weapontype.shock",
    traits:["shock"]
  },
  primary:{
    key:"sys-const.weapontype.primary",
    traits:["primary"]
  }
}
export const QUALITY_MANIFEST = {
  poor:{
    key:"sys-const.quality.poor",
    traits:["quality:poor"]
  },
  common:{
    key:"sys-const.quality.common",
    traits:["quality:common"]
  },
  good:{
    key:"sys-const.quality.good",
    traits:["quality:good"]
  },
  best:{
    key:"sys-const.quality.best",
    traits:["quality:best"]
  }
}
export const ARMORTYPE_MANIFEST = {
  primative:{
    key:"sys-const.armortype.primative",
    trait:["armor:primative"]
  },
  flak:{
    key:"sys-const.armortype.flak",
    traits:["armor:flak"]
  },
  mesh:{
    key:"sys-const.armortype.mesh",
    traits:["armor:mesh"]
  },
  carapice:{
    key:"sys-const.armortype.carapice",
    traits:["armor:carapice"]
  },
  power:{
    key:"sys-const.armortype.power",
    traits:["armor:power"]
  },
  exotic:{
    key:"sys-const.armortype.exotic",
    traits:["armor:exotic"]
  }
}
export const PRIDE_MANIFEST = {
  beauty:{
    label:"sys-const.pride.beauty.label",
    description: "sys-const.pride.beauty.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.willpower":-4
    },
    traits:["pride:beauty"]
  },
  charm:{
    label:"sys-const.pride.charm.label",
    description:"sys-const.pride.charm.description",
    modifiers:{
      "characteristic.fellowship":5,
      "characteristic.toughness":-5
    },
    traits:["pride:charm"]
  },
  craftsmanship:{
    label:"sys-const.pride.craftsmanship.label",
    description:"sys-const.pride.craftsmanship.description",
    modifiers:{
      "characteristic.infamy":1,
      "characteristic.agility":3,
      "characteristic.intelligence":3,
      "characteristic.weaponSkill":-3,
      "characteristic.ballisticSkill":-3
    },
    traits:["pride:craftsmanship"]
  },
  devotion:{
    label:"sys-const.pride.devotion.label",
    description:"sys-const.pride.devotion.description",
    modifiers:{
      "characteristic.willpower":5,
      "characteristic.strength":-5
    },
    traits:["pride:devotion"]
  },
  fortitude:{
    label:"sys-const.pride.fortitude.label",
    description:"sys-const.pride.fortitude.description",
    modifiers:{
      "characteristic.toughness":5,
      "characteristic.agility":-3,
      "characteristic.intelligence":-3
    },
    traits:["pride:fortitude"]
  },
  foresight:{
    label:"sys-const.pride.foresight.label",
    description:"sys-const.pride.foresight.description",
    modifiers:{
      "characteristic.perception":5,
      "characteristic.felowship":-5
    },
    traits:["pride:foresight"]
  },
  logic:{
    label:"sys-const.pride.logic.label",
    description:"sys-const.pride.logic.description",
    modifiers:{
      "characteristic.intelligence":5,
      "characteristic.perception":-5
    },
    traits:["pride:logic"]
  },
  martialProwess:{
    label:"sys-const.pride.martialProwess.label",
    description:"sys-const.pride.martialProwess.description",
    modifiers:{
      "characteristic.weaponSkill":5,
      "cahracteristic.intelligence":-5
    },
    traits:["pride:martial-prowess"]
  },
  grace:{
    label:"sys-const.pride.grace.label",
    description:"sys-const.pride.grace.description",
    modifiers:{
      "characteristic.agility":5,
      "characteristic.ballisticSkill":-5,
    },
    traits:["pride:grace"]
  },
  wealth:{
    label:"sys-const.pride.wrath.label",
    description:"sys-const.pride.wrath.description",
    modifiers:{
      "characteristic.willpower":-3
    },
    traits:["pride:wealth"]
  }
}
export const DISGRACE_MANIFEST ={
  betrayal:{
    label:"sys-const.disgrace.betrayal.label",
    description: "sys-const.disgrace.betrayal.description",
    modifiers:{
      "playermods.corruption":5,
      "trait.untrustworthy":true
    },
    traits:["disgrace:betrayal"]
  },
  deceit:{
    label:"sys-const.disgrace.deceit.label",
    description:"sys-const.disgrace.deceit.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.perception":-4
    },
    traits:["disgrace:deceit"]
  },
  dread:{
    label:"sys-const.disgrace.dread.label",
    description:"sys-const.disgrace.dread.description",
    modifiers:{
      "characteristic.perception":5,
      "characteristic.willpower":-5,
    },
    traits:["disgrace:dread"]
  },
  destruction:{
    label:"sys-const.disgrace.destruction.label",
    description:"sys-const.disgrace.destruction.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.fellowship":-4
    },
    traits:["disgrace:destruction"]
  },
  gluttony:{
    label:"sys-const.disgrace.gluttony.label",
    description:"sys-const.disgrace.gluttony.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.agility":-5
    },
    traits:["disgrace:gluttony"]
  },
  greed:{
    label:"sys-const.disgrace.greed.label",
    description:"sys-const.disgrace.greed.description",
    modifiers:{
      "playermod.corruption":4,
      "trait.overwhelmingNeed":true
    },
    traits:["disgrace:greed"]
  },
  hubris:{
    label:"sys-const.disgrace.hubris.label",
    description:"sys-const.disgrace.hubris.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.intelligence":-4
    },
    traits:["disgrace:hubris"]
  },
  regret:{
    label:"sys-const.disgrace.regret.label",
    description:"sys-const.disgrace.regret.description",
    modifiers:{
      "playermod.corruption":5,
      "trait.haunted":true
    },
    traits:["disgrace:regret"]
  },
  waste:{
    label:"sys-const.disgrace.waste.label",
    description:"sys-const.disgrace.waste.description",
    modifiers:{
      "characteristic.willpower":-4,
      "characteristic.infamy":2,
    },
    traits:["disgrace:waste"]
  },
  wrath:{
    label:"sys-const.disgrace.wrath.label",
    description:"sys-const.disgrace.wrath.description",
    modifiers:{
      "playermods.wounds":-1,
      "characteristic.willpower":-2,
      "characteristic.perception":5
    },
    traits:["disgrace:wrath"]
  }
}
export const MOTIVATION_MANIFEST={
  arcane:{
    label:"sys-const.motivation.arcane.label",
    description: "sys-const.motivation.arcane.description",
    modifiers:{
      "playermods.corruption":4,
      "characteristic.intelligence":2,
      "characteristic.strength":-3
    },
    traits:["motivation:arcane"]
  },
  ascendancy:{
    label:"sys-const.motivation.ascendancy.label",
    description:"sys-const.motivation.ascendancy.description",
    modifiers:{
      "playermods.wounds":-2,
      "characteristic.willpower":5
    },
    traits:["motivation:ascendancy"]
  },
  dominion:{
    label:"sys-const.motivation.dominion.label",
    description:"sys-const.motivation.dominion.description",
    modifiers:{
      "characteristic.infamy":1,
      "characteristic.willpower":2,
      "characteristic.fellowship":2,
      "characteristic.agility":-4,
      "playermods.wounds":-1
    },
    traits:["motivation:dominion"]
  },
  immortality:{
    label:"sys-const.motivation.immortality.label",
    description:"sys-const.motivation.immortality.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.weaponSkill":5
    },
    traits:["motivation:immortality"]
  },
  innovation:{
    label:"sys-const.motivation.innovation.label",
    description:"sys-const.motivation.innovation.description",
    modifiers:{
      "playermods.corruption":2,
      "playermods.wounds":-2,
      "characteristic.intelligence":3
    },
    traits:["motivation:innovation"]
  },
  legacy:{
    label:"sys-const.motivation.legacy.label",
    description:"sys-const.motivation.legacy.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.intelligence":-4
    },
    traits:["motivation:legacy"]
  },
  nihilism:{
    label:"sys-const.motivation.nihilism.label",
    description:"sys-const.motivation.nihilism.description",
    modifiers:{
      "playermods.corruption":5,
      "characteristic.willpower":-3
    },
    traits:["motivation:nihilism"]
  },
  perfection:{
    label:"sys-const.motivation.perfection.label",
    description:"sys-const.motivation.perfection.description",
    modifiers:{
      "characteristic.choice":-3,
      "characteristic.choice":-3,
      "characteristic.choice":5
    },
    traits:["motivation:perfection"]
  },
  vengeance:{
    label:"sys-const.motivation.vengeance.label",
    description:"sys-const.motivation.vengeance.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.perception":-5,
    },
    traits:["motivation:vengeance"]
  },
  violence:{
    label:"sys-const.motivation.violence.label",
    description:"sys-const.motivation.violence.description",
    modifiers:{
      "playermods.corruption":5,
      "characteristic.intelligence":-3
    },
    traits:["motivation:violence"]
  }
}
export const RELOADTIME_MANIFEST={
  free:{
    label:"sheets.weapon.stats.free",
    key:"free",
    traits:["free"]
  },
  half:{
    label:"sheets.weapon.stats.half",
    key:"half",
    traits:["half"]
  },
  full:{
    label:"sheets.weapon.stats.full",
    key:"full",
    traits:["full"]
  },
  twoFull:{
    label:"sheets.weapon.stats.full",
    key:"2full",
    traits:["2-full"]
  },
  threeFull:{
    label:"sheets.weapon.stats.full",
    key:"3full",
    traits:["3-full"]
  },
  fourFull:{
    label:"sheets.weapon.stats.full",
    key:"4full",
    traits:["4-full"]
  },
  fiveFull:{
    label:"sheets.weapon.stats.full",
    key:"5full",
    traits:["5-full"]
  },
  sixFull:{
    label:"sheets.weapon.stats.full",
    key:"6full",
    traits:["6-full"]
  }
}