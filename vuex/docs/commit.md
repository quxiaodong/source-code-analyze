#### usage

```javascript
const store = new Vuex.Store({
  mutations: {
    setState(state, payload) { console.log(payload) }
  }
})

store.commit('setState', 'my-state-value') // 用法一
store.commit({ type: 'setState', value: 'my-state-value' }) // 用法二
```

#### achieve

```javascript
// /src/store.js
export class Store {
  constructor() {
    // 存储所有mutation
    this._mutations = Object.create(null)
  }

  commit(_type, _payload) {
    const { type, payload } = unifyObjectStyle(_type, _payload)

    const entry = this._mutations[type]

    if (!entry) {
      console.error(`[vuex] unknown mutation type: ${type}`)
      return
    }

    entry.forEach(handler => handler(payload))
  }
}
```