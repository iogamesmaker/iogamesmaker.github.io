// ==UserScript==
// @name         Block annoying people no way
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Shut some annoying people up
// @author       Dutchman
// @match        *://*.drednot.io/*
// @grant        none
// ==/UserScript==

// How to use:
// Install this script with the TAMPERMONKEY extension
// (Create a new script, copy paste the ENTIRE thing into there)
// Reload your drednot.io page
// Go into settings
// A new misaligned UI element should appear with "Ignored players"
// WIN!!!!

(function() {
    'use strict';

    function getIgnoredUsers() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('ignoredUsers='));
        return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : [];
    }

    function setIgnoredUsers(users) {
        document.cookie = `ignoredUsers=${encodeURIComponent(JSON.stringify(users))}; path=/; max-age=${60*60*24*365}`;
    }

    function getHideSystemMessages() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('hideSystemMessages='));
        return cookie ? cookie.split('=')[1] === 'true' : false;
    }

    function setHideSystemMessages(value) {
        document.cookie = `hideSystemMessages=${value}; path=/; max-age=${6*60*60*24*365}`;
    }


    function addIgnoredUser(username) {
        const ignored = getIgnoredUsers();
        if (!ignored.includes(username)) {
            ignored.push(username);
            setIgnoredUsers(ignored);
        }
        return ignored;
    }

    function removeIgnoredUser(username) {
        const ignored = getIgnoredUsers().filter(u => u !== username);
        setIgnoredUsers(ignored);
        return ignored;
    }

    function createIgnoreUI() {
        if (document.getElementById('ignore-ui-container')) return;

        const settingsSection = document.querySelector('#new-ui-left section');
        if (!settingsSection) return;

        const container = document.createElement('div');
        container.id = 'ignore-ui-container';
        container.style.border = '1px solid #fff';
        container.style.padding = '10px';
        container.style.margin = '10px 0 10px 0';
        container.style.borderRadius = '0px';
        container.style.background = '#19232d';

        container.innerHTML = `
            <h3 style="margin: 0 0 8px; font-size: 1.1em;">Ignored Players</h3>
            <div id="ignore-list-container" style="margin-bottom: 10px;"></div>
            <input type="text" id="ignore-input" placeholder="Username" style="margin-right: 5px; padding: 4px;" />
            <button id="ignore-add-btn" class="btn-green btn-small">Add</button>
            <br /><br />
            <label style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="ignore-toggle-system-msgs" />
                Hide system messages (join/leave)
            </label>

        `;

        const sysMsgToggle = container.querySelector('#ignore-toggle-system-msgs');
        sysMsgToggle.checked = getHideSystemMessages();
        sysMsgToggle.addEventListener('change', () => {
            setHideSystemMessages(sysMsgToggle.checked);
            hideIgnoredMessages();
        });


        settingsSection.parentNode.insertBefore(container, settingsSection.nextSibling);

        container.querySelector('#ignore-add-btn').addEventListener('click', () => {
            const input = container.querySelector('#ignore-input');
            const username = input.value.trim();
            if (!username) return;
            addIgnoredUser(username);
            input.value = '';
            updateIgnoreList();
            hideIgnoredMessages();
        });

        updateIgnoreList();
    }

    function updateIgnoreList() {
        const listContainer = document.getElementById('ignore-list-container');
        if (!listContainer) return;

        const ignored = getIgnoredUsers();
        if (ignored.length === 0) {
            listContainer.innerHTML = '<em>No ignored players, yippie!</em>';
            return;
        }

        listContainer.innerHTML = ignored.map(username => `
            <div style="display:flex; align-items:center; margin: 2px 0;">
                <span style="flex:1;">${username}</span>
                <button class="btn-red btn-small" data-user="${username}">Remove</button>
            </div>
        `).join('');

        listContainer.querySelectorAll('button[data-user]').forEach(btn => {
            btn.addEventListener('click', () => {
                removeIgnoredUser(btn.dataset.user);
                updateIgnoreList();
                hideIgnoredMessages();
            });
        });
    }

    function hideIgnoredMessages() {
        const hideSystem = getHideSystemMessages();
        const ignored = getIgnoredUsers();
        document.querySelectorAll('#chat-content p').forEach(message => {
            if (!message.textContent.includes(":") && !hideSystem) {
                return;
            }
            const usernameEl = message.querySelector('bdi');
            if (!usernameEl) return;
            const username = usernameEl.textContent;
            message.style.display = ignored.includes(username) ? 'none' : '';
        });
    }

    const chatContainer = document.querySelector('#chat-content');
    if (chatContainer) {
        new MutationObserver(hideIgnoredMessages).observe(chatContainer, { childList: true, subtree: true });
    }

    const uiLeft = document.querySelector('#new-ui-left');
    if (uiLeft) {
        new MutationObserver(() => {
            setTimeout(createIgnoreUI, 0); // increase if it explopde
        }).observe(uiLeft, { childList: true, subtree: true });
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            createIgnoreUI();
            hideIgnoredMessages();
        }, 500);
    });
})();
