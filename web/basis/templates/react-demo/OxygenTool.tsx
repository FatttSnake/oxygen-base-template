import { createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

import './OxygenTool.css'

const OxygenTool = () => {
    const [count, setCount] = useState(0)

    return (
        <>
            <h1>Hello World</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
        </>
    )
}

window.initOxygenTool = (id: string) => {
    createRoot(document.getElementById(id)!).render(
        createElement(OxygenTool)
    )
}
