import { BROWSER_CLIPBOARD_EVENT, BROWSER_EVENTS, BROWSER_RECORDING_STATE, BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS, XHR_CUSTOM_EVENT_NAME } from "../constants";
import { getItem } from "../Datasource";
import { BROWSER_MESSAGE } from "../index.d";
import { parseClipboardEvent, parseDomEvent } from "./event";

let tabId: number;

async function getCurrentRecordingState() {
    let data = await getItem<number[]>(DATABASE_KEYS.RECORDING)
    data = Array.isArray(data) ? data : []
    return data.includes(tabId) 
        
}


async function parseEvent(e: Event) {
    console.log(`parsing`, e.type)
    if (e.target === document) return
    if((e.target as HTMLElement).tagName === undefined) return
    console.log(e.type)
    let data;
    if ((BROWSER_CLIPBOARD_EVENT as string[]).includes(e.type)) {
        data = await parseClipboardEvent(e)
    } else {
        data = await parseDomEvent(e)
    }
    chrome.runtime.sendMessage(data)
}

/**
 * Setup browser events
 */
function setupDomListeners() {
    const eventOption = {
        capture: true,
        passive: true,
    };
    console.log(`adding Event Listener FOR`, BROWSER_EVENTS)
    BROWSER_EVENTS.map(e => document.addEventListener(e, parseEvent, eventOption))
}


function setupXhrListeners() {
    if (document.head.querySelector('#xhrModifyScript')) { return }
    var xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.src = chrome.runtime.getURL('/browser/script.js');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.id = 'xhrModifyScript';
    // xhrOverrideScript.onload = function () { (this as any).remove() }

    const doc = document.head || document.documentElement
    doc.appendChild(xhrOverrideScript);

    document.head.prepend(xhrOverrideScript);
}

/**
 * Removes event listeners from the DOM.
 */
function teardownDOMListeners(): void {
    BROWSER_EVENTS.map(e => document.removeEventListener(e, parseEvent, { capture: true }))
}

function handleMessage(message: BROWSER_MESSAGE, sender: chrome.runtime.MessageSender, sendResponse: Function) {
    console.log(`messages`,message)
    switch (message.type) {
        case BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT:
            sendResponse && sendResponse({ type: BROWSER_RECORDING_STATE.DOM_RECORDING })
            setupXhrListeners()
            setupDomListeners()
            break
            
        case BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING:
            teardownDOMListeners()
            tabId = (message as any).tabId as number
        break

        case BROWSER_SHORTCUT_COMMANDS.START_RECORDING:
            setupXhrListeners()
            setupDomListeners()
        break

        default:
            break
    }
    return true
}

function initialize(): void {
    chrome.runtime.onMessage.addListener(handleMessage)

    window.addEventListener(XHR_CUSTOM_EVENT_NAME, async function (evt) {
        const isRecording = await getCurrentRecordingState()
        if (!isRecording) { return false }
        chrome.runtime.sendMessage((evt as any).detail);
    }, false);
}

initialize()