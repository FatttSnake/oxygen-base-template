import { initOxygenTool } from './OxygenTool.tsx'

(initOxygenTool ?? (
    (id: string) => {
        document.getElementById(id)!.innerText = '载入应用失败，请联系作者。Failed to load the application, please contact the author.'
    }
))("root")