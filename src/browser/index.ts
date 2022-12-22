import { BROWSER_CLIPBOARD_EVENT, BROWSER_EVENTS, BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS, XHR_CUSTOM_EVENT_NAME } from "../constants";
import { getItem, setCurrentRecordingState } from "../Datasource";
import { BROWSER_MESSAGE } from "../index.d";
import { parseClipboardEvent, parseDomEvent } from "./event";

let port: chrome.runtime.Port;

async function getCurrentRecordingState() {
    let data = await getItem<number[]>(DATABASE_KEYS.RECORDING)
    data = Array.isArray(data) ? data : []
    return data.includes(port?.sender?.tab?.id) 
        
}


async function parseEvent(e: Event) {
    const isRecording = await getCurrentRecordingState()
    if (!isRecording) return
    if (e.target === document) return

    let data;
    console.log(e.type, BROWSER_CLIPBOARD_EVENT)
    if ((BROWSER_CLIPBOARD_EVENT as string[]).includes(e.type)) {
        data = await parseClipboardEvent(e)
    } else {
        data = await parseDomEvent(e)
    }
    port.postMessage(data)
}

/**
 * Setup browser events
 */
function setupDomListeners() {
    const eventOption = {
        capture: true,
        passive: true,
    }
    BROWSER_EVENTS.map(e => document.removeEventListener(e, parseEvent, eventOption))
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


function handleMessage(message: BROWSER_MESSAGE, port: chrome.runtime.Port) {
    switch (message.type) {
        case BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT:
            break
        case BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING:
            if (port.sender?.tab?.id === undefined) { return }
            setCurrentRecordingState(false, port.sender.tab.id)
            teardownDOMListeners()
            break

        case BROWSER_SHORTCUT_COMMANDS.START_RECORDING:
            setupXhrListeners()
            break
        default:
            break
    }
}

function initialize(): void {
    port = chrome.runtime.connect({ name: window.location.hostname })

    port.onDisconnect.addListener(teardownDOMListeners)
    port.onMessage.addListener(handleMessage)

    window.addEventListener(XHR_CUSTOM_EVENT_NAME, async function (evt) {
        const isRecording = await getCurrentRecordingState()
        if (!isRecording) { return false }
        port && port.postMessage((evt as any).detail);
    }, false);

    setupDomListeners()
}

initialize()