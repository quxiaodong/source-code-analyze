import Vuex from '../src/index.js'

Vue.use(Vuex)

// -------------------------
const Store = new Vuex.Store({
  state: () => ({ base: 3 }),
  mutations: {
    setBase(state, payload) {
      state.base = payload
    }
  },
  actions: {
    setBase({ commit }, payload) {
      commit('setBase', payload)
    }
  },
  modules: {
    todo: {
      namespaced: true,
      state: () => ({ list: [] }),
      getters: {
        filterList(state, getters, rootState, rootGetters) {
          return state.list.filter(n => n % rootState.base === 0)
        }
      },
      mutations: {
        add(state, payload) {
          state.list.push(payload)
        }
      },
      actions: {
        add({ commit }, payload) {
          commit('add', payload)
        }
      }
    }
  }
})

const OriginList = {
  template: `
    <ul>
      <li>todo list</li>
      <li v-for="(item, index) in list">{{ item }}</li>
    </ul>
  `,
  computed: {
    list() {
      return this.$store.state.todo.list
    }
  }
}

const FilterList = {
  template: `
    <ul>
      <li>filter list</li>
      <li v-for="(item, index) in list">{{ item }}</li>
    </ul>
  `,
  computed: {
    list() {
      return this.$store.getters['todo/filterList']
    }
  }
}

const todo = new Vue({
  store: Store,
  el: '#todo',
  data() {
    return { inputValue: '' }
  },
  computed: {
    base: {
      get() {
        return this.$store.state.base
      },
      set(value) {
        const num = parseFloat(value)
        if (!isNaN(num)) {
          this.$store.dispatch('setBase', num)
        }
      }
    }
  },
  methods: {
    add() {
      const num = parseFloat(this.inputValue)
      if (!isNaN(num)) {
        this.$store.dispatch('todo/add', this.inputValue).then(() => {
          this.inputValue = ''
        })
      }
    }
  },
  components: { OriginList, FilterList }
})