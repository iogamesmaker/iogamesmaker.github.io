---
layout: default
title: DSA Item Counter & Configurator
---

## How to use
- Build NEM0's printer design. Press to copy the DSA for the <a href="#" id="copyleft">left side</a>, or the <a href="#" id="copyright">right side</a> of the ship. Truly one of the designs of all time
    - <small>i made some minor changes and fixes, 100% compatible with the original.</small>
- Put your ship DSA in the container below
- Enter the number of doors you need
    - <small>doors aren't stored in the DSA but they are supported on NEM0's printer design.</small>
- Press "process"
- Paste the output DSA on the printer
- Coolsnake quickly to the left and then down again. About a quarter of a second of coolsnake to the left is enough for it to activate.
- Watch it automatically RCD

## THIS IS A VERY EARLY RELEASE, STUFF MIGHT BREAK!!

<style>
    .container { max-width: 600px; display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; }
    textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
    th { background: #f4f4f4; }
    .icon-img { object-fit: contain; vertical-align: middle; margin-right: 8px; }
    .total-row { font-weight: bold; background: #fafafa; }
    .btn { width: 100% }
    h2 { margin-bottom: 5px; font-size: 1.25em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
</style>

<div class="container">
    <div>
        <label for="doorsCount">Doors:</label>
        <input type="number" id="doorsCount" value="0" min="0" max="59" step="1" style="width: 100px;">
    </div>
    <div>
        <textarea id="bpInput" placeholder="input DSA here"></textarea>
    </div>

    <button id="processBtn" class="btn" disabled>Process</button>

    <div id="outputContainer" style="display:none;">
        <textarea id="outDsa" readonly></textarea>
    </div>

    <div id="results" style="display:none;">
        <h2>manifest scan</h2>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="width: 80px;">Count</th>
                </tr>
            </thead>
            <tbody id="statsBody"></tbody>
        </table>
    </div>
</div>

<script>
  document.getElementById('copyleft').addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText('DSA: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').then(() => {
      alert('Copied left side to clipboard.');
    });
  });
  document.getElementById('copyright').addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText('DSA: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').then(() => {
      alert('Copied right side to clipboard.');
    });
  });
</script>

