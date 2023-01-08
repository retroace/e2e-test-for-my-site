import { MESSAGE_MODAL } from ".."
import { getCurrentTab, setCurrentRecordingState } from "../Datasource"
import { isRecordingOnTab, saveEvent, tranformTabChangeEvent } from "./datasource"
import { changeIcon, injectScriptIfNotInjected, startRecording } from "./helper"

export function onMessageReceived(message: MESSAGE_MODAL, port: chrome.runtime.MessageSender) {
    const tabId = port?.tab?.id
    if (!tabId) return false
    saveEvent('browser', message, tabId)
    return false
}



export async function onTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (changeInfo && changeInfo.url === 'chrome://newtab/') {
        return false;
    }

    changeIcon(tabId)
    isRecordingOnTab(tabId).then(isRecording => {
        if (!isRecording) { return }
        if (changeInfo.status !== 'loading') return
        getCurrentTab().then(newTab => {
            let currentTab = Array.isArray(newTab) ? newTab[0] : newTab
            saveEvent('extension', tranformTabChangeEvent(changeInfo), tabId)
            injectScriptIfNotInjected(currentTab, 1000, () => {
                if (isRecording) startRecording(tabId)
            })
        })
    })
    return true
}


export async function onTabNavigation(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    isRecordingOnTab(details.tabId).then(isRecording => {
        if (!isRecording) { return }
        getCurrentTab().then(newTab => {
            let currentTab = Array.isArray(newTab) ? newTab[0] : newTab
            injectScriptIfNotInjected(currentTab, 1000, () => {
                if (isRecording) startRecording(details.tabId)
            })
        })
    })
    return true
}



export async function onTabRemoved(tabId: number) {
    await setCurrentRecordingState(false, tabId)
    return true
}

