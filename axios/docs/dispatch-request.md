```javascript
// /src/core/dispatchRequest.js
import defaults from '../defaults/index.js'

function dispatchRequest(config) {
  // xhr or others
  const adapter = config.adapter || defaults.adapter

  return adapter(config)
}

export default dispatchRequest
```