import { BROWSER_MESSAGE, COMMAND } from "../index.d";
import { BROWSER_SHORTCUT_COMMANDS, DATABASE_KEYS } from "../constants";
import { appendItem, getCurrentTab, getItem, setCurrentRecordingState } from "../Datasource";

/**
 * Injects the event recorder into the active tab.
 *
 * @param details If the details argument is present, that means that web navigation occurred, and
 * we want to ensure that this navigation is occurring in the top-level frame.
 */
function injectEventRecorder(
  details: { tab: chrome.tabs.Tab },
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: { tabId: details.tab.id },
      files: ['/browser/index.js']
    }, () => {
      if (chrome?.runtime?.lastError) {
        return setTimeout(() => injectEventRecorder(details), 400)
      }
      resolve();
    });
  });
}


function openCodeManagementPage() {
  chrome.tabs.create({ url: chrome.runtime.getURL("/page/index.html") });
}

function onMessageReceived(message, port) {
  const tabId = port?.sender?.tab?.id
  if (!tabId) return

  if (message.type === BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT) {
    injectEventRecorder({ tab: port.sender.tab })
    return
  }
  console.log(message)
  appendItem(tabId, message, (a,b) => a ? [ ...a, b ] : [b])
}

function handleNewConnection(detail: chrome.runtime.Port) {
  detail.onMessage.addListener(onMessageReceived)
}


function injectScriptIfNotInjected(tab: chrome.tabs.Tab) {
  chrome.tabs.sendMessage(tab.id, { type: BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT }, (msg) => {
    msg = msg || {}
    if (msg.type !== BROWSER_SHORTCUT_COMMANDS.INJECT_SCRIPT) {
      injectEventRecorder({ tab: tab })
    }
  })
}


async function changeIcon(tabId: number, state ?: boolean) {
  if(state === undefined) {
    const dbKeys = await getItem(DATABASE_KEYS.RECORDING)
    state = dbKeys && Array.isArray(dbKeys) && dbKeys.includes(tabId)
  }

  const icon = state ? '/tms-rec.png' : '/tms.png'
  await chrome.action.setIcon({ path: icon, tabId });

}

async function onTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if (changeInfo.status !== 'loading') return
  await changeIcon(tabId)
  injectScriptIfNotInjected(tab)
}

async function onShortcutsKeys(detail) {
  const tab = await getCurrentTab()
  let newDetail: COMMAND = {
    tab: Array.isArray(tab) ? tab[0] : tab as chrome.tabs.Tab,
    command: detail
  }
  let tabId = newDetail.tab.id
  switch (detail) {
    case BROWSER_SHORTCUT_COMMANDS.TOGGLE_RECORDING:
      let isRecording = await getItem<number[]>(DATABASE_KEYS.RECORDING)
      isRecording = Array.isArray(isRecording) ? isRecording : []
      await setCurrentRecordingState(!isRecording.includes(tabId), tabId)
      await changeIcon(tabId)
      injectScriptIfNotInjected(newDetail.tab)
      break

    case BROWSER_SHORTCUT_COMMANDS.START_RECORDING:
      setCurrentRecordingState(true, tabId)
      await changeIcon(tabId, true)
      await injectScriptIfNotInjected(newDetail.tab)
      chrome.tabs.sendMessage(tabId, { type: BROWSER_SHORTCUT_COMMANDS.START_RECORDING })
      break

    case BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING:
      await setCurrentRecordingState(false, tabId)
      await changeIcon(tabId, false)
      chrome.tabs.sendMessage(tabId, {
        type: BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING
      } as BROWSER_MESSAGE)
      await openCodeManagementPage()
      break

    case BROWSER_SHORTCUT_COMMANDS.RESET_RECORDING:
      await changeIcon(tabId, true)
      await injectScriptIfNotInjected(newDetail.tab)

      break

    default:
      break
  }
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
  chrome.runtime.onConnect.addListener(handleNewConnection);
  // chrome.runtime.onMessage.addListener(onMessageReceived);
  chrome.commands.onCommand.addListener(onShortcutsKeys);
  chrome.runtime.onInstalled.addListener(handleInstalled);
  chrome.tabs.onUpdated.addListener(onTabUpdate)

}

setup();