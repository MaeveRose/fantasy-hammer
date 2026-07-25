export const SKILL_MANIFEST = {
  acrobatics:       { char: "agility",        key: "sys-const.skills.acrobatics" },
  athletics:        { char: "strength",       key: "sys-const.skills.athletics" },
  awareness:        { char: "perception",     key: "sys-const.skills.awareness" },
  charm:            { char: "fellowship",     key: "sys-const.skills.charm" },
  command:          { char: "fellowship",     key: "sys-const.skills.command" },
  commerce:         { char: "intelligence",   key: "sys-const.skills.commerce" },
  commonLore:       { char: "none",           key: "sys-const.skills.commonLore" },
  deceive:          { char: "fellowship",     key: "sys-const.skills.deceive" },
  dodge:            { char: "agility",        key: "sys-const.skills.dodge" },
  forbiddenLore:    { char: "intelligence",   key: "sys-const.skills.forbiddenLore" },
  inquiry:          { char: "fellowship",     key: "sys-const.skills.inquiry" },
  intimidate:       { char: "willpower",      key: "sys-const.skills.intimidate" },
  linguistics:      { char: "intelligence",   key: "sys-const.skills.linguistics" },
  logic:            { char: "intelligence",   key: "sys-const.skills.logic" },
  medicae:          { char: "intelligence",   key: "sys-const.skills.medicae" },
  navigationSurface:{ char: "intelligence",   key: "sys-const.skills.navigationSurface" },
  navigationStellar:{ char: "intelligence",   key: "sys-const.skills.navigationStellar" },
  navigationWarp:   { char: "intelligence",   key: "sys-const.skills.navigationWarp" },
  operateAeronautica:{ char: "agility",       key: "sys-const.skills.operateAeronautica" },
  operateSurface:   { char: "agility",        key: "sys-const.skills.operateSurface" },
  operateVoidship:  { char: "agility",        key: "sys-const.skills.operateVoidship" },
  parry:            { char: "weaponSkill",    key: "sys-const.skills.parry" },
  psyniscience:     { char: "perception",     key: "sys-const.skills.psyniscience" },
  scholasticLore:   { char: "intelligence",   key: "sys-const.skills.scholasticLore" },
  scrutiny:         { char: "perception",     key: "sys-const.skills.scrutiny" },
  security:         { char: "intelligence",   key: "sys-const.skills.security" },
  slightOfHand:     { char: "agility",        key: "sys-const.skills.slightOfHand" },
  stealth:          { char: "agility",        key: "sys-const.skills.stealth" },
  techUse:          { char: "intelligence",   key: "sys-const.skills.techUse" },
  tracking:         { char: "intelligence",   key: "sys-const.skills.tracking" },
  trade:            { char: "intelligence",   key: "sys-const.skills.trade" }
};

export const CHARACTERISTIC_MANIFEST = {
    weaponSkill:        { key: "sys-const.characteristic.weaponSkill" , short: "sys-const.characteristic.weaponSkill_short"},
    ballisticSkill:     { key: "sys-const.characteristic.ballisticSkill" , short: "sys-const.characteristic.ballisticSkill_short"},
    strength:           { key: "sys-const.characteristic.strength" , short: "sys-const.characteristic.strength_short"},
    toughness:          { key: "sys-const.characteristic.toughness" , short: "sys-const.characteristic.toughness_short"},
    agility:            { key: "sys-const.characteristic.agility" , short: "sys-const.characteristic.agility_short"},
    intelligence:       { key: "sys-const.characteristic.intelligence" , short: "sys-const.characteristic.intelligence_short"},
    perception:         { key: "sys-const.characteristic.perception" , short: "sys-const.characteristic.perception_short"},
    willpower:          { key: "sys-const.characteristic.willpower" , short: "sys-const.characteristic.willpower_short"},
    fellowship:         { key: "sys-const.characteristic.fellowship" , short: "sys-const.characteristic.fellowship_short"},
    infamy:             { key: "sys-const.characteristic.infamy" , short: "sys-const.characteristic.infamy_short"}
}

