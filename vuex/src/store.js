import { unifyObjectStyle, isPromise, getNestedState } from './util.js'
import applyMixin from './mixin.js'
import ModuleCollection from './module/module-collection.js'

let Vue

export class Store {
  constructor(options = {}) {
    this._mutations = Object.create(null)

    this._actions = Object.create(null)

    this._wrappedGetters = Object.create(null)

    this._modules = new ModuleCollection(options)

    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload) {
      return commit.call(store, type, payload)
    }

    installModule(this, this._modules.root.state, [], this._modules.root)

    resetStoreVM(this, this._modules.root.state)
  }

  get state () {
    return this._vm._data.$$state
  }

  set state (v) {
    console.error(`use store.replaceState() to explicit replace store state.`)
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

export function install(_Vue) {
  if (Vue && Vue === _Vue) {
    console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.')
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}

function resetStoreVM(store, state, hot) {
  store.getters = {}
  const computed = {}

  if (store._wrappedGetters) {
    Object.keys(store._wrappedGetters).forEach(key => {
      const getter = store._wrappedGetters[key]
      computed[key] = getter

      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
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

function installModule(store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    parentState[moduleName] = module.state
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  if (module._rawModule.mutations) {
    Object.keys(module._rawModule.mutations).forEach(key => {
      const mutation = module._rawModule.mutations[key]
      const type = namespace + key
      const entry = store._mutations[type] || (store._mutations[type] = [])
      entry.push(function(payload) {
        mutation.call(store, local.state, payload)
      })
    })
  }

  if (module._rawModule.actions) {
    Object.keys(module._rawModule.actions).forEach(key => {
      const action = module._rawModule.actions[key]
      const type = action.root ? key : namespace + key
      const handler = action.handler || action
      const entry = store._actions[type] || (store._actions[type] = [])
      entry.push(function(payload) {
        let res = handler.call(store, {
          state: local.state,
          getters: local.getters,
          commit: local.commit,
          dispatch: local.dispatch,
          rootState: store.state,
          rootGetters: store.getters
        }, payload)
        if (!isPromise(res)) {
          res = Promise.resolve(res)
        }
        return res
      })
    })
  }

  if (module._rawModule.getters) {
    Object.keys(module._rawModule.getters).forEach(key => {
      const getter = module._rawModule.getters[key]
      const type = namespace + key
      if (store._wrappedGetters[type]) {
        console.error(`[vuex] duplicate getter key: ${type}`)
        return
      }
      store._wrappedGetters[type] = function() {
        return getter(local.state, local.getters, store.state, store.getters)
      }
    })
  }

  Object.keys(module._children).forEach(key => {
    installModule(store, rootState, path.concat(key), module._children[key], hot)
  })
}

function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === ''
  const local = {}

  local.commit = noNamespace ? store.commit : (_type, _payload, _options) => {
    const args = unifyObjectStyle(_type, _payload, _options)
    const { payload, options } = args
    let { type } = args

    if (!options || !options.root) {
      type = namespace + type
    }

    store.commit(type, payload)
  }

  local.dispatch = noNamespace ? store.dispatch : (_type, _payload, _options) => {
    const args = unifyObjectStyle(_type, _payload, _options)
    const { payload, options } = args
    let { type } = args

    if (!options || !options.root) {
      type = namespace + type
    }

    return store.dispatch(type, payload)
  }

  Object.defineProperty(local, 'state', {
    get: () => getNestedState(store.state, path)
  })

  Object.defineProperty(local, 'getters', {
    get: noNamespace
      ? () => store.getters
      : () => makeLocalGetters(store, namespace)
  })

  return local
}

function makeLocalGetters(store, namespace) {
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