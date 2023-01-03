
export const BROWSER_INPUT_EVENTS: Array<keyof GlobalEventHandlersEventMap> = [
    'click',
    'drag',
    'drop',
    'blur',
    'change',

    // SHIFT, CTRL, ALT, ENTER, BACKSPACE and other KEYS
    'keyup',
    'submit',

    'selectionchange',
]
    

export const BROWSER_CLIPBOARD_EVENT: Array<keyof DocumentAndElementEventHandlersEventMap> = [
    'copy',
    'cut',
    'paste'
]

export const XHR_CUSTOM_EVENT_NAME = 'testmysitexhr'


export enum DATABASE_KEYS {
    RECORDING = 'allTabs'
}

export const BROWSER_EVENTS  = [ ...BROWSER_CLIPBOARD_EVENT, ...BROWSER_INPUT_EVENTS ]

export enum BROWSER_RECORDING_STATE {
    XHR_RECORDING = 'xhr-recording',
    DOM_RECORDING = 'dom-recording',
}

export enum BROWSER_SHORTCUT_COMMANDS {
    INJECT_SCRIPT = 'inject-script',
    START_RECORDING = 'start-recording',
    TOGGLE_RECORDING = 'toggle-recording',
    STOP_RECORDING = 'stop-recording',
    RESET_RECORDING = 'reset-recording',
}