#### usage

```javascript
axios.request(config)
axios.request(url, config)
axios.get(url, config)
axios.post(url, data, config)
```

#### achieve

```javascript
// /src/core/Axios.js
function Axios(instanceConfig) {
  // 实例属性，记录传入的配置项
  this.defaults = instanceConfig
}

// 挂载 request 方法
Axios.prototype.request = function () {
  console.log('Axios.prototype.request')
}

// 挂载 delete get head options 方法
Array.prototype.forEach.call(
  ['delete', 'get', 'head', 'options'],
  method => {
    Axios.prototype[method] = function(url, config) {
      console.log('Axios.prototype.' + method)
    }
})

// 挂载 post put patch 方法
Array.prototype.forEach.call(
  ['post', 'put', 'patch'],
  method => {
    Axios.prototype[method] = function(url, data, config) {
      console.log('Axios.prototype.' + method)
    }
})

export default Axios
```