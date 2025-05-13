(function() {
    'use strict';

    const chatBox = document.getElementById("chat");
    const chatInp = document.getElementById("chat-input");
    const chatBtn = document.getElementById("chat-send");
    const chatContent = document.querySelector("#chat-content");

    let afkTimeout = null;
    let nextSendTime = 0;
    let afkMessage = "afk ping me on discord or sometyhinhg idk"; // Replace with your message, can use !afk [message] as a command to set a custom message without modifying shit.
    const username = "Dutchman"; // Replace with your username

    function sendChat(mess) {
        try {
            if (!chatBox || !chatInp || !chatBtn) return;
            if (chatBox.classList.contains('closed')) chatBtn.click();
            chatInp.value = mess;
            chatBtn.click();
        } catch (e) {
            console.error('AFK Script Error:', e);
        }
    }

    function scheduleAFK() {
        const now = Date.now();
        const timeDrift = now - nextSendTime;

        if (timeDrift > 240000) { 
            sendChat(afkMessage);
            nextSendTime = now + 240000;
        }

        const delay = Math.max(10000, Math.min(240000, nextSendTime - now));

        afkTimeout = setTimeout(() => {
            sendChat(afkMessage);
            nextSendTime = Date.now() + 240000;
            scheduleAFK();
        }, delay);
    }

    function startAFK(message) {
        stopAFK();
        afkMessage = message || "AFK - Please leave a message";
        nextSendTime = Date.now() + 240000; 
        scheduleAFK();
        sendChat("AFK ACTIVATED: " + afkMessage);
    }

    function stopAFK() {
        if (afkTimeout) {
            clearTimeout(afkTimeout);
            afkTimeout = null;
            sendChat("AFK DEACTIVATED");
        }
    }

    new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                const mess = mutation.addedNodes[0];
                if (mess.nodeName === "P") {
                    const text = mess.innerText;
                    const [header, ...messageParts] = text.split(':');
                    const message = messageParts.join(':').trim();

                    const userMatch = header.match(/\[(.*?)\]\s(.*?)\s/);
                    if (!userMatch) continue;

                    const [_, rank, user] = userMatch;
                    if (user === username && message.startsWith('!afk')) {
                        const cmd = message.split(' ');
                        if (cmd.length > 1) {
                            startAFK(cmd.slice(1).join(' '));
                        } else {
                            if (afkTimeout) stopAFK();
                            else startAFK();
                        }
                    }
                }
            }
        }
    }).observe(chatContent, { childList: true });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && afkTimeout) {
            sendChat(afkMessage); 
            nextSendTime = Date.now() + 240000;
        }
    });

    window.addEventListener('beforeunload', () => {
        if (afkTimeout) {
            sendChat(afkMessage); 
        }
    });
})();
