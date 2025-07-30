// ==UserScript==
// @name         Stop you from saying bad words!!!!
// @namespace    http://tampermonkey.net/
// @version      1.7
// @author       chatgpt, whooped together by iogamesplayer.
// @description  ChatGPT did all of this in like 10 minutes
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

// "I" made this so that I don't get banned for saying stupid shit like I often say.
// Feel free to share around. I don't really care.

(function () {
    'use strict';

    // --- Custom Popup System ---
    function createPopup(message, duration = 3000) {
        // Remove existing popup if present
        const existingPopup = document.querySelector('.custom-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create new popup
        const popupContainer = document.createElement('div');
        popupContainer.className = 'custom-popup';
        popupContainer.textContent = message;
        popupContainer.style.position = 'fixed';
        popupContainer.style.top = '20px';
        popupContainer.style.left = '50%';
        popupContainer.style.transform = 'translateX(-50%) translateY(-20px)';
        popupContainer.style.padding = '10px 15px';
        popupContainer.style.background = '#19232d';
        popupContainer.style.border = '1px solid #fff';
        popupContainer.style.borderRadius = '4px';
        popupContainer.style.color = 'white';
        popupContainer.style.fontFamily = '"Courier New", monospace';
        popupContainer.style.fontSize = '14px';
        popupContainer.style.zIndex = '9999';
        popupContainer.style.opacity = '0';
        popupContainer.style.transition = 'opacity 0.3s, transform 0.3s';
        popupContainer.style.maxWidth = '80%';
        popupContainer.style.textAlign = 'center';
        popupContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        popupContainer.style.wordBreak = 'break-word';

        document.body.appendChild(popupContainer);

        // Animate in
        setTimeout(() => {
            popupContainer.style.opacity = '1';
            popupContainer.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                popupContainer.style.opacity = '0';
                popupContainer.style.transform = 'translateX(-50%) translateY(-20px)';
                setTimeout(() => popupContainer.remove(), 300);
            }, duration);
        }

        return popupContainer;
    }

    // --- Storage Helpers ---
    function loadPresets() {
        try {
            const saved = localStorage.getItem('wordPresets');
            return saved ? JSON.parse(saved) : {
                Preset1: ['gay', 'jihad', 'muslim', 'fucke', 'cum', 'just came', 'dyke', 'spic', 'bastard', 'molest', 'cksuck', 'terrorist', 'kid', 'im gonna come', 'trans', 'pussy', 'bitch', 'cunt', 'chink', 'slut', 'tits', 'boob', 'tranny', 'whip', 'slave', 'whore', 'puss', 'dick', 'niga', 'nigg', 'ass', 'queer', 'fag', 'fuck', 'suck my', 'penis', 'ape', 'monkey', 'negr', 'homo', 'rape', 'sex', '🤣', '😂', 'nudes', 'n1gg', 'nazi', 'tard', 'idiot', 'dumbass', 'crying', 'dog'],
                Preset2: ['Go add your own stuff here']
            };
        } catch (e) {
            console.error('Failed to load presets:', e);
        }
    }

    function savePresets(presets) {
        localStorage.setItem('wordPresets', JSON.stringify(presets));
    }

    function getSelectedPreset() {
        return localStorage.getItem('selectedPreset') || 'Preset1';
    }

    function setSelectedPreset(name) {
        localStorage.setItem('selectedPreset', name);
    }

    function getBlockerEnabled() {
        const enabled = localStorage.getItem('blockerEnabled');
        return enabled === null ? true : enabled === 'true';
    }

    function setBlockerEnabled(value) {
        localStorage.setItem('blockerEnabled', value.toString());
    }

    // --- Word Processing ---
    function sanitizeWord(word) {
        return word.trim().toLowerCase();
    }

    function getMatchedWords(msg) {
        const lower = msg.toLowerCase();
        const words = loadPresets()[getSelectedPreset()] || [];
        return words.filter(w => w && lower.includes(w.toLowerCase()));
    }

    // --- Block Logic ---
    function interceptChat() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');
        if (!input || !sendBtn) return;

        sendBtn.addEventListener('click', (e) => {
            if (!getBlockerEnabled()) return;
            const matched = getMatchedWords(input.value);
            if (matched.length > 0) {
                e.stopImmediatePropagation();
                e.preventDefault();
                createPopup(`Message blocked! Contains: ${matched.join(', ')}\n\nPress SHIFT+ENTER to send anyway`, 5000);
            }
        }, true);

        input.addEventListener('keydown', (e) => {
            if (!getBlockerEnabled()) return;
            if (e.key === 'Enter') {
                const bypass = e.shiftKey;
                if (!bypass) {
                    const matched = getMatchedWords(input.value);
                    if (matched.length > 0) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        createPopup(`Message blocked! Contains: ${matched.join(', ')}\n\nPress SHIFT+ENTER to send anyway`, 5000);
                    }
                }
            }
        }, true);
    }

    // --- UI ---
    function createBlockerUI() {
        if (document.getElementById('block-ui-container')) return;
        const settingsSection = document.querySelector('#new-ui-left section');
        if (!settingsSection) return;

        const container = document.createElement('div');
        container.id = 'block-ui-container';
        container.style.border = '1px solid #fff';
        container.style.padding = '10px';
        container.style.margin = '10px 0';
        container.style.background = '#19232d';

        container.innerHTML = `
            <h3 style="margin-bottom:8px;">Blocked Words</h3>
            <label style="display:flex; align-items:center; gap:5px; margin-bottom:6px;">
                <input type="checkbox" id="block-toggle" />
                Enable blocking
            </label>
            <div style="display:flex; gap:4px; margin-bottom:6px;">
                <select id="preset-select" style="flex:1;"></select>
                <button id="preset-new" class="btn-small">New</button>
                <button id="preset-delete" class="btn-red btn-small">Del</button>
            </div>
            <input type="text" id="block-search" placeholder="Search..." style="width:100%; margin-bottom:6px; padding:4px;" />
            <div id="block-list-container" style="max-height:200px; overflow:auto; margin-bottom:6px; border:1px solid #444; padding:4px;"></div>
            <div style="display:flex; gap:4px;">
                <input type="text" id="block-input" placeholder="Word to block" style="flex:1; padding:4px;" />
                <button id="block-add-btn" class="btn-green btn-small">Add</button>
            </div>
            <div style="display:flex; gap:4px; margin-top:6px;">
                <button id="export-preset" class="btn-small">Export</button>
                <button id="import-preset" class="btn-small">Import</button>
            </div>
            <div style="margin-top:8px; font-size:12px; color:#aaa;">
                Tip: Press SHIFT+ENTER to bypass blocking
            </div>
        `;

        settingsSection.parentNode.insertBefore(container, settingsSection.nextSibling);

        const toggle = container.querySelector('#block-toggle');
        toggle.checked = getBlockerEnabled();
        toggle.addEventListener('change', () => {
            const isEnabled = toggle.checked;
            setBlockerEnabled(isEnabled);
            createPopup(`Word blocking ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
        });

        const presetSelect = container.querySelector('#preset-select');
        const searchInput = container.querySelector('#block-search');

        // --- Preset Logic ---
        function updatePresetDropdown() {
            const presets = loadPresets();
            const selected = getSelectedPreset();
            presetSelect.innerHTML = Object.keys(presets).map(name =>
                                                              `<option value="${name}" ${name === selected ? 'selected' : ''}>${name}</option>`
                                                             ).join('');
        }

        presetSelect.addEventListener('change', () => {
            setSelectedPreset(presetSelect.value);
            updateBlockList();
            createPopup(`Preset "${presetSelect.value}" loaded`);
        });

        container.querySelector('#preset-new').addEventListener('click', () => {
            const name = prompt("Preset name?");
            if (!name) return;
            const presets = loadPresets();
            if (presets[name]) {
                createPopup('Preset already exists!');
                return;
            }
            presets[name] = [];
            savePresets(presets);
            setSelectedPreset(name);
            updatePresetDropdown();
            updateBlockList();
            createPopup(`Preset "${name}" created`);
        });

        container.querySelector('#preset-delete').addEventListener('click', () => {
            const presets = loadPresets();
            const name = getSelectedPreset();
            if (!presets[name]) return;
            if (!confirm(`Delete preset "${name}"?`)) return;
            delete presets[name];
            savePresets(presets);
            setSelectedPreset(Object.keys(presets)[0] || '');
            updatePresetDropdown();
            updateBlockList();
            createPopup(`Preset "${name}" deleted`);
        });

        // --- Word Management ---
        container.querySelector('#block-add-btn').addEventListener('click', () => {
            const input = container.querySelector('#block-input');
            const word = sanitizeWord(input.value);
            if (!word) return;
            const presets = loadPresets();
            const preset = getSelectedPreset();
            if (!presets[preset].includes(word)) {
                presets[preset].push(word);
                savePresets(presets);
                createPopup(`"${word}" added to block list`);
            } else {
                createPopup(`"${word}" is already blocked`);
            }
            input.value = '';
            updateBlockList();
        });

        // --- Export/Import ---
        container.querySelector('#export-preset').addEventListener('click', () => {
            const presets = loadPresets();
            navigator.clipboard.writeText(JSON.stringify(presets, null, 2))
                .then(() => createPopup('Presets copied to clipboard!'))
                .catch(() => createPopup('Failed to copy to clipboard'));
        });

        container.querySelector('#import-preset').addEventListener('click', () => {
            const input = prompt('Paste preset JSON:');
            if (!input) return;
            try {
                const parsed = JSON.parse(input);
                savePresets(parsed);
                updatePresetDropdown();
                updateBlockList();
                createPopup('Presets imported successfully!');
            } catch (e) {
                createPopup('Invalid JSON format!');
            }
        });

        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(updateBlockList, 300);
        });

        function updateBlockList() {
            const listContainer = document.getElementById('block-list-container');
            const search = searchInput.value.toLowerCase();
            const preset = getSelectedPreset();
            const words = (loadPresets()[preset] || []).filter(w => w.toLowerCase().includes(search));

            listContainer.innerHTML = words.length === 0
                ? '<em>No blocked words</em>'
            : words.map(word => `
                    <div style="display:flex; justify-content:space-between; margin:2px 0;">
                        <span>${word}</span>
                        <button class="btn-red btn-small" data-word="${word}">Remove</button>
                    </div>`).join('');

            listContainer.querySelectorAll('button[data-word]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const word = btn.dataset.word;
                    const presets = loadPresets();
                    const preset = getSelectedPreset();
                    presets[preset] = presets[preset].filter(w => w !== word);
                    savePresets(presets);
                    updateBlockList();
                    createPopup(`"${word}" removed from block list`);
                });
            });
        }

        updatePresetDropdown();
        updateBlockList();
    }

    // --- Init ---
    const observer = new MutationObserver(interceptChat);
    observer.observe(document.body, { childList: true, subtree: true });

    const uiLeft = document.querySelector('#new-ui-left');
    if (uiLeft) {
        new MutationObserver(() => {
            setTimeout(createBlockerUI, 0);
        }).observe(uiLeft, { childList: true, subtree: true });
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            createBlockerUI();
            interceptChat();
        }, 500);
    });
})();
