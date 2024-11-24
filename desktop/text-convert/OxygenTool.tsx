import { createElement, ChangeEvent, Dispatch, SetStateAction, useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, ButtonGroup, SvgIcon } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import saveAs from 'file-saver'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { ViewUpdate, keymap } from '@codemirror/view'
import { insertTab } from "@codemirror/commands";
import { LanguageSupport } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { materialLight, materialDark } from '@uiw/codemirror-theme-material'

import './base_oxygen_base_style.css'
import './OxygenTool_oxygen_base_style.css'

const defaultConverter: Converter = {
  firstTitle: 'Untitled',
  secondTitle: 'Untitled',
  forwardConvert: (input) => input,
  backwardConvert: (input) => input
}

const converter: Converter = window.converter ?? defaultConverter

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

  const { firstTitle, firstLanguage, secondTitle, secondLanguage, forwardConvert, backwardConvert } = converter

  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFuncRef = useRef<Dispatch<SetStateAction<string>>>()
  const firstEditorRef = useRef<HTMLDivElement>(null)
  const firstEditorViewRef = useRef<EditorView>()
  const secondEditorRef = useRef<HTMLDivElement>(null)
  const secondEditorViewRef = useRef<EditorView>()

  const [firstText, setFirstText] = useState('')
  const [secondText, setSecondText] = useState('')

  const copyToClipboard = (text: string) => {
    return () => {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪切板。Copied to clipboard.')
      })
    }
  }

  const pasteFromClipboard = (setFunc: Dispatch<SetStateAction<string>>) => {
    return () => {
      navigator.clipboard.readText().then((text) => {
        setFunc(text)
      })
    }
  }

  const uploadFile = (setFunc: Dispatch<SetStateAction<string>>) => {
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
        setFuncRef.current?.(e.target.result as string)
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
        if (viewUpdate.docChanged && !firstEditorViewRef.current!.composing) {
          const text = viewUpdate.state.doc.toString()
          setFirstText(text)
        }
      })
    })

    const firstEditorState = EditorState.create({
      doc: firstText,
      extensions: [
        basicSetup,
        keymap.of([
          {
            key: "Tab",
            preventDefault: true,
            run: insertTab,
          }
        ]),
        onFirstUpdateExt,
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
        if (viewUpdate.docChanged && !secondEditorViewRef.current!.composing) {
          const text = viewUpdate.state.doc.toString()
          setSecondText(text)
        }
      })
    })

    const secondEditorState = EditorState.create({
      doc: secondText,
      extensions: [
        basicSetup,
        keymap.of([
          {
            key: "Tab",
            preventDefault: true,
            run: insertTab,
          }
        ]),
        onSecondUpdateExt,
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

  useEffect(() => {
    forwardConvert && setSecondText(forwardConvert(firstText))

    if (!firstEditorViewRef.current) {
      return
    }

    const selection = firstEditorViewRef.current.state.selection
    const safeSelection = {
      anchor: Math.min(selection.ranges[0].anchor, firstText.length),
      head: Math.min(selection.ranges[0].head, firstText.length)
    };
    firstEditorViewRef.current.dispatch(
        {
          changes: { from: 0, to: firstEditorViewRef.current.state.doc.length, insert: firstText },
          selection: safeSelection
        }
    )
  }, [firstText])

  useEffect(() => {
    backwardConvert && setFirstText(backwardConvert(secondText))

    if (!secondEditorViewRef.current) {
      return
    }

    const selection = secondEditorViewRef.current.state.selection
    const safeSelection = {
      anchor: Math.min(selection.ranges[0].anchor, secondText.length),
      head: Math.min(selection.ranges[0].head, secondText.length)
    };
    secondEditorViewRef.current.dispatch(
        {
          changes: { from: 0, to: secondEditorViewRef.current.state.doc.length, insert: secondText },
          selection: safeSelection
        }
    )
  }, [secondText])

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
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button onClick={copyToClipboard(firstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={pasteFromClipboard(setFirstText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={uploadFile(setFirstText)}>
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
                  <Button color={'error'} onClick={() => setFirstText('')}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={'oxygen-input'}>
              <div className={'oxygen-editor'} ref={firstEditorRef} />
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
                <ButtonGroup variant={'contained'} size={'small'}>
                  <Button onClick={copyToClipboard(secondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={pasteFromClipboard(setSecondText)}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
                    </SvgIcon>
                  </Button>
                  <Button onClick={uploadFile(setSecondText)}>
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
                  <Button color={'error'} onClick={() => setSecondText('')}>
                    <SvgIcon viewBox={'0 -960 960 960'} fontSize={'small'}>
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </SvgIcon>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={'oxygen-input'}>
              <div className={'oxygen-editor'} ref={secondEditorRef} />
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
