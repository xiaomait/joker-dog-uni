<template>
  <view class="page" :style="safeAreaStyle">
    <view
      class="music-toggle"
      :class="{ 'is-playing': isPlaying }"
      @tap="toggleMusic"
    >
      <image
        class="music-toggle__icon"
        :src="isPlaying ? playIcon : pauseIcon"
        mode="aspectFit"
      />
    </view>

    <view class="card">
      <view class="stamp">舔狗日记</view>

      <view class="card__header">
        <text class="badge">DAILY DOG DIARY</text>
        <text class="title">每日舔狗语录</text>
        <text class="subtitle">今天也要深情且稳定地发疯。</text>
      </view>

      <view class="hero">
        <image class="hero__img" :src="heroImage" mode="aspectFit" />
      </view>

      <view class="quote-wrap">
        <view class="quote-wrap__bar"></view>
        <text class="quote-label">今日语录</text>
        <view class="quote">
          <typewriter-text :text="quoteText" />
        </view>
      </view>

      <view class="actions">
        <view class="actions__row">
          <button class="btn" :disabled="loading" @tap="loadQuote">
            再舔一句
          </button>
          <button
            class="btn btn--light"
            :disabled="saving"
            @tap="saveQuoteAsImage"
          >
            保存成图片
          </button>
        </view>
        <text
          :class="['status', statusLevel ? `status--${statusLevel}` : '']"
          >{{ statusText }}</text
        >
      </view>
    </view>

    <canvas
      canvas-id="quoteCanvas"
      id="quoteCanvas"
      class="share-canvas"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
    />
  </view>
</template>

<script setup>
import { computed, nextTick, ref } from "vue"
import { onLoad, onReady, onUnload } from "@dcloudio/uni-app"
import { endpoints, offlineQuotes } from "@/config"
import {
  fetchWithTimeout,
  pickOfflineQuote,
  saveQuoteAsImage as exportQuoteAsImage
} from "@/utils"

