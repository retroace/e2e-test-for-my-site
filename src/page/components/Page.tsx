import { useEffect, useState } from "react"
import CyGenerator from "./CyGenerator"

export default function Page() {
    const [data, setData] = useState<{ [key: string]: any }>({})
    const [activeTab, setActiveTab] = useState<string>("")
    
    const getData = () => {
        chrome.storage.local.get(null, setData)
    }

    useEffect(() => { getData() }, [])

    const activeTabData = data[activeTab] ? [ ...data[activeTab] ].sort((a, b) => {
        if(a.timestamp < b.timestamp) return -1
        if(b.timestamp < a.timestamp) return 1
        return 0
    }) : []

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <style>
                {`
                    ul { margin: 10px 0; padding: 0; }
                    ul > li { list-style: none; padding: 10px; border: 1px solid #e3e3e3; margin: 10px 0; }
                `}
            </style>
            <div style={{ minWidth: 250, maxWidth: 300, paddingRight: 10 }}>
                {Object.keys(data).map(i => (
                    <div style={{ width: '100%', }} key={i}>
                        <button style={{ width: '100%', padding: 8 }} onClick={() => setActiveTab(i)}>
                            {i}
                        </button>
                    </div>
                ))}
            </div>
            
            <div>
                <div>
                    <CyGenerator items={activeTabData} />
                </div>
                {activeTabData.map((item, i) => (
                    <div style={{ borderTop: '1px solid #e3e3e3', borderBottom: '1px solid #e3e3e3' }} key={item.timestamp}>
                        <p>Type: {item.type}</p>
                        <p>Selector: {item.selector}</p>
                        <p>URL: {item.info?.url}</p>
                        <pre>
                            {JSON.stringify(item, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>

        </div>
    )
}