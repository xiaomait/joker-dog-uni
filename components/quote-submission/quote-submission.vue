<template>
  <view class="quote-submission">
    <button class="submission-toggle" @tap="openSubmission">
      <text class="submission-toggle__mark">+</text>
      <text>投稿</text>
    </button>

    <view v-if="submissionVisible" class="submission-mask">
      <view class="submission-dialog" role="dialog" aria-label="投稿语录">
        <view class="submission-dialog__header">
          <view>
            <text class="submission-dialog__eyebrow">READER'S NOTE</text>
            <text class="submission-dialog__title">投递你的语录</text>
          </view>
          <button
            class="submission-dialog__close"
            :disabled="submitting"
            aria-label="关闭投稿弹窗"
            @tap="closeSubmission"
          >
            ×
          </button>
        </view>

        <view class="submission-form">
          <label class="submission-field">
            <text class="submission-field__label">你的名称</text>
            <input
              v-model="submissionForm.userName"
              class="submission-field__control"
              type="text"
              maxlength="30"
              placeholder="怎么称呼你？"
              :disabled="submitting"
            />
          </label>

          <label class="submission-field">
            <text class="submission-field__label">投稿内容</text>
            <textarea
              v-model="submissionForm.content"
              class="submission-field__control submission-field__textarea"
              maxlength="500"
              placeholder="写下你想投稿的内容……"
              :disabled="submitting"
            />
            <text class="submission-field__count">
              {{ submissionForm.content.length }}/500
            </text>
          </label>

          <view class="submission-field submission-captcha">
            <text class="submission-field__label">验证码</text>
            <view class="submission-captcha__row">
              <input
                v-model="submissionForm.verifyCode"
                class="submission-field__control submission-captcha__input"
                type="text"
                maxlength="12"
                placeholder="请输入验证码"
                :disabled="submitting"
              />
              <image
                v-if="captchaImage"
                class="submission-captcha__image"
                :src="captchaImage"
                mode="aspectFit"
                aria-label="验证码，点击刷新"
                @tap="refreshCaptcha"
              />
              <button
                v-else
                class="submission-captcha__image submission-captcha__image--empty"
                :disabled="captchaLoading || submitting"
                @tap="refreshCaptcha"
              >
                {{ captchaLoading ? "加载中" : "点击加载" }}
              </button>
            </view>
            <text class="submission-captcha__hint">看不清？点击图片换一张</text>
          </view>

          <view class="submission-warning">
            <text class="submission-warning__sign">!</text>
            <text>请勿多次重复提交或发布辱骂内容，违规行为将封禁 IP。</text>
          </view>

          <text v-if="submissionError" class="submission-error">
            {{ submissionError }}
          </text>

          <view class="submission-form__actions">
            <button
              class="btn btn--light submission-form__button"
              :disabled="submitting"
              @tap="closeSubmission"
            >
              取消
            </button>
            <button
              class="btn submission-form__button"
              :loading="submitting"
              :disabled="submitting"
              @tap="submitContribution"
            >
              {{ submitting ? "正在投递" : "确认投稿" }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue"
import Message from "@/components/message"
import { getCaptcha, submitMessageAudit } from "@/request"

const submitting = ref(false)
const captchaLoading = ref(false)
const captchaImage = ref("")
const captchaId = ref("")
const submissionVisible = ref(false)
const submissionError = ref("")
const submissionForm = ref({
  userName: "",
  content: "",
  verifyCode: ""
})

function openSubmission() {
  submissionError.value = ""
  submissionVisible.value = true
  refreshCaptcha()
}

function closeSubmission() {
  if (submitting.value) {
    return
  }

  submissionVisible.value = false
  submissionError.value = ""
}

async function refreshCaptcha(force = false) {
  if (captchaLoading.value || (submitting.value && !force)) {
    return
  }

  captchaLoading.value = true
  try {
    const response = await getCaptcha()
    const captcha = response?.data || {}
    captchaId.value = captcha.captchaId || ""
    captchaImage.value = captcha.data || ""
    submissionForm.value.verifyCode = ""
    if (!captchaId.value || !captchaImage.value) {
      throw new Error("验证码响应缺少必要字段")
    }
  } catch (error) {
    console.error("验证码加载失败", error)
    captchaId.value = ""
    captchaImage.value = ""
    submissionError.value = "验证码加载失败，请点击重试。"
  } finally {
    captchaLoading.value = false
  }
}

async function submitContribution() {
  if (submitting.value) {
    return
  }

  const userName = submissionForm.value.userName.trim()
  const content = submissionForm.value.content.trim()

  if (!userName) {
    submissionError.value = "请填写你的名称。"
    return
  }

  if (!content) {
    submissionError.value = "请填写投稿内容。"
    return
  }

  const verifyCode = submissionForm.value.verifyCode.trim()
  if (!captchaId.value || !captchaImage.value) {
    submissionError.value = "验证码尚未加载，请点击验证码区域重试。"
    refreshCaptcha()
    return
  }

  if (!verifyCode) {
    submissionError.value = "请输入验证码。"
    return
  }

  submitting.value = true
  submissionError.value = ""

  try {
    await submitMessageAudit({
      userName,
      content,
      captchaId: captchaId.value,
      verifyCode
    })
    submissionForm.value = { userName: "", content: "", verifyCode: "" }
    captchaId.value = ""
    captchaImage.value = ""
    submissionVisible.value = false
    Message.success("投稿成功，等待审核")
  } catch (error) {
    console.error("投稿失败", error)
    await refreshCaptcha(true)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.quote-submission {
  width: 0;
  height: 0;
  flex: 0 0 0;
  color: #111;
  font-family: "STKaiti", "KaiTi", "Kaiti SC", "FangSong", serif;
}

.submission-toggle {
  position: fixed;
  top: calc(18px + var(--music-top));
  right: calc(18px + var(--safe-right));
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 88px;
  margin: 0;
  padding: 11px 17px 10px 13px;
  border: 3px solid #111;
  border-radius: 999px;
  background: #fff;
  color: #111;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 6px 6px 0 #111;

  &::after {
    border: none;
  }

  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #111;
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 19px;
    font-weight: 400;
    line-height: 22px;
  }
}

/* #ifdef MP-WEIXIN */
.submission-toggle {
  top: calc(12px + var(--safe-nav-top));
}
/* #endif */

.submission-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(22px + var(--safe-top)) calc(16px + var(--safe-right))
    calc(22px + var(--safe-bottom)) calc(16px + var(--safe-left));
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.58);
}