export const AVAILABILITY_MANIFEST = {
  ubiquitous:           { key: "sys-const.availability.ubiquitous",     value: 70},
  abundant:             { key: "sys-const.availability.abundant",       value: 50},
  plentiful:            { key: "sys-const.availability.plentiful",      value: 30},
  common:               { key: "sys-const.availability.common",         value: 20},
  average:              { key: "sys-const.availability.average",        value: 10},
  scarce:               { key: "sys-const.availability.scarce",         value: 0},
  rare:                 { key: "sys-const.availability.rare",           value: -10},
  veryRare:             { key: "sys-const.availability.veryRare",       value: -20},
  extremelyRare:        { key: "sys-const.availability.extremelyRare",  value: -30},
  nearUnique:           { key: "sys-const.availability.nearUnique",     value: -50},
  unique:               { key: "sys-const.availability.unique",         value: -70}
}

export const DAMAGETYPE_MANIFEST = {
  energy:     {key:"sys-const.damageType.energy",     short:"E"},
  explosive:  {key:"sys-const.damageType.explosive",  short:"X"},
  rending:    {key:"sys-const.damageType.rending",    short:"R"},
  impact:     {key:"sys-const.damageType.impact",     short:"I"}
}
export const WEAPONCLASS_MANIFEST = {
  melee: {key:"sys-const.weaponclass.melee"},
  thrown: {key:"sys-const.weaponclass.thrown"},
  pistol: {key:"sys-const.weaponclass.pistol"},
  basic: {key:"sys-const.weaponclass.basic"},
  heavy: {key:"sys-const.weaponclass.heavy"},
  launch:{key:"sys-const.weaponclass.launch"},
  place:{key:"sys-const.weaponclass.place"},
  vehicle:{key:"sys-const.weaponclass.vehicle"}
}
export const WEAPONTYPE_MANIFEST = {
  las: {key:"sys-const.weapontype.las"},
  solid:{key:"sys-const.weapontype.solid"},
  bolt:{key:"sys-const.weapontype.bolt"},
  melta:{key:"sys-const.weapontype.melta"},
  plasma:{key:"sys-const.weapontype.plasma"},
  flame:{key:"sys-const.weapontype.flame"},
  launcher:{key:"sys-const.weapontype.launcher"},
  grenade:{key:"sys-const.weapontype.grenade"},
  exotic:{key:"sys-const.weapontype.exotic"},
  chain:{key:"sys-const.weapontype.chain"},
  power:{key:"sys-const.weapontype.power"},
  force:{key:"sys-const.weapontype.force"},
  shock:{key:"sys-const.weapontype.shock"},
  primary:{key:"sys-const.weapontype.primary"}
}
export const QUALITY_MANIFEST = {
  poor: {key:"sys-const.quality.poor"},
  common: {key:"sys-const.quality.common"},
  good: {key:"sys-const.quality.good"},
  best: {key:"sys-const.quality.best"}
}
export const ARMORTYPE_MANIFEST = {
  primative: {key:"sys-const.armortype.primative"},
  flak: {key:"sys-const.armortype.flak"},
  mesh: {key:"sys-const.armortype.mesh"},
  carapice: {key:"sys-const.armortype.carapice"},
  power: {key:"sys-const.armortype.power"},
  exotic: {key:"sys-const.armortype.exotic"}
}
export const PRIDE_MANIFEST = {
  beauty:{
    label:"sys-const.pride.beauty.label",
    description: "sys-const.pride.beauty.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.willpower":-4
    }
  },
  charm:{
    label:"sys-const.pride.charm.label",
    description:"sys-const.pride.charm.description",
    modifiers:{
      "characteristic.fellowship":5,
      "characteristic.toughness":-5
    }
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
    }
  },
  devotion:{
    label:"sys-const.pride.devotion.label",
    description:"sys-const.pride.devotion.description",
    modifiers:{
      "characteristic.willpower":5,
      "characteristic.strength":-5
    }
  },
  fortitude:{
    label:"sys-const.pride.fortitude.label",
    description:"sys-const.pride.fortitude.description",
    modifiers:{
      "characteristic.toughness":5,
      "characteristic.agility":-3,
      "characteristic.intelligence":-3
    }
  },
  foresight:{
    label:"sys-const.pride.foresight.label",
    description:"sys-const.pride.foresight.description",
    modifiers:{
      "characteristic.perception":5,
      "characteristic.felowship":-5
    }
  },
  logic:{
    label:"sys-const.pride.logic.label",
    description:"sys-const.pride.logic.description",
    modifiers:{
      "characteristic.intelligence":5,
      "characteristic.perception":-5
    }
  },
  martialProwess:{
    label:"sys-const.pride.martialProwess.label",
    description:"sys-const.pride.martialProwess.description",
    modifiers:{
      "characteristic.weaponSkill":5,
      "cahracteristic.intelligence":-5
    }
  },
  grace:{
    label:"sys-const.pride.grace.label",
    description:"sys-const.pride.grace.description",
    modifiers:{
      "characteristic.agility":5,
      "characteristic.ballisticSkill":-5,
    }
  },
  wealth:{
    label:"sys-const.pride.wrath.label",
    description:"sys-const.pride.wrath.description",
    modifiers:{
      "characteristic.willpower":-3
    }
  }
}
export const DISGRACE_MANIFEST ={
  betrayal:{
    label:"sys-const.disgrace.betrayal.label",
    description: "sys-const.disgrace.betrayal.description",
    modifiers:{
      "playermods.corruption":5,
      "trait.untrustworthy":true
    }
  },
  deceit:{
    label:"sys-const.disgrace.deceit.label",
    description:"sys-const.disgrace.deceit.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.perception":-4
    }
  },
  dread:{
    label:"sys-const.disgrace.dread.label",
    description:"sys-const.disgrace.dread.description",
    modifiers:{
      "characteristic.perception":5,
      "characteristic.willpower":-5,
    }
  },
  destruction:{
    label:"sys-const.disgrace.destruction.label",
    description:"sys-const.disgrace.destruction.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.fellowship":-4
    }
  },
  gluttony:{
    label:"sys-const.disgrace.gluttony.label",
    description:"sys-const.disgrace.gluttony.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.agility":-5
    }
  },
  greed:{
    label:"sys-const.disgrace.greed.label",
    description:"sys-const.disgrace.greed.description",
    modifiers:{
      "playermod.corruption":4,
      "trait.overwhelmingNeed":true
    }
  },
  hubris:{
    label:"sys-const.disgrace.hubris.label",
    description:"sys-const.disgrace.hubris.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.intelligence":-4
    }
  },
  regret:{
    label:"sys-const.disgrace.regret.label",
    description:"sys-const.disgrace.regret.description",
    modifiers:{
      "playermod.corruption":5,
      "trait.haunted":true
    }
  },
  waste:{
    label:"sys-const.disgrace.waste.label",
    description:"sys-const.disgrace.waste.description",
    modifiers:{
      "characteristic.willpower":-4,
      "characteristic.infamy":2,
    }
  },
  wrath:{
    label:"sys-const.disgrace.wrath.label",
    description:"sys-const.disgrace.wrath.description",
    modifiers:{
      "playermods.wounds":-1,
      "characteristic.willpower":-2,
      "characteristic.perception":5
    }
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
    }
  },
  ascendancy:{
    label:"sys-const.motivation.ascendancy.label",
    description:"sys-const.motivation.ascendancy.description",
    modifiers:{
      "playermods.wounds":-2,
      "characteristic.willpower":5
    }
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
    }
  },
    immortality:{
    label:"sys-const.motivation.immortality.label",
    description:"sys-const.motivation.immortality.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.weaponSkill":5
    }
  },
  innovation:{
    label:"sys-const.motivation.innovation.label",
    description:"sys-const.motivation.innovation.description",
    modifiers:{
      "playermods.corruption":2,
      "playermods.wounds":-2,
      "characteristic.intelligence":3
    }
  },
  legacy:{
    label:"sys-const.motivation.legacy.label",
    description:"sys-const.motivation.legacy.description",
    modifiers:{
      "characteristic.infamy":2,
      "characteristic.intelligence":-4
    }
  },
  nihilism:{
    label:"sys-const.motivation.nihilism.label",
    description:"sys-const.motivation.nihilism.description",
    modifiers:{
      "playermods.corruption":5,
      "characteristic.willpower":-3
    }
  },
  perfection:{
    label:"sys-const.motivation.perfection.label",
    description:"sys-const.motivation.perfection.description",
    modifiers:{
      "characteristic.choice":-3,
      "characteristic.choice":-3,
      "characteristic.choice":5
    }
  },
  vengeance:{
    label:"sys-const.motivation.vengeance.label",
    description:"sys-const.motivation.vengeance.description",
    modifiers:{
      "playermods.wounds":2,
      "characteristic.perception":-5,
    }
  },
  violence:{
    label:"sys-const.motivation.violence.label",
    description:"sys-const.motivation.violence.description",
    modifiers:{
      "playermods.corruption":5,
      "characteristic.intelligence":-3
    }
  }
}