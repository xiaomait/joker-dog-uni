<template>
  <view
    :class="[
      'app-message',
      `app-message--${messageState.type}`,
      { 'app-message--visible': messageState.visible }
    ]"
    role="status"
    aria-live="polite"
  >
    <view class="app-message__mark" aria-hidden="true">
      <text>{{ statusMark }}</text>
    </view>
    <text class="app-message__text">{{ messageState.message }}</text>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount } from "vue"
import Message, { messageState } from "./index"

const statusMarks = {
  success: "✓",
  error: "×",
  warning: "!",
  info: "i"
}

const statusMark = computed(() => statusMarks[messageState.type] || "i")

onBeforeUnmount(() => {
  Message.close()
})
</script>

<style lang="scss" scoped>
.app-message {
  position: fixed;
  top: calc(14px + var(--safe-nav-top, 0px));
  left: 50%;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 32px);
  min-height: 48px;
  padding: 9px 16px 9px 10px;
  border: 2px solid #111;
  border-radius: 14px;
  box-sizing: border-box;
  background: #fff;
  color: #111;
  font-family: "STKaiti", "KaiTi", "Kaiti SC", "FangSong", serif;
  box-shadow: 6px 6px 0 #111;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, -12px) scale(0.98);
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    visibility 0s linear 180ms;

  &--visible {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0) scale(1);
    transition-delay: 0s;
  }

  &__mark {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 2px solid #111;
    border-radius: 50%;
    background: #dcecff;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  &__text {
    min-width: 0;
    word-break: break-all;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.35;
  }

  &--success &__mark {
    background: #dff4d8;
  }

  &--error &__mark {
    background: #ffd9dd;
  }

  &--warning &__mark {
    background: #ffe98b;
  }
}

@media (max-width: 560px) {
  .app-message {
    max-width: calc(100vw - 28px);
    min-height: 44px;
    padding: 8px 13px 8px 8px;
    border-radius: 12px;
    box-shadow: 5px 5px 0 #111;

    &__mark {
      width: 25px;
      height: 25px;
      font-size: 16px;
    }

    &__text {
      font-size: 15px;
    }
  }
}
</style>
