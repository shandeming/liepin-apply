const statusEl = document.getElementById("status")
const startBtn = document.getElementById("start")
const stopBtn = document.getElementById("stop")

function setStatus(text) {
  statusEl.textContent = text
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs[0]
}

function getPageModeFromUrl(url) {
  if (url?.startsWith("https://c.liepin.com/")) {
    return "homepage"
  }

  if (url?.includes("https://www.liepin.com/zhaopin/")) {
    return "jobpage"
  }

  return "unsupported"
}

async function sendCommand(type) {
  const tab = await getActiveTab()

  if (!tab?.id) {
    setStatus("No active tab found")
    return
  }

  const mode = getPageModeFromUrl(tab.url)
  if (mode === "unsupported") {
    setStatus("Unsupported URL")
    return
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { type }, response => {
      const error = chrome.runtime.lastError
      if (error) {
        reject(new Error(error.message))
        return
      }

      resolve(response)
    })
  })
}

startBtn.addEventListener("click", async () => {
  try {
    setStatus("Starting...")
    await sendCommand("START_AUTO_CHAT")
    setStatus("Running")
  } catch (error) {
    console.error(error)
    setStatus(`Failed: ${error.message || error}`)
  }
})

stopBtn.addEventListener("click", async () => {
  try {
    setStatus("Stopping...")
    await sendCommand("STOP_AUTO_CHAT")
    setStatus("Stopped")
  } catch (error) {
    console.error(error)
    setStatus(`Failed: ${error.message || error}`)
  }
})
