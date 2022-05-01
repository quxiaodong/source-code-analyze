```javascript
// /src/store.js
import applyMixin from './mixin.js'

let Vue

export function install(_Vue) {
  if (Vue && Vue === _Vue) {
    // 防止多次Vue.use(Vuex)
    console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.')
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

```javascript
// /src/mixin.js
function applyMixin(Vue) {
  Vue.mixin({
    // 全局注册mixin，影响注册之后创建的每个Vue实例
    beforeCreate() {
      // const store = new Vuex.Store({})
      // const app = new Vue({ el: '#app', store })
      // 此时，store 挂载在 this.$options 上
      // 为了在Vue组件中使用 this.$store
      const options = this.$options
      if (options.store) {
        // 传入对象：const app = new Vue({ store: store })
        // 传入函数：const app = new Vue({ store: () => store })
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      } else if (options.parent && options.parent.$store) {
        // 在有些项目中，store没有挂载在根实例上
        // 而是挂载在组件上，这样子组件也可以使用父组件的$store
        this.$store = options.parent.$store
      }
    }
  })
}

export default applyMixin
```