import { DATABASE_KEYS } from "./constants"

export async function appendItem(
    key: string,
    value: any,
    merge?: Function
) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (keyVal) => {
            const val = merge ? merge(keyVal[key], value) : value
            chrome.storage.local.set({ [String(key)]: val })
                .then(r => resolve(r))
                .catch(console.log)
        })
    })
}


export async function getItem<T = any>(key: string) {
    return new Promise<T>((resolve, reject) => {
        chrome.storage.local.get(key, (keyVal) => {
            resolve(keyVal[key])
        })
    })
}


export const getCurrentTab = () => new Promise<chrome.tabs.Tab[]>(resolve => (
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      resolve(tabs)
    })
  ))


export async function setCurrentRecordingState(recording: boolean = false, tabId) {
    if(recording) {
        await appendItem(DATABASE_KEYS.RECORDING, tabId, (a,b) => ([ ...(a || []), b ]))
        return
    }
    
    await appendItem(DATABASE_KEYS.RECORDING, tabId, (a,b) => {
        const data = (a || []).filter(i => i !== b)
        return data
    })
}