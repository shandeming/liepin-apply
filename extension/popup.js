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

function autoChatRunner() {
  if (document.documentElement.dataset.autoChatRunning === "1") {
    console.log("[AutoChat] already running")
    return
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const shouldStop = () =>
    document.documentElement.dataset.autoChatStop === "1"

  const markRunning = value => {
    document.documentElement.dataset.autoChatRunning = value ? "1" : "0"
  }

  ;(async () => {
    try {
      markRunning(true)
      document.documentElement.dataset.autoChatStop = "0"
      const clicked = new Set()

      while (!shouldStop()) {
        const avatars = document.querySelectorAll(".recruiter-photo--YmVhZ")

        for (const avatar of avatars) {
          if (shouldStop()) {
            break
          }

          if (clicked.has(avatar)) {
            continue
          }

          clicked.add(avatar)

          avatar.scrollIntoView({
            behavior: "smooth",
            block: "center"
          })

          await sleep(1000)

          if (shouldStop()) {
            break
          }

          avatar.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true,
              view: window
            })
          )

          await sleep(1500)

          if (shouldStop()) {
            break
          }

          const buttons = [...document.querySelectorAll("button")]
          const target = buttons.find(btn => btn.innerText.includes("聊一聊"))

          if (target) {
            target.click()
            console.log("[AutoChat] clicked")
            await sleep(2000)
          }
        }

        if (shouldStop()) {
          break
        }

        window.scrollBy({
          top: 1500,
          behavior: "smooth"
        })

        await sleep(3000)
      }
    } catch (error) {
      console.error("[AutoChat] error", error)
    } finally {
      markRunning(false)
    }
  })()
}

startBtn.addEventListener("click", async () => {
  try {
    setStatus("Injecting...")
    const tab = await getActiveTab()
    if (!tab?.id) {
      setStatus("No active tab found")
      return
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: autoChatRunner
    })

    setStatus("Running")
  } catch (error) {
    console.error(error)
    setStatus(`Failed: ${error.message || error}`)
  }
})

stopBtn.addEventListener("click", async () => {
  try {
    setStatus("Stopping...")
    const tab = await getActiveTab()
    if (!tab?.id) {
      setStatus("No active tab found")
      return
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.documentElement.dataset.autoChatStop = "1"
        document.documentElement.dataset.autoChatRunning = "0"
        console.log("[AutoChat] stop requested")
      }
    })

    setStatus("Stopped")
  } catch (error) {
    console.error(error)
    setStatus(`Failed: ${error.message || error}`)
  }
})
