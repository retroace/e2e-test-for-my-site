import { BROWSER_RECORDING_STATE, BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS } from "../constants"
import { getItem, setCurrentRecordingState } from "../Datasource"

export function injectScriptIfNotInjected(tab: chrome.tabs.Tab, timeout: number = 0, cb?: Function) {
    chrome.tabs.sendMessage(tab.id, { type: BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT }, (msg) => {
        msg = msg || {}
        if (msg.type !== BROWSER_RECORDING_STATE.DOM_RECORDING) {
            setTimeout(() => { injectEventRecorder({ tab: tab }, cb) }, timeout)
        }
    })
}


export function startRecording(tabId: number, cb?: Function) {
    setCurrentRecordingState(true, tabId)
    changeIcon(tabId, true)
    cb && cb()
    chrome.tabs.sendMessage(tabId, { type: BROWSER_SHORTCUT_COMMANDS.START_RECORDING, tabId })
}


export function stopRecording(tabId: number, cb?: Function) {
    setCurrentRecordingState(false, tabId)
    changeIcon(tabId, false)
    chrome.tabs.sendMessage(tabId, { type: BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING, tabId})
    cb && cb()
}

export function changeIcon(tabId: number, state?: boolean) {
    if (state === undefined) {
        getItem(DATABASE_KEYS.RECORDING).then(dbKeys => {
            state = dbKeys && Array.isArray(dbKeys) && dbKeys.includes(tabId)
            const icon = state ? '/tms-rec.png' : '/tms.png'
            chrome.action.setIcon({ path: icon, tabId });
        })
        return false
    }
    
    const icon = state ? '/tms-rec.png' : '/tms.png'
    chrome.action.setIcon({ path: icon, tabId });
    return false
}


export function openCodeManagementPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("/page/index.html") });
}


/**
* Injects the event recorder into the active tab.
*
* @param details If the details argument is present, that means that web navigation occurred, and
* we want to ensure that this navigation is occurring in the top-level frame.
*/

export function injectEventRecorder(
    details: { tab: chrome.tabs.Tab },
    cb?: Function
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript({
                target: { tabId: details.tab.id },
                files: ['/browser/index.js']
            }, () => {
                if (chrome?.runtime?.lastError) {
                    return setTimeout(() => injectEventRecorder(details, cb), 400)
                }
                cb && cb()
                resolve();
            });
        });
    }
    
    
    