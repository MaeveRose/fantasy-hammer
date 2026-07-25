const { StringField, HTMLField, NumberField, SchemaField, ArrayField, BooleanField } = foundry.data.fields;

export class TalentDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: false, initial: "" }),
      tier: new StringField({ required: false, initial: "Tier 1" }),
      specialist: new BooleanField({required: true, initial: false}),
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
  async printToChat(){
    const itemDom = this.parent;
    const actorDoc = itemDom.actor;
    let compName = itemDom.name;
    if(this.specialist && this.specializationName)
    {
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