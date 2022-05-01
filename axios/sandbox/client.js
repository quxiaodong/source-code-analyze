import axios from '../src/index.js'

axios.get('http://127.0.0.1:3001').then(res => {
  console.log(res)
})
