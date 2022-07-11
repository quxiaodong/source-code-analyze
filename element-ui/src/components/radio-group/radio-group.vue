<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import Emitter from '../../mixins/emitter'

export default {
  name: 'ElRadioGroup',

  componentName: 'ElRadioGroup',

  mixins: [Emitter],

  inject: {
    elFormItem: {
      default: ''
    }
  },

  props: {
    value: {},
    size: String,
    disabled: Boolean,
  },

  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    _elTag() {
      let tag = (this.$vnode.data || {}).tag;
      if (!tag || tag === 'component') tag = 'div'
      return tag
    },
    radioGroupSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    }
  },

  created() {
    this.$on('handleChange', value => {
      this.$emit('change', value)
    })
  },

  watch: {
    value(value) {
      this.dispatch('ElFormItem', 'el.form.change', [this.value])
    }
  }
}
</script>