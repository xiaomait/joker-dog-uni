import Message from "@/components/message"

function request(params) {
  const url = params.url
  const method = params.method || "get"
  const data = params.data || {}
  const timeout = params.timeout || 9000
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      timeout,
      success: (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        if (response.data?.code === 1000) {
          resolve(response.data)
          return
        }

        Message.error(response.data?.message || "请求失败，请稍后重试")
        reject(response.data || new Error("请求失败"))
      },
      fail: reject
    })
  })
}

export default request
