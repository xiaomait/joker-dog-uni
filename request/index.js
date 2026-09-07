import request from "@/utils/request"

export function getDogMessage() {
  return request({
    url: "/app/message/audit/dog",
    method: "get"
  })
}

export function getCaptcha() {
  return request({
    url: "/app/base/comm/captcha?height=45&width=150&color=%232c3142",
    method: "get"
  })
}

export function submitMessageAudit(data) {
  return request({
    url: "/app/message/audit",
    method: "post",
    data
  })
}
