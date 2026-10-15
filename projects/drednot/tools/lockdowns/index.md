---
layout: default
title: unshrinkable calculator
---

# Unshrinkable calculator
Claude did 100% of the work. Crazy how good it is.<br>
Paste a blueprint and it works out the fewest lockdown override units needed so the ship is unshrinkable.<br>
Lockdowns aren't compatible with the RCD, so they show up as **punch ammo** in the output. Swap them for lockdowns in game.<br>
Only full iron / hyper rubber / hyper ice blocks get replaced.<br>
For most ships, this won't work.

<style>
    .ul-container {
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-family: 'Fraunces', sans-serif;
        color: var(--text);
    }
    .ul-container textarea {
        width: 100%;
        min-height: 90px;
        box-sizing: border-box;
        font-family: monospace;
        font-size: 12px;
        word-break: break-all;
    }
    .ul-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
    }
    .ul-controls label { cursor: pointer; }
    .btn {
        background: var(--top);
        color: var(--text);
        border: 1px solid var(--text);
        cursor: pointer;
        font-family: 'Fraunces', serif;
        font-weight: bold;
        padding: 8px 12px;
    }
    .btn:hover { background: var(--accent-light); }
    .btn:disabled { opacity: 0.5; cursor: wait; }
    .ul-workspace {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 20px;
        align-items: start;
    }
    @media (max-width: 760px) { .ul-workspace { grid-template-columns: 1fr; } }
    .panel { border: 1px solid var(--text); }
    .panel-header {
        padding: 12px;
        background: var(--accent-light);
        border-bottom: 1px solid var(--text);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-family: 'Fraunces', serif;
        color: var(--text);
    }
    .panel-body { padding: 10px; }
    .ul-container table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .ul-container td { padding: 6px 8px; border-bottom: 1px solid var(--text); text-align: left; vertical-align: top; }
    .ul-container td:first-child { width: 45%; }
    .ul-big { font-size: 22px; font-weight: bold; }
    .ul-warn { color: #c0392b; font-size: 13px; margin: 6px 0 0; }
    .ul-note { font-size: 12px; opacity: 0.75; margin-top: 6px; }
    #ulCanvas { max-width: 100%; image-rendering: pixelated; display: block; }
    .ul-legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; margin-top: 8px; }
    .ul-legend span { display: inline-flex; align-items: center; gap: 4px; }
    .ul-legend i { display: inline-block; width: 12px; height: 12px; border: 1px solid var(--text); }
</style>

<div class="ul-container">
    <textarea id="ulInput" placeholder="Paste your DSA here!!!"></textarea>

    <div class="ul-controls">
        <button id="ulProcess" class="btn">Process</button>
        <label><input type="checkbox" id="ulAir"> Allow replacing air</label>
        <span id="ulStatus"></span>
    </div>

    <div class="ul-workspace">
        <div class="panel">
            <div class="panel-header">Result</div>
            <div class="panel-body">
                <table><tbody id="ulStats">
                    <tr><td colspan="2" style="opacity:.6">Nothing yet</td></tr>
                </tbody></table>
                <div id="ulWarnings"></div>
            </div>
        </div>
        <div class="panel">
            <div class="panel-header">Preview</div>
            <div class="panel-body">
                <canvas id="ulCanvas" width="1" height="1"></canvas>
                <div class="ul-legend" id="ulLegend"></div>
            </div>
        </div>
    </div>

    <div class="panel">
        <div class="panel-header">
            Output
            <button id="ulCopy" class="btn">Copy</button>
        </div>
        <div class="panel-body">
            <textarea id="ulOutput" readonly placeholder="Output blueprint shows up here"></textarea>
        </div>
    </div>
</div>

