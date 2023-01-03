import { BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS } from "../constants"
import { getItem, setCurrentRecordingState } from "../Datasource"


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