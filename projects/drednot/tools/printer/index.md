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

### Stuff could break, but it should be functional.
I'm gonna be real here if something breaks its probably your fault ✌✌

<style>
.container { 
        max-width: 600px; 
        display: flex; 
        flex-direction: column; 
        gap: 20px; 
        font-family: 'Fraunces', sans-serif; 
        color: var(--text);
    }
    textarea { 
        width: 100%; 
        height: 100px; 
        padding: 10px; 
        border: 1px solid var(--text); 
        border-radius: 4px; 
        resize: vertical; 
        background: var(--bg);
        color: var(--text);
        font-family: 'Fraunces', sans-serif;
    }
    table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 10px; 
    }
    th, td { 
        padding: 10px; 
        border-bottom: 1px solid var(--text); 
        text-align: left; 
    }
    th { 
        background: var(--accent-light); 
        font-family: 'Fraunces', serif;
        color: var(--text);
    }
    .icon-img { 
        object-fit: contain; 
        vertical-align: middle; 
        margin-right: 8px; 
    }
    .total-row { 
        font-weight: bold; 
        background: var(--accent-light); 
    }
    .btn { 
        width: 100%; 
        padding: 10px; 
        cursor: pointer;
        background: var(--accent-light);
        color: var(--text);
        border: 1px solid var(--text);
        font-family: 'Fraunces', serif;
        font-weight: bold;
    }
    .btn:hover {
        background: var(--bg);
    }
    h2 { 
        margin-bottom: 5px; 
        font-size: 1.25em; 
        font-family: 'Fraunces', serif;
        color: var(--accent);
        border-bottom: 1px solid var(--text); 
        padding-bottom: 5px; 
    }
    .controls-row { 
        display: flex; 
        gap: 15px; 
        align-items: center; 
    }
    .log-panel {
        border: 1px solid var(--text);
        border-left: 6px solid #c0392b;
        padding: 10px 12px;
        font-size: 14px;
    }
    .log-panel.only-warnings { border-left-color: #d4a017; }
    .log-panel h3 { margin: 0 0 6px; font-size: 1em; font-family: 'Fraunces', serif; }
    .log-panel p { margin: 0 0 8px; }
    .log-panel ul { margin: 0 0 10px; padding-left: 18px; }
    .log-panel li { margin-bottom: 4px; }
    .log-panel .lvl { font-weight: bold; font-size: 11px; padding: 0 4px; margin-right: 4px; border: 1px solid currentColor; }
    .log-panel .lvl.error { color: #c0392b; }
    .log-panel .lvl.warn { color: #b8860b; }
    .log-panel pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; margin: 0 0 10px; }
    .log-panel .btn { width: auto; }
</style>

<div class="container">
    <div class="controls-row">
        <div>
            <label for="config">Printer:</label>
            <select id="config" style="width: 300px; padding: 3px;"></select>
            <br>
            <label for="includePushers">include neutral pushers in DSA:</label>
            <input type="checkbox" id="includePushers" name="includePushers">
            <br>
            The following settings are only supported by NEM0's printer.
            <br>
            <label for="doorsCount">Doors:</label>
            <input type="number" id="doorsCount" value="0" min="0" max="59" step="1" style="width: 80px; padding: 3px;">
        </div>
    </div>
    <div>
        <textarea id="bpInput" placeholder="input DSA here"></textarea>
    </div>

    <button style="
  background: url('/assets/topbar.png') no-repeat center center;
  background-size: cover;
  color: var(--top)"
  id="processBtn" class="btn" disabled>Process</button>

    <div id="errorLog" class="log-panel" style="display:none;"></div>

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
      alert('Copied LEFT side to clipboard.');
    });
  });
  document.getElementById('copyright').addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText('DSA: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').then(() => {
      alert('Copied RIGHT side to clipboard.');
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
    const configSelect = document.getElementById('config');
    const includePushers = document.getElementById('includePushers');
    
    const IMG_BASE_URL = "https://test.drednot.io/img/";

    const PRINTER_CONFIGS = [
        {
            name: "NEM0's Printer",
            dsa: "DSA:rZdLaxNRFMfPmXcnJo5QHzUgIqi4sIuWtoIPKoitCbVduymiqQRqC7VrmerMJpA4A+JH8IP4ORRBtL5BBEGhYO9M7ky7yJw5N2SVZAi/+Z/H/9xzIwhWgpUowpeLEUCn+mBzY639aHV98/7D1hZEqIO389rodeNOda29vt3aWu3/AyIt7hyRj9rbrcdPIApfAUAcxxEEzVl/LxbQ24OgJoI33utxkJAwU+Q1lyCCicgm/pfEcxRRs9Eb7zKJfyTxYp/4IsnAUrDs74ovAP7n5Pdy+lnwNmOYjJwcI/RbNnhTqkRX6H+OQjIY4klh+TTki/2ddURjgsq2pVC/TxI5V1I/i0kMf2Rte1wSB1rBtIQVGshk5lawJXOhqEr+hioyaMwkTDhNyQWt71zFFqg6pM2GaNPrZFINBZWHMzBHyERLoUEtlMjFo/SAqXDb6Wuu8u4VAqmLfjqjHPgShUS+Sgh/SuQsaSOVwfpOEmsUUUwPLjHcy8O+MzOa6RH+y5E3K3QL8eN+K5F1Mm6b7Z2DcmsUUU+JXTU3niKPUZufyN1M43nK38mA23mq7G9DMI8Vp9IaYgxdEEizeBCLaenfU2UGjTqVTQtr3Gx+yyIfo7Ipjmb+NnYgs+aMyDyIklhx6SnE984vSZx0aY3cUQnhd0mcdkfl77+SeKNkBeUujOGHrNo6qRGAH3VW60mq1oatEPV7SbxUplF5qukOtREkE+MNqsZ9ma72EJkMmvWS/Vp5+E6Navg6mREt+shRuMN8lMSrLj3S2Boh02iWGpGr8YskTlA7NWr8nfpQtReq6U4dzKe3KjgrevQZwnzxNUjEp37DOuGkNywP0uwI9K1BaFtDg5lmMz+KpglT2cma3dGUt81msm3G8T4=",
            pushers: "DSA:hZK7CsIwFIZP44UoKgh9ABEcBS2io+AmKDq7OEjVgjfaugdNQTrUBFz0OXwcZ3XuE9hYxyZOucD3ny8/YUDHdMyYduYM6JCOyDPaAJCXOI++q3Yxoiu/ONtu5tZiuts7S9MGhjTvDnqAuF+YWyvXtKeWa64dEDjnAu+XSCjwRiKODCU8aAsYapiEZbkD+uNQzZHwoAFU5BEQeXjvlDQii+NXtJIFTrfro6cHeSmPsKoFULaAI/aYqWQI6BhESDNZgk5UKXW1gbLAbj5mkweDenDnN9iQfgBV8WlBc/4B",
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
            name: "Mehmets Printer (thank you zombie2)",
            dsa: "DSA:rZbdSgJBGIZn9s+lXcHC6AeCQCmKIIiCIAgqK8VE70CiNARLMC9gpe1EcNuV6Ho67CYi6MD+IzoqEGrUne1knZ3d5mhgFx7e9/u+d74xgZ7Tc6YJLywTcHpWa6MTAO0BHXq2d8LLHfSpET6onBRLR/lyZf+wUAUmlGAk2jSsRrhYKtcK1Xz/PzA5q6Han0q1wvEpMM8/ENKyEHJG1ToDiUCCMGrQETuYOEki8iGk0WhSEa8wkUfEs9SI3IqnWnEm9j8xesrDPjXxBROXSERBDGBf30LIeorrUnddiwphRLuh7NMfNqE4WPdecUHE7kmMKnqPkYJd0aRrRZH3+jXv1/yo0mcm/jlJju00q0GSoI1c88pRzG9vJlhpvMPEdVbEW0xcZEUEuI4hVsRnrHGIGHHYTY3PcZxVCEROpNf4hInDJI1owMVok2563jBxmkQUIb1GiDujZySySGpk28nhJqtuy1hlWPUSafic8QWVcPkAeqJjOkmSyPmQ6CzxMc87d9n3nTuvMGrNNyau2Cpdt6IgBdqK6RCJGWjTckrv/QJaQpLwfpHAgD5BktyMTC6qRFvUV4xcZZWgH0fkNqsIPWLknAeRp73eHGKMle0vx/aGR4jk+jvnd5bGuyGyrF8=",
            pushers: "DSA:fc49CsJAEIbhydiIaCMeITfQE5jGBSG5QQrZ6IJ/JBEsV9xCUujsYqPX8Bp6DS3scgInHmCrF77i4SMwiUmIgoslQBPrNxdAfzgm/je4jniqerPNOlPzdLsrFjIHQjzdb9/x4Iy26mZqWco8VaVcFdAA1jZA1NH1QaDPGD5c5DWmbV37gNdz7z3R4g9H0Z+4ULiQlx8=",
            mapping: {
                [Item.BLOCK_HYPER_RUBBER.id]: { maxStack: 16, injector: { x: 17, y: 12 }, timer1: { x: 14, y: 11 }, timer2: { x: 15, y: 12 } },
                [Item.LOADER_NEW.id]: { maxStack: 1,
                                        injector: { x: 26, y: 12 }, timer1: { x: 24, y: 11 }, timer2: { x: 25, y: 12},
                                        secondinjector: { x: 23, y: 12 }, secondtimer1: { x: 21, y: 11 }, secondtimer2: { x: 22, y: 12}
                                      },
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
                [Item.BLOCK.id]: { maxStack: 16, 
                                    injector: { x: 35, y: 12 }, timer1: { x: 33, y: 11 }, timer2: { x: 34, y: 12},
                                    secondinjector: { x: 41, y: 12 }, secondtimer1: { x: 39, y: 11 }, secondtimer2: { x: 40, y: 12}
                                 },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 56, y: 12 }, timer1: { x: 54, y: 11 }, timer2:{ x: 55, y: 12} },
                [Item.ITEM_HATCH.id]: { maxStack: 1,
                                        injector: { x: 47, y: 12 }, timer1: { x: 45, y: 11 }, timer2: { x: 46, y: 12 },
                                        secondinjector: { x: 44, y: 12 }, secondtimer1: { x: 42, y: 11 }, secondtimer2: { x: 43, y: 12 }
                                      },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 77, y: 6 }, timer1: { x: 75, y: 7 }, timer2:{ x: 76, y: 6} }, 
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 10, y: 12 }, timer1: { x: 8, y: 11 }, timer2:{ x: 9, y: 12} },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 13, y: 12 }, timer1: { x: 11, y: 11 }, timer2:{ x: 12, y: 12} },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 7, y: 12 }, timer1: { x: 5, y: 11 }, timer2:{ x: 6, y: 12} },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 4, y: 12 }, timer1: { x: 2, y: 11 }, timer2: { x: 3, y: 12 } }
            }
        },
    		{
            name: "ILFS's Printer",
            dsa: "DSA:rZbLS+NQFMbPSdKkmbFjhcLgzGZG0CkVOsO8VrMZ7FTnaRezF9EqBR+gLlwmGDcFawLi3+HCpf+HCxFXPkAXgggKBb1JvXFhe9ITsgoN5Zfzne87514XnIpTcV3c9FwYcMatE/EEsE7FwxkPnrg1Jl7VM1OLCzO12Ym5xcnp6hK4qGDW3lMaDa+emanNrVSXJlr/AFfx6j0Pr2or1fllcNe3BdTzBLTPsJo+s9yOqRmYzXVJvJDE92mC6Ff5jVvjK71FLLUjgtqhRnxClLxiUpovwy6aLeJo2woRs9YuV7Tzo6fFbOs2+G6X2G4PviQ6qXTqJHTspFPORJid45aYMgjZujDH3tHYvRwbjpMgQvevAqFb1bvXjfiAfJ0mIuR30lrlyjapnCMj58eS+NlMSPaJJGom4UzK4Dszko/q4yU7PqV8QrJBuv31edRw81Ne0CNmMc8lYhAgGBRg29Y6shVGB24k+wUVJQ5xXxKzVJQwxpD/GSCAaoxslgqE68EB7qhcj74EqsGgZt1gtPNagp9RBmGqe+JduI/I7cEgnkuikVSImo8n2gdKNsQ40Yb1KNf/I5epklcYRisPJXGoP2pvVrhFZkSR1vdEUvl4g+lP6Ew7CJcclSFgtPIqzNBPk97uWpw7TLmYUNaPJDJHKle7J95K4juDWsF+jRu8jfmvjyqRIfosPCXTUdPYZO9gZ2QoChrD8L+9wWbvFT1dE/cGeAOA4vdHcp2IBWVr2Nhgfmu0SCUW4wn4/ZaaVYZ5urw2ffLN87x7",
            mapping: {
                [Item.RES_FLUX.id]: { maxStack: 16, injector: { x: 70, y: 13 }, timer1: { x: 69, y: 12 } },
                [Item.BLOCK_HYPER_RUBBER.id]: { maxStack: 16, injector: { x: 74, y: 42 }, timer1: { x: 72, y: 43 } },
                [Item.LOADER_NEW.id]: { maxStack: 1, injector: { x: 70, y: 48 }, timer1: { x: 70, y: 46 }, timer2: { x: 71, y: 46} },
                [Item.PUSHER.id]: { maxStack: 1, injector: { x: 68, y: 42 }, timer1: { x: 68, y: 40 } },
                [Item.BLOCK_LOGISTICS_RAIL.id]: { maxStack: 16, injector: { x: 51, y: 8 }, timer1: { x: 50, y: 6 } },
                [Item.FABRICATOR_ENGINEERING.id]: { maxStack: 1, injector: { x: 39, y: 7 }, timer1: { x: 37, y: 6 } },
                [Item.FABRICATOR_MUNITIONS.id]: { maxStack: 1, injector: { x: 14, y: 9 }, timer1: { x: 13, y: 7 } },
                [Item.TURRET_AUTO.id]: { maxStack: 1, injector: { x: 52, y: 9 }, timer1: { x: 52, y: 7 } },
                [Item.BLOCK_ITEM_NET.id]: { maxStack: 16, injector: { x: 46, y: 7 }, timer1: { x: 44, y: 6 } },
                [Item.BLOCK_LADDER.id]: { maxStack: 16, injector: { x: 7, y: 9 }, timer1: { x: 5, y: 7 } },
                [Item.EXPANDO_BOX.id]: { maxStack: 1, injector: { x: 17, y: 9 }, timer1: { x: 17, y: 7 } },
                [Item.ITEM_EJECTOR.id]: { maxStack: 1, injector: { x: 20, y: 9 }, timer1: { x: 19, y: 7 } },
                [Item.RECYCLER.id]: { maxStack: 1, injector: { x: 10, y: 9 }, timer1: { x: 9, y: 7 } },
                [Item.THRUSTER.id]: { maxStack: 1, injector: { x: 4, y: 9 }, timer1: { x: 3, y: 7 } },
                [Item.FLUID_TANK.id]: { maxStack: 1, injector: { x: 9, y: 9 }, timer1: { x: 7, y: 7 } },
                [Item.BLOCK.id]: { maxStack: 16, injector: { x: 42, y: 8 }, timer1: { x: 42, y: 6 }, timer2: { x: 43, y: 6} },
                [Item.BLOCK_WALKWAY.id]: { maxStack: 16, injector: { x: 47, y: 8 }, timer1: { x: 47, y: 6 } },
                [Item.ITEM_HATCH.id]: { maxStack: 1, injector: { x:38, y: 25 }, timer1: { x: 37, y: 23 }, timer2: { x: 37, y: 25} },
                [Item.SHIELD_PROJECTOR.id]: { maxStack: 1, injector: { x: 27, y: 8 }, timer1: { x: 26, y: 6 } },
                [Item.BLOCK_ICE_GLASS.id]: { maxStack: 16, injector: { x: 78, y: 17 }, timer1: { x: 77, y: 15 } },
                [Item.MUNITIONS_SUPPLY_UNIT.id]: { maxStack: 1, injector: { x: 76, y: 34 }, timer1: { x: 75, y: 33 } },
                [Item.SHIELD_GENERATOR.id]: { maxStack: 1, injector: { x: 54, y: 11 }, timer1: { x: 53, y: 9 } },
                [Item.TURRET_REMOTE.id]: { maxStack: 1, injector: { x: 67, y: 40 }, timer1: { x: 67, y: 38 } }
            }
    		}
    ];

    PRINTER_CONFIGS.forEach((cfg, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = cfg.name;
        configSelect.appendChild(opt);
    });

    const LOADER_ROLES = [
        ['injector', 'injector'], ['timer1', 'timer 1'], ['timer2', 'timer 2'],
        ['secondinjector', '2nd injector'], ['secondtimer1', '2nd timer 1'], ['secondtimer2', '2nd timer 2'],
    ];
    
    function checkPrinterLoaders(bp, configMap, printer) {
        const loaderId = Item.LOADER_NEW.id;
        const nameOf = id => Item.getById(id)?.name?.replace(/ \(Packaged\)$/, '').replace(/, Packaged\)$/, ')') || `item #${id}`;
        const at = new Map();
        const loaders = [];
        for (const cmd of bp.commands) {
            if (!(cmd instanceof BuildCmd)) continue;
            const id = cmd.item?.id ?? cmd.item;
            const key = `${cmd.x},${cmd.y}`;
            if (!at.has(key)) at.set(key, []);
            at.get(key).push(id);
            if (id === loaderId) loaders.push({ x: cmd.x, y: cmd.y });
        }

        const problems = [];
        const usedBy = new Map();
        for (const [idStr, mapping] of Object.entries(printer.mapping)) {
            const itemId = parseInt(idStr, 10);
            const item = Number.isNaN(itemId) ? `unknown item (key "${idStr}")` : nameOf(itemId);
            for (const [prop, role] of LOADER_ROLES) {
                const pos = mapping[prop];
                if (pos === undefined) continue;
                const isInjector = prop.endsWith('injector');
                const timer2Prop = prop.replace('timer1', 'timer2');
                // a missing timer 1 only crashes when its timer 2 is there
                const crashes = isInjector || (prop.endsWith('timer1') && !!mapping[timer2Prop] && configMap.has(`${mapping[timer2Prop].x},${mapping[timer2Prop].y}`));
                const report = (msg, level = crashes ? 'error' : 'warn') =>
                    problems.push({ level, printer: printer.name, item, itemId, role, x: pos?.x, y: pos?.y, message: msg });

                if (typeof pos?.x !== 'number' || typeof pos?.y !== 'number') {
                    report(`mapping position is malformed: ${JSON.stringify(pos)}`);
                    continue;
                }
                const key = `${pos.x},${pos.y}`;
                if (!usedBy.has(key)) usedBy.set(key, []);
                usedBy.get(key).push(`${item} ${role}`);

                const things = at.get(key);
                if (!things) {
                    report(`no loader at ${key}, nothing is built there`);
                } else if (!things.includes(loaderId)) {
                    report(`no loader at ${key}, found ${[...new Set(things)].map(nameOf).join(' + ')} instead`);
                } else if (!configMap.has(key)) {
                    report(`loader at ${key} has no config in the printer DSA`);
                }
            }
        }
        for (const [key, users] of usedBy) {
            if (users.length > 1) problems.push({
                level: 'warn', printer: printer.name, item: users.join(' & '), itemId: null, role: 'shared',
                x: +key.split(',')[0], y: +key.split(',')[1],
                message: `loader at ${key} is used by ${users.join(' and ')}, the last one wins`,
            });
        }
        return problems;
    }

    const errorLog = document.getElementById('errorLog');
    const escHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let processStep = 'starting';

    function clearErrorLog() {
        errorLog.style.display = 'none';
        errorLog.innerHTML = '';
    }

    function showErrorLog({ title, intro, items = [], details = '', report }) {
        const onlyWarnings = items.length > 0 && items.every(i => i.level === 'warn') && !details;
        errorLog.className = 'log-panel' + (onlyWarnings ? ' only-warnings' : '');
        errorLog.innerHTML = `
            <h3>${escHtml(title)}</h3>
            ${intro ? `<p>${escHtml(intro)}</p>` : ''}
            ${items.length ? `<ul>${items.map(i => `<li><span class="lvl ${i.level}">${i.level === 'error' ? 'ERROR' : 'WARN'}</span>${escHtml(i.text)}</li>`).join('')}</ul>` : ''}
            ${details ? `<pre>${escHtml(details)}</pre>` : ''}
            <button class="btn" type="button">Copy error report</button>`;
        errorLog.querySelector('button').addEventListener('click', async e => {
            try { await navigator.clipboard.writeText(report); e.target.textContent = 'Copied!'; }
            catch { e.target.textContent = "Couldn't copy, check the console"; console.log(report); }
        });
        errorLog.style.display = 'block';
    }

    function buildReport(lines) {
        return [
            'DSA to printer config - error report',
            `time: ${new Date().toISOString()}`,
            `page: ${location.href}`,
            `browser: ${navigator.userAgent}`,
            ...lines,
        ].join('\n');
    }

    function logPrinterProblems(printer, problems) {
        const errors = problems.filter(p => p.level === 'error');
        const warns = problems.filter(p => p.level === 'warn');
        const title = `[printer check] ${printer.name}: ${errors.length} error(s), ${warns.length} warning(s)`;
        (errors.length ? console.error : console.warn)(title);
        console.table(problems.map(({ level, item, role, x, y, message }) => ({ level, item, role, x, y, message })));
        console.log('[printer check] mapping used:', printer.mapping);

        showErrorLog({
            title: errors.length
                ? `${errors.length} loader${errors.length === 1 ? '' : 's'} missing in the "${printer.name}" DSA, no output was made`
                : `"${printer.name}": ${warns.length} warning${warns.length === 1 ? '' : 's'}, output was still made`,
            intro: errors.length
                ? 'The printer mapping points at loaders that aren\'t in the printer DSA. Positions are x,y in the printer blueprint.'
                : 'These loaders get skipped or share a config, so those items may come out with the wrong amount.',
            items: [...errors, ...warns].map(p => ({ level: p.level, text: `${p.item} ${p.role}: ${p.message}` })),
            report: buildReport([
                `printer: ${printer.name}`,
                `errors: ${errors.length}, warnings: ${warns.length}`,
                ...[...errors, ...warns].map(p => `[${p.level}] ${p.item} ${p.role}: ${p.message}`),
            ]),
        });
        return errors.length;
    }

    function logUnexpectedError(e, printer) {
        console.error(`[printer] failed while ${processStep} (printer: ${printer?.name ?? 'unknown'})`, e);
        showErrorLog({
            title: `Something broke while ${processStep}`,
            intro: 'No output was made. Copy the report and send it to @iogamesplayer.',
            details: `${e?.name || 'Error'}: ${e?.message || e}\n${e?.stack || ''}`,
            report: buildReport([
                `printer: ${printer?.name ?? 'unknown'}`,
                `step: ${processStep}`,
                `error: ${e?.name || 'Error'}: ${e?.message || e}`,
                `stack: ${e?.stack || 'none'}`,
            ]),
        });
    }

    // dev helper: run checkAllPrinters() in the browser console to check every printer mapping at once
    window.checkAllPrinters = async () => {
        for (const printer of PRINTER_CONFIGS) {
            try {
                const bp = decompress(await decode(printer.dsa));
                const configMap = new Map();
                let cfg = null;
                for (const cmd of bp.commands) {
                    if (cmd instanceof ConfigCmd) cfg = cmd;
                    else if (cmd instanceof BuildCmd && cfg) configMap.set(`${cmd.x},${cmd.y}`, cfg);
                }
                const problems = checkPrinterLoaders(bp, configMap, printer);
                const errors = problems.filter(p => p.level === 'error').length;
                console.groupCollapsed(`${errors ? '❌' : problems.length ? '⚠️' : '✅'} ${printer.name}: ${errors} error(s), ${problems.length - errors} warning(s)`);
                if (problems.length) console.table(problems.map(({ level, item, role, x, y, message }) => ({ level, item, role, x, y, message })));
                console.groupEnd();
            } catch (e) {
                console.error(`❌ ${printer.name}: couldn't decode the printer DSA`, e);
            }
        }
    };

    let currentCounts = new Map();
    let currentBuildCmdCount = 0;
    let currentBlueprint = null;
    
    bpInput.addEventListener('input', async () => {
        const val = bpInput.value.trim();
        processBtn.disabled = true;
        outputContainer.style.display = 'none';
        clearErrorLog();
        
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
                    }

                    currentBuildCmdCount += amount;

                    const id = cmd.item?.id ?? cmd.item;
                    if (id !== 0) {
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
        clearErrorLog();
        processStep = 'starting';
        try {
            await process(currentCounts);
        } catch (e) {
            logUnexpectedError(e, PRINTER_CONFIGS[parseInt(configSelect.value, 10)]);
        }
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
        
        let diff = t1Ms - Math.ceil(t1Ms);
        if(diff !== 0) {
            t1Ms = Math.ceil(t1Ms);
        }
        console.log("hrmrmmm",bestS,bestT,t1Ms,t2Ms, t1SL, inMS);
        return { S: bestS, T: bestT, t1Ms, t2Ms, t1SL, error: minOverfill, injectMs: inMS };
    }

    async function process(counts) {
        const selectedIndex = parseInt(configSelect.value, 10);
        const activeConfig = PRINTER_CONFIGS[selectedIndex];
        processStep = `decoding the printer DSA for "${activeConfig?.name}"`;
        let bp = await decode(activeConfig.dsa);

        processStep = 'decompressing the printer DSA';
        bp = decompress(bp);
        processStep = 'reading loader configs from the printer DSA';
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
        
        processStep = 'checking printer loaders';
        const loaderProblems = checkPrinterLoaders(bp, configMap, activeConfig);
        if (loaderProblems.length && logPrinterProblems(activeConfig, loaderProblems) > 0) return;

        let warnings = [];

        for (const [itemIdString, mapping] of Object.entries(activeConfig.mapping)) {
            
            const itemId = parseInt(itemIdString);
            let qty = counts.get(itemId) || 0;
            const itemObj = Item.getById(itemId);         
            const itemName = itemObj?.name || "name not found";
            processStep = `setting loader timings for ${itemName}`;
            
            
            if (itemId === Item.RES_FLUX.id) {
                qty = Math.ceil(currentBuildCmdCount / 10);
            }
            
            if (itemId === Item.DOOR.id) {
                qty = Math.min(59, parseInt(document.getElementById('doorsCount').value, 10) || 0);
            }
            
            const setups = [{ injector: mapping.injector, timer1: mapping.timer1, timer2: mapping.timer2 }];
            
            if(mapping.secondinjector) {
                setups.push({ injector: mapping.secondinjector, timer1: mapping.secondtimer1, timer2: mapping.secondtimer2 });
            }
                        
            let quantities = [];
            if(setups.length === 2) {
                quantities.push(Math.ceil(qty / 2));
                quantities.push(Math.floor(qty / 2));
            } else {
                quantities.push(qty);
            }
            
            for(let i = 0; i < setups.length; i++ ) {
                const amount = quantities[i];
                const setup = setups[i];
                
                const injectorConfig = configMap.get(`${setup.injector.x},${setup.injector.y}`);
                const timer1Config = setup.timer1 ? configMap.get(`${setup.timer1.x},${setup.timer1.y}`) : null;
                const timer2Config = setup.timer2 ? configMap.get(`${setup.timer2.x},${setup.timer2.y}`) : null;
                
                if (amount === 0) {
                    if (!injectorConfig.loader) injectorConfig.loader = {};
                    injectorConfig.loader.requireOutputInventory = true;
                    
                    if (timer1Config && timer1Config.loader) timer1Config.loader.cycleTime = 200;
                    if (timer2Config && timer2Config.loader) timer2Config.loader.cycleTime = 20;
                    continue;
                }
                
                const calc = calculate(amount, !!setup.timer2, mapping.maxStack || 16);
                if (calc.error != 1) {
                    warnings.push(`${itemName}: can't exactly eject ${amount} items. Ejecting ${calc.S * calc.T} items.`);
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
        }
        
        processStep = 'adding the pushers';
        if(includePushers.checked && activeConfig.pushers !== "null") {
            try {
                const pushers = await decode(activeConfig.pushers);
                if (pushers && pushers.commands) {
                    bp.commands.push(...pushers.commands);
                }
            } catch (e) {
                console.error("Couldn't include the pushers ):", e);
                alert("Encoding error with the pusher part, screenshot the browser console and send it to @iogamesplayer.");
            }
        }
        
        processStep = 'encoding the output DSA';
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
        clearErrorLog();
        if (currentBlueprint) {
             processBtn.disabled = false;
             outputContainer.style.display = 'none';
        }
    });
</script>
