<template>
  <view class="typewriter-text">
    <text>{{ displayedText }}</text>
    <text v-if="showCursor" class="typewriter-text__cursor">{{ cursorChar }}</text>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue"

const props = defineProps({
  text: {
    type: String,
    default: ""
  },
  minDelay: {
    type: Number,
    default: 35
  },
  maxDelay: {
    type: Number,
    default: 55
  },
  longTextThreshold: {
    type: Number,
    default: 80
  },
  cursorChar: {
    type: String,
    default: "|"
  },
  cursorBlinkInterval: {
    type: Number,
    default: 500
  }
})

const displayedText = ref("")
const showCursor = ref(true)

let typingTimer = null
let cursorTimer = null

const typingDelay = computed(() => {
  const normalizedMinDelay = Math.max(0, props.minDelay)
  const normalizedMaxDelay = Math.max(normalizedMinDelay, props.maxDelay)

  if ((props.text || "").length > props.longTextThreshold) {
    return normalizedMinDelay
  }

  return normalizedMaxDelay
})

function clearTypingAnimation() {
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
}

function clearCursorAnimation() {
  if (cursorTimer) {
    clearInterval(cursorTimer)
    cursorTimer = null
  }
}

function startCursorAnimation() {
  clearCursorAnimation()
  showCursor.value = true

  if (props.cursorBlinkInterval <= 0) {
    return
  }

  cursorTimer = setInterval(() => {
    showCursor.value = !showCursor.value
  }, props.cursorBlinkInterval)
}

function startTypingAnimation(text) {
  const fullText = String(text || "")
  clearTypingAnimation()
  startCursorAnimation()
  displayedText.value = ""

  if (!fullText) {
    return
  }

  if (typingDelay.value <= 0) {
    displayedText.value = fullText
    return
  }

  let index = 0
  typingTimer = setInterval(() => {
    index += 1
    displayedText.value = fullText.slice(0, index)

    if (index >= fullText.length) {
      clearTypingAnimation()
      showCursor.value = true
    }
  }, typingDelay.value)
}

watch(
  () => props.text,
  (value) => {
    startTypingAnimation(value)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTypingAnimation()
  clearCursorAnimation()
})
</script>

<style lang="scss" scoped>
.typewriter-text {
  white-space: pre-wrap;
  word-break: break-all;

  &__cursor {
    display: inline-block;
    margin-left: 2px;
    font-weight: 700;
    animation: typewriter-cursor-blink 1s steps(1) infinite;
  }
}

@keyframes typewriter-cursor-blink {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}
</style>
