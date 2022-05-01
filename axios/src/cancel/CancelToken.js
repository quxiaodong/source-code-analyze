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