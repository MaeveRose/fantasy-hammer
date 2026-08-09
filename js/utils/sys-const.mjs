export const SYSTEM_ID = "fantasy-hammer";
export const SKILL_MANIFEST = {
  acrobatics:{ 
    char: "agility",
    key: "sys-const.skills.acrobatics",
    option:["skill","skill:acrobatics"]
  },
  athletics:{ 
    char: "strength",
    key: "sys-const.skills.athletics",
    option:["skill","skill:athletics"]
  },
  awareness:{ 
    char: "perception",
    key: "sys-const.skills.awareness",
    option:["skill","skill:awareness"]
  },
  charm:{ 
    char: "fellowship",
    key: "sys-const.skills.charm",
    option:["skill","skill:charm"]
  },
  command:{ 
    char: "fellowship",
    key: "sys-const.skills.command",
    option:["skill","skill:command"]
  },
  commerce:{ 
    char: "intelligence",
    key: "sys-const.skills.commerce",
    option:["skill","skill:commerce"]
  },
  commonLore:{ 
    char: "none",
    key: "sys-const.skills.commonLore",
    option:["skill","skill:common-lore"]
  },
  deceive:{ 
    char: "fellowship",
    key: "sys-const.skills.deceive",
    option:["skill","skill:deceive"]
  },
  dodge:{ 
    char: "agility",
    key: "sys-const.skills.dodge",
    option:["skill","skill:dodge"]
  },
  forbiddenLore:{ 
    char: "intelligence",
    key: "sys-const.skills.forbiddenLore",
    option:["skill","skill:forbidden-lore"]
  },
  inquiry:{ 
    char: "fellowship",
    key: "sys-const.skills.inquiry",
    option:["skill","skill:inquiry"]
  },
  intimidate:{ 
    char: "willpower",
    key: "sys-const.skills.intimidate",
    option:["skill","skill:intimidate"]
  },
  linguistics:{ 
    char: "intelligence",
    key: "sys-const.skills.linguistics",
    option:["skill","skill:linguistics"]
  },
  logic:{ 
    char: "intelligence",
    key: "sys-const.skills.logic",
    option:["skill","skill:logic"]
  },
  medicae:{ 
    char: "intelligence",
    key: "sys-const.skills.medicae",
    option:["skill","skill:medicae"]
  },
  navigationSurface:{ 
    char: "intelligence",
    key: "sys-const.skills.navigationSurface",
    option:["skill","skill:navigation-surface"]
  },
  navigationStellar:{ 
    char: "intelligence",
    key: "sys-const.skills.navigationStellar",
    option:["skill","skill:navigation-stellar"]
  },
  navigationWarp:   { 
    char: "intelligence",
    key: "sys-const.skills.navigationWarp",
    option:["skill","skill:navigation-warp"]
  },
  operateAeronautica:{ 
    char: "agility",
    key: "sys-const.skills.operateAeronautica",
    option:["skill","skill:operate-aeronautica"]
  },
  operateSurface:{ 
    char: "agility",
    key: "sys-const.skills.operateSurface",
    option:["skill","skill:operate-surface"]
  },
  operateVoidship:{ 
    char: "agility",
    key: "sys-const.skills.operateVoidship",
    option:["skill","skill:operate-voidship"]
  },
  parry:{ 
    char: "weaponSkill",
    key: "sys-const.skills.parry",
    option:["skill","skill:parry"]
  },
  psyniscience:{ 
    char: "perception",
    key: "sys-const.skills.psyniscience",
    option:["skill","skill:psyniscience"]
  },
  scholasticLore:{ 
    char: "intelligence",
    key: "sys-const.skills.scholasticLore",
    option:["skill","skill:scholastic-lore"]
  },
  scrutiny:{ 
    char: "perception",
    key: "sys-const.skills.scrutiny",
    option:["skill","skill:scrutiny"]
  },
  security:{ 
    char: "intelligence",
    key: "sys-const.skills.security",
    option:["skill","skill:security"]
  },
  slightOfHand:{ 
    char: "agility",
    key: "sys-const.skills.slightOfHand",
    option:["skill","skill:slight-of-hand"]
  },
  stealth:{ 
    char: "agility",
    key: "sys-const.skills.stealth",
    option:["skill","skill:stealth"]
  },
  techUse:{ 
    char: "intelligence",
    key: "sys-const.skills.techUse",
    option:["skill","skill:tech-use"]
  },
  tracking:{ 
    char: "intelligence",
    key: "sys-const.skills.tracking",
    option:["skill","skill:tracking"]
  },
  trade:{ 
    char: "intelligence",
    key: "sys-const.skills.trade",
    option:["skill","skill:trade"]
  }
}
export const CHARACTERISTIC_MANIFEST = {
    weaponSkill:        {
      key: "sys-const.characteristic.weaponSkill",
      short: "sys-const.characteristic.weaponSkill_short",
      option:["characteristic","characteristic:weapon-skill"]
    },
    ballisticSkill:     {
      key: "sys-const.characteristic.ballisticSkill",
      short: "sys-const.characteristic.ballisticSkill_short",
      option:["characteristic","characteristic:ballistic-skill"]
    },
    strength:           {
      key: "sys-const.characteristic.strength",
      short: "sys-const.characteristic.strength_short",
      option:["characteristic","characteristic:strength"]
    },
    toughness:          {
      key: "sys-const.characteristic.toughness",
      short: "sys-const.characteristic.toughness_short",
      option:["characteristic","characteristic:toughness"]
    },
    agility:            {
      key: "sys-const.characteristic.agility",
      short: "sys-const.characteristic.agility_short",
      option:["characteristic","characteristic:agility"]
    },
    intelligence:       {
      key: "sys-const.characteristic.intelligence",
      short: "sys-const.characteristic.intelligence_short",
      option:["characteristic","characteristic:intelligence"]
    },
    perception:         {
      key: "sys-const.characteristic.perception",
      short: "sys-const.characteristic.perception_short",
      option:["characteristic","characteristic:perception"]
    },
    willpower:          {
      key: "sys-const.characteristic.willpower",
      short: "sys-const.characteristic.willpower_short",
      option:["characteristic","characteristic:willpower"]
    },
    fellowship:         {
      key: "sys-const.characteristic.fellowship",
      short: "sys-const.characteristic.fellowship_short",
      option:["characteristic","characteristic:fellowship"]
    },
    infamy:             {
      key: "sys-const.characteristic.infamy",
      short: "sys-const.characteristic.infamy_short",
      option:["characteristic","characteristic:infamy"]
    }
}
export const SIZE_MANIFEST = {
  miniscule:{
    value:1,
    modifier:{
      tohit: -30,
      stealth: 30,
      movement: -3
    },
    option:["size:miniscule","size:1"],
    key:"sys-const.size.miniscule"
  },
    tokensize:[1,1],
    tokenscale:0.5,
  puny:{
    value:2,
    modifier:{
      tohit: -20,
      stealth: 20,
      movement: -2
    },
    tokensize:[1,1],
    tokenscale:0.75,
    option:["size:puny","size:2"],
    key:"sys-const.size.puny"
  },
  weedy:{
    value:3,
    modifier:{
      tohit: -10,
      stealth: 10,
      movement: -1
    },
    tokensize:[1,1],
    tokenscale:0.9,
    option:["size:weedy","size:3"],
    key:"sys-const.size.weedy"
  },
  average:{
    value: 4,
    modifier:{
      tohit: 0,
      stealth: 0,
      movement: 0
    },
    tokensize:[1,1],
    tokenscale:1.0,
    option:["size:average","size:4"],
    key:"sys-const.size.average"
  },
  hulking:{
    value: 5,
    modifier:{
      tohit: 10,
      stealth: -10,
      movement: 1
    },
    tokensize:[1,1],
    tokenscale:1.5,
    option:["size:hulking","size:5"],
    key:"sys-const.size.hulking"
  },
  enormous:{
    value: 6,
    modifier:{
      tohit: 20,
      stealth: -20,
      movement: 2
    },
    tokensize:[2,2],
    tokenscale:1.0,
    option:["size:enormous","size:6"],
    key:"sys-const.size.enormous"
  },
  massive:{
    value:7,
    modifier:{
      tohit: 30,
      stealth: -30,
      movement: 3
    },
    tokensize:[3,3],
    tokenscale:1.0,
    option:["size:massive","size:7"],
    key:"sys-const.size.massive"
  },
  immense:{
    value:8,
    modifier:{
      tohit: 40,
      stealth: -40,
      movement: 4
    },
    tokensize:[4,4],
    tokenscale:1.0,
    option:["size:immense","size:8"],
    key:"sys-const.size.immense"
  },
  monumental:{
    value:9,
    modifier:{
      tohit: 50,
      stealth: -50,
      movement: 5
    },
    tokensize:[5,5],
    tokenscale:1.0,
    option:["size:monumental","size:9"],
    key:"sys-const.size.monumental"
  },
  titanic:{
    value:10,
    modifier:{
      tohit: 60,
      stealth: -60,
      movement: 6
    },
    tokensize: [5,5],
    tokenscale: 1.2,
    option:["size:titanic","size:10"],
    key:"sys-const.size.titanic"
  },
}
export const FIREMODE_MANIFEST = {
  automatic:{
    key:"auto",
    value:"-10"
  },
  semi:{
    key:"semi",
    value:"0"
  },
  single:{
    key:"single",
    value:"10"
  }
}
export const RANGE_MANIFEST = {
  pointblank:{
    key:"pointblank",
    value: 30
  },
  short:{
    value: 10
  },
  standard:{
    value:0
  },
  long:{
    value:-10
  },
  extreme:{
    value:-30
  },
  outofrange:{
    value:-Infinity
  }
}
export const AVAILABILITY_MANIFEST = {
  ubiquitous:{
    key: "sys-const.availability.ubiquitous",
    value: 70,
    option:["availability:ubiquitous"],
    color: "#94a3b8"
  },
  abundant:{
    key: "sys-const.availability.abundant",
    value: 50,
    option:["availability:abundant"],
    color: "#cbd5e1"
  },
  plentiful:{
    key: "sys-const.availability.plentiful",
    value: 30,
    option:["availability:plentiful"],
    color: "#ffffff"
  },
  common:{
    key: "sys-const.availability.common",
    value: 20,
    option:["availability:common"],
    color: "#1eff00"
  },
  average:{
    key: "sys-const.availability.average",
    value: 10,
    option:["availability:average"],
    color: "#06b6d4"
  },
  scarce:{
    key: "sys-const.availability.scarce",
    value: 0,
    option:["availability:scarce"],
    color: "#0070dd"
  },
  rare:{
    key: "sys-const.availability.rare",
    value: -10,
    option:["availability:rare"],
    color: "#a335ee"
  },
  veryRare:{
    key: "sys-const.availability.veryRare",
    value: -20,
    option:["availability:very-rare"],
    color: "#d946ef"
  },
  extremelyRare:{
    key: "sys-const.availability.extremelyRare",
    value: -30,
    option:["availability:extremely-rare"],
    color: "#ff3333"
  },
  nearUnique:{
    key: "sys-const.availability.nearUnique",
    value: -50,
    option:["availability:near-unique"],
    color: "#e65c00"
  },
  unique:{
    key: "sys-const.availability.unique",
    value: -70,
    option:["availability:unique"],
    color: "#e5c158"
  }
}
export const DAMAGETYPE_MANIFEST = {
  energy:     {
    key:"sys-const.damageType.energy",
    short:"E",
    option:["energy"]
  },
  explosive:  {
    key:"sys-const.damageType.explosive",
    short:"X",
    option:["explosive"]
  },
  rending:    {
    key:"sys-const.damageType.rending",
    short:"R",
    option:["rending"]
  },
  impact:     {
    key:"sys-const.damageType.impact",
    short:"I",
    option:["impact"]
  }
}
export const WEAPONCLASS_MANIFEST = {
  melee: {
    key:"sys-const.weaponclass.melee",
    option:["melee"]
  },
  thrown: {
    key:"sys-const.weaponclass.thrown",
    option:["thrown"]
  },
  pistol: {
    key:"sys-const.weaponclass.pistol",
    option:["pistol"]
  },
  basic: {
    key:"sys-const.weaponclass.basic",
    option:["basic"]
  },
  heavy: {
    key:"sys-const.weaponclass.heavy",
    option:["heavy"]
  },
  launch:{
    key:"sys-const.weaponclass.launch",
    option:["launch"]
  },
  place:{
    key:"sys-const.weaponclass.place",
    option:["place"]
  },
  vehicle:{
    key:"sys-const.weaponclass.vehicle",
    option:["vehicle"]
  }
}
export const WEAPONTYPE_MANIFEST = {
  las: {
    key:"sys-const.weapontype.las",
    option:["las"]
  },
  solid:{
    key:"sys-const.weapontype.solid",
    option:["solid"]
  },
  bolt:{
    key:"sys-const.weapontype.bolt",
    option:["bolt"]
  },
  melta:{
    key:"sys-const.weapontype.melta",
    option:["melta"]
  },
  plasma:{
    key:"sys-const.weapontype.plasma",
    option:["plasma"]
  },
  flame:{
    key:"sys-const.weapontype.flame",
    option:["flame"]
  },
  launcher:{
    key:"sys-const.weapontype.launcher",
    option:["launcher"]
  },
  grenade:{
    key:"sys-const.weapontype.grenade",
    option:["granade"]
  },
  exotic:{
    key:"sys-const.weapontype.exotic",
    option:["exotic"]
  },
  chain:{
    key:"sys-const.weapontype.chain",
    option:["chain"]
  },
  power:{
    key:"sys-const.weapontype.power",
    option:["power"]
  },
  force:{
    key:"sys-const.weapontype.force",
    option:["force"]
  },
  shock:{
    key:"sys-const.weapontype.shock",
    option:["shock"]
  },
  primary:{
    key:"sys-const.weapontype.primary",
    option:["primary"]
  }
}
export const QUALITY_MANIFEST = {
  poor:{
    key:"sys-const.quality.poor",
    option:["quality:poor"],
    color: "#808080",
    availValue: 10
  },
  common:{
    key:"sys-const.quality.common",
    option:["quality:common"],
    color:"#1eff00",
    availValue: 0
  },
  good:{
    key:"sys-const.quality.good",
    option:["quality:good"],
    color:"#0070dd",
    availValue: -10
  },
  best:{
    key:"sys-const.quality.best",
    option:["quality:best"],
    color:"#a335ee",
    availValue: -20
  }
}
export const ARMORTYPE_MANIFEST = {
  primative:{
    key:"sys-const.armortype.primative",
    option:["armor:primative"]
  },
  flak:{
    key:"sys-const.armortype.flak",
    option:["armor:flak"]
  },
  mesh:{
    key:"sys-const.armortype.mesh",
    option:["armor:mesh"]
  },
  carapice:{
    key:"sys-const.armortype.carapice",
    option:["armor:carapice"]
  },
  power:{
    key:"sys-const.armortype.power",
    option:["armor:power"]
  },
  exotic:{
    key:"sys-const.armortype.exotic",
    option:["armor:exotic"]
  }
}
export const RELOADTIME_MANIFEST={
  free:{
    label:"sheets.weapon.stats.free",
    key:"free",
    option:["free"]
  },
  half:{
    label:"sheets.weapon.stats.half",
    key:"half",
    option:["half"]
  },
  full:{
    label:"sheets.weapon.stats.full",
    key:"full",
    option:["full"]
  },
  twoFull:{
    label:"sheets.weapon.stats.full",
    key:"2full",
    option:["2-full"]
  },
  threeFull:{
    label:"sheets.weapon.stats.full",
    key:"3full",
    option:["3-full"]
  },
  fourFull:{
    label:"sheets.weapon.stats.full",
    key:"4full",
    option:["4-full"]
  },
  fiveFull:{
    label:"sheets.weapon.stats.full",
    key:"5full",
    option:["5-full"]
  },
  sixFull:{
    label:"sheets.weapon.stats.full",
    key:"6full",
    option:["6-full"]
  }
}
export const ADVANCEMENT_MANIFEST={
  skill:{
    key:"skill"
  },
  talent:{
    key:"talent"
  },
  characteristic:{
    key:"characteristic"
  },
}
export const AMOUNT_MANIFEST={
  single:{
    key: "sys-const.itemAmount.single.label",
    disc: "sys-const.itemAmount.single.disc",
    value: 10
  },
  minor:{
    key: "sys-const.itemAmount.minor.label",
    disc: "sys-const.itemAmount.minor.disc",
    value:0
  },
  significant:{
    key: "sys-const.itemAmount.significant.label",
    disc: "sys-const.itemAmount.significant.disc",
    value:-10
  },
  vast:{
    key: "sys-const.itemAmount.vast.label",
    disc: "sys-const.itemAmount.vast.disc",
    value:-20
  },
  legion:{
    key: "sys-const.itemAmount.legion.label",
    disc: "sys-const.itemAmount.legion.disc",
    value:-40
  },
  impossible:{
    key: "sys-const.itemAmount.impossible.label",
    disc: "sys-const.itemAmount.impossible.disc",
    value: -60
  },
}