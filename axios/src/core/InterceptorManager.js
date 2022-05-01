function InterceptorManager() {
  this.handlers = []
}

InterceptorManager.prototype.use = function(fulfilled, rejected) {
  this.handlers.push({ fulfilled, rejected })
}

InterceptorManager.prototype.eject = function(id) {
  if (this.handlers[id]) {
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