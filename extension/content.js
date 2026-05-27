let running = false
let stopRequested = false

function getPageMode() {
  const url = location.href

  if (url.startsWith("https://c.liepin.com/")) {
    return "homepage"
  }

  if (url.includes("https://www.liepin.com/zhaopin/")) {
    return "jobpage"
  }

  return "unsupported"
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clickChatButton(root) {
  const buttons = [...root.querySelectorAll("button")]
  return buttons.find(btn => btn.innerText.includes("聊一聊"))
}

function getJobCards() {
  return document.querySelectorAll(".job-card-right-box")
}

function getJobCardsSignature(cards) {
  return [...cards]
    .slice(0, 3)
    .map(card => card.innerText.trim().replace(/\s+/g, " ").slice(0, 80))
    .join("||")
}

async function waitForJobCards(previousSignature = "", timeoutMs = 15000) {
  const startedAt = Date.now()

  while (!stopRequested && Date.now() - startedAt < timeoutMs) {
    const cards = getJobCards()

    if (cards.length > 0) {
      const signature = getJobCardsSignature(cards)

      if (signature && signature !== previousSignature) {
        return cards
      }

      if (!previousSignature) {
        return cards
      }
    }

    await sleep(500)
  }

  return null
}

function goToNextPage() {
  const nextBtn = document.querySelector(".ant-pagination-next")

  if (!nextBtn) {
    console.log("[AutoChat] next button not found")
    return false
  }

  const disabled = nextBtn.getAttribute("aria-disabled") === "true"

  if (disabled) {
    console.log("[AutoChat] already last page")
    return false
  }

  nextBtn.click()
  console.log("[AutoChat] go to next page")
  return true
}

async function runHomepageAutoChat() {
  const clicked = new Set()

  while (!stopRequested) {
    const avatars = document.querySelectorAll(".recruiter-photo--YmVhZ")

    for (const avatar of avatars) {
      if (stopRequested) {
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

      if (stopRequested) {
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

      if (stopRequested) {
        break
      }

      const target = clickChatButton(document)

      if (target) {
        target.click()
        console.log("[AutoChat] clicked homepage 聊一聊")
        await sleep(2000)
      }
    }

    if (stopRequested) {
      break
    }

    window.scrollBy({
      top: 1500,
      behavior: "smooth"
    })

    await sleep(3000)
  }
}

async function runJobPageAutoChat() {
  while (!stopRequested) {
    const cards = await waitForJobCards()

    if (!cards || cards.length === 0) {
      console.warn("[AutoChat] job cards not ready")
      break
    }

    const pageSignature = getJobCardsSignature(cards)

    for (const card of cards) {
      if (stopRequested) {
        break
      }

      card.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })

      await sleep(1000)

      if (stopRequested) {
        break
      }

      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      card.dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          view: window
        })
      )

      card.dispatchEvent(
        new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          view: window
        })
      )

      card.dispatchEvent(
        new MouseEvent("mouseover", {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          view: window
        })
      )

      await sleep(1500)

      if (stopRequested) {
        break
      }

      const target = clickChatButton(card)

      if (target) {
        target.click()
        console.log("[AutoChat] clicked job page 聊一聊")
        await sleep(2000)
      }
    }

    if (stopRequested) {
      break
    }

    const hasNext = goToNextPage()

    if (!hasNext) {
      break
    }

    const nextCards = await waitForJobCards(pageSignature)

    if (!nextCards || nextCards.length === 0) {
      console.warn("[AutoChat] next page not loaded")
      break
    }
  }
}

async function autoChatRunner() {
  if (running) {
    console.log("[AutoChat] already running")
    return
  }

  const mode = getPageMode()

  if (mode === "unsupported") {
    console.warn("[AutoChat] unsupported URL:", location.href)
    return
  }

  running = true
  stopRequested = false

  try {
    if (mode === "homepage") {
      await runHomepageAutoChat()
      return
    }

    if (mode === "jobpage") {
      await runJobPageAutoChat()
    }
  } catch (error) {
    console.error("[AutoChat] error", error)
  } finally {
    running = false
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "START_AUTO_CHAT") {
    void autoChatRunner()
    sendResponse({ ok: true })
    return true
  }

  if (msg?.type === "STOP_AUTO_CHAT") {
    stopRequested = true
    sendResponse({ ok: true })
    return true
  }
})
