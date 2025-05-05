// ==UserScript==
// @name         afk
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  this script is the most sigma
// @author       skid
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

// How to use:
// Install this script with the TAMPERMONKEY extension
// (Create a new script, copy paste the ENTIRE thing into there)
// Replace my usernames (Dutchman) with your main username(s) (line 71)
// Reload your drednot.io page
// type !afk [message] to go AFK - it will repeat the message every 4.5 minutes.

(function() {
    'use strict';

    const chatBox = document.getElementById("chat");
    const chatInp = document.getElementById("chat-input");
    const chatBtn = document.getElementById("chat-send");
    const chatContent = document.querySelector("#chat-content");
    let scriptEnabled = true;
    let afkActive = false;
    let afkInterval = null;

    function sendChat(mess) {
        if (chatBox.classList.contains('closed')) chatBtn.click();
        chatInp.value = mess;
        chatBtn.click();
    }

    function startAFK(message) {
        stopAFK();
        let afkMessage = message || "im afk omg";
        afkInterval = setInterval(() => sendChat(afkMessage), 270000); // 4.5 minutes 270000
        sendChat(afkMessage);
    }

    function stopAFK() {
        if (afkInterval) {
            clearInterval(afkInterval);
            afkInterval = null;
        }
    }

    function observeNode(node, callback) {
        new MutationObserver(callback).observe(node, { childList: true });
    }

    observeNode(chatContent, () => {
        const mess = document.querySelector("#chat-content > p:last-of-type");

        if (!mess) return;

        mess.querySelectorAll(".user-badge-small").forEach(badge => badge.remove());

        const rankElement = mess.querySelector("span");
        const usernameElement = mess.querySelector("bdi");
        const messageText = mess.childNodes[mess.childNodes.length - 1].textContent.trim();

        const rank = rankElement ? rankElement.textContent.replace(/[\[\]]/g, '') : "Guest";
        const username = usernameElement ? usernameElement.textContent : "Unknown";
        const message = messageText || "";
        const messageNoCase = message.toLowerCase();


        // Admin commands
        if (username === 'Dutchman') {
            if (messageNoCase.startsWith('!afk')) {
                if(afkActive) {
                    afkActive = false;
                    stopAFK();
                    return;
                }
                afkActive = true;
                let customMessage = messageText.substring(5).trim();
                startAFK(customMessage);
            }

        }
    });
})();
