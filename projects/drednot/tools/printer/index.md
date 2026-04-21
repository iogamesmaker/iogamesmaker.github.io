---
layout: default
title: DSA to printer config
---

## How to use
- Build a printer design. Press to copy the DSA for the <a href="#" id="copyleft">left side</a>, or the <a href="#" id="copyright">right side</a> of NEM0's design. Truly one of the designs of all time
    - <small>i made some changes and fixes to NEM0's design, 100% config compatible with the original.</small>
- Put your ship DSA in the container below
- Enter the number of doors you need
    - <small>doors aren't stored in the DSA but they are supported on NEM0's printer design.</small>
- Select your target Printer Configuration from the dropdown
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
    .btn { width: 100%; padding: 10px; cursor: pointer;}
    h2 { margin-bottom: 5px; font-size: 1.25em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .controls-row { display: flex; gap: 15px; align-items: center; }
</style>

<div class="container">
    <div class="controls-row">
        <div>
            <label for="configSelect">Printer:</label>
            <select id="configSelect" style="width: 120px; padding: 3px;"></select>
            <label for="doorsCount">Doors:</label>
            <input type="number" id="doorsCount" value="0" min="0" max="59" step="1" style="width: 80px; padding: 3px;">
        </div>
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
    import { decode, encode, Item, BuildCmd, ConfigCmd, BuildBits } from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";

    const bpInput = document.getElementById('bpInput');
    const outDsa = document.getElementById('outDsa');
    const processBtn = document.getElementById('processBtn');
    const statsBody = document.getElementById('statsBody');
    const resultsDiv = document.getElementById('results');
    const outputContainer = document.getElementById('outputContainer');
    const configSelect = document.getElementById('configSelect');
    
    const IMG_BASE_URL = "https://test.drednot.io/img/";

    const PRINTER_CONFIGS = [
        {
            name: "NEM0's Printer",
            dsa: "DSA:rZdLaxNRFMfPmXcnJo5QHzUgIqi4sIuWtoIPKoitCbVduymiqQRqC7VrmerMJpA4A+JH8IP4ORRBtL5BBEGhYO9M7ky7yJw5N2SVZAi/+Z/H/9xzIwhWgpUowpeLEUCn+mBzY639aHV98/7D1hZEqIO389rodeNOda29vt3aWu3/AyIt7hyRj9rbrcdPIApfAUAcxxEEzVl/LxbQ24OgJoI33utxkJAwU+Q1lyCCicgm/pfEcxRRs9Eb7zKJfyTxYp/4IsnAUrDs74ovAP7n5Pdy+lnwNmOYjJwcI/RbNnhTqkRX6H+OQjIY4klh+TTki/2ddURjgsq2pVC/TxI5V1I/i0kMf2Rte1wSB1rBtIQVGshk5lawJXOhqEr+hioyaMwkTDhNyQWt71zFFqg6pM2GaNPrZFINBZWHMzBHyERLoUEtlMjFo/SAqXDb6Wuu8u4VAqmLfjqjHPgShUS+Sgh/SuQsaSOVwfpOEmsUUUwPLjHcy8O+MzOa6RH+y5E3K3QL8eN+K5F1Mm6b7Z2DcmsUUU+JXTU3niKPUZufyN1M43nK38mA23mq7G9DMI8Vp9IaYgxdEEizeBCLaenfU2UGjTqVTQtr3Gx+yyIfo7Ipjmb+NnYgs+aMyDyIklhx6SnE984vSZx0aY3cUQnhd0mcdkfl77+SeKNkBeUujOGHrNo6qRGAH3VW60mq1oatEPV7SbxUplF5qukOtREkE+MNqsZ9ma72EJkMmvWS/Vp5+E6Navg6mREt+shRuMN8lMSrLj3S2Boh02iWGpGr8YskTlA7NWr8nfpQtReq6U4dzKe3KjgrevQZwnzxNUjEp37DOuGkNywP0uwI9K1BaFtDg5lmMz+KpglT2cma3dGUt81msm3G8T4=",
            mapping: {
                [Item.RES_FLUX.id]: { maxStack: 16, injector: { x: 74, y: 51 }, timer1: { x: 74, y: 53 } },
                [Item.BLOCK_HYPER_RUBBER.id]: { maxStack: 16, injector: { x: 78, y: 56 }, timer1: { x: 75, y: 56 }, timer2: { x: 77, y: 56 } },
                [Item.LOADER_NEW.id]: { maxStack: 1, injector: { x: 73, y: 53 }, timer1: { x: 74, y: 55 }, timer2: { x: 75, y: 54} },
                [Item.PUSHER.id]: { maxStack: 1, injector: { x: 74, y: 25 }, timer1: { x: 74, y: 27 }, timer2: { x: 75, y: 27} },
                [Item.BLOCK_LOGISTICS_RAIL.id]: { maxStack: 16, injector: { x: 72, y: 15 }, timer1: { x: 71, y: 13 } },
                [Item.FABRICATOR_ENGINEERING.id]: { maxStack: 1, injector: { x: 65, y: 11 }, timer1: { x: 64, y: 9 } },
                [Item.FABRICATOR_MUNITIONS.id]: { maxStack: 1, injector: { x: 62, y: 10 }, timer1: { x: 62, y: 8 } },
                [Item.TURRET_BURST.id]: { maxStack: 1, injector: { x: 59, y: 10 }, timer1: { x: 60, y: 10 }, timer2: { x: 61, y: 10} },
                [Item.TURRET_AUTO.id]: { maxStack: 1, injector: { x: 55, y: 10 }, timer1: { x: 54, y: 8 } },
                [Item.BLOCK_ITEM_NET.id]: { maxStack: 16, injector: { x: 54, y: 10 }, timer1: { x: 52, y: 10 } },
                [Item.BLOCK_LADDER.id]: { maxStack: 16, injector: { x: 51, y: 10 }, timer1: { x: 50, y: 10 } },
                [Item.EXPANDO_BOX.id]: { maxStack: 1, injector: { x: 46, y: 10 }, timer1: { x: 45, y: 10 }, timer2: { x: 46, y: 8} },
                [Item.ITEM_EJECTOR.id]: { maxStack: 1, injector: { x: 41, y: 10 }, timer1: { x: 42, y: 8 } },
                [Item.RECYCLER.id]: { maxStack: 1, injector: { x: 39, y: 10 }, timer1: { x: 40, y: 10 } },
                [Item.THRUSTER.id]: { maxStack: 1, injector: { x: 37, y: 10 }, timer1: { x: 38, y: 10 } },
                [Item.FLUID_TANK.id]: { maxStack: 1, injector: { x: 34, y: 10 }, timer1: { x: 32, y: 8 } },
                [Item.DOOR.id]: { maxStack: 1, injector: { x: 27, y: 10 }, timer1: { x: 26, y: 10 } },
                [Item.BLOCK.id]: { maxStack: 16, injector: { x: 25, y: 10 }, timer1: { x: 24, y: 10 }, timer2: { x: 23, y: 9} },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 21, y: 10 }, timer1: { x: 22, y: 8 } },
                [Item.ITEM_HATCH.id]: { maxStack: 1, injector: { x: 14, y: 10 }, timer1: { x: 13, y: 8 }, timer2: { x: 14, y: 8} },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 11, y: 10 }, timer1: { x: 10, y: 10 } },
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 9, y: 10 }, timer1: { x: 8, y: 10 } },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 6, y: 10 }, timer1: { x: 7, y: 10 } },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 5, y: 10 }, timer1: { x: 4, y: 10 } },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 3, y: 10 }, timer1: { x: 2, y: 10 }, timer2: { x: 3, y: 8 } }
            }
        }/*,
        {
            name: "placeholder -- don't use",
            dsa: "DSA:nope",
            mapping: {
                [Item.RES_FLUX.id]: { maxStack: 16, injector: { x: 74, y: 51 }, timer1: { x: 74, y: 53 } }
            }
        }*/
    ];

    PRINTER_CONFIGS.forEach((cfg, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = cfg.name;
        configSelect.appendChild(opt);
    });

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
            alert("probably an invalid blueprint");
        }
    });

    processBtn.addEventListener('click', async () => {
        await process(currentCounts);
    });

    function decompress(bp) { // blueprints are compressed for space efficiency but it's not too handy for modifying loaders in bulk... that's why we decompress it.
        const newCommands = [];
        let latestConfig = null;

        for (const cmd of bp.commands) {
            if (cmd instanceof ConfigCmd) {
                latestConfig = cmd;
                newCommands.push(cmd.clone());
            } else if (cmd instanceof BuildCmd) {
                const itemId = cmd.item?.id ?? cmd.item;
                const isLoader = (itemId === Item.LOADER_NEW.id);

                if (cmd.bits && typeof cmd.bits.isZero === 'function' && !cmd.bits.isZero()) {
                    const bitsArray = cmd.bits.toArray();
                    for (let i = 0; i < bitsArray.length; i++) {
                        if (bitsArray[i]) {
                            const singleCmd = cmd.clone();
                            singleCmd.x += i;
                            singleCmd.bits = new BuildBits(1n); 

                            if (isLoader && latestConfig) {
                                newCommands.push(latestConfig.clone());
                            }
                            newCommands.push(singleCmd);
                        }
                    }
                } else {
                    if (isLoader) {
                        const lastCmd = newCommands[newCommands.length - 1];
                        if (!(lastCmd instanceof ConfigCmd) && latestConfig) {
                            newCommands.push(latestConfig.clone());
                        }
                    }
                    newCommands.push(cmd.clone());
                }
            } else {
                newCommands.push(cmd);
            }
        }

        bp.commands = newCommands;
        return bp;
    }

    function calculate(targetQty, hasTimer2, maxStack) {
        if (targetQty <= 0) return { S: 0, T: 0, t1Ms: 0, t2Ms: 0, error: 0 };

        const MAX_PULSES_SINGLE = 60 - 1; // 59
        const MAX_PULSES_DUAL = 60 + (60 * 16) - 1; // 1019
        const MIN_PULSES = 1;

        let bestS = -1;
        let bestT = -1;
        let minOverfill = Infinity;

        for (let stackSize = 1; stackSize <= maxStack; stackSize++) {
            let times = Math.ceil(targetQty / stackSize);
            const maxAllowedPulses = (hasTimer2 ? MAX_PULSES_DUAL : MAX_PULSES_SINGLE);

            if (times > maxAllowedPulses) continue;
            if (times < MIN_PULSES) times = MIN_PULSES;

            const overfill = (stackSize * times) - targetQty;

            if (bestS === -1 || overfill < minOverfill || (overfill === minOverfill && stackSize > bestS)) {
                minOverfill = overfill;
                bestS = stackSize;
                bestT = times;
            }
        }

        if (bestS === -1) {
            bestS = maxStack;
            const maxPulses = hasTimer2 ? MAX_PULSES_DUAL : MAX_PULSES_SINGLE;
            bestT = maxPulses;
        }
        minOverfill = Math.abs((bestS * bestT) - targetQty);
        
        let t1Ms, t2Ms;
        let t1SL = 16;
        let inMS = 20;

        if (hasTimer2) {
            let pulses2 = Math.min(bestT, MAX_PULSES_SINGLE);
            let pulses1 = bestT - pulses2;
            
            if (pulses2 < 1) {
                pulses2 = 1;
                pulses1 = bestT - 1;
            }
            
            if (pulses1 >= 60) {
                let divideBy = Math.ceil(pulses1 / 60);
                const allowed = [1, 2, 4, 8, 16];
                while(!allowed.includes(divideBy) && divideBy <= 16) { 
                    divideBy++;
                }
                
                t1SL /= divideBy;
                pulses1 /= divideBy;
            }
            
            t1Ms = 20 + 20 * (pulses1 - 1);
            t2Ms = 30 + 20 * (pulses2 - 1);

            t1Ms = Math.min(1200, Math.max(20, t1Ms));
            t2Ms = Math.min(1200, Math.max(30, t2Ms));
            
            if(targetQty === 1) inMS = 40;
        } else {
            let pulses = Math.min(bestT, MAX_PULSES_SINGLE);
            t1Ms = 30 + 20 * (pulses - 1);
            t1Ms = Math.min(1190, Math.max(30, t1Ms));
            t2Ms = 0;
        }
        
        return { S: bestS, T: bestT, t1Ms, t2Ms, t1SL, error: minOverfill, injectMs: inMS };
    }

    async function process(counts) {
        const selectedIndex = parseInt(configSelect.value, 10);
        const activeConfig = PRINTER_CONFIGS[selectedIndex];
        let bp = await decode(activeConfig.dsa);
        console.log(bp);
        bp = decompress(bp);
        console.log(bp);
        const configMap = new Map();
        let currentConfig = null;
        
        for (const cmd of bp.commands) {
            if (cmd instanceof ConfigCmd) {
                currentConfig = cmd;
            } else if (cmd instanceof BuildCmd && currentConfig) {
                const baseX = cmd.x;
                const baseY = cmd.y;
                configMap.set(`${baseX},${baseY}`, currentConfig);
            }
        }
        
        let warnings = [];

        for (const [itemIdString, mapping] of Object.entries(activeConfig.mapping)) {
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
            
            const calc = calculate(qty, !!mapping.timer2, mapping.maxStack || 16);
            if (calc.error > 0) {
                warnings.push(`${itemName}: can't exactly eject ${qty} items. Ejecting ${calc.S * calc.T} items.`);
            }

            injectorConfig.loader.requireOutputInventory = false;
            injectorConfig.loader.stackLimit = calc.S;
            injectorConfig.loader.cycleTime = calc.injectMs;
                
            if (timer1Config) {
                timer1Config.loader.cycleTime = calc.t1Ms;
                timer1Config.loader.stackLimit = 16;
                timer1Config.loader.waitForStackLimit = true;
            }
            if (timer2Config) {
                timer2Config.loader.waitForStackLimit = true;
                timer1Config.loader.waitForStackLimit = false;
                timer1Config.loader.stackLimit = calc.t1SL;
                timer2Config.loader.stackLimit = 16;
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

    configSelect.addEventListener('change', () => {
        if (currentBlueprint) {
             processBtn.disabled = false;
             outputContainer.style.display = 'none';
        }
    });
</script>
