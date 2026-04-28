---
layout: default
title: DSA to printer config
---

## How to use
- Build a printer design. Press to copy the DSA for the <a href="#" id="copyleft">left side</a>, or the <a href="#" id="copyright">right side</a> of NEM0's design. Truly one of the designs of all time.
- I'd recommend disabling the recyclers. They're pretty shit. Also don't forget to put standard ammo into the timing circuits.
- Put your ship DSA in the container below
- Enter the number of doors you need
    - <small>doors aren't stored in the DSA but they are supported on NEM0's printer design.</small>
- Select your target Printer Configuration from the dropdown
- Press "process"
- Paste the output DSA on the printer
- Eject the items. Do this by either: 
    - Coolsnaking quickly to the left and then down again. About a quarter of a second of coolsnake to the left is enough for it to activate. <b>BE WARNED!!! THIS IS A LOT OF ITEMS!!! YOU NEED AT LEAST 3 INPUT CARGO HATCHES THAT WON'T CLOG!!!</b><br>
    or
    - using the pushers on the ship to push the standard ammo around. I'd also recommend having a handheld pusher.
- Watch it automatically RCD! yay

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
            <select id="configSelect" style="width: 300px; padding: 3px;"></select>
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
                [Item.BLOCK.id]: { maxStack: 16, injector: { x: 25, y: 10 }, timer1: { x: 23, y: 9 }, timer2: { x: 24, y: 10} },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 21, y: 10 }, timer1: { x: 22, y: 8 } },
                [Item.ITEM_HATCH.id]: { maxStack: 1, injector: { x: 14, y: 10 }, timer1: { x: 13, y: 8 }, timer2: { x: 14, y: 8} },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 11, y: 10 }, timer1: { x: 10, y: 10 } },
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 9, y: 10 }, timer1: { x: 8, y: 10 } },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 6, y: 10 }, timer1: { x: 7, y: 10 } },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 5, y: 10 }, timer1: { x: 4, y: 10 } },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 3, y: 10 }, timer1: { x: 2, y: 10 }, timer2: { x: 3, y: 8 } }
            }
        },
        {
            name: "NEM0: Burst = acute",
            dsa: "DSA:rZdLaxNRFMfPmXcnJo5QHzUgIqi4sIuWtoIPKoitCbVduymiqQRqC7VrmerMJpA4A+JH8IP4ORRBtL5BBEGhYO9M7ky7yJw5N2SVZAi/+Z/H/9xzIwhWgpUowpeLEUCn+mBzY639aHV98/7D1hZEqIO389rodeNOda29vt3aWu3/AyIt7hyRj9rbrcdPIApfAUAcxxEEzVl/LxbQ24OgJoI33utxkJAwU+Q1lyCCicgm/pfEcxRRs9Eb7zKJfyTxYp/4IsnAUrDs74ovAP7n5Pdy+lnwNmOYjJwcI/RbNnhTqkRX6H+OQjIY4klh+TTki/2ddURjgsq2pVC/TxI5V1I/i0kMf2Rte1wSB1rBtIQVGshk5lawJXOhqEr+hioyaMwkTDhNyQWt71zFFqg6pM2GaNPrZFINBZWHMzBHyERLoUEtlMjFo/SAqXDb6Wuu8u4VAqmLfjqjHPgShUS+Sgh/SuQsaSOVwfpOEmsUUUwPLjHcy8O+MzOa6RH+y5E3K3QL8eN+K5F1Mm6b7Z2DcmsUUU+JXTU3niKPUZufyN1M43nK38mA23mq7G9DMI8Vp9IaYgxdEEizeBCLaenfU2UGjTqVTQtr3Gx+yyIfo7Ipjmb+NnYgs+aMyDyIklhx6SnE984vSZx0aY3cUQnhd0mcdkfl77+SeKNkBeUujOGHrNo6qRGAH3VW60mq1oatEPV7SbxUplF5qukOtREkE+MNqsZ9ma72EJkMmvWS/Vp5+E6Navg6mREt+shRuMN8lMSrLj3S2Boh02iWGpGr8YskTlA7NWr8nfpQtReq6U4dzKe3KjgrevQZwnzxNUjEp37DOuGkNywP0uwI9K1BaFtDg5lmMz+KpglT2cma3dGUt81msm3G8T4=",
            mapping: {
                [Item.RES_FLUX.id]: { maxStack: 16, injector: { x: 74, y: 51 }, timer1: { x: 74, y: 53 } },
                [Item.BLOCK_HYPER_RUBBER.id]: { maxStack: 16, injector: { x: 78, y: 56 }, timer1: { x: 75, y: 56 }, timer2: { x: 77, y: 56 } },
                [Item.LOADER_NEW.id]: { maxStack: 1, injector: { x: 73, y: 53 }, timer1: { x: 74, y: 55 }, timer2: { x: 75, y: 54} },
                [Item.PUSHER.id]: { maxStack: 1, injector: { x: 74, y: 25 }, timer1: { x: 74, y: 27 }, timer2: { x: 75, y: 27} },
                [Item.BLOCK_LOGISTICS_RAIL.id]: { maxStack: 16, injector: { x: 72, y: 15 }, timer1: { x: 71, y: 13 } },
                [Item.FABRICATOR_ENGINEERING.id]: { maxStack: 1, injector: { x: 65, y: 11 }, timer1: { x: 64, y: 9 } },
                [Item.FABRICATOR_MUNITIONS.id]: { maxStack: 1, injector: { x: 62, y: 10 }, timer1: { x: 62, y: 8 } },
                [Item.TURRET_ACUTE.id]: { maxStack: 1, injector: { x: 59, y: 10 }, timer1: { x: 60, y: 10 }, timer2: { x: 61, y: 10} },
                [Item.TURRET_AUTO.id]: { maxStack: 1, injector: { x: 55, y: 10 }, timer1: { x: 54, y: 8 } },
                [Item.BLOCK_ITEM_NET.id]: { maxStack: 16, injector: { x: 54, y: 10 }, timer1: { x: 52, y: 10 } },
                [Item.BLOCK_LADDER.id]: { maxStack: 16, injector: { x: 51, y: 10 }, timer1: { x: 50, y: 10 } },
                [Item.EXPANDO_BOX.id]: { maxStack: 1, injector: { x: 46, y: 10 }, timer1: { x: 45, y: 10 }, timer2: { x: 46, y: 8} },
                [Item.ITEM_EJECTOR.id]: { maxStack: 1, injector: { x: 41, y: 10 }, timer1: { x: 42, y: 8 } },
                [Item.RECYCLER.id]: { maxStack: 1, injector: { x: 39, y: 10 }, timer1: { x: 40, y: 10 } },
                [Item.THRUSTER.id]: { maxStack: 1, injector: { x: 37, y: 10 }, timer1: { x: 38, y: 10 } },
                [Item.FLUID_TANK.id]: { maxStack: 1, injector: { x: 34, y: 10 }, timer1: { x: 32, y: 8 } },
                [Item.DOOR.id]: { maxStack: 1, injector: { x: 27, y: 10 }, timer1: { x: 26, y: 10 } },
                [Item.BLOCK.id]: { maxStack: 16, injector: { x: 25, y: 10 }, timer1: { x: 23, y: 9 }, timer2: { x: 24, y: 10} },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 21, y: 10 }, timer1: { x: 22, y: 8 } },
                [Item.ITEM_HATCH.id]: { maxStack: 1, injector: { x: 14, y: 10 }, timer1: { x: 13, y: 8 }, timer2: { x: 14, y: 8} },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 11, y: 10 }, timer1: { x: 10, y: 10 } },
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 9, y: 10 }, timer1: { x: 8, y: 10 } },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 6, y: 10 }, timer1: { x: 7, y: 10 } },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 5, y: 10 }, timer1: { x: 4, y: 10 } },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 3, y: 10 }, timer1: { x: 2, y: 10 }, timer2: { x: 3, y: 8 } }
            }
        },
        {
            name: "Mehmets Printer (thank you zombie2)",
            dsa: "DSA:rdbNSsNAEAfw3aRJq6aioiiKoFhERRBEQVD81rZW0Tcooq0UqoXao4eUxkvBmhTxCXwIjz6IInjwWyieFAqa2G5OdpJp9xRI4Md/dnZnoxNtp0fX6bmhE0LUJ/Ohbf896cW6+Srv30sdxRMH0WRqdz+WJjqRaVtnoWDk/fFEMhNLRyvfiS4YeaX6KpGJHR4T/fTbJA3DJKcVtWyJof9ED6Vt2RPq0rxkZqClYjac8p6J8won8YeJ2hpEehCkXbYW8Tqt5RV6LSVoLSki5icT+6HCBcm9+MLEdkgUvZZ4hqtaNMVcuCNUDISLAS6Nf2C0pxp2tUHR7noI3EhSHdVrKyaZDQu111SoR92U4a0kuiWfGTnkODxuROyG7zI3fBOXln/ZlS855vQJ2JwCdDAtEz0/fKaYayKLKgkLxKKDtWj1Fmv38RrJr0xs5jWS75g44SDKbsV3Js449l1HD+RWXgPZrnscSilaKa/RKbUgr4bLtErOOi7mODrmIK+Ub0ycVOD2SG6H3AcTB8D7EpGxzMRuXkeHsN54HXszhR7EY+Agxuz0EiOHeRVuL2UvJMqkhkihk7PlA0gJMdgptUno5hXruSu0DbA7VsvnsOYcr8PoY4X7FYc7cgSbcYHX9LX/YUah/0Fax/9gpAoGazVbLaG7vcqr7EebXLZiGsYv",
            mapping: {
                [Item.RES_FLUX.id]: { maxStack: 16, injector: { x: 74, y: 51 }, timer1: { x: 74, y: 53 } },
                [Item.BLOCK_HYPER_RUBBER.id]: { maxStack: 16, injector: { x: 17, y: 12 }, timer1: { x: 14, y: 11 }, timer2: { x: 15, y: 12 } },
                [Item.LOADER_NEW.id]: { maxStack: 1, injector: { x: 26, y: 12 }, timer1: { x: 24, y: 11 }, timer2: { x: 25, y: 12} },
                [Item.PUSHER.id]: { maxStack: 1, injector: { x: 29, y: 12 }, timer1: { x: 27, y: 11 }, timer2: { x: 28, y: 12} },
                [Item.BLOCK_LOGISTICS_RAIL.id]: { maxStack: 16, injector: { x: 59, y: 12 }, timer1: { x: 57, y: 11 }, timer2:{ x: 58, y: 12} },
                [Item.FABRICATOR_ENGINEERING.id]: { maxStack: 1, injector: { x: 53, y: 12 }, timer1: { x: 51, y: 11 }, timer2:{ x: 52, y: 12} },
                [Item.FABRICATOR_MUNITIONS.id]: { maxStack: 1, injector: { x: 65, y: 12 }, timer1: { x: 63, y: 11 }, timer2:{ x: 64, y: 12} },
                [Item.TURRET_BURST.id]: { maxStack: 1, injector: { x: 75, y: 12 }, timer1: { x: 77, y: 11 }, timer2: { x: 76, y: 12} },
                [Item.TURRET_AUTO.id]: { maxStack: 1, injector: { x: 72, y: 12 }, timer1: { x: 74, y: 11 } , timer2:{ x: 73, y: 12} },
                [Item.BLOCK_ITEM_NET.id]: { maxStack: 16, injector: { x: 32, y: 12 }, timer1: { x: 30, y: 11 }, timer2:{ x: 31, y: 12} },
                [Item.BLOCK_LADDER.id]: { maxStack: 16, injector: { x: 50, y: 12 }, timer1: { x: 48, y: 11 }, timer2:{ x: 49, y: 12} },
                [Item.EXPANDO_BOX.id]: { maxStack: 1, injector: { x: 38, y: 12 }, timer1: { x: 36, y: 11 }, timer2: { x: 37, y: 12} },
                [Item.ITEM_EJECTOR.id]: { maxStack: 1, injector: { x: 62, y: 12 }, timer1: { x: 60, y: 11 }, timer2:{ x: 61, y: 12} },
                [Item.RECYCLER.id]: { maxStack: 1, injector: { x: 72, y: 12 }, timer1: { x: 74, y: 11 }, timer2:{ x: 73, y: 12} },
                [Item.THRUSTER.id]: { maxStack: 1, injector: { x: 66, y: 12 }, timer1: { x: 68, y: 11 }, timer2:{ x: 67, y: 12} },
                [Item.FLUID_TANK.id]: { maxStack: 1, injector: { x: 69, y: 12 }, timer1: { x: 71, y: 11 }, timer2:{ x: 70, y: 12} }, 
                [Item.BLOCK.id]: { maxStack: 16, injector: { x: 35, y: 12 }, timer1: { x: 33, y: 11 }, timer2: { x: 34, y: 12} },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 56, y: 12 }, timer1: { x: 54, y: 11 }, timer2:{ x: 55, y: 12} },
                [Item.ITEM_HATCH.id]: { maxStack: 1, injector: { x: 47, y: 12 }, timer1: { x: 45, y: 11 }, timer2: { x: 46, y: 12} },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 77, y: 6 }, timer1: { x: 75, y: 7 }, timer2:{ x: 76, y: 6} }, 
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 10, y: 12 }, timer1: { x: 8, y: 11 }, timer2:{ x: 9, y: 12} },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 13, y: 12 }, timer1: { x: 11, y: 11 }, timer2:{ x: 12, y: 12} },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 7, y: 12 }, timer1: { x: 5, y: 11 }, timer2:{ x: 6, y: 12} },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 4, y: 12 }, timer1: { x: 2, y: 11 }, timer2: { x: 3, y: 12 } }
            }
        }
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
            
            currentBuildCmdCount = 0; 
            currentCounts.clear();
            let total = 0;

            blueprint.commands.forEach(cmd => {
                if (cmd instanceof BuildCmd) {
                    let amount = 1;

                    if (cmd.bits) {
                        amount = cmd.bits.int.toString(2).match(/1/g)?.length || 0;
                        console.log(amount)
                    }

                    currentBuildCmdCount += amount;

                    const id = cmd.item?.id ?? cmd.item;
                    if (id !== 0) {
                        currentCounts.set(id, (currentCounts.get(id) || 0) + amount);
                        total += amount;
                    }
                }
            });

            console.log(total);
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

            const overfill = (stackSize * times) - (targetQty + 1);

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
        minOverfill = Math.abs((bestS * bestT) - (targetQty + 1));
        
        let t1Ms, t2Ms;
        let t1SL = 16;
        let inMS = 20;

        if (hasTimer2) {
            let pulses1 = Math.min(bestT, MAX_PULSES_DUAL);
            let pulses2 = bestT - pulses1;
            
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
            t2Ms = 35 + 20 * (pulses2 - 1);

            t1Ms = Math.min(1200, Math.max(20, t1Ms));
            t2Ms = Math.min(1200, Math.max(30, t2Ms));
            
            if(targetQty <= maxStack) inMS = 35;
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
                
                if (timer1Config && timer1Config.loader) timer1Config.loader.cycleTime = 200;
                if (timer2Config && timer2Config.loader) timer2Config.loader.cycleTime = 20;
                continue;
            }
            
            const calc = calculate(qty, !!mapping.timer2, mapping.maxStack || 16);
            if (calc.error != 1) {
                warnings.push(`${itemName}: can't exactly eject ${qty} items. Ejecting ${calc.S * calc.T} items.`);
            }

            injectorConfig.loader.requireOutputInventory = false;
            injectorConfig.loader.stackLimit = calc.S;
            injectorConfig.loader.cycleTime = calc.injectMs;
            console.log(calc)
                
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
