interface Window {
    converter: Converter
}

interface Converter {
    firstTitle: string
    secondTitle: string
    forwardConvert?: (input: string) => string
    backwardConvert?: (input: string) => string
}
