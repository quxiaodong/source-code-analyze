const http = require('http')

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
})

server.on('request', (request, response) => {
  setTimeout(() => {
    const { method, url, headers } = request

    const responseBody = { method, url, headers }
    response.end(JSON.stringify(responseBody))
  }, 5000)
})

server.listen(3001, () => console.log('server is running'))