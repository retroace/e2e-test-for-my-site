import { BROWSER_SHORTCUT_COMMANDS } from "./constants"

export interface BROWSER_MESSAGE {
    type: string
}

export type EventType = 'browser' | 'extension'


export enum BROWSER_INPUT_EVENTS { 
    CLICK = 'click',
    DRAG = 'drag',
    DROP = 'drop',
    BLUR = 'blur',
    CHANGE = 'change',
    KEYUP = 'keyup',
    SUBMIT = 'submit',
    SELECTION_CHANGE = 'selectionchange',
    XHR = 'xhr'
}

export interface TAB_MODAL {
    type: 'urlchange',
    url: string,
    status?: string, 
    title?: string,
    timestamp: number
}

export interface MESSAGE_MODAL {
    type: 'xhr' | 'dom',
    action: BROWSER_INPUT_EVENTS,
    value: string | null,
    extra?: any,
    url: string,
    info: DOM_EVENT_MODAL | XHR_MESSAGE_MODAL,
    timestamp: number
}

export interface XHR_MESSAGE_MODAL {
    reqBody: string,
    method: string,
    resBody: string,
    url: string,
    reqHeader: string[],
}

export interface DOM_EVENT_MODAL {
    selector: string,
    possibleSelectors: string[],
    action: string,
    tag: string,
    value: string,
    tagInfo: {
        inputType?: string,
        href?: string,
        key?: string
    },
    mouse?: [number, number]
    viewport: {
        width: number,
        height: number
    },
    specialKeys: {
        SHIFT: boolean,
        CTRL: boolean,
        ALT: boolean
    },
}



export interface COMMAND {
    tab: chrome.tabs.Tab,
    command: BROWSER_SHORTCUT_COMMANDS
}