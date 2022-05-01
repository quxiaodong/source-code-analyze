import mergeConfig from './mergeConfig.js'
import dispatchRequest from './dispatchRequest.js'
import InterceptorManager from './InterceptorManager.js'

function Axios(instanceConfig) {
  this.defaults = instanceConfig
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }
}

Axios.prototype.request = function (configOrUrl, config) {
  if (typeof configOrUrl === 'string') {
    config = config || {}
    config.url = configOrUrl
  } else {
    config = configOrUrl || {}
  }

  config = mergeConfig(this.defaults, config)

  if (config.method) {
    config.method = config.method.toLowerCase()
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase()
  } else {
    config.method = 'get'
  }

  const requestInterceptorChain = []
  this.interceptors.request.forEach(interceptor => {
    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  const responseInterceptorChain = []
  this.interceptors.response.forEach(interceptor => {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected)
  })

  let chain = [dispatchRequest, undefined]
  Array.prototype.unshift.apply(chain, requestInterceptorChain)
  chain = chain.concat(responseInterceptorChain)

  let promise = Promise.resolve(config)
  while(chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }

  return promise
}

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

export default Axios