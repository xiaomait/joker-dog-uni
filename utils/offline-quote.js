const offlineQuotes = [
  "今天你回了我一个句号，我已经脑补到我们婚后冷静期了。",
  "你一句在吗，我连孩子上哪所小学都想好了。",
  "她说先忙，我说好，她忙了三年我还在等。",
  "我不是舔狗，我只是对你有持续且稳定的服务意识。",
  "你晒太阳，我晒聊天记录，大家都挺暖和。"
]

export function getOfflineQuote() {
  const idx = Math.floor(Math.random() * offlineQuotes.length)

  return {
    userName: "不愿透漏姓名",
    content: offlineQuotes[idx]
  }
}
