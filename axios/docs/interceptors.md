#### usage

```javascript
// request interceptor 1
axios.interceptors.request.use(config => { // 同步请求拦截器
  console.log('request interceptor resolve1')
  return config
}, error => {
  console.log('request interceptor reject1', error)
})

// request interceptor 2
axios.interceptors.request.use(config => { // 异步请求拦截器
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('request interceptor resolve2')
      resolve(config)
    }, 3000)
  })
}, error => {
  console.log('request interceptor reject2', error)
})

// response interceptor 1
axios.interceptors.response.use(response => { // 异步响应拦截器
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('response interceptor resolve1')
      resolve(response)
    }, 3000)
  })
}, error => {
  console.log('response interceptor reject 1')
})

// response interceptor 2
axios.interceptors.response.use(response => { // 同步响应拦截器
  console.log('response interceptor resolve2')
  return response
}, error => {
  console.log('response interceptor reject 2')
})

axios.get('http://127.0.0.1:3001').then(res => {
  console.log(res)
})

// 执行顺序：
// request interceptor resolve2
// request interceptor resolve1
// response interceptor resolve1
// response interceptor resolve2
```

#### achieve

```javascript
// /src/core/InterceptorManager.js
function InterceptorManager() {
  this.handlers = []
}

InterceptorManager.prototype.use = function(fulfilled, rejected) {
  this.handlers.push({ fulfilled, rejected })
  return this.handlers.length - 1 // 返回当前下标表示当前拦截器的id
}

InterceptorManager.prototype.eject = function(id) {
  if (this.handlers[id]) {
    // 因为拦截器id是以数组下标记录的
    // 所以不能使用splice来移除拦截器
    // 否则下标对应不上
    this.handlers[id] = null
  }
}

InterceptorManager.prototype.forEach = function(fn) {
  this.handlers.forEach(handler => {
    if (handler !== null) {
      fn(handler)
    }
  })
}

export default InterceptorManager
```

```javascript
// /src/core/Axios.js
import InterceptorManager from './InterceptorManager.js'

function Axios(instanceConfig) {
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }
}
```

```javascript
// /src/core/Axios.js
Axios.prototype.request = function (configOrUrl, config) {
  // 请求拦截器
  const requestInterceptorChain = []
  this.interceptors.request.forEach(interceptor => {
    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  // 响应拦截器
  const responseInterceptorChain = []
  this.interceptors.response.forEach(interceptor => {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected)
  })

  let chain = [dispatchRequest, undefined]

  // 先添加后执行的顺序添加请求拦截器
  Array.prototype.unshift.apply(chain, requestInterceptorChain)

  // 先添加先执行的顺序添加响应拦截器
  chain = chain.concat(responseInterceptorChain)

  let promise = Promise.resolve(config)
  while(chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }

  return promise
}
```
