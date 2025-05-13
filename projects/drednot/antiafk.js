// ==UserScript==
// @name         afk
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Prevents AFK by sending messages every 4.5 minutes accurately
// @author       skid
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let user = "Dutchman";

    const chatBox = document.getElementById("chat");
    const chatInp = document.getElementById("chat-input");
    const chatBtn = document.getElementById("chat-send");
    const chatContent = document.querySelector("#chat-content");
    let afkActive = false;
    let afkTimeout = null;

    function sendChat(message) {
        if (chatBox.classList.contains('closed')) chatBtn.click();
        chatInp.value = message;
        chatBtn.click();
    }

    function startAFK(message) {
        stopAFK();
        const afkMessage = message || "im afk omg";
        let nextTime = Date.now();

        const scheduleNext = () => {
            nextTime += 60000; // Schedule next message in 1 minute
            const now = Date.now();
            const delay = Math.max(nextTime - now, 0);
            afkTimeout = setTimeout(() => {
                sendChat(afkMessage);
                scheduleNext();
            }, delay);
        };

        sendChat(afkMessage);
        scheduleNext();
        afkActive = true;
    }

    function stopAFK() {
        if (afkTimeout) {
            clearTimeout(afkTimeout);
            afkTimeout = null;
        }
        afkActive = false;
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
        const messageLower = message.toLowerCase();

        // Admin commands
        if (username === user) { // Replace with your username
            if (messageLower.startsWith('!afk')) {
                if (afkActive) {
                    stopAFK();
                    sendChat("im back baby");
                } else {
                    const customMessage = messageText.substring(5).trim();
                    startAFK(customMessage);
                }
            }
        }
    });
})();
