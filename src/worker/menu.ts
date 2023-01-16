
// Code generator 

import { BROWSER_SHORTCUT_COMMANDS } from "../constants";

// Generate selectors in a variable if they need it
const extensionName = 'test-my-site'

function initializeListeners() {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        chrome.tabs.sendMessage(tab.id, { type: BROWSER_SHORTCUT_COMMANDS.CONTEXT_MENU, tabId: tab.id})
    })
}

// USe this to create context menu
export function initializeContextMenu() {
    chrome.contextMenus.create({
        id: `${extensionName}-assert`,
        type: 'normal',
        visible: true,
        title: "Assetions",
        contexts: ["all"],
    });

    initializeListeners()
}