const systemInfo = uni.getSystemInfoSync()
const safeAreaInsets = systemInfo.safeAreaInsets || {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

let menuButtonRect = null

// #ifdef MP-WEIXIN
menuButtonRect = uni.getMenuButtonBoundingClientRect()
// #endif

const safeAreaStyle = computed(() => ({
  "--safe-top": `${safeAreaInsets.top || 0}px`,
  "--safe-right": `${safeAreaInsets.right || 0}px`,
  "--safe-bottom": `${safeAreaInsets.bottom || 0}px`,
  "--safe-left": `${safeAreaInsets.left || 0}px`,
  "--safe-nav-top": `${menuButtonRect?.bottom || safeAreaInsets.top || 0}px`,
  "--music-top": `${menuButtonRect?.top || safeAreaInsets.top || 0}px`
}))

const quoteText = ref("正在加载今天的深情发言...")
const statusText = ref("初始化中...")
const statusLevel = ref("")
const loading = ref(false)
const saving = ref(false)
const isPlaying = ref(false)
const heroImage = ref("/static/doutub_img.png")
const playIcon = ref("/static/musicfill.svg")
const pauseIcon = ref("/static/musicforbidfill.svg")
const canvasWidth = ref(900)
const canvasHeight = ref(1200)
const audioContext = ref(null)

function setStatus(message, level = "") {
  statusText.value = message
  statusLevel.value = level
}

function setMusicState(playing) {
  isPlaying.value = playing
}

function initAudio() {
  const innerAudioContext = uni.createInnerAudioContext()
  innerAudioContext.src = "/static/lei.mp3"
  innerAudioContext.loop = true
  innerAudioContext.autoplay = false
  innerAudioContext.onPlay(() => {
    setMusicState(true)
  })
  innerAudioContext.onPause(() => {
    setMusicState(false)
  })
  innerAudioContext.onStop(() => {
    setMusicState(false)
  })
  innerAudioContext.onError(() => {
    setMusicState(false)
  })
  audioContext.value = innerAudioContext
}

function toggleMusic() {
  if (!audioContext.value) {
    return
  }

  if (isPlaying.value) {
    audioContext.value.pause()
    return
  }

  audioContext.value.play()
}

function tryAutoPlayMusic() {
  if (!audioContext.value) {
    return
  }

  audioContext.value.play()
}

function renderQuote(text) {
  quoteText.value = text
}

async function loadQuote() {
  if (loading.value) {
    return
  }

  loading.value = true
  setStatus("正在读取今日语录...")

  try {
    for (const endpoint of endpoints) {
      try {
        const quote = await fetchWithTimeout(endpoint.url)
        if (quote) {
          renderQuote(quote)
          statusText.value = "更新成功，继续保持深情。"
          statusLevel.value = "ok"
          return
        }
      } catch (error) {
        console.warn(`${endpoint.name} 获取失败`, error)
      }
    }

    renderQuote(pickOfflineQuote(offlineQuotes))
    setStatus("接口开小差了，已切换本地语录。", "warn")
  } finally {
    loading.value = false
  }
}

async function saveQuoteAsImage() {
  if (saving.value) {
    return
  }

  saving.value = true
  setStatus("正在生成图片...")

  try {
    const result = await exportQuoteAsImage({
      quoteText: quoteText.value,
      heroImage: heroImage.value,
      canvasWidth,
      canvasHeight,
      nextTick
    })
    setStatus(result.message, result.level)
  } catch (error) {
    console.error("导出失败", error)
    setStatus("导出失败，请稍后重试。", "warn")
  } finally {
    saving.value = false
  }
}

onLoad(() => {
  initAudio()
  loadQuote()
})

onReady(() => {
  tryAutoPlayMusic()
})

onUnload(() => {
  if (audioContext.value) {
    audioContext.value.destroy()
    audioContext.value = null
  }
})
</script>

<style lang="scss" scoped>
.page {
  --safe-top: 0px;
  --safe-right: 0px;
  --safe-bottom: 0px;
  --safe-left: 0px;
  --safe-nav-top: 0px;
  --music-top: 0px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(24px + var(--safe-top)) calc(14px + var(--safe-right))
    calc(24px + var(--safe-bottom)) calc(14px + var(--safe-left));
  box-sizing: border-box;
  position: relative;
  color: #111;
  font-family: "STKaiti", "KaiTi", "Kaiti SC", "FangSong", serif;
  background:
    radial-gradient(circle at 12% 20%, #fff 0 18%, transparent 18%),
    radial-gradient(circle at 90% 10%, #dcdcdc 0 24%, transparent 24%),
    radial-gradient(circle at 80% 85%, #d7d7d7 0 22%, transparent 22%), #ececec;
  background-attachment: fixed;
}

/* #ifdef H5 */
.page {
  padding: calc(24px + env(safe-area-inset-top))
    calc(14px + env(safe-area-inset-right))
    calc(24px + env(safe-area-inset-bottom))
    calc(14px + env(safe-area-inset-left));
}
/* #endif */

/* #ifdef MP-WEIXIN */
.page {
  padding: calc(16px + var(--safe-nav-top)) calc(20px + var(--safe-right))
    calc(24px + var(--safe-bottom)) calc(20px + var(--safe-left));
}
/* #endif */

.card {
  position: relative;
  width: min(760px, 100%);
  background: #fff;
  border: 3px solid #1f1f1f;
  border-radius: 18px;
  box-shadow:
    0 12px 0 #000,
    0 24px 36px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.stamp {
  position: absolute;
  right: 5px;
  top: 20px;
  transform: rotate(20deg);
  font-size: 12px;
  letter-spacing: 2px;
  padding: 6px 10px;
  color: #fff;
  background: #000;
  border: 2px solid #fff;
  z-index: 2;
}

.card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 26px 18px 14px;
  border-bottom: 2px dashed #1f1f1f;
}

.badge {
  font-family: "Courier New", "SFMono-Regular", monospace;
  font-size: 12px;
  letter-spacing: 2px;
}

.title {
  margin: 8px 0 6px;
  font-size: 44px;
  line-height: 1.1;
  font-weight: 700;
}

.subtitle {
  font-size: 17px;
  color: #666;
}

.hero {
  display: flex;
  justify-content: center;
  padding: 18px 16px 6px;
}

.hero__img {
  width: min(330px, 78%);
  height: 330px;
  border: 3px solid #111;
  border-radius: 14px;
  background: #f6f6f6;
  box-shadow: 8px 8px 0 #111;
  transform: rotate(-1deg);
}

.quote-wrap {
  position: relative;
  margin: 14px 18px 8px;
  border: 2px solid #111;
  border-radius: 14px;
  padding: 14px 14px 12px 20px;
  background: #fff;

  &__bar {
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 100%;
    background: #000;
    border-radius: 12px 0 0 12px;
  }
}

.quote-label {
  display: block;
  margin-bottom: 8px;
  font-family: "Courier New", "SFMono-Regular", monospace;
  font-size: 12px;
  letter-spacing: 1.2px;
}

.quote {
  font-size: 28px;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 18px 20px;
}

.actions__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  margin: 0;
  padding: 10px 18px;
  border: 2px solid #000;
  border-radius: 999px;
  background: #000;
  color: #fff;
  font-size: 18px;
  font-family: inherit;
  line-height: 1.2;
  box-shadow: 0 4px 0 #3b3b3b;

  &::after {
    border: none;
  }

  &[disabled] {
    opacity: 0.6;
  }
}

.btn--light {
  background: #fff;
  color: #111;
  box-shadow: 0 4px 0 #8e8e8e;
}

.status {
  min-height: 1.2em;
  font-size: 14px;
  color: #666;

  &--ok {
    color: #0f7a2a;
  }

  &--warn {
    color: #9b111e;
  }
}

.music-toggle {
  position: fixed;
  top: calc(18px + var(--music-top));
  left: calc(18px + var(--safe-left));
  z-index: 10;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #111;
  border-radius: 50%;
  background: #fff;
  box-shadow: 6px 6px 0 #111;

  &__icon {
    width: 28px;
    height: 28px;
  }

  &.is-playing .music-toggle__icon {
    animation: music-spin 2.6s linear infinite;
  }
}

.share-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
}

@keyframes music-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .page {
    padding: calc(72px + var(--safe-top)) calc(14px + var(--safe-right))
      calc(24px + var(--safe-bottom)) calc(14px + var(--safe-left));
  }

  /* #ifdef H5 */
  .page {
    padding: calc(72px + env(safe-area-inset-top))
      calc(14px + env(safe-area-inset-right))
      calc(24px + env(safe-area-inset-bottom))
      calc(14px + env(safe-area-inset-left));
  }
  /* #endif */

  /* #ifdef MP-WEIXIN */
  .page {
    padding: calc(12px + var(--safe-nav-top)) calc(16px + var(--safe-right))
      calc(24px + var(--safe-bottom)) calc(16px + var(--safe-left));
  }
  /* #endif */

  .card {
    border-width: 2px;
    border-radius: 14px;
    box-shadow:
      0 8px 0 #000,
      0 16px 24px rgba(0, 0, 0, 0.14);
  }

  .stamp {
    right: 0;
    top: 12px;
    font-size: 11px;
  }

  .title {
    font-size: 34px;
  }

  .subtitle {
    font-size: 15px;
  }

  .hero__img {
    width: min(330px, 78vw);
    height: 300px;
  }

  .quote {
    font-size: 24px;
  }
}
</style>
