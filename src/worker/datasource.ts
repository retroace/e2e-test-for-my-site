import { EventType, MESSAGE_MODAL, TAB_MODAL } from ".."
import { DATABASE_KEYS } from "../constants"
import { appendItem, getItem } from "../Datasource"

export const saveEvent = (type: EventType, data: MESSAGE_MODAL | TAB_MODAL, tabId: number) => {
    if(type === 'browser' || data.url) {
        appendItem(String(tabId), data, (a,b) => a ? [ ...a, b ] : [b])
        return
    }
}


export const tranformTabChangeEvent = (tabInfo: chrome.tabs.TabChangeInfo): TAB_MODAL => {
    return {
        type: 'urlchange',
        url: tabInfo.url,
        title: tabInfo?.title,
        status: tabInfo?.status,
        timestamp: +(new Date())
    }
}



export async function isRecordingOnTab(tabId: number) {
    let isRecording = await getItem<number[]>(DATABASE_KEYS.RECORDING)
    isRecording = Array.isArray(isRecording) ? isRecording : []
    return isRecording.includes(tabId)
  }
  