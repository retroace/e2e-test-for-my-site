import { BROWSER_MESSAGE, COMMAND } from "../index.d";
import { BROWSER_RECORDING_STATE, BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS } from "../constants";
import { appendItem, getCurrentTab, getItem, setCurrentRecordingState } from "../Datasource";
import { changeIcon, startRecording, stopRecording } from "./command";

/**
 * Injects the event recorder into the active tab.
 *
 * @param details If the details argument is present, that means that web navigation occurred, and
 * we want to ensure that this navigation is occurring in the top-level frame.
 */
function injectEventRecorder(
  details: { tab: chrome.tabs.Tab },
  cb ?: Function
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`injecting`)
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

async function isRecordingOnTab(tabId: number) {
  let isRecording = await getItem<number[]>(DATABASE_KEYS.RECORDING)
  isRecording = Array.isArray(isRecording) ? isRecording : []
  return isRecording.includes(tabId)
}

function openCodeManagementPage() {
  chrome.tabs.create({ url: chrome.runtime.getURL("/page/index.html") });
}

function onMessageReceived(message, port: chrome.runtime.MessageSender) {
  console.log(`we RECEIVED MESSAGE`, message)
  const tabId = port?.tab?.id
  if (!tabId) return false
  appendItem(String(tabId), message, (a,b) => a ? [ ...a, b ] : [b])
  return false
}

function injectScriptIfNotInjected(tab: chrome.tabs.Tab, timeout: number = 0, cb ?: Function) {
  chrome.tabs.sendMessage(tab.id, { type: BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT }, (msg) => {
    msg = msg || {}
    if (msg.type !== BROWSER_RECORDING_STATE.DOM_RECORDING) {
      setTimeout(() => { injectEventRecorder({ tab: tab }, cb) }, timeout)
    }
  })
}


async function onTabRemoved(tabId: number) {
  await setCurrentRecordingState(false, tabId)
  return true
}


async function onTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if(changeInfo && changeInfo.url === 'chrome://newtab/'){
    return false;
  }
  changeIcon(tabId)
  isRecordingOnTab(tabId).then(isRecording => {
    if(!isRecording) { return }
    if (changeInfo.status !== 'loading') return
    getCurrentTab().then(newTab => {
      let currentTab = Array.isArray(newTab) ? newTab[0] : newTab
      injectScriptIfNotInjected(currentTab, 1000, () => {
        if(isRecording) startRecording(tabId)
      })
    })
  })
  return true
}

async function onShortcutsKeys(detail) {
  getCurrentTab().then(async tab => {
    let newDetail: COMMAND = {
      tab: Array.isArray(tab) ? tab[0] : tab as chrome.tabs.Tab,
      command: detail
    }
    let tabId = newDetail.tab.id
    const isRecording = await isRecordingOnTab(tabId)
    switch (detail) {
      case BROWSER_SHORTCUT_COMMANDS.TOGGLE_RECORDING:
        if(isRecording) {
          stopRecording(tabId)
        }else {
          startRecording(tabId, () => {
            injectScriptIfNotInjected(newDetail.tab)
          })
        }
        break
  
      case BROWSER_SHORTCUT_COMMANDS.START_RECORDING:
        console.log(`recording`)
        startRecording(tabId, () => {
          injectScriptIfNotInjected(newDetail.tab)
        })
        break
  
      case BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING:
        console.log(`stop recording`)
        stopRecording(tabId, () => {
          openCodeManagementPage()
        })
        break
  
      case BROWSER_SHORTCUT_COMMANDS.RESET_RECORDING:
        stopRecording(tabId)
        break
  
      default:
        break
    }
  })
  return true
}


function handleInstalled() {
  // chrome.contextMenus.create({
  //   "id": "selectors",
  //   "title": "Assertions",
  //   "contexts": ["all"],
  // })
}

/**
 * Initializes the extension.
 */
function setup(): void {
  chrome.runtime.onMessage.addListener(onMessageReceived);

  chrome.commands.onCommand.addListener(onShortcutsKeys);
  chrome.runtime.onInstalled.addListener(handleInstalled);
  chrome.tabs.onUpdated.addListener(onTabUpdate)
  chrome.tabs.onRemoved.addListener(onTabRemoved)

}

setup();