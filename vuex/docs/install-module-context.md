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
//     // ??????root???????????????????????????????????????????????????
//     commit('setName', 'my-name', { root: true }) // ?????????
//     commit({ type: 'setName', value: 'my-name' }, { root: true }) // ?????????
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
//     // ??????root???????????????????????????????????????????????????
//     dispatch('setName', 'my-name', { root: true }) // ?????????
//     dispatch({ type: 'setName', value: 'my-name' }, { root: true }) // ?????????
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
  // ??????state?????????
  // path=[a, aa]??? state[a] -> state[a][aa]
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
// ????????????????????????????????????????????????getters?????????????????????
// ??????getters === rootGetters
// ???????????????????????????????????????????????????????????????????????????????????????
// ??????????????????getters???????????????????????????getters?????????
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
  // ???????????????????????????getters
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