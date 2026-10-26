---
layout: default
title: blueprint diff
---

# Blueprint diff
Based on [SkySea's dsabp library](https://github.com/Blueyescat/dsabp-js).<br>
Paste the **original** blueprint and the blueprint of the **damaged** ship. You get a blueprint with only the stuff that's missing, ready to throw into the [printer tool](/projects/drednot/tools/printer) or straight into an RCD.

<style>
    .df-tool {
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-family: 'Fraunces', sans-serif;
        color: var(--text);
        margin: 16px 0;
    }
    .df-tool *, .df-tool *::before, .df-tool *::after { box-sizing: border-box; }

    .df-io { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .df-tool textarea {
        width: 100%;
        min-height: 96px;
        resize: vertical;
        padding: 10px;
        font-family: ui-monospace, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.4;
        word-break: break-all;
        color: var(--text);
        background: var(--bg);
        border: 1px solid var(--text);
    }
    .df-tool textarea:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
    .df-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        font-weight: bold;
        min-height: 34px;
    }
    .df-meta { font-weight: normal; font-size: 12px; opacity: 0.75; font-variant-numeric: tabular-nums; }
    .df-meta.bad { color: #c0392b; opacity: 1; font-weight: bold; }

    .df-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .df-status { font-size: 13px; opacity: 0.8; margin-left: auto; }
    .df-status.bad { color: #c0392b; opacity: 1; }

    .btn {
        background: var(--top);
        color: var(--text);
        border: 1px solid var(--text);
        cursor: pointer;
        font-family: 'Fraunces', serif;
        font-weight: bold;
        font-size: 13px;
        padding: 6px 12px;
        line-height: 1.4;
    }
    .btn:hover { background: var(--accent-light); }
    .btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
    .btn.toggle::before { content: "○ "; }
    .btn.toggle.on { background: var(--accent-light); }
    .btn.toggle.on::before { content: "● "; color: var(--accent); }
    .btn:disabled { opacity: 0.45; cursor: default; }

    .panel { border: 1px solid var(--text); background: var(--bg); max-width: 400px; }
    .panel-header {
        padding: 10px 12px;
        background: var(--accent-light);
        border-bottom: 1px solid var(--text);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        font-family: 'Fraunces', serif;
        color: var(--text);
    }
    .panel-header small { font-weight: normal; opacity: 0.75; font-variant-numeric: tabular-nums; }
    .scroll-box { max-height: 70vh; overflow-y: auto; padding: 8px; }
    .df-empty { text-align: center; opacity: 0.55; padding: 24px 8px; font-size: 13px; }

    .df-tool table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .df-tool td { padding: 5px 6px; border-bottom: 1px solid color-mix(in srgb, var(--text) 20%, transparent); text-align: left; }
    .df-tool td.num { text-align: right; font-variant-numeric: tabular-nums; width: 56px; }
    .df-tool tr.total td { font-weight: bold; border-top: 1px solid var(--text); border-bottom: none; }
    .df-section { margin-top: 12px; font-size: 13px; }
    .df-section h4 { margin: 0 0 6px; font-size: 13px; }
    .df-section .note { font-size: 11px; opacity: 0.65; margin-top: 6px; }

    .icon-img { width: 24px; height: 24px; object-fit: contain; vertical-align: middle; image-rendering: pixelated; }
    .icon-cell { width: 32px; }

    @media (max-width: 800px) {
        .df-io { grid-template-columns: 1fr; }
        .panel { max-width: none; }
    }
</style>

<div class="df-tool">
    <div class="df-io">
        <div>
            <div class="df-label">Original <span class="df-meta" id="origMeta"></span></div>
            <textarea id="origInput" placeholder="Paste the DSA of the full, undamaged ship" spellcheck="false"></textarea>
        </div>
        <div>
            <div class="df-label">Damaged <span class="df-meta" id="dmgMeta"></span></div>
            <textarea id="dmgInput" placeholder="Paste the DSA of the ship as it is now" spellcheck="false"></textarea>
        </div>
    </div>

    <div class="df-toolbar">
        <button id="configToggle" class="btn toggle" title="Also rebuild loaders/pushers/etc. whose config is different from the original">Config changes</button>
        <span class="df-status" id="status"></span>
    </div>

    <div>
        <div class="df-label">
            <span>Missing <span class="df-meta" id="outMeta"></span></span>
            <button id="copyBtn" class="btn" disabled>Copy</button>
        </div>
        <textarea id="output" placeholder="Difference blueprint shows up here" readonly spellcheck="false"></textarea>
    </div>

    <div class="panel">
        <div class="panel-header">Missing items <small id="countMeta"></small></div>
        <div class="scroll-box">
            <table><tbody id="missingBody"><tr><td class="df-empty">Paste both blueprints</td></tr></tbody></table>
            <div class="df-section" id="costBox"></div>
        </div>
    </div>
</div>

<script type="module">
    import { decode, encode, Item, BuildCmd, ConfigCmd, BuildBits, Blueprint } from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";

    const $ = id => document.getElementById(id);
    const origInput = $('origInput'), dmgInput = $('dmgInput'), output = $('output');
    const configToggle = $('configToggle'), copyBtn = $('copyBtn'), statusEl = $('status');

    const IMG_BASE_URL = "https://test.drednot.io/img/";
    const MAX_LEN = 10000, MAX_BUILDS = 1000;
    const RESOURCES = [1, 2, 4, 5]; // iron, explosives, hyper rubber, flux

    const bps = { orig: null, dmg: null };      // decoded blueprints
    const tiles = { orig: [], dmg: [] };        // one entry per built tile
    let compareConfig = false;
    let missing = [];                           // tiles from the original that need building
    let decodeToken = { orig: 0, dmg: 0 }, syncToken = 0;

    // ---------- helpers ----------
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const itemId = it => (it && typeof it === 'object') ? it.id : (it ?? 0);
    const shapeOf = b => b.shape?.enumValue ?? 0;
    const sameConfig = (a, b) => a === b || (!!a && !!b && a.equals(b));
    const isBlock = id => Item.getById(id)?.isBlock === true;

    function nameOf(id) {
        if (id === 0) return 'Nothing';
        const name = Item.getById(id)?.name;
        if (!name) return `Unknown item #${id}`;
        return name.replace(/ \(Packaged\)$/, '').replace(/, Packaged\)$/, ')');
    }
    function imgOf(id) {
        const item = Item.getById(id);
        const img = item?.image || item?.buildInfo?.[0]?.image;
        return img ? `<img src="${IMG_BASE_URL}${img}.png" class="icon-img" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '';
    }
    function setStatus(text, bad = false) {
        statusEl.textContent = text;
        statusEl.classList.toggle('bad', bad);
    }
    function positions(b) {
        if (!b.bits || typeof b.bits.int !== 'bigint') return [0];
        const out = []; let n = b.bits.int, i = 0;
        while (n > 0n) { if (n & 1n) out.push(i); n >>= 1n; i++; }
        return out;
    }

    // split every build command into single tiles, remembering the config that was active for it
    function parseTiles(bp) {
        const out = [];
        let config = null;
        for (const cmd of bp.commands) {
            if (cmd instanceof ConfigCmd) { config = cmd; continue; }
            if (!(cmd instanceof BuildCmd)) continue;
            const id = itemId(cmd.item);
            if (id === 0) continue;
            for (const p of positions(cmd)) {
                out.push({ x: cmd.x + p, y: cmd.y, id, item: cmd.item, shape: cmd.shape, shapeId: shapeOf(cmd), config: isBlock(id) ? null : config });
            }
        }
        return out;
    }
    const keyOf = t => `${t.x},${t.y},${t.id},${t.shapeId}`;

    // ---------- input ----------
    for (const [which, el] of [['orig', origInput], ['dmg', dmgInput]]) {
        let timer;
        el.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => loadInput(which, el), 150);
        });
    }

    async function loadInput(which, el) {
        const val = el.value.trim();
        const token = ++decodeToken[which];
        const meta = $(which + 'Meta');
        meta.classList.remove('bad');
        meta.textContent = val ? `${val.length.toLocaleString()} chars` : '';
        bps[which] = null; tiles[which] = [];
        if (!val) { recompute(); return; }
        if (!/^DSA:/i.test(val)) { meta.textContent = "doesn't start with DSA:"; meta.classList.add('bad'); recompute(); return; }
        try {
            const bp = await decode(val);
            if (token !== decodeToken[which]) return; // a newer paste won
            bps[which] = bp;
            tiles[which] = parseTiles(bp);
            meta.textContent = `${bp.width}×${bp.height} · ${tiles[which].length.toLocaleString()} tiles`;
        } catch (e) {
            if (token !== decodeToken[which]) return;
            console.error(e);
            meta.textContent = "couldn't decode";
            meta.classList.add('bad');
        }
        recompute();
    }

    // ---------- toolbar ----------
    configToggle.addEventListener('click', () => {
        compareConfig = !compareConfig;
        configToggle.classList.toggle('on', compareConfig);
        recompute();
    });
    copyBtn.addEventListener('click', async () => {
        if (!output.value) return;
        try { await navigator.clipboard.writeText(output.value); }
        catch { output.select(); document.execCommand('copy'); }
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1200);
    });

    // ---------- diff ----------
    function recompute() {
        if (!bps.orig || !bps.dmg) {
            missing = [];
            renderEmpty(bps.orig ? 'Paste the damaged blueprint' : 'Paste the original blueprint');
            return;
        }
        // damaged tiles bucketed per tile/item/shape
        const pool = new Map();
        for (const t of tiles.dmg) {
            const k = keyOf(t);
            if (!pool.has(k)) pool.set(k, []);
            pool.get(k).push(t);
        }
        missing = [];
        for (const t of tiles.orig) {
            const bucket = pool.get(keyOf(t));
            let idx = -1;
            if (bucket?.length) {
                idx = compareConfig ? bucket.findIndex(d => t.config === null || sameConfig(t.config, d.config)) : 0;
            }
            if (idx >= 0) bucket.splice(idx, 1);
            else missing.push(t);
        }

        const matched = tiles.orig.length - missing.length;
        setStatus(`${matched.toLocaleString()} of ${tiles.orig.length.toLocaleString()} tiles still there`);

        renderCounts();
        syncOutput();
    }

    // ---------- rendering ----------
    function renderEmpty(msg) {
        $('missingBody').innerHTML = `<tr><td class="df-empty">${esc(msg)}</td></tr>`;
        $('costBox').innerHTML = '';
        $('countMeta').textContent = '';
        $('outMeta').textContent = ''; $('outMeta').classList.remove('bad');
        output.value = ''; copyBtn.disabled = true;
        setStatus('');
    }

    function renderCounts() {
        const counts = new Map();
        for (const t of missing) counts.set(t.id, (counts.get(t.id) || 0) + 1);
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || nameOf(a[0]).localeCompare(nameOf(b[0])));
        $('missingBody').innerHTML = sorted.length
            ? sorted.map(([id, qty]) => `
                <tr><td class="icon-cell">${imgOf(id)}</td><td><strong>${esc(nameOf(id))}</strong></td><td class="num">${qty.toLocaleString()}</td></tr>`).join('') +
              `<tr class="total"><td></td><td>Total</td><td class="num">${missing.length.toLocaleString()}</td></tr>`
            : '<tr><td class="df-empty">Nothing missing, ship is whole</td></tr>';
        $('countMeta').textContent = `${sorted.length} types`;

        // rough material cost
        const cost = new Map(), noRecipe = [];
        for (const [id, qty] of sorted) {
            const r = Item.getById(id)?.recipe;
            if (!r?.input?.length || !r.count) { noRecipe.push(id); continue; }
            for (const inp of r.input) cost.set(inp.item, (cost.get(inp.item) || 0) + inp.count * qty / r.count);
        }
        $('costBox').innerHTML = cost.size
            ? `<h4>Rough material cost</h4><table><tbody>${[...cost.entries()]
                .sort((a, b) => RESOURCES.indexOf(a[0]) - RESOURCES.indexOf(b[0]))
                .map(([id, amt]) => `<tr><td class="icon-cell">${imgOf(id)}</td><td>${esc(nameOf(id))}</td><td class="num">${Math.ceil(amt).toLocaleString()}</td></tr>`)
                .join('')}</tbody></table>` +
              (noRecipe.length ? `<div class="note">Not included (no recipe): ${noRecipe.map(id => esc(nameOf(id))).join(', ')}</div>` : '')
            : '';
    }

    // ---------- output ----------
    // merge neighbouring builds of the same item/shape/row/config into one bits command
    function compactTiles(list) {
        const out = [];
        for (const t of list) {
            const prev = out[out.length - 1];
            const merged = prev && tryMerge(prev, t);
            if (merged) out[out.length - 1] = merged;
            else out.push({ xs: [t.x], t });
        }
        return out;
    }
    function tryMerge(group, t) {
        const a = group.t;
        if (a.id !== t.id || a.y !== t.y || a.shapeId !== t.shapeId) return null;
        if (!sameConfig(a.config, t.config)) return null;
        if (!Number.isInteger(t.x - a.x) || group.xs.includes(t.x)) return null;
        const xs = [...group.xs, t.x];
        if (Math.max(...xs) - Math.min(...xs) > 63) return null;
        return { xs, t: a };
    }
    function toBuild(group) {
        const x0 = Math.min(...group.xs);
        let n = 0n;
        for (const x of group.xs) n |= 1n << BigInt(x - x0);
        const t = group.t;
        return new BuildCmd({ x: x0, y: t.y, item: t.item, shape: t.shape, bits: n === 1n ? undefined : new BuildBits(n) });
    }

    async function syncOutput() {
        const meta = $('outMeta');
        meta.classList.remove('bad');
        if (!bps.orig || !bps.dmg) return;
        const token = ++syncToken;
        if (!missing.length) {
            output.value = '';
            meta.textContent = 'nothing missing';
            copyBtn.disabled = true;
            return;
        }
        // keep the original's build order, so blocks still go down before the stuff that sits on them
        const groups = compactTiles(missing);
        const cmds = [];
        let active = null; // the game's builder starts with no config
        for (const g of groups) {
            if (!isBlock(g.t.id) && !sameConfig(g.t.config, active)) {
                cmds.push(g.t.config || new ConfigCmd());
                active = g.t.config;
            }
            cmds.push(toBuild(g));
        }
        const o = bps.orig;
        const bp = new Blueprint({ version: o.version, width: o.width, height: o.height, commands: cmds });
        try {
            const str = 'DSA:' + await encode(bp);
            if (token !== syncToken) return;
            output.value = str;
            copyBtn.disabled = false;
            const tooLong = str.length > MAX_LEN, tooMany = groups.length > MAX_BUILDS;
            meta.textContent = `${str.length.toLocaleString()} chars · ${groups.length} build cmds` +
                (tooLong ? ' · too long for the game' : '') + (tooMany ? ` · over ${MAX_BUILDS} builds` : '');
            meta.classList.toggle('bad', tooLong || tooMany);
        } catch (e) {
            console.error(e);
            setStatus('Encoding failed: ' + (e?.message || e), true);
        }
    }
</script>

HAIL HYDEATH
