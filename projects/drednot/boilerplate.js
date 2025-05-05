// ==UserScript==
// @name         boilerplate
// @namespace    http://tampermonkey.net/
// @version      1
// @description -
// @author       dutchman
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

// How to use:
// Install this script with the TAMPERMONKEY extension
// (Create a new script, copy paste the ENTIRE thing into there)
// Replace my usernames (pablo20, Dutchman, Blackbeard) with your main username(s)
// Reload your drednot.io page and load a ship you are captain on
// Type !test into the chatbox and send the message
// It should replace the MOTD with "test test anjgf adhajanhja\ngjnfkamjnd", and output a message of "pong"
// (little note: the message won't output when you run the command since there's a chat cooldown of 500ms - and you just triggered a message to send.)
// Add your own functions with custom I/O
// WIN!!!

(function() {
    'use strict';

    const chatBox = document.getElementById("chat");
    const chatInp = document.getElementById("chat-input");
    const chatBtn = document.getElementById("chat-send");
    const chatContent = document.querySelector("#chat-content");

    const motdEdit = document.getElementById("motd-edit-button");
    const motdText = document.getElementById("motd-edit-text");
    const motdSavedText = document.getElementById("motd-text");
    const motdSave = document.querySelector("#motd-edit .btn-green");

    function sendChat(mess) {
        if (chatBox.classList.contains('closed')) chatBtn.click();
        chatInp.value = mess;
        chatBtn.click();
    }

    function setMOTD(text) {
        if (motdSavedText.innerText === text) return;
        motdEdit.click();
        motdText.value = text;
        motdSave.click();
    }

    observeNode(chatContent, () => {
        const mess = document.querySelector("#chat-content > p:last-of-type");
        if (!mess) return;
        mess.querySelectorAll(".user-badge-small").forEach(badge => badge.remove());

        const usernameElement = mess.querySelector("bdi");
        const messageText = mess.childNodes[mess.childNodes.length - 1].textContent.trim();
        const username = usernameElement ? usernameElement.textContent : "invalid username";

        if (username === "Dutchman" || username === "Blackbeard" || username === "pablo20") {
            if(messageText == "!test") {
                sendChat("pong")
                setMOTD("test test anjgf adhajanhja\ngjnfkamjnd")
            }
        }
    });

    function observeNode(node, callback) {
        new MutationObserver(callback).observe(node, { childList: true });
    }
})();
