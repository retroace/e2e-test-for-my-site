import { MESSAGE_MODAL, TAB_MODAL, XHR_MESSAGE_MODAL } from "../..";
import { CondensedCyFormat } from "./condensor";

export const tranformTabEvent = (currentData: TAB_MODAL): CondensedCyFormat => ({
    type: 'urlchange',
    selector: currentData.url,
    value: [currentData.url],
    timestamp: currentData.timestamp,
    sortTime: currentData.timestamp
})

export const tranformXhrEvent = (currentData: MESSAGE_MODAL): CondensedCyFormat => ({
    type: 'xhr' as any,
    selector: (currentData.info as XHR_MESSAGE_MODAL).method,
    value: [ (currentData.info as XHR_MESSAGE_MODAL) ],
    timestamp: currentData.timestamp,
    sortTime: currentData.timestamp,
})