import { reactive } from "vue"

const DEFAULT_DURATION = 2200
const messageTypes = new Set(["success", "error", "warning", "info"])

export const messageState = reactive({
  visible: false,
  message: "",
  type: "info"
})

let closeTimer = null

function clearCloseTimer() {
  if (closeTimer === null) {
    return
  }

  clearTimeout(closeTimer)
  closeTimer = null
}

function close() {
  clearCloseTimer()
  messageState.visible = false
}

function show(type, message, duration = DEFAULT_DURATION) {
  clearCloseTimer()

  messageState.type = messageTypes.has(type) ? type : "info"
  messageState.message = String(message ?? "")
  messageState.visible = true

  const displayDuration = Number.isFinite(duration)
    ? Math.max(0, duration)
    : DEFAULT_DURATION

  if (displayDuration > 0) {
    closeTimer = setTimeout(close, displayDuration)
  }
}

const Message = {
  show(options = {}) {
    show(options.type, options.message, options.duration)
  },
  success(message, duration) {
    show("success", message, duration)
  },
  error(message, duration) {
    show("error", message, duration)
  },
  warning(message, duration) {
    show("warning", message, duration)
  },
  info(message, duration) {
    show("info", message, duration)
  },
  close
}

export default Message
