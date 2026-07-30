const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

import { RELOADTIME_MANIFEST, AVAILABILITY_MANIFEST, DAMAGETYPE_MANIFEST, WEAPONCLASS_MANIFEST, WEAPONTYPE_MANIFEST, QUALITY_MANIFEST } from "../../utils/sys-const.mjs";
import { BaseItemDataModel } from "./ItemDataModel.mjs";

export class WeaponDataModel extends BaseItemDataModel {
    static defineSchema() {
        const baseFields = super.defineSchema();
        const parentTraits = baseFields.traits?.options?.initial || [];
        baseFields.traits = new ArrayField(
            new StringField( // Inherit the StringField configuration exactly as the parent defined it
                {
                    required: true
                }),
            {
                initial: [...parentTraits, "item:weapon", "weapon"]
            }
        );
        return {
            ...baseFields,
            description: new HTMLField({ required: true, initial: "" }),
            equipped: new BooleanField({ required: true, initial: false }),
            class: new StringField({ required: true, initial: "melee", choices: Object.keys(WEAPONCLASS_MANIFEST) }),
            type: new StringField({ required: true, initial: "las", choices: Object.keys(WEAPONTYPE_MANIFEST) }),
            craftsmanship: new StringField({ required: true, initial: "poor", choices: Object.keys(QUALITY_MANIFEST) }),
            range: new NumberField({ required: true, initial: 0 }),
            rateOfFire: new SchemaField({
                single: new StringField({ required: true, initial: false }),
                semi: new NumberField({ required: true, initial: 0 }),
                full: new NumberField({ required: true, initial: 0 })
            }),
            isMelee: new BooleanField({ required: true, initial: false }),
            damage: new SchemaField({
                value: new StringField({ required: true, initial: "0d10+0" }),
                type: new StringField({
                    required: true,
                    blank: false,
                    initial: "energy",
                    choices: Object.keys(DAMAGETYPE_MANIFEST)
                })
            }),
            pen: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            clip: new SchemaField({
                current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
                max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
            }),
            reload: new StringField({ required: true, integer: true, initial: "half", choices: Object.keys(RELOADTIME_MANIFEST) }),
            special: new ArrayField(
                new StringField({ required: true, initial: "" }),
                {
                    required: true, initial: []
                },

            ),
            weight: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
            availability: new StringField({
                required: true,
                blank: false,
                initial: "average",
                choices: Object.keys(AVAILABILITY_MANIFEST)
            })
        };
    }
    gatherRollOptions() {
        let set = new Set();
        for (const trait of this.traits) {
            set.add(trait);
        }
        const slug = this.slug ? this.slug : this.parent.name.slugify();
        const id = this.parent.uuid.replaceAll(".", "-");
        set.add(`item:slug:${slug}`);
        set.add(`item:uuid:${id}`);
        const classConfig = WEAPONCLASS_MANIFEST[this.class];
        const typeConfig = WEAPONTYPE_MANIFEST[this.type];
        const damageConfig = DAMAGETYPE_MANIFEST[this.damage.type];
        const reloadConfig = RELOADTIME_MANIFEST[this.reload];
        if (classConfig?.traits) {
            for (const trait of classConfig.traits) {
                set.add(`item:weapon:class:${trait}`);
            }
        }
        if (typeConfig?.traits) {
            for (const trait of typeConfig.traits) {
                set.add(`item:weapon:type:${trait}`);
            }
        }
        set.add(`item:quality:${this.craftsmanship}`);
        set.add(`item:availability:${this.availability}`);
        if (damageConfig?.traits) {
            for (const trait of damageConfig.traits) {
                set.add(`item:weapon:damage:${trait}`);
            }
        }
        if (reloadConfig?.traits) {
            for (const trait of reloadConfig.traits) {
                set.add(`item:weapon:reload:${trait}`);
            }
        }
        if (!this.isMelee) set.add(`item:weapon:range:${this.range}`);
        this.isMelee ? set.add(`item:weapon:melee:true`) : set.add(`item:weapon:melee:false`);
        set.add(`item:weapon:rof:single:${this.rateOfFire.single}`);
        set.add(`item:weapon:rof:semi:${this.rateOfFire.semi}`);
        set.add(`item:weapon:rof:full:${this.rateOfFire.full}`);
        set.add(`item:weapon:pen:${this.pen}`);
        set.add(`item:weapon:clip:max:${this.clip.max}`);
        if (this?.special) {
            for (const spec of this.special) {
                set.add(`item:weapon:special:${spec}`);
            }
        }
        return Array.from(set);
    }
    async printToChat() {
        const itemDom = this.parent;
        console.log(`item dom:`)
        console.log(itemDom)
        console.log(`///////////`)
        const actorDoc = itemDom.actor;
        let compName = itemDom.name;
        let localizedItemType = game.i18n.localize(`TYPES.Item.${itemDom.type}.label`);
        let localizedWepClass = game.i18n.localize(`sys-const.weaponclass.${this.class}`);
        let localizedWepType = game.i18n.localize(`sys-const.weapontype.${this.type}`);
        let damage = this.damage.value;
        let damageType = game.i18n.localize(`sys-const.damageType.${this.damage.type}.short`);
        let weightValue = this.weight;
        let localizedavailability = game.i18n.localize(`sys-const.availability.${this.availability}`);
        let availColor = AVAILABILITY_MANIFEST[this.availability].color;
        let quality = game.i18n.localize(`sys-const.quality.${this.craftsmanship}`);
        let qualityColor = QUALITY_MANIFEST[this.craftsmanship].color;

        const chatContent = `
    <div class="fantasy-hammer-weapon-chat-card">
      <h6 class="item-type-bar"><span class="weapon-quality" style="color:${qualityColor};">${quality} quality: ${localizedItemType}</span></h6>
      <h4 class="weapon-quality-name">  <span class="weapon-name">${compName}</span></h3>
      <h5 class="weapon-type-class">${localizedWepType} ${localizedWepClass}</h5>
      <div class="weapon-stat-wrapper">
        <div class="weapon-stat-aside">
          <h6 class="weapon-damage">${damage} ${damageType}</h6>
          <h6 class="weapon-weight">${weightValue} kg</h6>
          <span class="weapon-avail" style="color:${availColor};">${localizedavailability}</span>
        </div>
        <img class="weapon-image chat-card-item-link" data-actor-id="${actorDoc.uuid}" data-item-id="${itemDom.uuid}"src=${this.parent.img} />
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.9rem;">
        ${this.description}
      </div>
    </div>
  `;
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker(actorDoc),
            content: chatContent
        });
    }
}