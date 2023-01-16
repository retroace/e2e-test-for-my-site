import { useEffect, useState } from "react"
import CyGenerator from "./CyGenerator"

export default function Page() {
    const [data, setData] = useState<{ [key: string]: any }>({})
    const [activeTab, setActiveTab] = useState<string>("")

    const getData = () => {
        chrome.storage.local.get(null, setData)
    }

    useEffect(() => { getData() }, [])

    const activeTabData = data[activeTab] ? [...data[activeTab]].sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1
        if (b.timestamp < a.timestamp) return 1
        return 0
    }) : []

    return (
        <div style={{ minHeight: '100vh' }}>
            <aside className="sidebar" style={{ flex: 0.5, borderRight: '1px solid #e3e3e3' }}>
                <div className="sidebar-title">
                    <a className="">
                        <span>Test My Site</span>
                    </a>
                </div>

                <div className="sidebar-link-parent">
                    <ul className="sidebar-links">
                        <li className="mt-0.5 w-full">
                            {Object.keys(data).filter(i => i !== 'allTabs').map(i => (
                                <div className={` ${i === activeTab && 'active'} sidebarlinks`} key={i} onClick={() => setActiveTab(i)}>
                                    Tab - {i}
                                </div>
                            ))}
                        </li>
                    </ul>
                </div>

            </aside>

            <div className="main-content">
                {Boolean(activeTabData && activeTabData.length) ? (
                    <CyGenerator items={activeTabData} />
                ) : (
                    <div className="py-20">
                        <p className="title">Select Tab To Generate Code</p>
                    </div>
                )}
            </div>

        </div>
    )
}