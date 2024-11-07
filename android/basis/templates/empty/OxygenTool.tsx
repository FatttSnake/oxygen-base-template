import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

const OxygenTool = () => {
    return <></>
}

window.initOxygenTool = (id: string) => {
    createRoot(document.getElementById(id)!).render(
        createElement(OxygenTool)
    )
}
