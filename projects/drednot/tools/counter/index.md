---
layout: default
title: blueprint tools
---

# Blueprint sorter // item viewer
Based on [SkySea's dsabp library](https://github.com/Blueyescat/dsabp-js). It does most the heavy lifting. This is just like 120 lines of JS.<br>I plan to make something else with this library and made this along the way.<br>
I still haven't nailed blueprint compression so the end result might be a heck of a lot bigger and heavier for the game compared to a vanilla blueprint.<br>Good chance it tells you the text is too long. In that case, turn on grouping or try re-editing from the vanilla blueprint again.

Also a tiny chance it might fuck up the configuration of loaders or something, in that case just repaste the vanilla blueprint over it again.
Summary: just use dsa.fr.to lol
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>

<style>
    .container { max-width: 1200px; display: flex; flex-direction: column; gap: 20px; }
    

    .workspace { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
    .panel-header { padding: 12px; background: #eee; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
    .scroll-box { overflow-y: auto; flex-grow: 1; padding: 10px; }

    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
    .icon-img { width: 24px; height: 24px; object-fit: contain; vertical-align: middle; }

    .sortable-list { list-style: none; padding: 0; margin: 0; }
    .order-item { 
        display: flex; align-items: left; padding: 8px; background: #fff; 
        border: 1px solid #ddd; margin-bottom: 4px; cursor: grab; 
    }
    .order-item:active { cursor: grabbing; }
    .order-item.ghost { opacity: 0.3; background: #ddd; }
    .order-info { flex-grow: 1; margin-left: 10px; }
    
    .btn { color: black; border-color: #ddd; }
</style>

<div class="container">
    <textarea id="bpInput" placeholder="Paste your DSA here!!!"></textarea>

    <div class="workspace">
        <div class="panel">
            <div class="panel-header">Count</div>
            <div class="scroll-box">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 32px;"></th>
                            <th>Name</th>
                            <th style="width: 50px;">Count</th>
                        </tr>
                    </thead>
                    <tbody id="statsBody">
                        <tr><td colspan="3" style="text-align:center; color:#999; padding:20px;"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">
                Order
                <button id="groupToggle" class="btn">Group: ON</button>
            </div>
            <div class="scroll-box">
                <div id="buildOrderList" class="sortable-list"></div>
            </div>
        </div>
    </div>
</div>

<script type="module">
    import { decode, encode, Item, BuildCmd, ConfigCmd } from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";

    const bpInput = document.getElementById('bpInput');
    const statsBody = document.getElementById('statsBody');
    const buildOrderList = document.getElementById('buildOrderList');
    const groupToggle = document.getElementById('groupToggle');

    const IMG_BASE_URL = "https://test.drednot.io/img/";
    
    let currentBP = null;
    let isGrouping = true;
    let atomicUnits = [];

    groupToggle.addEventListener('click', () => {
        isGrouping = !isGrouping;
        groupToggle.textContent = `Group: ${isGrouping ? 'ON' : 'OFF'}`;
        groupToggle.classList.toggle('active', isGrouping);
        renderLists();
    });

    bpInput.addEventListener('input', async () => {
        const val = bpInput.value.trim();
        if (val.startsWith("DSA:")) {
            try {
                currentBP = await decode(val);
                parseAtomicUnits();
                renderLists();
            } catch (e) { console.error("error:", e); }
        }
    });

    function parseAtomicUnits() {
        atomicUnits = [];
        if (!currentBP) return;

        let activeConfigs = [];

        currentBP.commands.forEach(cmd => {
            if (cmd instanceof ConfigCmd) {
                activeConfigs.push(cmd);
            } else if (cmd instanceof BuildCmd) {
                atomicUnits.push({
                    build: cmd,
                    configs: [...activeConfigs] 
                });
            }
        });
    }

    function renderLists() {
        if (!currentBP) return;

        const counts = new Map();
        atomicUnits.forEach(u => {
            const id = u.build.item.id || u.build.item;
            if (id !== 0) {
                let amount = 1;
                // Handle compressed blocks (BuildBits)
                if (u.build.bits && typeof u.build.bits.int === 'bigint') {
                    amount = u.build.bits.int.toString(2).match(/1/g)?.length || 0;
                }
                counts.set(id, (counts.get(id) || 0) + amount);
            }
        });
        
        const sorted = Array.from(counts.entries()).sort((a,b) => b[1] - a[1]);
        statsBody.innerHTML = sorted.map(([id, qty]) => {
            const item = Item.getById(id);
            const img = item?.image || item?.buildInfo?.[0]?.image;
            return `<tr>
                <td>${img ? `<img src="${IMG_BASE_URL}${img}.png" class="icon-img">` : ''}</td>
                <td><strong>${item?.name || 'Unknown'}</strong></td>
                <td>${qty}</td>
            </tr>`;
        }).join('');

        buildOrderList.innerHTML = '';
        let displayData = [];

        if (isGrouping) {
            const groups = new Map();
            atomicUnits.forEach(u => {
                const id = u.build.item.id || u.build.item;
                if (!groups.has(id)) groups.set(id, { id, units: [], totalQty: 0 });
                
                let amount = 1;
                if (u.build.bits && typeof u.build.bits.int === 'bigint') {
                    amount = u.build.bits.int.toString(2).match(/1/g)?.length || 0;
                }
                
                const g = groups.get(id);
                g.units.push(u);
                g.totalQty += amount;
            });
            displayData = Array.from(groups.values()).map(g => ({
                label: Item.getById(g.id)?.name || 'Unknown',
                units: g.units,
                displayQty: g.totalQty,
                img: Item.getById(g.id)?.image || Item.getById(g.id)?.buildInfo?.[0]?.image
            }));
        } else {
            displayData = atomicUnits.map((u, i) => {
                const item = Item.getById(u.build.item.id || u.build.item);
                let amount = 1;
                if (u.build.bits && typeof u.build.bits.int === 'bigint') {
                    amount = u.build.bits.int.toString(2).match(/1/g)?.length || 0;
                }
                return {
                    label: item?.name || 'Unknown',
                    units: [u],
                    displayQty: amount,
                    img: item?.image || item?.buildInfo?.[0]?.image
                };
            });
        }

        displayData.forEach((data, index) => {
            const el = document.createElement('div');
            el.className = 'order-item';
            el.innerHTML = `
                <span style="color:#999; font-size:10px; width:25px;">${index+1}</span>
                ${data.img ? `<img src="${IMG_BASE_URL}${data.img}.png" class="icon-img">` : ''}
                <div class="order-info">
                    <strong>${data.label}</strong>
                    ${data.displayQty > 1 ? `<span class="badge">x${data.displayQty}</span>` : ''}
                </div>
                <span style="color:#ccc">⠿</span>
            `;
            el._units = data.units;
            buildOrderList.appendChild(el);
        });

        new Sortable(buildOrderList, {
            animation: 150,
            ghostClass: 'ghost',
            onEnd: () => {
                const newOrder = [];
                buildOrderList.querySelectorAll('.order-item').forEach(el => newOrder.push(...el._units));
                atomicUnits = newOrder;
                syncToTextarea();
            }
        });
    }

    async function syncToTextarea() {
        if (!currentBP) return;
        const newCmds = [];
        
        atomicUnits.forEach(unit => {
            unit.configs.forEach(c => newCmds.push(c));
            newCmds.push(unit.build);
        });

        currentBP.commands = newCmds;
        bpInput.value = "DSA:" + await encode(currentBP);
    }
</script>

Hail HYDEATH
