(window.initOxygenApp ?? (
    (id: string) => {
        const rootElement = document.getElementById(id)!
        rootElement.innerHTML = ''

        const messageDiv = document.createElement('div')

        messageDiv.style.cssText = `
      background-color: #666;
      padding: 12px 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `
        messageDiv.textContent = '载入应用失败，请联系作者。Failed to load the application, please contact the author.'


        rootElement.appendChild(messageDiv)
    }
))("root")
