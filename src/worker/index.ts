import { onShortcutsKeys } from "./command";
import { onMessageReceived, onTabNavigation, onTabRemoved, onTabUpdate } from "./lifecycle";





/**
 * Initializes the extension.
 */
function setup(): void {
  chrome.runtime.onMessage.addListener(onMessageReceived);
  chrome.commands.onCommand.addListener(onShortcutsKeys);
  // Inject as soon as page loads
  chrome.webNavigation.onCommitted.addListener(onTabNavigation)
  chrome.tabs.onUpdated.addListener(onTabUpdate)
  chrome.tabs.onRemoved.addListener(onTabRemoved)
 

}

setup();