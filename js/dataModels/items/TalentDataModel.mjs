import { BaseItemDataModel } from "./ItemDataModel.mjs";

const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class TalentDataModel extends BaseItemDataModel {
  static defineSchema() {
    const baseFields = super.defineSchema();
    const parentTraits = baseFields.traits?.options?.initial || [];
    baseFields.traits = new ArrayField(
      new StringField( // Inherit the StringField configuration exactly as the parent defined it
        {
          required: true
        }),
      {
        initial: [...parentTraits, "item:talent", "talent"]
      }
    );
    return {
      ...baseFields,
      description: new HTMLField({ required: false, initial: "" }),
      tier: new NumberField({ required: false, initial:1, min:1, max:3 }),
      specialist: new BooleanField({ required: true, initial: false }),
      specializationName: new StringField({ required: false, initial: "" }),
      allowsDuplication: new BooleanField({ required: true, initial: false }),

      // 1. SCALABLE MULTI-PREREQUISITE ENGINE
      // This array can hold multiple individual characteristic, talent, or type demands!
      prerequisites: new ArrayField(
        new SchemaField({
          type: new StringField({ required: true, initial: "characteristic" }),
          targetKey: new StringField({ required: false, initial: "" }),
          minValue: new NumberField({ required: false, integer: true, min: 0, max: 100, initial: 0 })
        }),
        { initial: [] }
      ),
      modifiers: new ArrayField(
        new SchemaField({
          targetType: new StringField({ required: true, initial: "skill" }),
          targetKey: new StringField({ required: true, initial: "athletics" }),
          modifierValue: new NumberField({ required: true, integer: true, min: -60, max: 60, initial: 10 })
        }),
        { initial: [] }
      )
    };
  }
  gatherRollOptions() {
    let set = new Set();
    const slug = this.slug ? this.slug : this.parent.name.slugify();
    const id = this.parent.uuid.replaceAll(".", "-");
    console.log(this.tier);
    set.add(`item:slug:${slug}`);
    set.add(`item:uuid:${id}`);
    set.add(`item:talent:tier:${this.tier}`);
    set.add(`item:talent:specialist:${this.specialist}`);
    set.add(`item:talent:duplicatable:${this.allowsDuplication}`);
    return Array.from(set);
  }
  async printToChat() {
    const itemDom = this.parent;
    const actorDoc = itemDom.actor;
    let compName = itemDom.name;
    if (this.specialist && this.specializationName) {
      compName += ` (${this.specializationName})`;
    }

    const chatContent = `
    <div class="my-system-chat-card" style="border: 1px solid #5c4e43; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px;">
      <h6 style="text-align: left; padding-bottom: 1px;">Talent</h6>
      <h3 style="text-align: center; border-bottom: 2px solid #5c4e43; margin: 0 0 6px 0; padding-bottom: 2px; font-weight: bold;">${compName}</h3>
      <h4 style="text-align: center; border-bottom: 2px solid #5c4e43; margin: 0 0 6px 0; padding-bottom: 2px; font-weight: bold;">${this.tier}</h4>
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