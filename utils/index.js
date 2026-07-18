import QRCode from "qrcode"

function wrapTextLines(ctx, text, maxWidth) {
  const lines = []
  const paragraphs = String(text || "").split("\n")

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }

    let currentLine = ""
    for (const char of paragraph) {
      const testLine = currentLine + char
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines.length > 0 ? lines : [""]
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0)
  ctx.lineTo(x + width, y + height - r)
  ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
  ctx.lineTo(x + r, y + height)
  ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  ctx.closePath()
}

function getImageInfo(src) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: resolve,
      fail: reject
    })
  })
}

function normalizeCanvasImageSrc(src, fallback = "") {
  if (!src) {
    return fallback
  }

  if (/^(https?:|wxfile:|file:|data:|blob:)/.test(src)) {
    return src
  }

  if (src.startsWith("/")) {
    return src
  }

  if (src.startsWith("./")) {
    return `/${src.slice(2)}`
  }

  return `/${src}`
}

function canvasToTempFilePath(canvasId, width, height) {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvasId,
      fileType: "png",
      width,
      height,
      destWidth: width,
      destHeight: height,
      success: resolve,
      fail: reject
    })
  })
}

function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
      fail: reject
    })
  })
}

function downloadTempFile(tempFilePath, fileName) {
  const link = document.createElement("a")
  link.href = tempFilePath
  link.download = fileName
  link.click()
}

async function createQrCodeImage(url) {
  if (!url) {
    return ""
  }

  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180
  })
}

export async function saveQuoteAsImage({
  quoteText,
  heroImage,
  qrCodeUrl,
  canvasWidth,
  canvasHeight,
  nextTick,
  canvasId = "quoteCanvas"
}) {
  const currentQuoteText = (quoteText || "").trim() || "今天也要深情发言。"
  const width = 900
  const outerPadding = 44
  const cardPadding = 42
  const imageSize = 260
  const qrCodeSize = 60
  const cardWidth = width - outerPadding * 2
  const quoteBoxWidth = cardWidth - cardPadding * 2
  const quoteTextInsetX = 22
  const quoteTextRightPadding = 20

  let quoteFontSize = 38
  if (currentQuoteText.length > 150) {
    quoteFontSize = 30
  } else if (currentQuoteText.length > 100) {
    quoteFontSize = 34
  }

  const context = uni.createCanvasContext(canvasId)
  context.setFontSize(quoteFontSize)
  context.font = `${quoteFontSize}px serif`

  const quoteLines = wrapTextLines(
    context,
    currentQuoteText,
    quoteBoxWidth - quoteTextInsetX - quoteTextRightPadding
  )
  const quoteLineHeight = Math.round(quoteFontSize * 1.45)
  const quoteTopPadding = Math.round(quoteFontSize * 1.15)
  const quoteBlockHeight = quoteLines.length * quoteLineHeight
  const height =
    outerPadding * 2 + 140 + imageSize + 56 + quoteBlockHeight + 110

  canvasWidth.value = width
  canvasHeight.value = height

  await nextTick()

  context.setFillStyle("#ececec")
  context.fillRect(0, 0, width, height)

  drawRoundRect(
    context,
    outerPadding,
    outerPadding,
    width - outerPadding * 2,
    height - outerPadding * 2,
    24
  )
  context.setFillStyle("#ffffff")
  context.fill()
  context.setStrokeStyle("#111111")
  context.setLineWidth(6)
  context.stroke()

  const cardX = outerPadding
  const cardY = outerPadding
  context.setFillStyle("#111111")
  context.setFontSize(22)
  context.fillText("DAILY DOG DIARY", cardX + cardPadding, cardY + 42)
  context.setFontSize(58)
  context.fillText("每日舔狗语录", cardX + cardPadding, cardY + 112)

  const imageX = cardX + (cardWidth - imageSize) / 2
  const imageY = cardY + 136
  try {
    const imageInfo = await getImageInfo(heroImage)
    const imageSrc = normalizeCanvasImageSrc(
      imageInfo.path || imageInfo.tempFilePath,
      normalizeCanvasImageSrc(heroImage)
    )
    context.drawImage(imageSrc, imageX, imageY, imageSize, imageSize)
  } catch (error) {
    console.warn("图片读取失败", error)
    context.setFontSize(28)
    context.fillText("舔狗日记", imageX + 76, imageY + imageSize / 2 + 10)
  }

  if (qrCodeUrl) {
    try {
      const qrCodeDataUrl = await createQrCodeImage(qrCodeUrl)
      const qrCodeInfo = await getImageInfo(qrCodeDataUrl)
      const qrCodeSrc = normalizeCanvasImageSrc(
        qrCodeInfo.path || qrCodeInfo.tempFilePath,
        qrCodeDataUrl
      )
      // 二维码外框与上方语录框的右边缘对齐。
      const qrCodeX = width - outerPadding - cardPadding - qrCodeSize - 5
      const qrCodeY = height - outerPadding - qrCodeSize - 14

      context.setFillStyle("#ffffff")
      context.fillRect(
        qrCodeX - 6,
        qrCodeY - 6,
        qrCodeSize + 12,
        qrCodeSize + 12
      )
      context.setStrokeStyle("#111111")
      context.setLineWidth(2)
      context.strokeRect(
        qrCodeX - 6,
        qrCodeY - 6,
        qrCodeSize + 12,
        qrCodeSize + 12
      )
      context.drawImage(qrCodeSrc, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize)
    } catch (error) {
      console.warn("二维码生成失败", error)
    }
  }

  const quoteBoxX = cardX + cardPadding
  const quoteBoxY = imageY + imageSize + 26
  const quoteBoxHeight = quoteBlockHeight + Math.round(quoteFontSize * 0.9)
  context.setFillStyle("#ffffff")
  context.fillRect(quoteBoxX, quoteBoxY, quoteBoxWidth, quoteBoxHeight)
  context.setStrokeStyle("#111111")
  context.setLineWidth(3)
  context.strokeRect(quoteBoxX, quoteBoxY, quoteBoxWidth, quoteBoxHeight)
  context.setFillStyle("#111111")
  context.fillRect(quoteBoxX, quoteBoxY, 8, quoteBoxHeight)

  context.setFontSize(quoteFontSize)
  quoteLines.forEach((line, index) => {
    const y = quoteBoxY + quoteTopPadding + index * quoteLineHeight
    context.fillText(line, quoteBoxX + quoteTextInsetX, y)
  })

  context.setFontSize(20)
  context.setFillStyle("#555555")
  const dateText = new Date().toLocaleDateString("zh-CN")
  context.fillText(
    `Generated at ${dateText}`,
    quoteBoxX,
    height - outerPadding - 24
  )

  await new Promise((resolve) => {
    context.draw(false, resolve)
  })

  const result = await canvasToTempFilePath(
    canvasId,
    canvasWidth.value,
    canvasHeight.value
  )
  const fileDate = new Date().toISOString().slice(0, 10)

  // #ifdef H5
  downloadTempFile(result.tempFilePath, `舔狗日记-${fileDate}.png`)
  return { message: "图片已生成，正在下载。", level: "ok" }
  // #endif

  // #ifndef H5
  await saveImageToAlbum(result.tempFilePath)
  return { message: "图片已保存到相册。", level: "ok" }
  // #endif
}
