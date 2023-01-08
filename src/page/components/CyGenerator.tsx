import { useState } from "react"
import { MESSAGE_MODAL, TAB_MODAL } from "../.."
import eventCondensor, { CondensedCyFormat, GeneratorFormat } from "./condensor"
import { cypressCodeGenerator } from "./generator"


export default function CyGenerator({ items }: { items: Array<MESSAGE_MODAL | TAB_MODAL> }) {
    const [formattedEvents, setFormattedEvents] = useState<CondensedCyFormat[]>([])
    const [showFormat, setShowFormat] = useState<number>(0)
    const getCypressCode = () => {
        console.log(items)
        items.sort((a, b) => {
            if (a.timestamp < b.timestamp) return -1
            return a.timestamp > b.timestamp ? 1 : 0
        })
        const condensedEvents = eventCondensor(items)
        setFormattedEvents(condensedEvents)
        console.log(condensedEvents)
    }

    const codeBuilder = () => formattedEvents.reduce<GeneratorFormat[]>((carry,item) => {
        let lastItem = carry[carry.length - 1]
        if(lastItem && item.type === 'xhrresponse') {
            let newItem = JSON.parse(JSON.stringify(item))
            if(lastItem.generatorType === 'merged') {
                carry[carry.length - 1].merged.push(newItem)
                return carry
            }

            if(lastItem.type === 'xhrresponse') {
                lastItem.merged = [ newItem as CondensedCyFormat ]
                lastItem.generatorType = 'merged'
                carry[carry.length - 1] = lastItem
                return carry
            }
        }
        
        carry.push({ ...item, generatorType: 'single', merged: []})
        return carry
    }, []).map(cypressCodeGenerator).sort((a, b) => {
        if(a.timestamp < b.timestamp) return -1
        if(b.timestamp < a.timestamp) return 1
        return 0
    })

    return (
        <div>
            <button onClick={getCypressCode}>Generate Code</button>
            <button onClick={() => setShowFormat(showFormat ? 0 : 1)}>Show {showFormat ? 'List' : `Cypress Code`}</button>
            {showFormat ? (
                <ul>
                    {codeBuilder().map((item, index) => (
                        <li key={`code-${index}`}>
                            {item.code}
                        </li>
                    ))}
                </ul>
            ) : (
                <pre>
                    {codeBuilder().map(i => i.code).join('\n')}
                </pre>
            )}
        </div>
    )
}