/*
** 2026-06-20
**
** In place of a legal notice, here is a blessing:
**
**    May you do good and not evil.
**    May you find forgiveness for yourself and forgive others.
**    May you share freely, never taking more than you give.
**
*************************************************************************
*/

/*
**
** Honors
**
*************************************************************************
** 
** addythehealer
** ctabdul15
** ensinolats
** daniswastaken
*/

import { system, world } from "@minecraft/server";

function shouldTakeDurabilityDamage(item: any) {
    const ench = item.getComponent("enchantable");
    if (!ench) return true;

    const unbreaking = ench.getEnchantment("unbreaking");
    if (!unbreaking) return true;

    const level = unbreaking.level;
    const chanceNoDamage = level / (level + 1);

    return Math.random() >= chanceNoDamage;
}

function increaseDurability(player: any, itemStack: any, amount = 1) {
    let damageComp = itemStack.getComponent("minecraft:durability");
    if (!damageComp) return;

    if (shouldTakeDurabilityDamage(itemStack)) {
        damageComp.damage += amount;
    }
    if (damageComp.damage + 1 >= damageComp.maxDurability) {
        itemStack = undefined;
        player.playSound("random.break", { volume: 10 });
    }
    player.getComponent("inventory").container.setItem(player.selectedSlotIndex, itemStack);
}

world.beforeEvents.playerBreakBlock.subscribe(e => {
    var block = e.block;
    var capitator = e.player.isSneaking && (block.hasTag("wood"));

    if (capitator) {
        let dimension = block.dimension;
        let toBreak = [block.location];
        let checked = new Set();

        while (toBreak.length > 0) {
            let location = toBreak.shift()!;
            let key = `${location.x},${location.y},${location.z}`;
            if (checked.has(key)) continue;
            checked.add(key);

            let currentBlock = dimension.getBlock(location);
            if (currentBlock && currentBlock.hasTag("wood")) {
                system.run(() => {
                    dimension.runCommand(`setblock ${location.x} ${location.y} ${location.z} air destroy`);
                });
                let adjacent = [
                    // Around
                    { x: location.x + 1, y: location.y, z: location.z },
                    { x: location.x - 1, y: location.y, z: location.z },
                    { x: location.x, y: location.y + 1, z: location.z },
                    { x: location.x, y: location.y, z: location.z + 1 },
                    { x: location.x, y: location.y, z: location.z - 1 },

                    // Around upwards
                    { x: location.x, y: location.y + 1, z: location.z + 1 },
                    { x: location.x, y: location.y + 1, z: location.z - 1 },
                    { x: location.x + 1, y: location.y + 1, z: location.z },
                    { x: location.x - 1, y: location.y + 1, z: location.z },

                    // Around downwards
                    { x: location.x, y: location.y - 1, z: location.z + 1 },
                    { x: location.x, y: location.y - 1, z: location.z - 1 },
                    { x: location.x + 1, y: location.y - 1, z: location.z },
                    { x: location.x - 1, y: location.y - 1, z: location.z },

                    // Diagonal
                    { x: location.x - 1, y: location.y, z: location.z - 1 },
                    { x: location.x - 1, y: location.y, z: location.z + 1 },
                    { x: location.x + 1, y: location.y, z: location.z - 1 },
                    { x: location.x + 1, y: location.y, z: location.z + 1 },

                    // Diagonal upwards
                    { x: location.x - 1, y: location.y + 1, z: location.z - 1 },
                    { x: location.x - 1, y: location.y + 1, z: location.z + 1 },
                    { x: location.x + 1, y: location.y + 1, z: location.z - 1 },
                    { x: location.x + 1, y: location.y + 1, z: location.z + 1 },

                    // Diagonal downwards
                    { x: location.x - 1, y: location.y - 1, z: location.z - 1 },
                    { x: location.x - 1, y: location.y - 1, z: location.z + 1 },
                    { x: location.x + 1, y: location.y - 1, z: location.z - 1 },
                    { x: location.x + 1, y: location.y - 1, z: location.z + 1 },
                ];
                for (let loc of adjacent) {
                    toBreak.push(loc);
                }

                system.run(() => {
                    increaseDurability(e.player, e.itemStack)
                })
            }
        }
        e.cancel = true;
    }
});
