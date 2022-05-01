#### usage

```javascript
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({})
```

#### achieve

```javascript
// /src/store.js
export class Store {}

export function install() {}
```

```javascript
// /src/index.js
import { Store, install } from './store.js'

export default { Store, install }
```