.submission-dialog {
  width: min(560px, 100%);
  max-height: 100%;
  overflow-y: auto;
  border: 3px solid #111;
  border-radius: 18px;
  background: #fff;
  box-shadow: 10px 10px 0 #111;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 22px 17px;
    border-bottom: 2px dashed #111;
  }

  &__eyebrow,
  &__title {
    display: block;
  }

  &__eyebrow {
    margin-bottom: 5px;
    font-family: "Courier New", "SFMono-Regular", monospace;
    font-size: 11px;
    letter-spacing: 1.6px;
  }

  &__title {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__close {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    margin: 0;
    padding: 0;
    border: 2px solid #111;
    border-radius: 50%;
    background: #fff;
    color: #111;
    font-family: Arial, sans-serif;
    font-size: 28px;
    line-height: 36px;

    &::after {
      border: none;
    }
  }
}

.submission-form {
  padding: 20px 22px 22px;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }

  &__button {
    flex: 1;
    margin: 0;
  }
}

.submission-field {
  position: relative;
  display: block;
  margin-bottom: 16px;

  &__label {
    display: block;
    margin-bottom: 7px;
    font-size: 16px;
    font-weight: 700;
  }

  &__control {
    width: 100%;
    height: 46px;
    padding: 0 13px;
    border: 2px solid #111;
    border-radius: 10px;
    box-sizing: border-box;
    background: #f7f7f7;
    color: #111;
    font-family: inherit;
    font-size: 16px;
  }

  &__textarea {
    height: 136px;
    padding-top: 12px;
    padding-bottom: 30px;
    line-height: 1.5;
  }

  &__count {
    position: absolute;
    right: 11px;
    bottom: 9px;
    color: #777;
    font-family: "Courier New", "SFMono-Regular", monospace;
    font-size: 11px;
  }
}

.submission-captcha {
  margin-bottom: 16px;

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__input {
    flex: 1;
    min-width: 0;
  }

  &__image {
    flex: 0 0 150px;
    width: 150px;
    height: 45px;
    overflow: hidden;
    border: 2px solid #111;
    border-radius: 8px;
    box-sizing: border-box;
    background: #f7f7f7;
  }

  &__image--empty {
    margin: 0;
    padding: 0 8px;
    color: #111;
    font-family: inherit;
    font-size: 13px;
    line-height: 41px;

    &::after {
      border: none;
    }
  }

  &__hint {
    display: block;
    margin-top: 5px;
    color: #777;
    font-size: 12px;
  }
}

.submission-warning {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  border: 2px solid #111;
  border-radius: 10px;
  background: repeating-linear-gradient(
    -45deg,
    #fff4bf,
    #fff4bf 8px,
    #ffe98b 8px,
    #ffe98b 16px
  );
  font-size: 14px;
  line-height: 1.5;

  &__sign {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 21px;
    height: 21px;
    border-radius: 50%;
    background: #111;
    color: #fff;
    font-family: Arial, sans-serif;
    font-weight: 700;
    line-height: 1;
  }
}

.submission-error {
  display: block;
  margin-top: 10px;
  color: #9b111e;
  font-size: 14px;
  font-weight: 700;
}

.btn {
  margin: 0;
  padding: 10px 18px;
  border: 2px solid #000;
  border-radius: 999px;
  background: #000;
  color: #fff;
  font-family: inherit;
  font-size: 18px;
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

@media (max-width: 560px) {
  .submission-toggle {
    top: calc(16px + var(--music-top));
    right: calc(14px + var(--safe-right));
    min-width: 82px;
    padding: 10px 14px 9px 11px;
    border-width: 2px;
    font-size: 16px;
    box-shadow: 5px 5px 0 #111;
  }

  /* #ifdef MP-WEIXIN */
  .submission-toggle {
    top: calc(10px + var(--safe-nav-top));
  }
  /* #endif */

  .submission-dialog {
    border-width: 2px;
    border-radius: 14px;
    box-shadow: 7px 7px 0 #111;

    &__header {
      padding: 18px 17px 14px;
    }

    &__title {
      font-size: 26px;
    }
  }

  .submission-form {
    padding: 17px;
  }

  .submission-captcha {
    &__row {
      align-items: stretch;
    }

    &__image {
      flex-basis: 120px;
      width: 120px;
    }
  }
}
</style>
