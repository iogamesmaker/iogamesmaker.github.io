---
layout: default
title: blueprint tools
---

# Blueprint sorter // item viewer
Based on [SkySea's dsabp library](https://github.com/Blueyescat/dsabp-js). It does most the heavy lifting.<br>
Paste a blueprint, drag stuff around to change the build order, copy the result from the output box. Your pasted blueprint stays untouched so you can always hit reset.<br>
With **Compact** on, neighbouring builds of the same item on the same row get merged back into one command, which keeps the output a lot shorter. If the game still says the text is too long, turn on grouping.

Summary: just use dsa.fr.to lol
<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
<style>
    .bp-tool {
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-family: 'Fraunces', sans-serif;
        color: var(--text);
        margin: 16px 0;
    }
    .bp-tool *, .bp-tool *::before, .bp-tool *::after { box-sizing: border-box; }

    /* inputs */
    .bp-io { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .bp-tool textarea {
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
    .bp-tool textarea:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
    .bp-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        font-weight: bold;
        min-height: 34px;
    }
    .bp-meta { font-weight: normal; font-size: 12px; opacity: 0.75; font-variant-numeric: tabular-nums; }
    .bp-meta.bad { color: #c0392b; opacity: 1; font-weight: bold; }

    /* toolbar */
    .bp-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .bp-status { font-size: 13px; opacity: 0.8; margin-left: auto; }
    .bp-status.bad { color: #c0392b; opacity: 1; }

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

    /* panels */
    .bp-workspace { display: grid; grid-template-columns: 340px 1fr; gap: 16px; align-items: start; }
    .panel { border: 1px solid var(--text); background: var(--bg); min-width: 0; }
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
    .bp-empty { text-align: center; opacity: 0.55; padding: 24px 8px; font-size: 13px; }

    /* counts */
    .bp-tool table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .bp-tool td { padding: 5px 6px; border-bottom: 1px solid color-mix(in srgb, var(--text) 20%, transparent); text-align: left; }
    .bp-tool td.num { text-align: right; font-variant-numeric: tabular-nums; width: 56px; }
    .bp-tool tr.count-row { cursor: default; }
    .bp-tool tr.count-row:hover td { background: var(--accent-light); }
    .bp-tool tr.total td { font-weight: bold; border-top: 1px solid var(--text); border-bottom: none; }
    .bp-cost { margin-top: 12px; font-size: 13px; }
    .bp-cost h4 { margin: 0 0 6px; font-size: 13px; }
    .bp-cost .note { font-size: 11px; opacity: 0.65; margin-top: 6px; }

    .icon-img { width: 24px; height: 24px; object-fit: contain; vertical-align: middle; image-rendering: pixelated; }
    .icon-cell { width: 32px; }

    /* order list */
    .sortable-list { display: flex; flex-direction: column; gap: 4px; }
    .order-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: var(--bg);
        border: 1px solid var(--text);
        transition: background 0.1s;
    }
    .order-item:hover, .order-item.hl { background: var(--accent-light); }
    .order-index { width: 28px; text-align: right; font-size: 11px; opacity: 0.5; font-variant-numeric: tabular-nums; }
    .order-info { flex-grow: 1; min-width: 0; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
    .order-info strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge {
        font-size: 11px;
        font-weight: bold;
        padding: 1px 6px;
        border: 1px solid var(--accent);
        color: var(--accent);
        font-variant-numeric: tabular-nums;
    }
    .order-sub { font-size: 11px; opacity: 0.6; font-variant-numeric: tabular-nums; }
    .order-actions { display: flex; gap: 2px; opacity: 0.35; transition: opacity 0.1s; }
    .order-item:hover .order-actions, .order-actions:focus-within { opacity: 1; }
    .icon-btn {
        background: none;
        border: 1px solid transparent;
        color: var(--text);
        cursor: pointer;
        font-size: 12px;
        width: 24px;
        height: 24px;
        padding: 0;
        line-height: 1;
    }
    .icon-btn:hover { border-color: var(--text); background: var(--bg); }
    .icon-btn.remove:hover { color: #c0392b; border-color: #c0392b; }
    .icon-btn:disabled { opacity: 0.25; cursor: default; border-color: transparent; }
    .drag-handle { cursor: grab; padding: 0 4px; color: var(--accent); user-select: none; font-size: 16px; }
    .drag-handle:active { cursor: grabbing; }
    .order-item.ghost { opacity: 0.4; background: var(--accent-light); }
    .order-item.chosen { box-shadow: 0 2px 8px color-mix(in srgb, var(--text) 25%, transparent); }

    @media (max-width: 800px) {
        .bp-io, .bp-workspace { grid-template-columns: 1fr; }
        .order-actions { opacity: 1; }
    }
</style>

<div class="bp-tool">
    <div class="bp-io">
        <div>
            <div class="bp-label">Input <span class="bp-meta" id="inMeta"></span></div>
            <textarea id="bpInput" placeholder="Paste your DSA here!!!" spellcheck="false"></textarea>
        </div>
        <div>
            <div class="bp-label">
                <span>Output <span class="bp-meta" id="outMeta"></span></span>
                <button id="copyBtn" class="btn" disabled>Copy</button>
            </div>
            <textarea id="bpOutput" placeholder="Sorted blueprint shows up here" readonly spellcheck="false"></textarea>
        </div>
    </div>

    <div class="bp-toolbar">
        <button id="groupToggle" class="btn toggle on" title="Keep all builds of the same item together">Group</button>
        <button id="compactToggle" class="btn toggle on" title="Merge neighbouring builds of the same item on a row into one command">Compact</button>
        <button id="resetBtn" class="btn" disabled title="Go back to the pasted blueprint">Reset</button>
        <span class="bp-status" id="status"></span>
    </div>

    <div class="bp-workspace">
        <div class="panel">
            <div class="panel-header">Count <small id="countMeta"></small></div>
            <div class="scroll-box">
                <table>
                    <tbody id="statsBody">
                        <tr><td class="bp-empty">Nothing pasted yet</td></tr>
                    </tbody>
                </table>
                <div class="bp-cost" id="costBox"></div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-header">Order <small id="orderMeta"></small></div>
            <div class="scroll-box">
                <div id="buildOrderList" class="sortable-list">
                    <div class="bp-empty">Build order shows up here. Drag the ⠿ handle to move things.</div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="module">
    import { decode, encode, Item, BuildCmd, ConfigCmd, BuildBits, Blueprint } from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";

    const $ = id => document.getElementById(id);
    const bpInput = $('bpInput'), bpOutput = $('bpOutput');
    const statsBody = $('statsBody'), costBox = $('costBox'), buildOrderList = $('buildOrderList');
    const groupToggle = $('groupToggle'), compactToggle = $('compactToggle'), resetBtn = $('resetBtn'), copyBtn = $('copyBtn');
    const statusEl = $('status');

    const IMG_BASE_URL = "https://test.drednot.io/img/";
    const MAX_LEN = 10000, MAX_BUILDS = 1000;
    const RESOURCES = [1, 2, 4, 5]; // iron, explosives, hyper rubber, flux

    let sourceBP = null;     // as pasted
    let originalUnits = [];  // build order as pasted
    let units = [];          // current build order: [{ build, config }]
    let isGrouping = true, isCompact = true;
    let decodeToken = 0, syncToken = 0;

    // ---------- helpers ----------
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const itemId = it => (it && typeof it === 'object') ? it.id : (it ?? 0);
    const popcount = n => { let c = 0; while (n > 0n) { c += Number(n & 1n); n >>= 1n; } return c; };
    const amountOf = b => (b.bits && typeof b.bits.int === 'bigint') ? popcount(b.bits.int) : 1;
    const shapeOf = b => b.shape?.enumValue ?? 0;
    const sameConfig = (a, b) => a === b || (!!a && !!b && a.equals(b));
    // blocks can't hold a config, so their position relative to config commands doesn't matter
    const configFree = u => { const id = itemId(u.build.item); return id === 0 || Item.getById(id)?.isBlock === true; };

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
    function groupUnits(list) {
        const groups = new Map();
        for (const u of list) {
            const id = itemId(u.build.item);
            if (!groups.has(id)) groups.set(id, { id, units: [], qty: 0 });
            const g = groups.get(id);
            g.units.push(u);
            g.qty += amountOf(u.build);
        }
        return [...groups.values()];
    }

    // ---------- input ----------
    let inputTimer;
    bpInput.addEventListener('input', () => {
        clearTimeout(inputTimer);
        inputTimer = setTimeout(loadInput, 150);
    });

    async function loadInput() {
        const val = bpInput.value.trim();
        const token = ++decodeToken;
        $('inMeta').textContent = val ? `${val.length.toLocaleString()} chars` : '';
        if (!val) { clearAll(); setStatus(''); return; }
        if (!/^DSA:/i.test(val)) { setStatus("That doesn't start with DSA:", true); return; }
        try {
            const bp = await decode(val);
            if (token !== decodeToken) return; // a newer paste won
            sourceBP = bp;
            originalUnits = parseUnits(bp);
            units = isGrouping ? groupUnits(originalUnits).flatMap(g => g.units) : [...originalUnits];
            resetBtn.disabled = false;
            setStatus(`Loaded ${bp.width}×${bp.height} blueprint`);
            renderLists();
            syncOutput();
        } catch (e) {
            if (token !== decodeToken) return;
            console.error(e);
            setStatus("Couldn't decode that blueprint: " + (e?.message || e), true);
        }
    }

    function parseUnits(bp) {
        const out = [];
        let activeConfig = null;
        for (const cmd of bp.commands) {
            if (cmd instanceof ConfigCmd) activeConfig = cmd;
            else if (cmd instanceof BuildCmd) out.push({ build: cmd, config: activeConfig });
        }
        return out;
    }

    function clearAll() {
        sourceBP = null; originalUnits = []; units = [];
        bpOutput.value = '';
        $('outMeta').textContent = ''; $('countMeta').textContent = ''; $('orderMeta').textContent = '';
        statsBody.innerHTML = '<tr><td class="bp-empty">Nothing pasted yet</td></tr>';
        costBox.innerHTML = '';
        buildOrderList.innerHTML = '<div class="bp-empty">Build order shows up here. Drag the ⠿ handle to move things.</div>';
        copyBtn.disabled = true; resetBtn.disabled = true;
    }

    // ---------- toolbar ----------
    groupToggle.addEventListener('click', () => {
        isGrouping = !isGrouping;
        groupToggle.classList.toggle('on', isGrouping);
        if (!sourceBP) return;
        if (isGrouping) {
            units = groupUnits(units).flatMap(g => g.units);
            syncOutput();
        }
        renderLists();
    });
    compactToggle.addEventListener('click', () => {
        isCompact = !isCompact;
        compactToggle.classList.toggle('on', isCompact);
        if (sourceBP) syncOutput();
    });
    resetBtn.addEventListener('click', () => {
        if (!sourceBP) return;
        units = isGrouping ? groupUnits(originalUnits).flatMap(g => g.units) : [...originalUnits];
        renderLists();
        syncOutput();
        setStatus('Back to the pasted order');
    });
    copyBtn.addEventListener('click', async () => {
        if (!bpOutput.value) return;
        try { await navigator.clipboard.writeText(bpOutput.value); }
        catch { bpOutput.select(); document.execCommand('copy'); }
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1200);
    });

    // ---------- rendering ----------
    function currentEntries() {
        if (isGrouping) {
            return groupUnits(units).map(g => ({ id: g.id, units: g.units, qty: g.qty }));
        }
        return units.map(u => ({ id: itemId(u.build.item), units: [u], qty: amountOf(u.build) }));
    }

    function renderLists() {
        if (!sourceBP) return;

        // counts
        const counts = new Map();
        for (const u of units) {
            const id = itemId(u.build.item);
            if (id !== 0) counts.set(id, (counts.get(id) || 0) + amountOf(u.build));
        }
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || nameOf(a[0]).localeCompare(nameOf(b[0])));
        const total = sorted.reduce((s, [, q]) => s + q, 0);
        statsBody.innerHTML = sorted.length ? sorted.map(([id, qty]) => `
            <tr class="count-row" data-id="${id}">
                <td class="icon-cell">${imgOf(id)}</td>
                <td><strong>${esc(nameOf(id))}</strong></td>
                <td class="num">${qty.toLocaleString()}</td>
            </tr>`).join('') + `
            <tr class="total"><td></td><td>Total</td><td class="num">${total.toLocaleString()}</td></tr>`
            : '<tr><td class="bp-empty">No builds</td></tr>';
        $('countMeta').textContent = `${sorted.length} types`;
        renderCost(counts);

        // order
        const entries = currentEntries();
        buildOrderList.innerHTML = '';
        entries.forEach((data, index) => {
            const el = document.createElement('div');
            el.className = 'order-item';
            el.dataset.id = data.id;
            el.innerHTML = `
                <span class="drag-handle" title="Drag to move">⠿</span>
                <span class="order-index">${index + 1}</span>
                ${imgOf(data.id)}
                <div class="order-info">
                    <strong>${esc(nameOf(data.id))}</strong>
                    ${data.qty > 1 ? `<span class="badge">×${data.qty}</span>` : ''}
                </div>
                <div class="order-actions">
                    <button class="icon-btn up" title="Move up" ${index === 0 ? 'disabled' : ''}>▲</button>
                    <button class="icon-btn down" title="Move down" ${index === entries.length - 1 ? 'disabled' : ''}>▼</button>
                    <button class="icon-btn remove" title="Remove">✕</button>
                </div>`;
            el._units = data.units;
            el.querySelector('.up').addEventListener('click', () => moveEntry(index, -1));
            el.querySelector('.down').addEventListener('click', () => moveEntry(index, 1));
            el.querySelector('.remove').addEventListener('click', () => {
                const gone = new Set(data.units);
                units = units.filter(u => !gone.has(u));
                renderLists();
                syncOutput();
            });
            buildOrderList.appendChild(el);
        });
        if (!entries.length) buildOrderList.innerHTML = '<div class="bp-empty">Nothing left to build</div>';
        $('orderMeta').textContent = `${entries.length} ${isGrouping ? 'groups' : 'commands'}`;
    }

    function renderCost(counts) {
        const cost = new Map();
        const noRecipe = [];
        for (const [id, qty] of counts) {
            const r = Item.getById(id)?.recipe;
            if (!r?.input?.length || !r.count) { noRecipe.push(id); continue; }
            for (const inp of r.input) cost.set(inp.item, (cost.get(inp.item) || 0) + inp.count * qty / r.count);
        }
        if (!cost.size) { costBox.innerHTML = ''; return; }
        const rows = [...cost.entries()]
            .sort((a, b) => RESOURCES.indexOf(a[0]) - RESOURCES.indexOf(b[0]))
            .map(([id, amt]) => `<tr><td class="icon-cell">${imgOf(id)}</td><td>${esc(nameOf(id))}</td><td class="num">${Math.ceil(amt).toLocaleString()}</td></tr>`)
            .join('');
        costBox.innerHTML = `<h4>Rough material cost</h4><table><tbody>${rows}</tbody></table>` +
            (noRecipe.length ? `<div class="note">Not included (no recipe): ${noRecipe.map(id => esc(nameOf(id))).join(', ')}</div>` : '');
    }

    function moveEntry(index, dir) {
        const entries = currentEntries();
        const j = index + dir;
        if (j < 0 || j >= entries.length) return;
        [entries[index], entries[j]] = [entries[j], entries[index]];
        units = entries.flatMap(e => e.units);
        renderLists();
        syncOutput();
    }

    // highlight matching order entries when hovering a count row
    statsBody.addEventListener('mouseover', e => {
        const row = e.target.closest('.count-row');
        buildOrderList.querySelectorAll('.order-item.hl').forEach(el => el.classList.remove('hl'));
        if (row) buildOrderList.querySelectorAll(`.order-item[data-id="${row.dataset.id}"]`).forEach(el => el.classList.add('hl'));
    });
    statsBody.addEventListener('mouseleave', () => buildOrderList.querySelectorAll('.order-item.hl').forEach(el => el.classList.remove('hl')));

    // one Sortable for the lifetime of the page
    new Sortable(buildOrderList, {
        animation: 150,
        ghostClass: 'ghost',
        chosenClass: 'chosen',
        handle: '.drag-handle',
        onEnd: () => {
            units = [...buildOrderList.querySelectorAll('.order-item')].flatMap(el => el._units || []);
            renderLists();
            syncOutput();
        }
    });

    // ---------- output ----------
    // merge neighbouring builds of the same item/shape/row/config into one bits command
    function compactUnits(list) {
        const out = [];
        for (const u of list) {
            const prev = out[out.length - 1];
            const merged = prev && tryMerge(prev, u);
            if (merged) out[out.length - 1] = merged;
            else out.push(u);
        }
        return out;
    }
    function positions(b) {
        if (!b.bits || typeof b.bits.int !== 'bigint') return [0];
        const out = []; let n = b.bits.int, i = 0;
        while (n > 0n) { if (n & 1n) out.push(i); n >>= 1n; i++; }
        return out;
    }
    function tryMerge(a, b) {
        const A = a.build, B = b.build;
        if (itemId(A.item) !== itemId(B.item) || itemId(A.item) === 0) return null;
        if (A.y !== B.y || shapeOf(A) !== shapeOf(B)) return null;
        if (!configFree(a) && !sameConfig(a.config, b.config)) return null;
        const d = B.x - A.x;
        if (!Number.isInteger(d)) return null;
        const xs = [...positions(A).map(p => A.x + p), ...positions(B).map(p => B.x + p)];
        if (new Set(xs).size !== xs.length) return null; // same tile twice, keep both
        const x0 = Math.min(...xs);
        if (Math.max(...xs) - x0 > 63) return null;
        let n = 0n;
        for (const x of xs) n |= 1n << BigInt(x - x0);
        const build = new BuildCmd({ x: x0, y: A.y, item: A.item, shape: A.shape, bits: n === 1n ? undefined : new BuildBits(n) });
        return { build, config: a.config };
    }

    async function syncOutput() {
        if (!sourceBP) return;
        const token = ++syncToken;
        const list = isCompact ? compactUnits(units) : units;
        const cmds = [];
        let active = null; // the game's builder starts with no config
        for (const u of list) {
            if (!configFree(u) && !sameConfig(u.config, active)) {
                // switching back to "no config" needs an explicit empty config,
                // otherwise the previous loader/pusher config leaks onto this build
                cmds.push(u.config || new ConfigCmd());
                active = u.config;
            }
            cmds.push(u.build);
        }
        const buildCount = list.length;
        if (!buildCount) {
            bpOutput.value = '';
            $('outMeta').textContent = 'nothing to build';
            copyBtn.disabled = true;
            return;
        }
        const bp = new Blueprint({ version: sourceBP.version, width: sourceBP.width, height: sourceBP.height, commands: cmds });
        try {
            const str = 'DSA:' + await encode(bp);
            if (token !== syncToken) return;
            bpOutput.value = str;
            copyBtn.disabled = false;
            const tooLong = str.length > MAX_LEN, tooMany = buildCount > MAX_BUILDS;
            const meta = $('outMeta');
            meta.textContent = `${str.length.toLocaleString()} chars · ${buildCount} build cmds` +
                (tooLong ? ' · too long for the game' : '') + (tooMany ? ` · over ${MAX_BUILDS} builds` : '');
            meta.classList.toggle('bad', tooLong || tooMany);
        } catch (e) {
            console.error(e);
            setStatus('Encoding failed: ' + (e?.message || e), true);
        }
    }
</script>

HAIL HYDEATH
