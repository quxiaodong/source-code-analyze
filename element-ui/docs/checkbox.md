#### usage

```vue
<!-- `checked` 为 true 或 false -->
<el-checkbox v-model="checked">备选项</el-checkbox>
```

#### checkbox

##### value/v-model

```vue
<template>
  <label
    :class="[
      { 'is-checked': isChecked }
    ]"
  >
  </label>
</template>

<script>
export default {
  props: {
    value: {},
    label: {},
    trueLabel: [String, Number],
    falseLabel: [String, Number]
  },

  data() {
    return {
      selfModel: false
    }
  },

  computed: {
    store() {
      return this._checkboxGroup ? this._checkboxGroup.value : this.value
    },
    model: {
      get() {
        // 是checkbox-group
        // 如果checkbox-group传递了value，则取那个值，否则取传递给checkbox的value
        // 不是checkbox-group，如果传递了value，则取value，否则selfModel
        return this.isGroup
          ? this.store
          : this.value !== undefined
            ? this.value
            : this.selfModel
      },
      set(val) {
        if (this.isGroup) {
          this.dispatch('ElCheckboxGroup', 'input', [val])
        } else {
          this.$emit('input', val)
        }
      }
    },
    isChecked() {
      if (Object.prototype.toString.call(this.model) === '[object Boolean]') {
        return this.model
      } else if (Array.isArray(this.model)) {
        return this.model.indexOf(this.label) > -1
      } else if (this.model !== null && this.model !== undefined) {
        return this.model === this.trueLabel
      }
    }
  }
}
</script>
```

##### disabled

```vue
<template>
  <label
    :class="[
      { 'is-disabled': isDisabled }
    ]"
  >
  </label>
</template>

<script>
export default {
  inject: {
    elForm: {
      default: ''
    }
  },

  props: {
    disabled: Boolean
  }

  computed: {
    isLimitDisabled() {
      const { min, max } = this._checkboxGroup
      // 如果有最小选中个数或最大选中个数
      return !!(min || max) && (
        // 大于等于最大选中个数，并且它是没有选中的，禁止，不让它可选中
        (this.model.length >= max && !this.isChecked) ||
        // 小于等于最小选中个数，并且它是选中的，禁止，让它不可取消选中
        (this.model.length <= min && this.isChecked)
      )
    },
    isDisabled() {
      return this.isGroup
        ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled || this.isLimitDisabled
        : this.disabled || (this.elForm || {}).disabled
    }
  }
}
</script>
```

##### change

使用`label`标签包裹`input`，只要点击`label`任何区域都相当于点击了`input`

```vue
<template>
  <label>
  <!-- 左边方块 -->
  <span class="el-checkbox__icon-wrapper">
    <span class="el-checkbox__icon"></span>
    <input
      v-if="trueLabel || falseLabel"
      class="el-checkbox__input"
      type="checkbox"
      :true-value="trueLabel"
      :false-value="falseLabel"
      v-model="model"
      :disabled="isDisabled"
      @change="handleChange"
    >
    <input
      v-else
      class="el-checkbox__input"
      type="checkbox"
      :value="label"
      v-model="model"
      :disabled="isDisabled"
      @change="handleChange"
    >
  </span>
  <!-- 右边文字 -->
  <span class="el-checkbox__label">
    <slot>{{ label }}</slot>
  </span>
  </label>
</template>

<script>
export default {
  props: {
    label: {},
    trueLabel: [String, Number],
    falseLabel: [String, Number]
  },

  methods: {
    handleChange(e) {
      let value
      if (e.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel
      }
      this.$emit('change', value, e)
      // 这里用$nextTick是因为this.model是计算属性
      this.$nextTick(() => {
        if (this.isGroup) {
          this.dispatch('ElCheckboxGroup', 'change', [this.model])
        }
      })
    }
  }
}
</script>
```

##### border

```vue
<template>
  <label
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-bordered': border }
    ]"
  >
  </label>
</template>

<script>
export default {
  inject: {
    elFormItem: {
      default: ''
    }
  },

  props: {
    border: Boolean,
    size: String
  },

  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    checkboxSize() {
      const temCheckboxSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
      return this.isGroup ? this._checkboxGroup.checkboxGroupSize : temCheckboxSize
    }
  }
}
</script>
```

#### checkbox-group

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import Emitter from '../../mixins/emitter'

export default {
  name: 'ElCheckboxGroup',

  // 私有属性，el-checkbox会递归向上寻找是否在el-checkbox-group内
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
```