<script type="module">
    import * as lib from "https://cdn.jsdelivr.net/npm/dsabp-js@latest/dist/browser/esm/index.js";
    const { decode, encode } = lib;

    // ===== unshrinkable core (shared by page + tests) =====
    const REPLACEABLE_IDS = new Set([232, 233, 234]); // iron, hyper rubber, hyper ice
    const NAV_ID = 261;
    const PUNCH_ID = 154;

    function isPlainBlockShape(shape) {
        return shape == null || shape.enumValue === 0;
    }

    function placements(cmd) {
        // [offset, x] pairs for every object a build command places
        if (!cmd.bits || cmd.bits.int === undefined) return [[-1, cmd.x]];
        const out = [];
        let n = cmd.bits.int, i = 0;
        while (n > 0n) {
            if (n & 1n) out.push([i, cmd.x + i]);
            n >>= 1n; i++;
        }
        return out;
    }

    function analyze(bp, lib, { allowAir = false } = {}) {
        const { BuildCmd } = lib;
        const W = bp.width, H = bp.height;
        const K = (x, y) => (y + 4) * 512 + (x + 4);
        const blockAt = new Map();   // cell -> [{ idx, off, cand }]
        const blocked = new Set();   // cells used by objects (or their supports)
        const navs = [];
        const rowsWithBlocks = new Set(), colsWithBlocks = new Set();
        const warnings = [];

        const mark = (x, y) => blocked.add(K(x, y));

        bp.commands.forEach((cmd, idx) => {
            if (!(cmd instanceof BuildCmd)) return;
            const item = cmd.item;
            const id = item?.id ?? 0;
            if (id === 0) return; // air / nothing
            for (const [off, px] of placements(cmd)) {
                const py = cmd.y;
                if (item.isBlock) {
                    const x = Math.round(px), y = Math.round(py);
                    const k = K(x, y);
                    if (!blockAt.has(k)) blockAt.set(k, []);
                    blockAt.get(k).push({ idx, off, cand: REPLACEABLE_IDS.has(id) && isPlainBlockShape(cmd.shape) });
                    rowsWithBlocks.add(y); colsWithBlocks.add(x);
                    continue;
                }
                if (id === NAV_ID) navs.push({ x: Math.round(px), y: Math.round(py) });
                const infos = item.buildInfo;
                if (infos?.some(b => b.block_is_colored)) continue; // paint is background
                if (!infos) { mark(Math.round(px), Math.round(py)); continue; }
                // footprint: union of all build variants (we can't tell orientation)
                for (const b of infos) {
                    const hx = (b.bounds?.x ?? 1) / 2, hy = (b.bounds?.y ?? 1) / 2;
                    for (let x = Math.floor(px - hx - 1); x <= Math.ceil(px + hx + 1); x++)
                        for (let y = Math.floor(py - hy - 1); y <= Math.ceil(py + hy + 1); y++)
                            if (Math.abs(x - px) < 0.5 + hx - 1e-6 && Math.abs(y - py) < 0.5 + hy - 1e-6) mark(x, y);
                    for (const rb of b.require_blocks || []) {
                        mark(Math.round(px + rb.x), Math.round(py + rb.y));
                        if (b.offset) mark(Math.round(px - b.offset.x + rb.x), Math.round(py - b.offset.y + rb.y));
                    }
                }
            }
        });

        if (navs.length > 1) warnings.push(`Found ${navs.length} navigation units, only the first one is counted.`);
        const nav = navs[0] || null;
        const navKey = nav ? K(nav.x, nav.y) : null;

        const candidates = [];
        for (const [k, entries] of blockAt) {
            if (!entries.every(e => e.cand) || blocked.has(k) || k === navKey) continue;
            const x = (k % 512) - 4, y = Math.floor(k / 512) - 4;
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            candidates.push({ x, y, air: false });
        }
        if (allowAir) {
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                const k = K(x, y);
                if (blockAt.has(k) || blocked.has(k) || k === navKey) continue;
                candidates.push({ x, y, air: true });
            }
        }

        const inside = (v, max) => v >= 0 && v < max;
        let rows = [...rowsWithBlocks].filter(v => inside(v, H)).sort((a, b) => a - b);
        let cols = [...colsWithBlocks].filter(v => inside(v, W)).sort((a, b) => a - b);
        if (nav) {
            rows = rows.filter(r => Math.abs(r - nav.y) > 1);
            cols = cols.filter(c => Math.abs(c - nav.x) > 1);
        }

        return { W, H, K, blockAt, blocked, nav, candidates, rows, cols, warnings,
            allRows: [...rowsWithBlocks].sort((a, b) => a - b), allCols: [...colsWithBlocks].sort((a, b) => a - b) };
    }

    // 1D: fewest centres (from `allowed`) so every required value is within 1 of a centre. Greedy is optimal.
    function cover1D(req, allowed, rnd) {
        const out = [];
        let coveredTo = -Infinity;
        for (const r of req) {
            if (r <= coveredTo) continue;
            let opts = [r + 1, r, r - 1].filter(c => allowed.has(c));
            if (!opts.length) return null;
            const c = rnd && opts.length > 1 && rnd() < 0.25 ? opts[1 + Math.floor(rnd() * (opts.length - 1))] : opts[0];
            out.push(c);
            coveredTo = c + 1;
        }
        return out;
    }

    /**
     * Min number of cells such that every required row and column is within 1 of a chosen cell.
     * Search space: a row-centre set Y and column-centre set X. For fixed (Y, X) the cheapest point set is a
     * minimum edge cover of the bipartite graph Y-X (edges = candidate cells), i.e. |Y| + |X| - maxMatching.
     * Annealing over (Y, X); stops early once the 1D lower bound is hit (= provably optimal).
     */
    class Solver {
        constructor(rows, cols, cells, seed = 12345) {
            this.rows = rows; this.cols = cols;
            let s = seed >>> 0;
            this.rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
            this.rowCells = new Map(); this.colCells = new Map(); this.cellAir = new Map();
            for (const c of cells) {
                if (!this.rowCells.has(c.y)) this.rowCells.set(c.y, []);
                if (!this.colCells.has(c.x)) this.colCells.set(c.x, []);
                this.rowCells.get(c.y).push(c.x);
                this.colCells.get(c.x).push(c.y);
                this.cellAir.set(c.y * 512 + c.x, c.air);
            }
            // prefer real blocks over air when picking edges
            for (const [y, xs] of this.rowCells) xs.sort((a, b) => this.cellAir.get(y * 512 + a) - this.cellAir.get(y * 512 + b));
            for (const [x, ys] of this.colCells) ys.sort((a, b) => this.cellAir.get(a * 512 + x) - this.cellAir.get(b * 512 + x));
            this.allowY = new Set(this.rowCells.keys());
            this.allowX = new Set(this.colCells.keys());
            this.allowYArr = [...this.allowY]; this.allowXArr = [...this.allowX];
            this.badRows = rows.filter(r => ![r - 1, r, r + 1].some(c => this.allowY.has(c)));
            this.badCols = cols.filter(r => ![r - 1, r, r + 1].some(c => this.allowX.has(c)));
            this.feasible = !this.badRows.length && !this.badCols.length;
            if (!this.feasible) return;

            const y0 = cover1D(rows, this.allowY), x0 = cover1D(cols, this.allowX);
            this.lowerBound = Math.max(y0.length, x0.length);
            this.reqRow = new Set(rows); this.reqCol = new Set(cols);
            this.setState(y0, x0);
            this.best = { cost: this.cost, Y: [...this.Y], X: [...this.X] };
            this.iter = 0; this.sinceBest = 0;
        }

        setState(Y, X) {
            this.Y = [...Y]; this.X = [...X];
            this.cntR = new Map(); this.cntC = new Map();
            for (const y of Y) this.bump(this.cntR, y, 1);
            for (const x of X) this.bump(this.cntC, x, 1);
            this.cost = this.evaluate();
        }
        bump(cnt, c, d) { for (let v = c - 1; v <= c + 1; v++) cnt.set(v, (cnt.get(v) || 0) + d); }
        okAround(cnt, req, c) { for (let v = c - 1; v <= c + 1; v++) if (req.has(v) && !(cnt.get(v) > 0)) return false; return true; }

        matching() {
            const inX = new Set(this.X);
            const matchX = new Map(); // x -> y
            const tryY = (y, seen) => {
                for (const x of this.rowCells.get(y)) {
                    if (!inX.has(x) || seen.has(x)) continue;
                    seen.add(x);
                    if (!matchX.has(x) || tryY(matchX.get(x), seen)) { matchX.set(x, y); return true; }
                }
                return false;
            };
            let m = 0;
            for (const y of this.Y) if (tryY(y, new Set())) m++;
            return { m, matchX };
        }
        evaluate() { return this.Y.length + this.X.length - this.matching().m; }

        // one random move; returns true if accepted
        step(T) {
            const r = this.rnd();
            const side = this.rnd() < this.Y.length / (this.Y.length + this.X.length || 1) ? 0 : 1;
            const S = side ? this.X : this.Y, cnt = side ? this.cntC : this.cntR, req = side ? this.reqCol : this.reqRow;
            const allowArr = side ? this.allowXArr : this.allowYArr, allow = side ? this.allowX : this.allowY;
            if (!S.length) return false;
            const i = Math.floor(this.rnd() * S.length), c = S[i];
            let nc = null, kind;
            if (r < 0.6) { // shift nearby
                const d = (1 + Math.floor(this.rnd() * 3)) * (this.rnd() < 0.5 ? -1 : 1);
                nc = c + d; kind = 'move';
            } else if (r < 0.8) { // jump anywhere
                nc = allowArr[Math.floor(this.rnd() * allowArr.length)]; kind = 'move';
            } else if (r < 0.93) {
                kind = 'remove';
            } else {
                nc = allowArr[Math.floor(this.rnd() * allowArr.length)]; kind = 'add';
            }
            if (nc !== null && (!allow.has(nc) || S.includes(nc))) return false;

            if (kind !== 'add') this.bump(cnt, c, -1);
            if (nc !== null) this.bump(cnt, nc, 1);
            const valid = kind === 'add' || this.okAround(cnt, req, c);
            if (!valid) { if (nc !== null) this.bump(cnt, nc, -1); this.bump(cnt, c, 1); return false; }

            const old = [...S];
            if (kind === 'move') S[i] = nc; else if (kind === 'remove') S.splice(i, 1); else S.push(nc);
            const newCost = this.evaluate();
            const delta = newCost - this.cost;
            if (delta <= 0 || this.rnd() < Math.exp(-delta / T)) { this.cost = newCost; return true; }
            // revert
            S.length = 0; S.push(...old);
            if (nc !== null) this.bump(cnt, nc, -1);
            if (kind !== 'add') this.bump(cnt, c, 1);
            return false;
        }

        // Lagrangian relaxation of the covering LP (subgradient). Any multipliers give a valid lower bound.
        improveBound(iters = 3000) {
            if (!this.feasible || this.done) return;
            const rIdx = new Map(this.rows.map((r, i) => [r, i]));
            const cIdx = new Map(this.cols.map((c, i) => [c, this.rows.length + i]));
            const m = this.rows.length + this.cols.length;
            const sets = [];
            for (const [y, xs] of this.rowCells) for (const x of xs) {
                const s = [];
                for (let v = y - 1; v <= y + 1; v++) if (rIdx.has(v)) s.push(rIdx.get(v));
                for (let v = x - 1; v <= x + 1; v++) if (cIdx.has(v)) s.push(cIdx.get(v));
                if (s.length) sets.push(s);
            }
            const lam = new Float64Array(m).fill(1 / 3);
            const g = new Float64Array(m);
            let mu = 2, bestL = -Infinity, stall = 0;
            const UB = this.best.cost;
            for (let it = 0; it < iters; it++) {
                let L = 0;
                for (let i = 0; i < m; i++) { L += lam[i]; g[i] = 1; }
                for (const s of sets) {
                    let rc = 1;
                    for (const i of s) rc -= lam[i];
                    if (rc < 0) { L += rc; for (const i of s) g[i] -= 1; }
                }
                if (L > bestL + 1e-9) { bestL = L; stall = 0; } else if (++stall > 40) { mu /= 2; stall = 0; }
                if (Math.ceil(bestL - 1e-6) >= UB || mu < 1e-5) break;
                let norm = 0;
                for (let i = 0; i < m; i++) norm += g[i] * g[i];
                if (!norm) break; // LP optimum reached
                const step = mu * (UB - L) / norm;
                for (let i = 0; i < m; i++) lam[i] = Math.max(0, lam[i] + step * g[i]);
            }
            this.lowerBound = Math.max(this.lowerBound, Math.ceil(bestL - 1e-6));
        }

        get done() { return !this.feasible || this.best.cost <= this.lowerBound; }

        run(ms) {
            if (this.done) return;
            const end = performance.now() + ms;
            while (performance.now() < end && !this.done) {
                for (let k = 0; k < 200; k++) {
                    this.iter++; this.sinceBest++;
                    const T = 0.15 + 0.6 * Math.exp(-this.sinceBest / 3000);
                    this.step(T);
                    if (this.cost < this.best.cost) {
                        this.best = { cost: this.cost, Y: [...this.Y], X: [...this.X] };
                        this.sinceBest = 0;
                        if (this.done) return;
                    }
                    if (this.sinceBest > 20000) { // restart: from best or a randomised greedy start
                        if (this.rnd() < 0.5) this.setState(this.best.Y, this.best.X);
                        else this.setState(cover1D(this.rows, this.allowY, this.rnd), cover1D(this.cols, this.allowX, this.rnd));
                        this.sinceBest = 0;
                    }
                }
            }
        }

        // turn best (Y, X) into concrete cells
        points() {
            if (!this.feasible) return null;
            const saveY = this.Y, saveX = this.X;
            this.Y = this.best.Y; this.X = this.best.X;
            const { matchX } = this.matching();
            this.Y = saveY; this.X = saveX;
            const pts = new Map();
            const add = (x, y) => pts.set(y * 512 + x, { x, y, air: this.cellAir.get(y * 512 + x) });
            const usedY = new Set(), usedX = new Set();
            for (const [x, y] of matchX) { add(x, y); usedY.add(y); usedX.add(x); }
            for (const y of this.best.Y) if (!usedY.has(y)) add(this.rowCells.get(y)[0], y);
            for (const x of this.best.X) if (!usedX.has(x)) add(x, this.colCells.get(x)[0]);
            return [...pts.values()];
        }
    }

    function verify(rows, cols, pts) {
        const okR = rows.every(r => pts.some(p => Math.abs(p.y - r) <= 1));
        const okC = cols.every(c => pts.some(p => Math.abs(p.x - c) <= 1));
        return okR && okC;
    }

    function buildOutput(bp, analysis, pts, lib) {
        const { BuildCmd, BuildBits, Item } = lib;
        const out = bp.clone();
        const del = new Set(), touched = new Set();
        for (const p of pts) {
            if (p.air) continue;
            for (const e of analysis.blockAt.get(analysis.K(p.x, p.y)) || []) {
                if (e.off < 0) del.add(e.idx);
                else { out.commands[e.idx].bits.clear(e.off); touched.add(e.idx); }
            }
        }
        for (const idx of touched) {
            const cmd = out.commands[idx];
            if (cmd.bits.isZero()) { del.add(idx); continue; }
            let tz = 0;
            while (!((cmd.bits.int >> BigInt(tz)) & 1n)) tz++;
            if (tz) { cmd.x += tz; cmd.bits.int >>= BigInt(tz); }
            if (cmd.bits.int === 1n && isPlainBlockShape(cmd.shape)) cmd.bits = undefined;
        }
        out.commands = out.commands.filter((_, i) => !del.has(i));

        // punch ammo placeholders, packed per row with bits
        const byRow = new Map();
        for (const p of pts) { if (!byRow.has(p.y)) byRow.set(p.y, []); byRow.get(p.y).push(p.x); }
        for (const [y, xs] of [...byRow].sort((a, b) => a[0] - b[0])) {
            xs.sort((a, b) => a - b);
            let i = 0;
            while (i < xs.length) {
                const x0 = xs[i];
                let n = 0n;
                while (i < xs.length && xs[i] - x0 < 64) { n |= 1n << BigInt(xs[i] - x0); i++; }
                out.commands.push(new BuildCmd({ x: x0, y, item: Item.getById(PUNCH_ID), bits: n === 1n ? undefined : new BuildBits(n) }));
            }
        }
        return out;
    }
    // ===== end core =====

    const $ = id => document.getElementById(id);
    const input = $('ulInput'), output = $('ulOutput'), btn = $('ulProcess'), airBox = $('ulAir');
    const statusEl = $('ulStatus'), statsEl = $('ulStats'), warnEl = $('ulWarnings');
    const canvas = $('ulCanvas'), legendEl = $('ulLegend');
    const SEARCH_MS = 6000;

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const nextFrame = () => new Promise(r => setTimeout(r, 0));

    function setStats(rows) {
        statsEl.innerHTML = rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
    }
    function setWarnings(list) {
        warnEl.innerHTML = list.map(w => `<p class="ul-warn">${esc(w)}</p>`).join('');
    }
    function ranges(list) {
        if (!list.length) return 'none';
        const out = []; let a = list[0], b = list[0];
        for (const v of list.slice(1)) { if (v === b + 1) b = v; else { out.push(a === b ? `${a}` : `${a}–${b}`); a = b = v; } }
        out.push(a === b ? `${a}` : `${a}–${b}`);
        return out.join(', ');
    }

    btn.addEventListener('click', run);
    $('ulCopy').addEventListener('click', async () => {
        if (!output.value) return;
        try { await navigator.clipboard.writeText(output.value); } catch { output.select(); document.execCommand('copy'); }
        $('ulCopy').textContent = 'Copied';
        setTimeout(() => $('ulCopy').textContent = 'Copy', 1200);
    });

    async function run() {
        const val = input.value.trim();
        output.value = '';
        setWarnings([]);
        if (!/^DSA:/i.test(val)) { statusEl.textContent = 'That doesn\'t look like a DSA blueprint.'; return; }
        btn.disabled = true;
        try {
            statusEl.textContent = 'Decoding...';
            const bp = await decode(val);
            const a = analyze(bp, lib, { allowAir: airBox.checked });
            const warnings = [...a.warnings];
            if (!a.nav) warnings.push('No navigation unit found, so everything is covered by lockdowns.');

            const solver = new Solver(a.rows, a.cols, a.candidates);
            if (!solver.feasible) {
                const parts = [];
                if (solver.badRows.length) parts.push(`rows ${ranges(solver.badRows)}`);
                if (solver.badCols.length) parts.push(`columns ${ranges(solver.badCols)}`);
                warnings.push(`Not possible: no replaceable cell within 1 tile of ${parts.join(' and ')} (counted from the bottom left, starting at 0).` +
                    (airBox.checked ? '' : ' Try allowing air.'));
                setStats([['Lockdowns needed', '<span class="ul-big">–</span>']]);
                setWarnings(warnings);
                draw(a, [], solver);
                statusEl.textContent = '';
                return;
            }

            const start = performance.now();
            solver.improveBound();
            let lastBound = start;
            while (!solver.done && performance.now() - start < SEARCH_MS) {
                solver.run(60);
                if (performance.now() - lastBound > 1000) { solver.improveBound(1500); lastBound = performance.now(); }
                statusEl.textContent = `Searching... best ${solver.best.cost}, can't go below ${solver.lowerBound}`;
                await nextFrame();
            }
            solver.improveBound(6000);

            const pts = solver.points();
            if (!verify(a.rows, a.cols, pts)) throw new Error('internal check failed, result does not cover everything');
            const out = buildOutput(bp, a, pts, lib);
            const buildCount = out.commands.filter(c => c instanceof lib.BuildCmd).length;
            if (buildCount > 1000) warnings.push(`Output has ${buildCount} build commands, the game only accepts 1000.`);
            output.value = 'DSA:' + await encode(out);
            if (output.value.length > 10000) warnings.push('Output is probably too long for the game.');

            const optimal = pts.length <= solver.lowerBound;
            const airUsed = pts.filter(p => p.air).length;
            setStats([
                ['Lockdowns needed', `<span class="ul-big">${pts.length}</span>` + (a.nav ? ' + navigator' : '')],
                ['Best possible', optimal ? 'yes, this is the minimum' : `maybe, minimum is somewhere ${solver.lowerBound}–${pts.length}`],
                ['Navigator', a.nav ? `at ${a.nav.x}, ${a.nav.y}` : 'not found'],
                ['Rows to protect', `${a.allRows.length}`],
                ['Columns to protect', `${a.allCols.length}`],
                ['Replaceable cells', `${a.candidates.length}`],
                ...(airUsed ? [['Placed in air', `${airUsed}`]] : []),
            ]);
            setWarnings(warnings);
            draw(a, pts, solver);
            statusEl.textContent = `Done in ${((performance.now() - start) / 1000).toFixed(1)}s`;
        } catch (e) {
            console.error(e);
            statusEl.textContent = 'Error: ' + (e?.message || e);
        } finally {
            btn.disabled = false;
        }
    }

    function draw(a, pts, solver) {
        const css = getComputedStyle(document.documentElement);
        const v = (name, fb) => css.getPropertyValue(name).trim() || fb;
        const col = {
            bg: v('--bg', '#ffffff'),
            text: v('--text', '#222222'),
            accent: v('--accent', '#d35400'),
            accentLight: v('--accent-light', '#f6d5bf'),
            block: '#9aa3ab',
            other: '#5d6670',
            nav: '#27ae60',
            bad: '#c0392b',
        };
        const { W, H } = a;
        const s = Math.max(4, Math.min(16, Math.floor(720 / Math.max(W, H))));
        canvas.width = W * s; canvas.height = H * s;
        const ctx = canvas.getContext('2d');
        const px = x => x * s, py = y => (H - 1 - y) * s; // y=0 is the bottom row
        ctx.fillStyle = col.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // protected areas
        ctx.fillStyle = col.accentLight;
        const guards = [...pts]; if (a.nav) guards.push(a.nav);
        for (const p of guards) ctx.fillRect(px(p.x - 1), py(p.y + 1), 3 * s, 3 * s);

        const candSet = new Set(a.candidates.filter(c => !c.air).map(c => a.K(c.x, c.y)));
        for (const [k] of a.blockAt) {
            const x = (k % 512) - 4, y = Math.floor(k / 512) - 4;
            ctx.fillStyle = candSet.has(k) ? col.block : col.other;
            ctx.fillRect(px(x) + 1, py(y) + 1, s - 2, s - 2);
        }
        // rows / columns that can't be covered
        if (solver && !solver.feasible) {
            ctx.fillStyle = col.bad; ctx.globalAlpha = 0.35;
            for (const r of solver.badRows) ctx.fillRect(0, py(r), canvas.width, s);
            for (const c of solver.badCols) ctx.fillRect(px(c), 0, s, canvas.height);
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = col.accent;
        for (const p of pts) ctx.fillRect(px(p.x), py(p.y), s, s);
        if (a.nav) { ctx.fillStyle = col.nav; ctx.fillRect(px(a.nav.x), py(a.nav.y), s, s); }

        legendEl.innerHTML = [
            [col.accent, 'Lockdown (punch ammo)'],
            [col.nav, 'Navigator'],
            [col.accentLight, 'Protected 3x3'],
            [col.block, 'Replaceable block'],
            [col.other, 'Other block'],
        ].map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join('');
    }
</script>
