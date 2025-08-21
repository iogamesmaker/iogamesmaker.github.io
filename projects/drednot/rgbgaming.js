// ==UserScript==
// @name         rgb gaming mode 1000
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  become THE gamer of 2032
// @match        *://*.drednot.io/*
// @require      https://raw.githubusercontent.com/ygoe/msgpack.js/refs/heads/master/msgpack.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

'use strict';

let isWsReady = false;
let theWs = null;

// Listen for page messages (WebSocket status & send requests)
window.addEventListener('message', event => {
    if (event.origin !== window.location.origin) return;
    const msg = event.data;
    if (msg.message === 'sdt-wsStatus') {
        isWsReady = msg.status;
    } else if (msg.message === 'sdt-sendToWs' && theWs) {
        theWs.send(msg.wsData);
    }
});

// will convert the HSL (bad format i know but it looks good) to HEX
function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];
    if (h < 60)      [r, g, b] = [c, x, 0];
    else if (h < 120)[r, g, b] = [x, c, 0];
    else if (h < 180)[r, g, b] = [0, c, x];
    else if (h < 240)[r, g, b] = [0, x, c];
    else if (h < 300)[r, g, b] = [x, 0, c];
    else             [r, g, b] = [c, 0, x];
    const toHex = n => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// convert the HEX into the final color code sent to dredark
function hexToInt(hex) {
    return parseInt(hex.slice(1), 16);
}

// change the rgb gamer skin
function setInGameOutfit([style, hair, skin, body, legs, feet]) {
    const ilikeyourfitg = {
        style_hair: parseInt(style, 10),
        color_hair: hexToInt(hair),
        color_skin: hexToInt(skin),
        color_body: hexToInt(body),
        color_legs: hexToInt(legs),
        color_feet: hexToInt(feet)
    };
    if (isWsReady) {
        try {
            const wsData = { type: 7, outfit: ilikeyourfitg };
            window.postMessage({ message: 'sdt-sendToWs', wsData: msgpack.encode(wsData) }, window.location.origin);
        } catch (e) {
            console.error('WebSocket send error', e);
        }
    } else {
        try {
            const settings = JSON.parse(localStorage.getItem('dredark_user_settings')) || {};
            settings.player_appearance = ilikeyourfitg;
            localStorage.setItem('dredark_user_settings', JSON.stringify(settings));
        } catch (e) {
            console.error('localStorage error', e);
        }
    }
}

// start the rgb gaming mode
function gamer() {
    let hue = 0;
    setInterval(() => {
        const col = hslToHex(hue, 100, 50);
        setInGameOutfit(['0', col, col, col, col, col]);
        hue = (hue + 1) % 360;
    }, 100);
    console.log('R.G.B. Gaming mode enabled. Become THE alpha male gamer.');
}

// detect if web socket is ready!!!!
(function() {
    const Native = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const socket = protocols ? new Native(url, protocols) : new Native(url);
        if (!socket.url.includes(':4000')) {
            socket.addEventListener('open', () => {
                window.postMessage({ message: 'sdt-wsStatus', status: true }, window.location.origin);
                theWs = socket;
                socket.addEventListener('close', () => window.postMessage({ message: 'sdt-wsStatus', status: false }, window.location.origin));
            });
            window.WebSocket = Native;
        }
        return socket;
    };
})();

gamer();
