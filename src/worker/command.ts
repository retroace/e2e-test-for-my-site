import { COMMAND } from ".."
import { BROWSER_SHORTCUT_COMMANDS } from "../constants"
import { getCurrentTab } from "../Datasource"
import { isRecordingOnTab } from "./datasource"
import { injectScriptIfNotInjected, openCodeManagementPage, startRecording, stopRecording } from "./helper"



export async function onShortcutsKeys(detail) {
  getCurrentTab().then(async tab => {
      let newDetail: COMMAND = {
          tab: Array.isArray(tab) ? tab[0] : tab as chrome.tabs.Tab,
          command: detail
      }
      let tabId = newDetail.tab.id
      const isRecording = await isRecordingOnTab(tabId)
      switch (detail) {
          case BROWSER_SHORTCUT_COMMANDS.TOGGLE_RECORDING:
              if (isRecording) {
                  stopRecording(tabId)
              } else {
                  startRecording(tabId, () => {
                      injectScriptIfNotInjected(newDetail.tab)
                  })
              }
              break

          case BROWSER_SHORTCUT_COMMANDS.START_RECORDING:
              startRecording(tabId, () => {
                  injectScriptIfNotInjected(newDetail.tab)
              })
              break

          case BROWSER_SHORTCUT_COMMANDS.STOP_RECORDING:
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

