import { BROWSER_INPUT_EVENTS, DOM_EVENT_MODAL, MESSAGE_MODAL } from "../index.d";
import { getSelectorForElement } from "./selector";

export function parseClipboardEvent(e: Event) {
    console.log(e)
}


export function parseAssertionsEvent(e: HTMLElement) {
    let selector = getSelectorForElement(e as Element);
    return {
        action: 'click',
        type: 'assert',
        url: location.href,
        value: (e as any)?.key,
        info: {
            action: 'exist',
            tagInfo: {
                innerText: e.innerText.substring(0, 7000),
                href: (e as HTMLAnchorElement).href,
                outerHTML: e.outerHTML
            },
            selector: selector.default,
            possibleSelectors: selector.all, 
            tag: (e as Element).tagName,
            value: (e as HTMLInputElement).value,
            mouse: [null, null],
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            specialKeys: {
                BACKSPACE: false,
                SHIFT: false,
                CTRL: false,
                ALT: false
            }
        } as DOM_EVENT_MODAL,
        timestamp: +(new Date())
    }
}

export function parseDomEvent(e: Event) {
    return new Promise(resolve => {
        let selector = getSelectorForElement(e.target as Element);
        const parsedEvent: MESSAGE_MODAL = {
            action: e.type as BROWSER_INPUT_EVENTS,
            type: 'dom',
            url: location.href,
            value: (e as any)?.key,
            extra: (e as KeyboardEvent)?.keyCode,
            info: {
                action: '',
                tagInfo: {},
                url: location.href,
                selector: selector.default,
                possibleSelectors: selector.all, 
                tag: (e.target as Element).tagName,
                value: (e.target as HTMLInputElement).value,
                mouse: [(e as PointerEvent)?.x, (e as PointerEvent)?.y],
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                specialKeys: {
                    BACKSPACE: (e as KeyboardEvent)?.keyCode == 8,
                    SHIFT: (e as KeyboardEvent).shiftKey || false,
                    CTRL: (e as KeyboardEvent).ctrlKey || false,
                    ALT: (e as KeyboardEvent).altKey || false
                }
            } as DOM_EVENT_MODAL,
            timestamp: +(new Date())
        }
        
        if ((e.target as HTMLAnchorElement).hasAttribute('href')) parsedEvent.value = (e.target as HTMLAnchorElement).href;

        if (["INPUT", "SELECT", "TEXTAREA"].includes((parsedEvent.info as DOM_EVENT_MODAL).tag)) {
            (parsedEvent.info as DOM_EVENT_MODAL).value = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value
        }
        
        resolve(parsedEvent);            
    });
}


export function overrideXHREvents() {
    
}