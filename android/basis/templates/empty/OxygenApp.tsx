import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

const OxygenApp = () => {
    return <></>
}

window.initOxygenApp = (id: string) => {
    createRoot(document.getElementById(id)!).render(
        createElement(OxygenApp)
    )
}
