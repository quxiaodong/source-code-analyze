```javascript
// /src/adapters/xhr.js
const xhrAdapter = config => {
  return new Promise((resolve, reject) => {
    // 请求体
    const requestData = config.data
    // 请求头信息
    const requestHeaders = config.headers
    // 响应类型
    const responseType = config.responseType
    // 不带参数的请求地址
    const fullPath = buildFullPath(config.baseURL, config.url)
    // 带参数的请求地址
    const fullURL = buildURL(fullPath, config.params, config.paramsSerializer)
    // 创建xhr实例
    let request = new XMLHttpRequest()

    // http://127.0.0.1:3001 调试地址
    request.open(config.method.toUpperCase(), 'http://127.0.0.1:3001', true)

    // 添加请求头信息，必须在 request.open 之后
    if ('setRequestHeader' in request) {
      Object.keys(requestHeaders).forEach(key => {
        request.setRequestHeader(key, requestHeaders[key])
      })
    }

    const onloadend = () => { // 请求完成，不管成功还是失败，都会执行
      request = null
    }

    const onload = () => { // 请求成功
      const responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response

      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText
      }

      resolve(response)
    }

    const onabort = () => { // 请求取消
      reject()
    }

    const onerror = () => { // 请求错误
      reject()
    }

    const ontimeout = () => { // 请求延迟
      reject()
    }

    request.timeout = config.timeout
    request.onloadend = onloadend
    request.onload = onload
    request.onabort = onabort
    request.onerror = onerror
    request.ontimeout = ontimeout

    // 监听下载进度
    if (typeof config.onDownloadProgress === 'function') {
      request.onprogress = config.onDownloadProgress
    }

    // 监听上传进度
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.onprogress = config.onUploadProgress
    }

    // 发送请求
    request.send(requestData)
  })
}

export default xhrAdapter
```