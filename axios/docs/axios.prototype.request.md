#### usage

```javascript
axios.request('http://127.0.0.1:3001', {
  method: 'post',
  params: { id: 123 },
  data: { user: 'xiaoming', password: 123456 },
  headers: { token: 'admin-token' }
}).then(res => {
  console.log(res)
})

// or

axios.request({
  url: 'http://127.0.0.1:3001',
  method: 'post',
  params: { id: 123 },
  data: { user: 'xiaoming', password: 123456 },
  headers: { token: 'admin-token' }
}).then(res => {
  console.log(res)
})
```

#### achieve

```javascript
// /src/core/Axios.js
Axios.prototype.request = function (configOrUrl, config) {
  if (typeof configOrUrl === 'string') {
    config = config || {}
    config.url = configOrUrl
  } else {
    config = configOrUrl || {}
  }

  // 合并配置项
  config = mergeConfig(this.defaults, config)

  // 设置请求方法
  if (config.method) {
    config.method = config.method.toLowerCase()
  } else if (this.defaults.method) {
    // axios.create({ method: 'post' }) 创建实例时传入的 method
    config.method = this.defaults.method.toLowerCase()
  } else {
    config.method = 'get'
  }

  let promise

  try {
    // 触发请求，返回promise类型
    promise = dispatchRequest(config)
  } catch (error) {
    return Promise.reject(error)
  }

  return promise
}
```
