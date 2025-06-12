// ==UserScript==
// @name         chat filter none option
// @namespace    http://tampermonkey.net/
// @version      1
// @description  spam the n word. ONLY CLIENT SIDE! DOES NOT ALLOW OTHERS TO SEE YOUR SLURS!
// @author       dust man / iogamesplayer
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    const SETTINGS = {
        profanityFilter: 1
    };
    let wsRef = null;
    let lastProcessedMOTD = null;

    function loadSettings() {
        const cookie = document.cookie.match(/drednotHaxxSettings=([^;]+)/);
        if (cookie) try { Object.assign(SETTINGS, JSON.parse(decodeURIComponent(cookie[1]))) } catch {}
    }

    function saveSettings() {
        document.cookie = `drednotHaxxSettings=${encodeURIComponent(JSON.stringify(SETTINGS))}; path=/; max-age=31536000`;
    }

    function addProfanityNoneOption() {
        const section = [...document.querySelectorAll('section')].find(s =>
            s.querySelector('h3')?.textContent.includes('Display / Interface')
        );
        const select = section?.querySelector('select');
        if (!select || select.querySelector('option[value="0"]')) return;

        const noneOption = document.createElement('option');
        noneOption.value = '0';
        noneOption.textContent = 'None';
        select.appendChild(noneOption);
        select.value = SETTINGS.profanityFilter;

        select.onchange = () => {
            SETTINGS.profanityFilter = +select.value;
            saveSettings();
        };
    }

    function isSystemMessage(msg) {
        return / (joined|left|kicked|banned|promoted|demoted|is now a|has been removed) /i.test(msg);
    }

    window.WebSocket = new Proxy(window.WebSocket, {
        construct(target, args) {
            wsRef = new target(...args);
            wsRef.addEventListener('message', e => {
                let data = e.data;
                (data instanceof Blob ? data.arrayBuffer() : Promise.resolve(data))
                .then(buf => {
                    try {
                        const packet = msgpack.decode(new Uint8Array(buf));
                        if (packet.type === 18) {
                            lastProcessedMOTD = packet.text;
                        }
                        if (packet.type === 16) {
                            const raw = packet.bubble?.msg;
                        }
                    } catch {}
                });
            });
            return wsRef;
        }
    });

    loadSettings();
    const observer = new MutationObserver(() => {
        addProfanityNoneOption();
    });

    window.addEventListener('load', () => {
        observer.observe(document.body, { childList: true, subtree: true });
        addProfanityNoneOption();
    });
})();
