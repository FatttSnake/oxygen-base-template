import { createElement, ChangeEvent, useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, ButtonGroup, SvgIcon, Checkbox, Tooltip } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import saveAs from 'file-saver'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { ViewUpdate, keymap } from '@codemirror/view'
import { indentMore } from "@codemirror/commands";
import { LanguageSupport, indentUnit } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { materialLight, defaultSettingsMaterialLight, materialDark, defaultSettingsMaterialDark } from '@uiw/codemirror-theme-material'

import './base_oxygen_base_style.css'
import './OxygenTool_oxygen_base_style.css'

const defaultConverter: Converter = {
  firstTitle: 'Untitled',
  secondTitle: 'Untitled',
  forwardConvert: async (input) => input,
  backwardConvert: async (input) => input
}

const converter: Converter = window.converter ?? defaultConverter
const firstKeymapCompartment = new Compartment
const firstIndentCompartment = new Compartment
const firstLineWrappingCompartment = new Compartment
const firstUpdateExtCompartment = new Compartment
const secondKeymapCompartment = new Compartment
const secondIndentCompartment = new Compartment
const secondLineWrappingCompartment = new Compartment
const secondUpdateExtCompartment = new Compartment

const OxygenTool = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: OxygenTheme.colorPrimary
      },
      text: {
        primary: OxygenTheme.colorText,
        secondary: OxygenTheme.colorTextSecondary
      }
    }
  })

  const { firstTitle, firstLanguage, secondTitle, secondLanguage, forwardConvert, firstFormat, backwardConvert, secondFormat } = converter

  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFuncRef = useRef<(newText: string, changeEditor: boolean) => void>()
  const firstEditorRef = useRef<HTMLDivElement>(null)
  const firstEditorViewRef = useRef<EditorView>()
  const secondEditorRef = useRef<HTMLDivElement>(null)
  const secondEditorViewRef = useRef<EditorView>()

  const [firstText, setFirstText] = useState('')
  const [secondText, setSecondText] = useState('')

  const [isFirstLineWrapping, setIsFirstLineWrapping] = useState(false)
  const [isFirstBeautify, setIsFirstBeautify] = useState(true)
  const [firstIndent, setFirstIndent] = useState(4)
  const [isSecondLineWrapping, setIsSecondLineWrapping] = useState(false)
  const [isSecondBeautify, setIsSecondBeautify] = useState(true)
  const [secondIndent, setSecondIndent] = useState(4)

  const insertTab = (indent: number) => {
    return ({ state, dispatch }: EditorView) => {
      if (state.selection.ranges.some(r => !r.empty))
        return indentMore({ state, dispatch });
      dispatch(state.update(state.replaceSelection(indent ? ' '.repeat(indent) : '\t'), { scrollIntoView: true, userEvent: "input" }));
      return true;
    }
  }

  const changeFirstText = (newFirstText: string, changeEditor = false) => {
    setFirstText(newFirstText)

    if (!secondEditorViewRef.current || !forwardConvert) {
      return
    }
    forwardConvert(newFirstText)
        .then((convertedFirstText) => {
          setSecondText(convertedFirstText)

          if (isSecondBeautify && secondFormat) {
            secondFormat(convertedFirstText, secondIndent)
                .then((output: string) => {
                  secondEditorViewRef.current!.dispatch(
                      {
                        changes: {
                          from: 0,
                          to: secondEditorViewRef.current!.state.doc.length,
                          insert: output
                        }
                      }
                  )
                })
                .catch((e) => {
                  console.error(e)
                  secondEditorViewRef.current!.dispatch(
                      {
                        changes: {
                          from: 0,
                          to: secondEditorViewRef.current!.state.doc.length,
                          insert: convertedFirstText
                        }
                      }
                  )
                })
          } else {
            secondEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: secondEditorViewRef.current!.state.doc.length,
                    insert: convertedFirstText
                  }
                }
            )
          }
        })
        .catch((e) => {
          console.error(e)
        })

    if (!firstEditorViewRef.current || !changeEditor) {
      return
    }
    if (isFirstBeautify && firstFormat) {
      firstFormat(newFirstText, firstIndent)
          .then((output: string) => {
            firstEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: firstEditorViewRef.current!.state.doc.length,
                    insert: output
                  }
                }
            )
          })
          .catch((e) => {
            console.error(e)
            firstEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: firstEditorViewRef.current!.state.doc.length,
                    insert: newFirstText
                  }
                }
            )
          })
    } else {
      firstEditorViewRef.current!.dispatch(
          {
            changes: {
              from: 0,
              to: firstEditorViewRef.current!.state.doc.length,
              insert: newFirstText
            }
          }
      )
    }
  }

  const changeSecondText = (newSecondText: string, changeEditor = false) => {
    setSecondText(newSecondText)

    if (!firstEditorViewRef.current || !backwardConvert) {
      return
    }
    backwardConvert(newSecondText)
        .then((convertedSecondText) => {
          setFirstText(convertedSecondText)

          if (isFirstBeautify && firstFormat) {
            firstFormat(convertedSecondText, firstIndent)
                .then((output) => {
                  firstEditorViewRef.current!.dispatch(
                      {
                        changes: {
                          from: 0,
                          to: firstEditorViewRef.current!.state.doc.length,
                          insert: output
                        }
                      }
                  )
                })
                .catch((e) => {
                  console.error(e)
                  firstEditorViewRef.current!.dispatch(
                      {
                        changes: {
                          from: 0,
                          to: firstEditorViewRef.current!.state.doc.length,
                          insert: convertedSecondText
                        }
                      }
                  )
                })
          } else {
            firstEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: firstEditorViewRef.current!.state.doc.length,
                    insert: convertedSecondText
                  }
                }
            )
          }
        })
        .catch((e) => {
          console.error(e)
        })

    if (!secondEditorViewRef.current || !changeEditor) {
      return
    }
    if (isSecondBeautify && secondFormat) {
      secondFormat(newSecondText, secondIndent)
          .then((output) => {
            secondEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: secondEditorViewRef.current!.state.doc.length,
                    insert: output
                  }
                }
            )
          })
          .catch((e) => {
            console.error(e)
            secondEditorViewRef.current!.dispatch(
                {
                  changes: {
                    from: 0,
                    to: secondEditorViewRef.current!.state.doc.length,
                    insert: newSecondText
                  }
                }
            )
          })
    } else {
      secondEditorViewRef.current!.dispatch(
          {
            changes: {
              from: 0,
              to: secondEditorViewRef.current!.state.doc.length,
              insert: newSecondText
            }
          }
      )
    }
  }

  const copyToClipboard = (text: string) => {
    return () => {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪切板。Copied to clipboard.')
      })
    }
  }

  const pasteFromClipboard = (setFunc: (newText: string, changeEditor: boolean) => void) => {
    return () => {
      navigator.clipboard.readText().then((text) => {
        setFunc(text, true)
      })
    }
  }

  const uploadFile = (setFunc: (newText: string, changeEditor: boolean) => void) => {
    return () => {
      setFuncRef.current = setFunc
      fileInputRef.current?.click()
    }
  }

  const handleOnFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!setFuncRef.current) {
      return
    }

    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setFuncRef.current?.(e.target.result as string, true)
      }
    }
    reader.readAsText(file)
  }

  const downloadFile = (text: string) => {
    return () => {
      saveAs(new File([text], `${Date.now()}.txt`, { type: 'text/plain;charset=utf-8' }))
    }
  }

  const loadFirstLanguage = (language?: LanguageSupport) => {
    const onFirstUpdateExt = EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
      setTimeout(() => {
        if (viewUpdate.docChanged && viewUpdate.view.hasFocus && !viewUpdate.view.composing) {
          const text = viewUpdate.state.doc.toString()
          changeFirstText(text)
        }
      })
    })

    const firstEditorState = EditorState.create({
      doc: firstText,
      extensions: [
        basicSetup,
        firstKeymapCompartment.of(
            keymap.of([
              {
                key: "Tab",
                preventDefault: true,
                run: insertTab(firstIndent),
              }
            ])
        ),
        firstIndentCompartment.of(
            indentUnit.of(firstIndent ? ' '.repeat(firstIndent) : '\t')
        ),
        firstLineWrappingCompartment.of(
            isFirstLineWrapping ? EditorView.lineWrapping : []
        ),
        firstUpdateExtCompartment.of(
            onFirstUpdateExt
        ),
        OxygenTheme.isDarkMode ? materialDark : materialLight,
        ...(language ? [language] : [])
      ]
    })

    firstEditorViewRef.current = new EditorView({
      state: firstEditorState,
      parent: firstEditorRef.current ?? undefined
    })
  }

  const loadSecondLanguage = (language?: LanguageSupport) => {
    const onSecondUpdateExt = EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
      setTimeout(() => {
        if (viewUpdate.docChanged && viewUpdate.view.hasFocus && !viewUpdate.view.composing) {
          const text = viewUpdate.state.doc.toString()
          changeSecondText(text)
        }
      })
    })

    const secondEditorState = EditorState.create({
      doc: secondText,
      extensions: [
        basicSetup,
        secondKeymapCompartment.of(
            keymap.of([
              {
                key: "Tab",
                preventDefault: true,
                run: insertTab(secondIndent),
              }
            ])
        ),
        secondIndentCompartment.of(
            indentUnit.of(secondIndent ? ' '.repeat(secondIndent) : '\t')
        ),
        secondLineWrappingCompartment.of(
            isSecondLineWrapping ? EditorView.lineWrapping : []
        ),
        secondUpdateExtCompartment.of(
            onSecondUpdateExt
        ),
        OxygenTheme.isDarkMode ? materialDark : materialLight,
        ...(language ? [language] : [])
      ]
    })

    secondEditorViewRef.current = new EditorView({
      state: secondEditorState,
      parent: secondEditorRef.current ?? undefined
    })
  }

  useEffect(() => {
    if (!firstEditorViewRef.current) {
      return
    }

    firstEditorViewRef.current.dispatch({
      effects: [
        firstKeymapCompartment.reconfigure(
            keymap.of([{
              key: "Tab",
              preventDefault: true,
              run: insertTab(firstIndent),
            }])
        ),
        firstIndentCompartment.reconfigure(
            indentUnit.of(firstIndent ? ' '.repeat(firstIndent) : '\t')
        )
      ]
    })
  }, [firstIndent])

  useEffect(() => {
    if (!firstEditorViewRef.current) {
      return
    }

    firstEditorViewRef.current.dispatch({
      effects: [
        firstLineWrappingCompartment.reconfigure(
            isFirstLineWrapping ? EditorView.lineWrapping : []
        )
      ]
    })
  }, [isFirstLineWrapping])

  useEffect(() => {
    if (!secondEditorViewRef.current) {
      return
    }

    secondEditorViewRef.current.dispatch({
      effects: [
        secondKeymapCompartment.reconfigure(
            keymap.of([{
              key: "Tab",
              preventDefault: true,
              run: insertTab(secondIndent),
            }])
        ),
        secondIndentCompartment.reconfigure(
            indentUnit.of(secondIndent ? ' '.repeat(secondIndent) : '\t')
        )
      ]
    })
  }, [secondIndent])

  useEffect(() => {
    if (!secondEditorViewRef.current) {
      return
    }

    secondEditorViewRef.current.dispatch({
      effects: [
        secondLineWrappingCompartment.reconfigure(
            isSecondLineWrapping ? EditorView.lineWrapping : []
        )
      ]
    })
  }, [isSecondLineWrapping])

  useEffect(() => {
    const onFirstUpdateExt = EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
      setTimeout(() => {
        if (viewUpdate.docChanged && viewUpdate.view.hasFocus && !viewUpdate.view.composing) {
          const text = viewUpdate.state.doc.toString()
          changeFirstText(text)
        }
      })
    })
    const onSecondUpdateExt = EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
      setTimeout(() => {
        if (viewUpdate.docChanged && viewUpdate.view.hasFocus && !viewUpdate.view.composing) {
          const text = viewUpdate.state.doc.toString()
          changeSecondText(text)
        }
      })
    })

    firstEditorViewRef.current && firstEditorViewRef.current.dispatch({
      effects: [
        firstUpdateExtCompartment.reconfigure(onFirstUpdateExt)
      ]
    })
    secondEditorViewRef.current && secondEditorViewRef.current.dispatch({
      effects: [
        secondUpdateExtCompartment.reconfigure(onSecondUpdateExt)
      ]
    })
  }, [isFirstBeautify, isSecondBeautify, firstIndent, secondIndent])

  useEffect(() => {
    firstLanguage ? languages.find((lang) => lang.name === firstLanguage)?.load().then((firstLanguage) => {
      loadFirstLanguage(firstLanguage)
    }) : loadFirstLanguage()

    secondLanguage ? languages.find((lang) => lang.name === secondLanguage)?.load().then((secondLanguage) => {
      loadSecondLanguage(secondLanguage)
    }) : loadSecondLanguage()

    return () => {
      firstEditorViewRef.current?.destroy()
      secondEditorViewRef.current?.destroy()
    }
  }, [])

  return (
      <ThemeProvider theme={theme}>
        <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleOnFileChange}
        />
        <div className={'oxygen-content'}>
          <div className={'oxygen-side'}>
            <div className={'oxygen-header'}>
              <div className={'oxygen-toolbar'}>
                <span className={'oxygen-toolbar-title'}>{firstTitle}</span>
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button onClick={copyToClipboard(firstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={pasteFromClipboard(changeFirstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={uploadFile(changeFirstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={downloadFile(firstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
              <div className={'oxygen-toolbar'}>
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button color={'error'} onClick={() => changeFirstText('', true)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={'oxygen-input'} style={{ backgroundColor: (OxygenTheme.isDarkMode ? defaultSettingsMaterialDark : defaultSettingsMaterialLight).background }}>
              <div className={'oxygen-editor'} ref={firstEditorRef} />
              <div className={'bottom-toolbar'}>
                <div className={'bottom-toolbar-left'}>
                  <Tooltip title={'自动换行/Word Wrap'}>
                    <Checkbox
                        checked={isFirstLineWrapping}
                        onChange={(_, checked) => setIsFirstLineWrapping(checked)}
                        icon={
                          <SvgIcon viewBox={'0 0 1536 1024'} style={{ fontSize: 12 }}>
                            <path d="M0 85.333333C0 38.205035 37.96875 0 84.769936 0L1451.230063 0C1498.047206 0 1536 37.876465 1536 85.333333 1536 132.461632 1498.031249 170.666667 1451.230063 170.666667L84.769936 170.666667C37.952793 170.666667 0 132.790202 0 85.333333L0 85.333333ZM0 938.666667C0 891.538372 37.96875 853.333333 84.769936 853.333333L1451.230063 853.333333C1498.047206 853.333333 1536 891.209796 1536 938.666667 1536 985.794961 1498.031249 1024 1451.230063 1024L84.769936 1024C37.952793 1024 0 986.123537 0 938.666667L0 938.666667ZM0 512C0 464.871701 37.959422 426.666667 84.955947 426.666667L938.666667 426.666667 937.301103 597.333333 84.832354 597.333333C37.980738 597.333333 0 559.456869 0 512L0 512ZM1110.92806 426.666667 1449.980348 426.666667C1497.487693 426.666667 1536 464.543131 1536 512 1536 559.128299 1498.499814 597.333333 1450.666249 597.333333L1266.303215 597.333333 1110.92806 597.333333 1110.92806 426.666667 1110.92806 426.666667Z" />
                          </SvgIcon>
                        }
                        checkedIcon={
                          <SvgIcon viewBox={'0 0 1024 1024'} style={{ fontSize: 12 }}>
                            <path d="M640 768h64a106.666667 106.666667 0 1 0 0-213.333333H170.666667a42.666667 42.666667 0 0 1 0-85.333334h533.333333a192 192 0 1 1 0 384H640v42.666667a21.333333 21.333333 0 0 1-34.133333 17.066667l-91.008-68.266667a42.666667 42.666667 0 0 1 0-68.266667l91.008-68.266666a21.333333 21.333333 0 0 1 34.133333 17.066666v42.666667zM170.666667 170.666667h682.666666a42.666667 42.666667 0 0 1 0 85.333333H170.666667a42.666667 42.666667 0 1 1 0-85.333333z m213.333333 640a42.666667 42.666667 0 0 1-42.666667 42.666666H170.666667a42.666667 42.666667 0 0 1 0-85.333333h170.666666a42.666667 42.666667 0 0 1 42.666667 42.666667z" />
                          </SvgIcon>
                        }
                    />
                  </Tooltip>
                  {firstFormat && (<Tooltip title={'格式化/Beautify'}>
                    <Checkbox
                        checked={isFirstBeautify}
                        onChange={(_, checked) => setIsFirstBeautify(checked)}
                        icon={
                          <SvgIcon viewBox={'0 -960 960 960'} style={{ fontSize: 12 }}>
                            <path d="M291-160q-55 0-93-39.55t-38-95.5q0-55.95 38-95.45t93-39.5h458q55 0 93 39.55t38 95.5q0 55.95-38 95.45T749-160H291Zm0-60h458q29.58 0 50.29-21.82 20.71-21.83 20.71-53Q820-326 799.29-348T749-370H291q-29.58 0-50.29 21.82-20.71 21.83-20.71 53Q220-264 240.71-242T291-220Zm-80-310q-55 0-93-39.55t-38-95.5q0-55.95 38-95.45t93-39.5h458q55 0 93 39.55t38 95.5q0 55.95-38 95.45T669-530H211Zm0-60h458q29.58 0 50.29-21.82 20.71-21.83 20.71-53Q740-696 719.29-718T669-740H211q-29.58 0-50.29 21.82-20.71 21.83-20.71 53Q140-634 160.71-612T211-590Zm309 295Zm-80-370Z" />
                          </SvgIcon>
                        }
                        checkedIcon={
                          <SvgIcon viewBox={'0 -960 960 960'} style={{ fontSize: 12 }}>
                            <path d="M291-160q-55 0-93-39.5T160-295q0-56 38-95.5t93-39.5h458q55 0 93 39.5t38 95.5q0 56-38 95.5T749-160H291Zm-80-370q-55 0-93-39.5T80-665q0-56 38-95.5t93-39.5h458q55 0 93 39.5t38 95.5q0 56-38 95.5T669-530H211Z" />
                          </SvgIcon>
                        }
                    />
                  </Tooltip>)}
                </div>
                <div className={'bottom-toolbar-right'}>
                  <Tooltip title={'缩进/Indent'}>
                    <div>
                      <Checkbox
                          checked={firstIndent === 0}
                          onChange={() => setFirstIndent(0)}
                          icon={<span style={{ fontSize: 12 }}>Tab</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>Tab</span>}
                      />
                      <Checkbox
                          checked={firstIndent === 2}
                          onChange={() => setFirstIndent(2)}
                          icon={<span style={{ fontSize: 12 }}>2</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>2</span>}
                      />
                      <Checkbox
                          checked={firstIndent === 4}
                          onChange={() => setFirstIndent(4)}
                          icon={<span style={{ fontSize: 12 }}>4</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>4</span>}
                      />
                      <Checkbox
                          checked={firstIndent === 6}
                          onChange={() => setFirstIndent(6)}
                          icon={<span style={{ fontSize: 12 }}>6</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>6</span>}
                      />
                      <Checkbox
                          checked={firstIndent === 8}
                          onChange={() => setFirstIndent(8)}
                          icon={<span style={{ fontSize: 12 }}>8</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>8</span>}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          <div className={'oxygen-center'}>
            <div className={'oxygen-convert-icon'}>
              {forwardConvert && backwardConvert ?
                  <SvgIcon viewBox={'0 -960 960 960'} color={'primary'} fontSize={'large'}>
                    <path d="M280-160 80-360l200-200 56 57-103 103h287v80H233l103 103-56 57Zm400-240-56-57 103-103H440v-80h287L624-743l56-57 200 200-200 200Z" />
                  </SvgIcon> :
                  <SvgIcon viewBox={'0 -960 960 960'} color={'primary'} fontSize={'large'} style={{ transform: backwardConvert ? 'rotateZ(90deg)' : 'rotateZ(-90deg)' }}>
                    <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
                  </SvgIcon>}
            </div>
          </div>
          <div className={'oxygen-side'}>
            <div className={'oxygen-header'}>
              <div className={'oxygen-toolbar'}>
                <span className={'oxygen-toolbar-title'}>{secondTitle}</span>
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button onClick={copyToClipboard(secondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={pasteFromClipboard(changeSecondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={uploadFile(changeSecondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={downloadFile(secondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
              <div className={'oxygen-toolbar'}>
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button color={'error'} onClick={() => changeSecondText('', true)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={'oxygen-input'} style={{ backgroundColor: (OxygenTheme.isDarkMode ? defaultSettingsMaterialDark : defaultSettingsMaterialLight).background }}>
              <div className={'oxygen-editor'} ref={secondEditorRef} />
              <div className={'bottom-toolbar'}>
                <div className={'bottom-toolbar-left'}>
                  <Tooltip title={'自动换行/Word Wrap'}>
                    <Checkbox
                        checked={isSecondLineWrapping}
                        onChange={(_, checked) => setIsSecondLineWrapping(checked)}
                        icon={
                          <SvgIcon viewBox={'0 0 1536 1024'} style={{ fontSize: 12 }}>
                            <path d="M0 85.333333C0 38.205035 37.96875 0 84.769936 0L1451.230063 0C1498.047206 0 1536 37.876465 1536 85.333333 1536 132.461632 1498.031249 170.666667 1451.230063 170.666667L84.769936 170.666667C37.952793 170.666667 0 132.790202 0 85.333333L0 85.333333ZM0 938.666667C0 891.538372 37.96875 853.333333 84.769936 853.333333L1451.230063 853.333333C1498.047206 853.333333 1536 891.209796 1536 938.666667 1536 985.794961 1498.031249 1024 1451.230063 1024L84.769936 1024C37.952793 1024 0 986.123537 0 938.666667L0 938.666667ZM0 512C0 464.871701 37.959422 426.666667 84.955947 426.666667L938.666667 426.666667 937.301103 597.333333 84.832354 597.333333C37.980738 597.333333 0 559.456869 0 512L0 512ZM1110.92806 426.666667 1449.980348 426.666667C1497.487693 426.666667 1536 464.543131 1536 512 1536 559.128299 1498.499814 597.333333 1450.666249 597.333333L1266.303215 597.333333 1110.92806 597.333333 1110.92806 426.666667 1110.92806 426.666667Z" />
                          </SvgIcon>
                        }
                        checkedIcon={
                          <SvgIcon viewBox={'0 0 1024 1024'} style={{ fontSize: 12 }}>
                            <path d="M640 768h64a106.666667 106.666667 0 1 0 0-213.333333H170.666667a42.666667 42.666667 0 0 1 0-85.333334h533.333333a192 192 0 1 1 0 384H640v42.666667a21.333333 21.333333 0 0 1-34.133333 17.066667l-91.008-68.266667a42.666667 42.666667 0 0 1 0-68.266667l91.008-68.266666a21.333333 21.333333 0 0 1 34.133333 17.066666v42.666667zM170.666667 170.666667h682.666666a42.666667 42.666667 0 0 1 0 85.333333H170.666667a42.666667 42.666667 0 1 1 0-85.333333z m213.333333 640a42.666667 42.666667 0 0 1-42.666667 42.666666H170.666667a42.666667 42.666667 0 0 1 0-85.333333h170.666666a42.666667 42.666667 0 0 1 42.666667 42.666667z" />
                          </SvgIcon>
                        }
                    />
                  </Tooltip>
                  {secondFormat && (<Tooltip title={'格式化/Beautify'}>
                    <Checkbox
                        checked={isSecondBeautify}
                        onChange={(_, checked) => setIsSecondBeautify(checked)}
                        icon={
                          <SvgIcon viewBox={'0 -960 960 960'} style={{ fontSize: 12 }}>
                            <path d="M291-160q-55 0-93-39.55t-38-95.5q0-55.95 38-95.45t93-39.5h458q55 0 93 39.55t38 95.5q0 55.95-38 95.45T749-160H291Zm0-60h458q29.58 0 50.29-21.82 20.71-21.83 20.71-53Q820-326 799.29-348T749-370H291q-29.58 0-50.29 21.82-20.71 21.83-20.71 53Q220-264 240.71-242T291-220Zm-80-310q-55 0-93-39.55t-38-95.5q0-55.95 38-95.45t93-39.5h458q55 0 93 39.55t38 95.5q0 55.95-38 95.45T669-530H211Zm0-60h458q29.58 0 50.29-21.82 20.71-21.83 20.71-53Q740-696 719.29-718T669-740H211q-29.58 0-50.29 21.82-20.71 21.83-20.71 53Q140-634 160.71-612T211-590Zm309 295Zm-80-370Z" />
                          </SvgIcon>
                        }
                        checkedIcon={
                          <SvgIcon viewBox={'0 -960 960 960'} style={{ fontSize: 12 }}>
                            <path d="M291-160q-55 0-93-39.5T160-295q0-56 38-95.5t93-39.5h458q55 0 93 39.5t38 95.5q0 56-38 95.5T749-160H291Zm-80-370q-55 0-93-39.5T80-665q0-56 38-95.5t93-39.5h458q55 0 93 39.5t38 95.5q0 56-38 95.5T669-530H211Z" />
                          </SvgIcon>
                        }
                    />
                  </Tooltip>)}
                </div>
                <div className={'bottom-toolbar-right'}>
                  <Tooltip title={'缩进/Indent'}>
                    <div>
                      <Checkbox
                          checked={secondIndent === 0}
                          onChange={() => setSecondIndent(0)}
                          icon={<span style={{ fontSize: 12 }}>Tab</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>Tab</span>}
                      />
                      <Checkbox
                          checked={secondIndent === 2}
                          onChange={() => setSecondIndent(2)}
                          icon={<span style={{ fontSize: 12 }}>2</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>2</span>}
                      />
                      <Checkbox
                          checked={secondIndent === 4}
                          onChange={() => setSecondIndent(4)}
                          icon={<span style={{ fontSize: 12 }}>4</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>4</span>}
                      />
                      <Checkbox
                          checked={secondIndent === 6}
                          onChange={() => setSecondIndent(6)}
                          icon={<span style={{ fontSize: 12 }}>6</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>6</span>}
                      />
                      <Checkbox
                          checked={secondIndent === 8}
                          onChange={() => setSecondIndent(8)}
                          icon={<span style={{ fontSize: 12 }}>8</span>}
                          checkedIcon={<span style={{ fontSize: 12 }}>8</span>}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
  )
}

export const initOxygenTool = (id: string) => {
  createRoot(document.getElementById(id)!).render(
      createElement(OxygenTool)
  )
}
