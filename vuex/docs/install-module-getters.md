把所有的getter存储在store._wrappedGetters中

#### usage

```javascript
const store = new Vuex.Store({
  getters: {
    getState(state, getters, rootState, rootGetters) {}
  },
  modules: {
    a: {
      namespaced: true,
      getters: {
        getState(state, getters, rootState, rootGetters) {}
      }
    }
  }
})
// store._wrappedGetters.getState=fn
// store._wrappedGetters.a/getState=fn
```

#### achieve

```javascript
if (module._rawModule.getters) {
  Object.keys(module._rawModule.getters).forEach(key => {
    const getter = module._rawModule.getters[key]
    const type = namespace + key
    if (store._wrappedGetters[type]) {
      // const store = new Vuex.Store({
      //   getters: { getState() {} },
      //   modules: {
      //     a: {
      //       getters: { getState() {} }
      //     }
      //   }
      // })
      // 此时，会出现两个 getState
      console.error(`[vuex] duplicate getter key: ${type}`)
      return
    }
    store._wrappedGetters[type] = function() {
      return getter(local.state, local.getters, store.state, store.getters)
    }
  })
}
```