import { useState } from "react";
import { MESSAGE_MODAL, XHR_MESSAGE_MODAL } from "../..";
import Arrow from "./arrow";

export function CyMock({ items }: { items: MESSAGE_MODAL[] }) {
    const firstXhrTimeStamp = items.length ? items[0].timestamp : 0
    const [open, setOpen] = useState<number>(firstXhrTimeStamp)

    const getXHRResponse = (xhr: MESSAGE_MODAL) => {
        return xhr.info as XHR_MESSAGE_MODAL
    }

    const copyItem = (data: string) => {
        navigator.clipboard.writeText(data).then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    const GenerateMockData = ({ data }: { data: MESSAGE_MODAL }) => {
        if (!data) { return <></> }
        const xhrInfo = getXHRResponse(data)
        const totalTime = Math.ceil((xhrInfo.finishedTime - data.timestamp) / 100) * 0.1
        const isOpen = data.timestamp === open
        return (
            <div className="box">
                <div className="title cursor-pointer" onClick={() => setOpen(isOpen ? 0 :  data.timestamp)}>
                    <Arrow width={20} height={20} className={`arrow ${isOpen && 'rotate-z-180'}`} />
                    <span className="method">{xhrInfo.method}</span>
                    <span className="url">{xhrInfo.url}</span>
                    <span className="time">({totalTime.toFixed(2)} sec)</span>
                </div>

                {open === data.timestamp && (
                    <div className="content">
                        <div className="code">
                            cy.intercept({xhrInfo.method}, {xhrInfo.url}, {`{ fixture: mock/filename.json }`})
                        </div>

                        <div className="flex flex-row justify-space-between align-item-center">
                            <h3 className="box-title">Response Body</h3>
                            <button className="copy" onClick={() => copyItem(xhrInfo.resBody)}>Copy To Clipboard</button>
                        </div>
                        <div className="mock-file">
                            <div style={{ maxHeight: 600, overflowY: 'scroll' }}>
                                <pre><code>
                                    {JSON.stringify(JSON.parse(xhrInfo.resBody), null, 4)}
                                </code></pre>
                            </div>
                        </div>

                        <div className="flex flex-row justify-space-between align-item-center">
                            <h3 className="box-title py-20">Request Headers</h3>

                        </div>
                        <div className="mock-file">
                            <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
                                <pre><code>
                                    {JSON.stringify(xhrInfo.reqHeader, null, 4)}
                                </code></pre>
                            </div>
                        </div>

                        {xhrInfo.reqBody && (
                            <>
                                <h3 className="box-title py-20">Request Body</h3>
                                <div style={{ maxHeight: 150, overflowY: 'scroll' }}>
                                    <pre><code>
                                        {xhrInfo.reqBody}
                                    </code></pre>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            {items.map((xhrData, index) => (<GenerateMockData data={xhrData} key={index} />))}
        </div>
    )
}