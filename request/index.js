import request from "@/utils/request"

export function getDogMessage() {
  return request({
    url: "/api/message/dog",
    method: "get"
  })
}

export function getCaptcha() {
  return request({
    url: "/api/base/captcha?height=45&width=150&color=%232c3142",
    method: "get"
  })
}

export function submitMessageAudit(data) {
  return request({
    url: "/api/message/audit",
    method: "post",
    data
  })
}
