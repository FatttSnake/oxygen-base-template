import { createElement, ChangeEvent, Dispatch, SetStateAction, useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ButtonGroup, Button, TextField, SvgIcon } from '@mui/material'
import { createTheme, ThemeProvider, SxProps, Theme } from '@mui/material/styles'

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

  const { firstTitle, secondTitle, forwardConvert, backwardConvert } = converter

  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFuncRef = useRef<Dispatch<SetStateAction<string>>>()

  const [firstText, setFirstText] = useState('')
  const [secondText, setSecondText] = useState('')

  const textFieldStyle: SxProps<Theme> = {
    height: '100%',
    '& .MuiInputBase-root': {
      height: '100%'
    },
    '& textarea': {
      height: '100% !important',
      overflow: 'auto !important'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: OxygenTheme.colorBorder
    }
  }

  const copyToClipboard = (text: string) => {
    return () => {
      if (!NativeApi.copyToClipboard) {
        alert('操作失败，请更新 App 后重试。The operation failed, please update the app and try again.')
        return
      }

      if (NativeApi.copyToClipboard(text)) {
        alert('已复制到剪切板。Copied to clipboard.')
      } else {
        alert('复制失败。Copy failed.')
      }
    }
  }

  const pasteFromClipboard = (setFunc: Dispatch<SetStateAction<string>>) => {
    return () => {
      if (!NativeApi.readClipboard) {
        alert('操作失败，请更新 App 后重试。The operation failed, please update the app and try again.')
        return
      }

      setFunc(NativeApi.readClipboard())
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
      if (!NativeApi.saveToDownloads) {
        alert('操作失败，请更新 App 后重试。The operation failed, please update the app and try again.')
        return
      }

      if (NativeApi.saveToDownloads(
          btoa(
              String.fromCharCode(
                  ...new TextEncoder().encode(text)
              )
          ),
          `${Date.now()}.txt`
      )) {
        alert("已保存到下载目录。Saved to download directory.")
      } else {
        alert("保存失败，请检查权限设置。Saving failed, please check permission settings.")
      }
    }
  }


  const handleOnInputChange = (setFunc: Dispatch<SetStateAction<string>>) => {
    return (e: ChangeEvent<HTMLTextAreaElement>) => {
      setFunc(e.target.value)
    }
  }

  useEffect(() => {
    forwardConvert && setSecondText(forwardConvert(firstText))
  }, [forwardConvert, firstText])

  useEffect(() => {
    backwardConvert && setFirstText(backwardConvert(secondText))
  }, [backwardConvert, secondText])

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
              <TextField label={firstTitle} slotProps={{
                input: {
                  readOnly: forwardConvert === undefined,
                },
              }} value={firstText} onChange={handleOnInputChange(setFirstText)} sx={textFieldStyle} multiline fullWidth />
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
              <TextField label={secondTitle} slotProps={{
                input: {
                  readOnly: backwardConvert === undefined,
                },
              }} value={secondText} onChange={handleOnInputChange(setSecondText)} sx={textFieldStyle} multiline fullWidth />
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
