#### usage

```javascript
const source = axios.CancelToken.source()
axios.get('http://127.0.0.1:3001', {
  cancelToken: source.token
}).then(res => {
  console.log(res)
})
setTimeout(() => {
  source.cancel('cancel the request')
}, 3000)

// or

let cancel
axios.get('http://127.0.0.1:3001', {
  cancelToken: new axios.CancelToken(c => {
    cancel = c
  })
}).then(res => {
  console.log(res)
})
setTimeout(() => {
  cancel('cancel the request')
}, 3000)
```

#### achieve

```javascript
// /src/cancel/CancelToken.js
function CancelToken(executor) {
  let resolvePromise
  this.promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
  })

  executor(function cancel(message) {
    console.log(message)
    resolvePromise()
  })
}

CancelToken.source = function() {
  let cancel
  const token = new CancelToken(function(c) {
    cancel = c
  })
  return { token, cancel }
}

export default CancelToken
```

```javascript
// /src/index.js
import CancelToken from './cancel/CancelToken.js'

axios.CancelToken = CancelToken
```

```javascript
// /src/adapters/xhr.js
const xhrAdapter = config => {
  return new Promise((resolve, reject) => {
    // 取消请求
    if (config.cancelToken) {
      config.cancelToken.promise.then(() => {
        request.abort()
      })
    }
  })
}
```