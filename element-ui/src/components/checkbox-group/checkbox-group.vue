<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import Emitter from '../../mixins/emitter'

export default {
  name: 'ElCheckboxGroup',

  componentName: 'ElCheckboxGroup',

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
    min: Number,
    max: Number
  },

  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    checkboxGroupSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    }
  },

  watch: {
    value(value) {
      // 改变的时候，通知el-form
      // 如果设置的change的时候校验
      this.dispatch('ElFormItem', 'el.form.change', [value])
    }
  }
}
</script>