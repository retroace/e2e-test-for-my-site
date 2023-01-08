import { BROWSER_INPUT_EVENTS, DOM_EVENT_MODAL, MESSAGE_MODAL, TAB_MODAL } from "../../index.d"
import { tranformTabEvent, tranformXhrEvent } from "./transformer"

export interface CondensedCyFormat {
    tagName ?: string,
    type: BROWSER_INPUT_EVENTS | 'xhrrequest' | 'xhrresponse' | 'urlchange',
    selector: string,
    value: any[],
    timestamp: number,
    sortTime: number,
}

export interface GeneratorFormat extends Partial<CondensedCyFormat> {
    merged: CondensedCyFormat[],
    generatorType: 'merged' | 'single'
}

function extractValueFromKeyEvents(item: MESSAGE_MODAL) {
    let val = ''
    const keyInfo = item.info as DOM_EVENT_MODAL
    if (keyInfo.specialKeys.ALT) {
        val += '{alt}'
    }
    if (keyInfo.specialKeys.CTRL) {
        val += '{ctrl}'
    }
    if (keyInfo.specialKeys.SHIFT) {
        val += '{shift}'
    }

    if (item.extra === 37) {
        return '{leftArrow}'
    }

    if (item.extra === 37) {
        return '{leftArrow}'
    }
    if (item.extra === 13) {
        return '{enter}'
    }
    if (item.extra === 38) {
        return '{upArrow}'
    }

    if (item.extra === 39) {
        return '{rightArrow}'
    }

    if (item.extra === 40) {
        return '{downArrow}'
    }

    if (item.extra === 8) {
        return '{backspace}'
    }

    return `${val}${item.value || (item.info as DOM_EVENT_MODAL)?.value}`

}

function condenseEventAction(action: BROWSER_INPUT_EVENTS, item: MESSAGE_MODAL, accum: string[]) {
    let newAccum = [ ...accum ]
    newAccum.push(action === 'keyup' ? extractValueFromKeyEvents(item): item.value)
    return newAccum
}

export default function eventCondensor(items : Array<MESSAGE_MODAL | TAB_MODAL> ) {
    let newData: CondensedCyFormat[] = []
    let xhrData: CondensedCyFormat[] = []
    let currentDataIterator = 0

    for (let i = 0; i < items.length; i++) {
        const currentData = items[i]
        if (currentData.type === 'urlchange') {
            newData[currentDataIterator] = tranformTabEvent(currentData) as CondensedCyFormat
            currentDataIterator++
            continue
        }

        if (currentData.type === 'xhr') {
            const response = tranformXhrEvent(currentData) as CondensedCyFormat
            xhrData.push({ ...response, type: 'xhrrequest', sortTime: currentData.timestamp - 3000 })
            
            let res = JSON.parse(JSON.stringify(response))
            xhrData.push({ ...res, type: 'xhrresponse', sortTime: res.value.finishedTime })
            continue
        }


        if (newData[currentDataIterator] && (
            newData[currentDataIterator].type !== currentData.action ||
            (currentData.info as DOM_EVENT_MODAL).selector !== newData[currentDataIterator].selector)) {
            currentDataIterator++
        }

        if (!newData[currentDataIterator]) {
            newData[currentDataIterator] = {
                tagName: (currentData.info as DOM_EVENT_MODAL).tag,
                type: currentData.action,
                selector: (currentData.info as DOM_EVENT_MODAL).selector,
                timestamp: currentData.timestamp,
                sortTime: currentData.timestamp,
                value: condenseEventAction(currentData.action, currentData, [])
            }
            continue
        }

        newData[currentDataIterator].value = condenseEventAction(
            currentData.action, 
            currentData,
            newData[currentDataIterator].value
        )
    }

    const alias = xhrData.filter(i => i.type === 'xhrrequest').map(i => `${i.selector} ${i.value[0]?.url} |timestamp| ${i.timestamp}`)
    xhrData = xhrData.map(i => {
        if(i.type === 'xhrresponse') {
            return i
        }
        let key = `${i.selector} ${i.value[0]?.url}`
        let indexOfKey = alias.findIndex(i => i.startsWith(key))
        if(indexOfKey < 0) return i
        let aliasKey = alias[indexOfKey].split('|timestamp| ')[1]
        
        i.timestamp = parseInt(aliasKey)
        return i
    })
 
    newData = [...newData, ...xhrData]
    newData.sort((a,b) => {
        if(a.sortTime < b.sortTime) return -1
        return a.sortTime > b.sortTime ? 1 : 0
    })

    return newData
}