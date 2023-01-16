import { useState } from "react"
import { MESSAGE_MODAL, TAB_MODAL } from "../.."
import eventCondensor, { CondensedCyFormat, GeneratorFormat } from "./condensor"
import { CyMock } from "./CyMock"
import { cypressCodeGenerator } from "./generator"


export enum FORMAT {
    code = 0,
    list = 1,
    mock = 2,

}

export default function CyGenerator({ items }: { items: Array<MESSAGE_MODAL | TAB_MODAL> }) {
    const [formattedEvents, setFormattedEvents] = useState<CondensedCyFormat[]>([])
    const [showFormat, setShowFormat] = useState<number>(FORMAT.code)

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

    const codeBuilder = () => formattedEvents.reduce<GeneratorFormat[]>((carry, item) => {
        let lastItem = carry[carry.length - 1]
        if (lastItem && item.type === 'xhrresponse') {
            let newItem = JSON.parse(JSON.stringify(item))
            if (lastItem.generatorType === 'merged') {
                carry[carry.length - 1].merged.push(newItem)
                return carry
            }

            if (lastItem.type === 'xhrresponse') {
                lastItem.merged = [newItem as CondensedCyFormat]
                lastItem.generatorType = 'merged'
                carry[carry.length - 1] = lastItem
                return carry
            }
        }

        carry.push({ ...item, generatorType: 'single', merged: [] })
        return carry
    }, []).map(cypressCodeGenerator).sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (b.timestamp < a.timestamp) return 1
        return 0
    })

    return (
        <div>
            <div className="flex flex-row">
                <div onClick={() => { getCypressCode(); setShowFormat(FORMAT.code) }} className={`card-rounded ${FORMAT.code === showFormat && 'active'}`}>
                    <div>
                        <h5 className="mb-0 font-bold text-center cursor-pointer">Show Code</h5>
                    </div>
                </div>
                <div onClick={() => { getCypressCode(); setShowFormat(FORMAT.list) }} className={`card-rounded ${FORMAT.list === showFormat && 'active'}`}>
                    <div>
                        <h5 className="mb-0 font-bold text-center cursor-pointer">Show List</h5>
                    </div>
                </div>
                <div onClick={() => { getCypressCode(); setShowFormat(FORMAT.mock) }} className={`card-rounded ${FORMAT.mock === showFormat && 'active'}`}>
                    <div>
                        <h5 className="mb-0 font-bold text-center cursor-pointer">Show Mocks</h5>
                    </div>
                </div>

            </div>

            <div>
                {showFormat === FORMAT.list && (
                    <ul>
                        {codeBuilder().map((item, index) => (
                            <li key={`code-${index}`}>
                                {item.code}
                            </li>
                        ))}
                    </ul>
                )}

                {showFormat === FORMAT.code && (
                    <pre style={{
                        background: '#e3e3e3',
                        color: 'black',
                        fontSize: '10px',
                        lineHeight: '18px',
                        paddingLeft: '14px',
                        paddingTop: '14px',
                    }}>
                        <code>
                            {codeBuilder().map(i => i.code).join('\n')}
                        </code>
                    </pre>
                )}

                {showFormat === FORMAT.mock && (
                    <>
                        <CyMock items={items.filter(i => i.type === 'xhr') as MESSAGE_MODAL[]} />
                        <div>
                            <p className="title">Total Url Covered In This Test</p>

                            <ol>
                                {Array.from(new Set(items.map((item, i) => item.url))).map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>

                            <p className="title">Total XHR Request Found In This Test</p>

                            <ol>
                                {Array.from(
                                    new Set(items.filter(i => i.type === 'xhr'))
                                )
                                    .map(item => (
                                        <li key={item.url}>{item.url}</li>
                                    ))}
                            </ol>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}