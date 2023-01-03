import { useState } from "react"
import { BROWSER_INPUT_EVENTS, DOM_EVENT_MODAL, MESSAGE_MODAL, XHR_MESSAGE_MODAL } from "../.."


function getKeyValueFromMessageModal(item: MESSAGE_MODAL) {
    let val = ''
    const keyInfo = item.info as DOM_EVENT_MODAL
    if(keyInfo.specialKeys.ALT) {
        val += '{alt}'
    }
    if(keyInfo.specialKeys.CTRL) {
        val += '{ctrl}'
    }
    if(keyInfo.specialKeys.SHIFT) {
        val += '{shift}'
    }
    
    if(item.extra === 37) {
        return '{leftArrow}'
    }
    if(item.extra === 13) {
        return '{enter}'
    }
    if(item.extra === 38) {
        return '{upArrow}'
    }

    if(item.extra === 39) {
        return '{rightArrow}'
    }

    if(item.extra === 40) {
        return '{downArrow}'
    }
    
    if(item.extra === 8) {
        return '{backspace}'
    }

    return `${val}${item.value}`
}

interface OptimizedCyFormat {
    type: BROWSER_INPUT_EVENTS | 'xhr',
    selector: string,
    value: any
}

export default function CyGenerator({ items }: { items: MESSAGE_MODAL[] }) {
    const newItems = [...items]
    newItems.sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (b.timestamp < a.timestamp) return 1
        return 0
    })
    const [codeData, setCodeData] = useState([])

    const getCypressCode = () => {
        let newData: OptimizedCyFormat[] = []
        let currentDataIterator = 0
        for (let i = 0; i < newItems.length; i++) {
            const currentData = items[i]
            if (currentData.type === 'xhr') {
                newData[currentDataIterator] = {
                    type: 'xhr',
                    selector: (currentData.info as XHR_MESSAGE_MODAL).method,
                    value: currentData.url
                }
                currentDataIterator++
                continue
            }

            if (newData[currentDataIterator] && 
                newData[currentDataIterator].type !== currentData.action && 
                (currentData.info as DOM_EVENT_MODAL).selector !== newData[currentDataIterator].selector) {
                currentDataIterator++
            }
            
            if (!newData[currentDataIterator]) {
                newData[currentDataIterator] = {
                    type: currentData.action,
                    selector: (currentData.info as DOM_EVENT_MODAL).selector,
                    value: getKeyValueFromMessageModal(currentData)
                }
                continue
            }

            newData[currentDataIterator].value += getKeyValueFromMessageModal(currentData)
        }
        setCodeData(newData)
    }

    const getXHR = (item: OptimizedCyFormat) => {
        return `cy.spy("${item.value}", ${item.selector}).as('alias1')`
    }

    const getDom = (item: OptimizedCyFormat) => {
        return `cy.get("${item.selector}").${getAction(item.type, item.value)}`
    }

    const getAction = (action: string, val: any) => {
        if(action === 'keyup') {
            return `type("${val}")`
        }
        if(action === 'click') {
            return `click()`
        }
        if(action === 'dblclick') {
            return `click()`
        }
        if(action === 'blur') {
            return `should('have.text', '${val}')`
        }
        if(action === 'change') {
            return `should('have.text', '${val}')`
        }
        
        return ''
    }
    
    const codeBuilder = codeData.map(
        (item: OptimizedCyFormat) => item.type !== 'xhr' ? getDom(item) : getXHR(item)
    ).join('\n')
    
    return (
        <div>
            <button onClick={getCypressCode}>Generate Code</button>

            <pre>
                {codeBuilder}
            </pre>
        </div>
    )
}