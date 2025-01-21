const converter: Converter = {
    firstTitle: '输入/输出(Input/Output)',

    firstSaveFileSuffix: 'txt',

    secondTitle: '输出/输入(Output/Intput)',

    secondSaveFileSuffix: 'txt',

    forwardConvert: async (input: string) => {
        return input
    },

    backwardConvert: async (input: string) => {
        return input
    }
}

window.converter = converter
