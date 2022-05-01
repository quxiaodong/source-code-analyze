function applyMixin(Vue) {
  Vue.mixin({
    beforeCreate() {
      const options = this.$options
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }
    }
  })
}

export default applyMixin