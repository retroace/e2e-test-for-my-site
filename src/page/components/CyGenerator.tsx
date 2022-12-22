import { useState } from "react"

export default function CyGenerator({ items }: { items: any }) {
    const newItems = [ ...items ]
    newItems.sort((a, b) => {
        if(a.timestamp < b.timestamp) return -1
        if(b.timestamp < a.timestamp) return 1
        return 0
    })

    const [codeData, setCodeData] = useState([])
    let newData = []
    let selector = {
        current: '',
        prev: ''
    }
    for(let i =0; i < newItems.length; i++) {
        
    }    

    return (
        <></>
    )
}