<script type="module">
    import { decode, encode, Item, BuildCmd, ConfigCmd } from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";

    const bpInput = document.getElementById('bpInput');
    const outDsa = document.getElementById('outDsa');
    const processBtn = document.getElementById('processBtn');
    const statsBody = document.getElementById('statsBody');
    const resultsDiv = document.getElementById('results');
    const outputContainer = document.getElementById('outputContainer');
    
    const IMG_BASE_URL = "https://test.drednot.io/img/";
    
    const CONFIG_DSA = "DSA:rZfZSiNBFIZPddKL7SSTAWdxBBkGZoa5mLlQ1IBRFMQl4vIGIhol4ALqAwStvglEu0F8OkUQ9wVEEBQErbTViRfmdFVRV0k68PX/13/q1Ckf6DSd9n2yE/hAJ+hU6ZR9ASidVX9PhZ9kd5g9KqfmVlcWioszS6uz84U18E0CmZbt7aCcWigubRTWZl7/B98Iyh/4o+JGYXkdfPD2AIKAIXNu6akh0bBJpqUiSLznxD8YMck0tstq/NqEEC1DwTXNtyFIMCVsP3PkT8y2ZSuIdBlxi7DsIcmeNBQrnpF3Chz9CxNLZOzfcGI3RgSVjFIOVpkWESdecWInqlFiHR3CiRZGTNjVWq/Iuf7m4oWZFtV4EWVNJ7MI0jQkFvKutn1asT0u0zUOOfIv6tsSzwaibEy0xi2VrjGOdw0FZB8ukhBh4jkntsYQxaOxCLc9+jGugASzearV5FiXprgvI2QT9z30HtE2hFfSrNV4J9Z/ZHrkAUemtYW9z4ltGNEUP3Sq9fhKNOKOsXZZIs2HWcN3VKvKfvzNiGZjZFLBPs33YBmBgsr/2DlmK4kcz+qZXryjCJlw4w5bQeJjTeRgs56BqO47yUR+0qESvBOO7HFj45Y8wNOOngKq2044ujr6Ayf2o64Twq7flmS3ronyNto3mvpFXaSNzhgqt6cvTjiiZyCcOjRco7zrSOxnvLVLLOgxJ/bG7fGcoEYSjVjN6PirEhGdyMZ0jVxFMqMOtNiVbo8jqfBEowPhxRR+sCrYJDAAOo7i+mv+VYUHwQs=";

    const PRINTER_MAPPING = {
        [Item.RES_FLUX.id]: {
            maxStack: 16,
            injector: { x: 74, y: 51 },
            timer1: { x: 74, y: 53 }
        },
        [Item.BLOCK_HYPER_RUBBER.id]: {
            maxStack: 16,
            injector: { x: 78, y: 56 },
            timer1: { x: 75, y: 56 },
            timer2: { x: 77, y: 56 }
        },
        [Item.LOADER_NEW.id]: {
            maxStack: 1,
            injector: { x: 73, y: 53 },
            timer1: { x: 74, y: 55 },
            timer2: { x: 75, y: 54}
        },
        [Item.PUSHER.id]: {
            maxStack: 1,
            injector: { x: 73, y: 53 },
            timer1: { x: 74, y: 27 },
            timer2: { x: 75, y: 27}
        },
        [Item.BLOCK_LOGISTICS_RAIL.id]: {
            maxStack: 16,
            injector: { x: 72, y: 15 },
            timer1: { x: 71, y: 13 }
        },
        [Item.FABRICATOR_ENGINEERING.id]: {
            maxStack: 1,
            injector: { x: 65, y: 11 },
            timer1: { x: 64, y: 9 }
        },
        [Item.FABRICATOR_MUNITIONS.id]: {
            maxStack: 1,
            injector: { x: 62, y: 10 },
            timer1: { x: 62, y: 8 }
        },
        [Item.TURRET_BURST.id]: {
            maxStack: 1,
            injector: { x: 59, y: 10 },
            timer1: { x: 60, y: 10 },
            timer2: { x: 61, y: 10}
        },
        [Item.TURRET_AUTO.id]: {
            maxStack: 1,
            injector: { x: 55, y: 10 },
            timer1: { x: 54, y: 8 }
        },
        [Item.BLOCK_ITEM_NET.id]: {
            maxStack: 16,
            injector: { x: 54, y: 10 },
            timer1: { x: 52, y: 10 }
        },
        [Item.BLOCK_LADDER.id]: {
            maxStack: 16,
            injector: { x: 50, y: 10 },
            timer1: { x: 51, y: 10 }
        },
        [Item.EXPANDO_BOX.id]: {
            maxStack: 1,
            injector: { x: 46, y: 10 },
            timer1: { x: 45, y: 10 },
            timer2: { x: 46, y: 8}
        },
        [Item.ITEM_EJECTOR.id]: {
            maxStack: 1,
            injector: { x: 41, y: 10 },
            timer1: { x: 42, y: 8 }
        },
        [Item.RECYCLER.id]: {
            maxStack: 1,
            injector: { x: 39, y: 10 },
            timer1: { x: 40, y: 10 }
        },
        [Item.THRUSTER.id]: {
            maxStack: 1,
            injector: { x: 37, y: 10 },
            timer1: { x: 38, y: 10 }
        },
        [Item.FLUID_TANK.id]: {
            maxStack: 1,
            injector: { x: 34, y: 10 },
            timer1: { x: 32, y: 8 }
        },
        [Item.DOOR.id]: { // not that cogg will ever support it lmfao but yeah it's here just in case
            maxStack: 1,
            injector: { x: 27, y: 10 },
            timer1: { x: 26, y: 10 }
        },
        [Item.BLOCK.id]: {
            maxStack: 16,
            injector: { x: 25, y: 10 },
            timer1: { x: 24, y: 10 },
            timer2: { x: 23, y: 9}
        },
        [Item.BLOCK_WALKWAY.id]: {
            maxStack: 16,
            injector: { x: 21, y: 10 },
            timer1: { x: 22, y: 8 }
        },
        [Item.ITEM_HATCH.id]: {
            maxStack: 1,
            injector: { x: 14, y: 10 },
            timer1: { x: 13, y: 8 },
            timer2: { x: 14, y: 8}
        },
        [Item.SHIELD_PROJECTOR.id]: {
            maxStack: 1,
            injector: { x: 11, y: 10 },
            timer1: { x: 10, y: 10 }
        },
        [Item.BLOCK_ICE_GLASS.id]: {
            maxStack: 16,
            injector: { x: 9, y: 10 },
            timer1: { x: 8, y: 10 }
        },
        [Item.MUNITIONS_SUPPLY_UNIT.id]: {
            maxStack: 1,
            injector: { x: 6, y: 10 },
            timer1: { x: 7, y: 10 }
        },
        [Item.SHIELD_GENERATOR.id]: {
            maxStack: 1,
            injector: { x: 5, y: 10 },
            timer1: { x: 4, y: 10 }
        },
        [Item.TURRET_REMOTE.id]: {
            maxStack: 1,
            injector: { x: 3, y: 10 },
            timer1: { x: 2, y: 10 },
            timer2: { x: 3, y: 8 }
        }
    };

    let currentCounts = new Map();
    let currentBuildCmdCount = 0;
    let currentBlueprint = null;
    
    bpInput.addEventListener('input', async () => {
        const val = bpInput.value.trim();
        processBtn.disabled = true;
        outputContainer.style.display = 'none';
        
        if (!val.startsWith("DSA:")) {
            resultsDiv.style.display = 'none';
            return;
        }

        try {
            const blueprint = await decode(val);
            currentBlueprint = blueprint;
            currentBuildCmdCount = blueprint.commands.filter(cmd => cmd instanceof BuildCmd).length;
            currentCounts.clear();
            let total = 0;

            blueprint.commands.forEach(cmd => {
                if (cmd instanceof BuildCmd) {
                    const id = cmd.item?.id ?? cmd.item;
                    if (id !== 0) {
                        let amount = 1;

                        if (cmd.bits && typeof cmd.bits.int === 'bigint') {
                            amount = cmd.bits.int.toString(2).match(/1/g)?.length || 0;
                        }

                        currentCounts.set(id, (currentCounts.get(id) || 0) + amount);
                        total += amount;
                    }
                }
            });

            render(currentCounts, total);
            resultsDiv.style.display = 'block';
            processBtn.disabled = false;
        } catch (e) {
            console.error("error:", e);
            alert("Error happened, look in the browser console and send it to @iogamesplayer on Discord.");
        }
    });

    processBtn.addEventListener('click', async () => {
        await processBlueprint(currentCounts);
    });

    function calculateLoaderSettings(targetQty, hasTimer2, maxStack) {
        if (targetQty <= 0) return { S: 0, T: 0, t1Ms: 0, t2Ms: 0, error: 0 };

        const MAX_PULSES_SINGLE = 59;
        const MAX_PULSES_DUAL = 118;
        const MIN_PULSES_SINGLE = 1;
        const MIN_PULSES_DUAL = 2;

        let bestS = -1;
        let bestT = -1;
        let minOverfill = Infinity;

        for (let s = 1; s <= maxStack; s++) {
            let t = Math.ceil(targetQty / s);
            const maxAllowedPulses = hasTimer2 ? MAX_PULSES_DUAL : MAX_PULSES_SINGLE;
            const minAllowedPulses = hasTimer2 ? MIN_PULSES_DUAL : MIN_PULSES_SINGLE;

            if (t > maxAllowedPulses) continue;
            if (t < minAllowedPulses) t = minAllowedPulses;

            const overfill = (s * t) - targetQty;

            if (bestS === -1 || overfill < minOverfill || (overfill === minOverfill && s > bestS)) {
                minOverfill = overfill;
                bestS = s;
                bestT = t;
            }
        }

        if (bestS === -1) {
            bestS = maxStack;
            const maxPulses = hasTimer2 ? MAX_PULSES_DUAL : MAX_PULSES_SINGLE;
            bestT = maxPulses;
            minOverfill = (bestS * bestT) - targetQty;
        }

        let t1Ms, t2Ms;

        if (hasTimer2) {
            let pulses1 = Math.min(bestT, MAX_PULSES_SINGLE);
            let pulses2 = bestT - pulses1;
            if (pulses2 < 1) {
                pulses2 = 1;
                pulses1 = bestT - 1;
            }
            t1Ms = 30 + 20 * (pulses1 - 1);
            t2Ms = 30 + 20 * (pulses2 - 1);

            t1Ms = Math.min(1190, Math.max(30, t1Ms));
            t2Ms = Math.min(1190, Math.max(30, t2Ms));
        } else {
            let pulses = Math.min(bestT, MAX_PULSES_SINGLE);
            t1Ms = 30 + 20 * (pulses - 1);
            t1Ms = Math.min(1190, Math.max(30, t1Ms));
            t2Ms = 0;
        }

        return { S: bestS, T: bestT, t1Ms, t2Ms, error: minOverfill };
    }

    async function processBlueprint(counts) {
        let bp = await decode(CONFIG_DSA);
        
        const configMap = new Map();
        let currentConfig = null;
        
        for (const cmd of bp.commands) {
            if (cmd instanceof ConfigCmd) {
                currentConfig = cmd;
            } else if (cmd instanceof BuildCmd && currentConfig) {
                const baseX = cmd.x;
                const baseY = cmd.y;
                
                if (cmd.bits && cmd.bits.int !== 0n) {
                    const bits = cmd.bits;
                    for (let i = 0; i < 64; i++) {
                        if (bits.isSet(i)) {
                            const cellX = baseX + i;
                            const cellY = baseY;
                            configMap.set(`${cellX},${cellY}`, currentConfig);
                        }
                    }
                } else {
                    configMap.set(`${baseX},${baseY}`, currentConfig);
                }
            }
        }
        
        let warnings = [];

        for (const [itemIdString, mapping] of Object.entries(PRINTER_MAPPING)) {
            const itemId = parseInt(itemIdString);
            let qty = counts.get(itemId) || 0;
            const itemObj = Item.getById(itemId);         
            const itemName = itemObj?.name || "name not found";
            
            const injectorConfig = configMap.get(`${mapping.injector.x},${mapping.injector.y}`);
            const timer1Config = mapping.timer1 ? configMap.get(`${mapping.timer1.x},${mapping.timer1.y}`) : null;
            const timer2Config = mapping.timer2 ? configMap.get(`${mapping.timer2.x},${mapping.timer2.y}`) : null;
            
            if (!injectorConfig) {
                console.warn(`Missing injector config at (${mapping.injector.x},${mapping.injector.y}) for ${itemName}`);
                continue;
            }
            if (!timer1Config) {
                console.warn(`Missing timer1 config at (${mapping.timer1.x},${mapping.timer1.y}) for ${itemName}`);
                continue;
            }
            
            if (itemId === Item.RES_FLUX.id) {
                qty = Math.ceil(currentBuildCmdCount / 10);
            }
            if (itemId === Item.DOOR.id) {
                qty = Math.min(59, parseInt(document.getElementById('doorsCount').value, 10) || 0);
            }
            
            if (qty === 0) {
                if (!injectorConfig.loader) injectorConfig.loader = {};
                injectorConfig.loader.requireOutputInventory = true;
                
                if (timer1Config && timer1Config.loader) timer1Config.loader.cycleTime = 20;
                if (timer2Config && timer2Config.loader) timer2Config.loader.cycleTime = 20;
                continue;
            }
            
            const calc = calculateLoaderSettings(qty, !!mapping.timer2, mapping.maxStack || 16);
            if (calc.error > 0) {
                warnings.push(`${itemName}: can't exactly eject ${qty} items. Ejecting ${calc.S * calc.T} items.`);
            }

            injectorConfig.loader.requireOutputInventory = false;
            injectorConfig.loader.stackLimit = calc.S;
            injectorConfig.loader.cycleTime = 20;

            if (timer1Config) {
                timer1Config.loader.cycleTime = calc.t1Ms;
            }
            if (timer2Config) {
                timer2Config.loader.cycleTime = calc.t2Ms > 0 ? calc.t2Ms : 30;
            }
        }
        
        try {
            const newDsa = "DSA:" + await encode(bp);
            outDsa.value = newDsa;
            outputContainer.style.display = 'block';
            
            if (warnings.length > 0) {
                alert(warnings.join("\n"));
            }
        } catch (e) {
            console.error("Encoding error:", e);
            alert("Encoding error, screenshot the browser console and send it to @iogamesplayer.");
        }
    }

    function render(counts, total) {
        const fluxQty = Math.ceil(currentBuildCmdCount / 10);
        const doorsQty = parseInt(document.getElementById('doorsCount').value, 10) || 0;

        let itemsArray = Array.from(counts.entries());

        if (fluxQty > 0) {
            itemsArray.push([Item.RES_FLUX.id, fluxQty]);
        }

        if (doorsQty > 0) {
            itemsArray.push([Item.DOOR.id, doorsQty]);
        }

        const sorted = itemsArray.sort((a, b) => b[1] - a[1]);
        
        const displayTotal = total + fluxQty + doorsQty;

        statsBody.innerHTML = sorted.map(([id, qty]) => {
            const item = Item.getById(id);
            const img = item?.image || item?.buildInfo?.[0]?.image;
            return `
                <tr>
                    <td>
                        ${img ? `<img src="${IMG_BASE_URL}${img}.png" class="icon-img">` : ''}
                        ${item?.name || 'Unknown Item'}
                    </td>
                    <td>${qty}</td>
                </tr>`;
        }).join('');
    }

    document.getElementById('doorsCount').addEventListener('input', function() {
        let val = parseInt(this.value, 10);
        
        if (val < 0) this.value = 0;
        if (val > 59) this.value = 59;

        if (currentBlueprint) {
            render(currentCounts, Array.from(currentCounts.values()).reduce((a, b) => a + b, 0));
        }
    });
</script>
