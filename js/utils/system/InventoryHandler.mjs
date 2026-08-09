import { AMOUNT_MANIFEST, AVAILABILITY_MANIFEST, CHARACTERISTIC_MANIFEST, QUALITY_MANIFEST } from "../sys-const.mjs";
import { executeD100Test } from "./rollEngine.mjs";
import { executeD100TestSilent } from "./rollEngine.mjs";

export class InventoryHandler {
    static async _HandleDrop(Actor, item) {
        const rollSuccess = await this._rollToAquire(Actor, item);
        return rollSuccess;
    }

    static async _rollToAquire(ActorItem, Item) {
        if(!Item || !ActorItem || ActorItem.type !== "character") return false;
        //if(ActorItem.system.characterCreationActive || game.user.isGM) return true;
        const itemDrop = foundry.utils.deepClone(Item);
        const availOp = Object.entries(AVAILABILITY_MANIFEST).map(([key, config])=>{
            return {
                id:key,
                label: game.i18n.localize(config.key),
                value: config.value,
                color: config.color
            }
        });
        const craftOp = Object.entries(QUALITY_MANIFEST).map(([key, config]) => {
            return {
                id:key,
                label: game.i18n.localize(config.key),
                value: config.availValue,
                color: config.color
            }
        });
        const numberOp = Object.entries(AMOUNT_MANIFEST).map(([key, config])=> {
            const initial = game.i18n.localize(config.key);
            const disc = game.i18n.localize(config.disc);

            return{
                id:key,
                label: `${initial} (${disc})`,
                value: config.value
            }
        });
        const title = game.i18n.localize("global.acquisitiondialog.title");
        const templateData = {
            availOptions: availOp,
            baseAvail: itemDrop.system.availability,
            baeCraft: itemDrop.system.craftsmanship,
            amountOptions: numberOp,
            craftOptions: craftOp,
            itemName:itemDrop.name,
            itemType:itemDrop.type
        }
        const dialogHTML = await foundry.applications.handlebars.renderTemplate('systems/fantasy-hammer/html/sheets/common/acquisitionTest.hbs', templateData);
        return new Promise((resolve) => {
            new foundry.applications.api.DialogV2({
                window: { title: `${title}` },
                content: dialogHTML,
                buttons: [
                    {
                        action: "submit",
                        label: "Confirm",
                        class: "dialog-button-ok",
                        callback: (event, button, target) => {
                            const formdata = new foundry.applications.ux.FormDataExtended(button.form);
                            console.log(formdata);
                            const availMod = AVAILABILITY_MANIFEST[formdata.object.availability].value || 0;
                            const craftMod = QUALITY_MANIFEST[formdata.object.craftsmanship].availValue || 0;
                            const amountMod = AMOUNT_MANIFEST[formdata.object.amount].value || 0;
                            const miscMod = Number(formdata.object.miscmod) || 0;
                            let modifier = availMod+craftMod+amountMod+miscMod;
                            const result = executeD100TestSilent(ActorItem, "char:infamy", [availMod,craftMod,amountMod,miscMod]);
                            resolve(result);
                        }
                    },
                    {
                        action: "cancel",
                        label: "Cancel",
                        callback: () => resolve(false)
                    }
                ],
                close: () => resolve(false)
            }).render(true);
        });
        
    }
}