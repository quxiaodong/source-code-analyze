把所有的action存储在store._actions中

#### usage

```javascript
const store = new Vuex.Store({
  actions: {
    setState: { // 用法一
      root: true,
      handler(context, payload) {}
    },
    setState(context, payload) {} // 用法二
  }
})
```

```javascript
const store = new Vuex.Store({
  actions: { setState(context, payload) {} },
  modules: {
    a: {
      actions: { setState(context, payload) {} }
    }
  }
})
// store._actions.setState = [根目录的setState, a模块的setState]
```

```javascript
const store = new Vuex.Store({
  actions: { setState(context, payload) {} },
  modules: {
    a: {
      namespaced: true,
      actions: { setState(context, payload) {} }
    }
  }
})
// store._actions.setState = [根目录的setState]
// store._actions.a/setState = [a模块的setState]
```

#### achieve

```javascript
if (module._rawModule.actions) {
  Object.keys(module._rawModule.actions).forEach(key => {
    const action = module._rawModule.actions[key]
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    const entry = store._actions[type] || (store._actions[type] = [])
    // 这里的payload是在执行dispatch('setState', payload)传入的
    // 详情查看store.dispatch部分代码
    entry.push(function(payload) {
      let res = handler.call(store, {
        state: local.state,
        getters: local.getters,
        commit: local.commit,
        dispatch: local.dispatch,
        rootState: store.state,
        rootGetters: store.getters
      }, payload)
      // 如果返回结果不是Promise对象，把它变成Promise对象
      if (!isPromise(res)) {
        res = Promise.resolve(res)
      }
      return res
    })
  })
}
```