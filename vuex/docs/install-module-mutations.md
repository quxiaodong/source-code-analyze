把所有的mutation存储在store._mutations中

#### usage

```javascript
const store = new Vuex.Store({
  mutations: { setState(state, payload) {} },
  modules: {
    a: {
      mutations: { setState(state, payload) {} }
    }
  }
})
// store._mutations.setState = [根目录的setState, a模块的setState]
```

```javascript
const store = new Vuex.Store({
  mutations: { setState(state, payload) {} },
  modules: {
    a: {
      namespaced: true,
      mutations: { setState(state, payload) {} }
    }
  }
})
// store._mutations.setState = [根目录的setState]
// store._mutations.a/setState = [a模块的setState]
```

#### achieve

```javascript
if (module._rawModule.mutations) {
  Object.keys(module._rawModule.mutations).forEach(key => {
    const mutation = module._rawModule.mutations[key]
    const type = namespace + key
    const entry = store._mutations[type] || (store._mutations[type] = [])
    // 这里的payload是在执行commit('setState', payload)传入的
    // 详情查看store.commit部分代码
    entry.push(function(payload) {
      mutation.call(store, local.state, payload)
    })
  })
}
```