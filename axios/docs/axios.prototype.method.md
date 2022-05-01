#### usage

```javascript
// delete options 可以携带Query String Parameters 和 Request Payload
// get head 只携带Query String Parameters
axios['delete' | 'get' | 'head' | 'options']('http://127.0.0.1:3001', {
  params: { id: 123 },
  data: { user: 'xiaoming', password: 123456 },
  headers: { token: 'admin-token' }
}).then(res => {
  console.log(res)
})

// post put patch 可以携带Query String Parameters 和 Request Payload
axios['post' | 'put' | 'patch']('http://127.0.0.1:3001', { user: 'xiaoming', password: 123456 }, {
  params: { id: 123 },
  headers: { token: 'admin-token' }
}).then(res => {
  console.log(res)
})
```

#### achieve

```javascript
// /src/core/Axios.js
Array.prototype.forEach.call(
  ['delete', 'get', 'head', 'options'],
  method => {
    Axios.prototype[method] = function(url, config = {}) {
      return this.request(mergeConfig(config, {
        method, url
      }))
    }
})

Array.prototype.forEach.call(
  ['post', 'put', 'patch'],
  method => {
  Axios.prototype[method] = function(url, data, config = {}) {
    return this.request(mergeConfig(config, {
      method, url, data
    }))
  }
})
```
