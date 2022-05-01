#### usage

```javascript
const store = new Vuex.Store({
  modules: {
    user: {
      namespaced: true,
      state: () => ({ id: 123 }),
      getters: { getId(state) { return state.id } },
      mutations: { setId(state, payload) { state.id = payload } },
      actions: { setId({ commit }, payload) { commit('setId', payload) } }
    }
  }
})

store.dispatch('user/setId', 456)
store.commit('user/setId', 789)
console.log(store.getters['user/getId'])
```

> 默认情况下，模块内部的`action`、`mutation`和`getter`是注册在全局命名空间的，可以通过`namespaced: true`让其成为带命名空间的模块

#### achieve

```javascript
// /src/store.js
export class Store {
  constructor(options = {}) {
    this._mutations = Object.create(null)
    this._actions = Object.create(null)
    this._wrappedGetters = Object.create(null)

    installModule(this, this._modules.root.state, [], this._modules.root)
  }
}
```

```javascript
// const store = new Vuex.Store({
//   modules: {
//     a: {
//       namespaced: true,
//       modules: {
//         aa: {
//           namespaced: true
//         }
//       }
//     },
//     b: {}
//   }
// })
// round1 path=[]          module=根模块 isRoot=true  namespace=''
// round2 path=['a']       module=a模块  isRoot=false namespace=a/
// round3 path=['a', 'aa'] module=aa模块 isRoot=false namespace=a/aa/
// round4 path=['b']       module=b模块  isRoot=false namespace=''

function installModule(store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // state
  // module.context
  // mutations
  // actions
  // getters

  // 递归子模块
  Object.keys(module._children).forEach(key => {
    installModule(store, rootState, path.concat(key), module._children[key], hot)
  })
}

export default installModule
```