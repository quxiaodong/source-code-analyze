```javascript
// /src/defaults/index.js
import xhrAdapter from '../adapters/xhr.js'

function getDefaultAdapter() {
  let adapter
  if (typeof XMLHttpRequest !== 'undefined') {
    adapter = xhrAdapter
  }
  return adapter
}

const defaults = {
  timeout: 0, // 0代表不设置超时
  headers: {},
  adapter: getDefaultAdapter()
}

export default defaults
```