#### usage

```javascript
const store = new Vuex.Store({
  state: { list: [1, 2, 3, 4] },
  getters: {
    getOdd(state) {
      return state.list.filter(n => n % 2)
    }
  }
})
console.log(store.state.list) // [1, 2, 3, 4]
console.log(store.getters.getOdd) // [1, 3]
```

#### achieve

```javascript
// /src/store.js
export class Store {
  constructor(options = {}) {
    resetStoreVM(this, this._modules.root.state)
  }

  get state () {
    return this._vm._data.$$state
  }

  set state (v) { // state只能通过commit来更改
    console.error(`use store.replaceState() to explicit replace store state.`)
  }
}
```

```javascript
function resetStoreVM(store, state, hot) {
  // 重置getters
  store.getters = {}
  // 重置计算属性
  const computed = {}

  if (store._wrappedGetters) {
    Object.keys(store._wrappedGetters).forEach(key => {
      const getter = store._wrappedGetters[key]
      // 保存所有计算属性
      computed[key] = getter

      // 当使用store.getters[key]时，从vue实例的计算属性中读取
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
        // enumerable定义了对象的属性是否可以在forin和Object.keys中被枚举
        // 如果不设置true
        // 在makeLocalGetters函数中，通过Object.keys(store.getters)就无法被枚举
        enumerable: true
      })
    })
  }

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```