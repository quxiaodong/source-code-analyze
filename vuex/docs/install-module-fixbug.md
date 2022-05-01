```javascript
const store = new Vuex.Store({
  mutations: {
    setId() { console.log('setId') }
  },
  actions: {
    setId({ commit }) { commit('setId') }
  },
  modules: {
    a: {
      mutations: {
        setA() { console.log('a') }
      },
      actions: {
        setA({ commit }) { commit('setA') }
      }
    },
    b: {
      namespaced: true,
      mutations: {
        setB() { console.log('b') }
      },
      actions: {
        setB({ commit }) { commit('setB') }
      }
    }
  }
})
// store.dispatch('setId') // 报错
// store.dispatch('setA') // 报错
// store.dispatch('b/setB') // 不报错
```

原因：`module.context`里`this`指向问题

```javascript
export class Store {
  constructor(options = {}) {
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload) {
      return commit.call(store, type, payload)
    }
  }
}
```