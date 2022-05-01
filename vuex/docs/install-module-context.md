#### usage

```javascript
const store = new Vuex.Store({
  state: { id: 'root' },
  getters: {
    getId(state, getters, rootState, rootGetters) {
      console.log('state:', state) // { id: 'root', a: { id: 'a' } }
      console.log('getters:', getters) // { getId, a/getId }
      console.log('rootState', rootState) // { id: 'root', a: { id: 'a' } }
      console.log('rootGetters:', rootGetters) // { getId, a/getId }
      console.log('state===rootState:', state === rootState) // true
      console.log('getters===rootGetters:', getters === rootGetters) // true
    }
  },
  mutations: {
    setId(state, payload) {
      console.log(state) // { id: 'root', a: { id: 'a' } }
    }
  },
  actions: {
    setId({ state, getters, commit, dispatch, rootState, rootGetters }, payload) {
      console.log('state:', state) // { id: 'root', a: { id: 'a' } }
      console.log('getters:', getters) // { getId, a/getId }
      console.log('rootState:', rootState) // { id: 'root', a: { id: 'a' } }
      console.log('rootGetters:', rootGetters) // { getId, a/getId }
      console.log('state===rootState:', state === rootState) // true
      console.log('getters===rootGetters:', getters === rootGetters) // true
    }
  },
  modules: {
    a: {
      namespaced: true,
      state: () => ({ id: 'a' }),
      getters: {
        getId(state, getters, rootState, rootGetters) {
          console.log('state:', state) // { id: 'a' }
          console.log('getters:', getters) // { getId }
          console.log('rootState', rootState) // { id: 'root', a: { id: 'a' } }
          console.log('rootGetters:', rootGetters) // { getId, a/getId }
        }
      },
      mutations: {
        setId(state, payload) {
          console.log(state) // { id: 'a' }
        }
      },
      actions: {
        setId({ state, getters, commit, dispatch, rootState, rootGetters }, payload) {
          console.log('state:', state) // { id: 'a' }
          console.log('getters:', getters) // { getId }
          console.log('rootState:', rootState) // { id: 'root', a: { id: 'a' } }
          console.log('rootGetters:', rootGetters) // { getId, a/getId }
        }
      }
    }
  }
})
```

#### achieve

```javascript
function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === ''
  const local = {}

  // commit
  // dispatch
  // state
  // getters

  return local
}
```

##### commit

```javascript
// actions: {
//   setName({ commit }) {
//     // 通过root属性来判断调用模块自身的还是全局的
//     commit('setName', 'my-name', { root: true }) // 方法一
//     commit({ type: 'setName', value: 'my-name' }, { root: true }) // 方法二
//   }
// }

local.commit = noNamespace ? store.commit : (_type, _payload, _options) => {
  const args = unifyObjectStyle(_type, _payload, _options)
  const { payload, options } = args
  let { type } = args

  if (!options || !options.root) {
    type = namespace + type
  }

  store.commit(type, payload)
}
```

##### dispatch

```javascript
// actions: {
//   setName({ dispatch }) {
//     // 通过root属性来判断调用模块自身的还是全局的
//     dispatch('setName', 'my-name', { root: true }) // 方法一
//     dispatch({ type: 'setName', value: 'my-name' }, { root: true }) // 方法二
//   }
// }

local.dispatch = noNamespace ? store.dispatch : (_type, _payload, _options) => {
  const args = unifyObjectStyle(_type, _payload, _options)
  const { payload, options } = args
  let { type } = args

  if (!options || !options.root) {
    type = namespace + type
  }

  return store.dispatch(type, payload)
}
```

##### state

```javascript
Object.defineProperty(local, 'state', {
  // 以根state为起点
  // path=[a, aa]： state[a] -> state[a][aa]
  get: () => getNestedState(store.state, path)
})
```

##### getters

```javascript
let temp = ''
const store = new Vuex.Store({
  modules: {
    a: {
      namespaced: true,
      getters: {
        getA(state, getters, rootState, rootGetters) {
          console.log('getA')
          temp = getters
        }
      },
      modules: {
        aa: {
          getters: {
            getAA(state, getters, rootState, rootGetters) {
              console.log('getAA')
              console.log(temp === getters) // true
            }
          }
        }
      }
    }
  }
})
store.getters['a/getA']
store.getters['a/getAA']
// 当模块不是命名空间模块时，模块的getters是挂载在全局的
// 所以getters === rootGetters
// 如果当前模块不是命名空间模块，但它的父级模块是命名空间模块
// 则当前模块的getters是挂载在父级模块的getters上面的
```

```javascript
Object.defineProperty(local, 'getters', {
  get: noNamespace
    ? () => store.getters
    : () => makeLocalGetters(store, namespace)
})
```

```javascript
// const store = new Vuex.Store({
//   getters: { geti() {}, getii() {} },
//   modules: {
//     a: {
//       namespaced: true,
//       getters: { getA() {}, getAA() {} }
//     }
//   }
// })
// namespace=a/
// splitPos=2
// round1 type=geti     type.slice(0, splitPos)=ge
// round2 type=getii    type.slice(0, splitPos)=ge
// round3 type=a/getA   type.slice(0, splitPos)=a/ localType=getA
// round4 type=a/getAA  type.slice(0, splitPos)=a/ localType=getAA

function makeLocalGetters(store, namespace) {
  // 存储当前模块的所有getters
  const gettersProxy = {}
  const splitPos = namespace.length

  Object.keys(store.getters).forEach(type => {
    if (type.slice(0, splitPos) !== namespace) return

    const localType = type.slice(splitPos)
    
    Object.defineProperty(gettersProxy, localType, {
      get: () => store.getters[type]
    })
  })

  return gettersProxy
}
```