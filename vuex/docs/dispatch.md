#### usage

```javascript
const store = new Vuex.Store({
  actions: {
    setState(context, payload) { console.log(payload) }
  }
})

store.dispatch('setState', 'my-state-value').then(() => { // 用法一
  console.log('dispatch success') 
})
store.dispatch({ type: 'setState', value: 'my-state-value' }).then(() => { // 用法二
  console.log('dispatch success')
})
```

> `dispatch`方法返回一个`Promise`对象

#### achieve

```javascript
// /src/store.js
export class Store {
  constructor() {
    // 存储所有action
    this._actions = Object.create(null)
  }

  dispatch(_type, _payload) {
    const { type, payload } = unifyObjectStyle(_type, _payload)

    const entry = this._actions[type]

    if (!entry) {
      console.error(`[vuex] unknown action type: ${type}`)
      return
    }

    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return result
  }
}
```