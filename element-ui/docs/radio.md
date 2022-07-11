#### usage

```vue
<el-radio v-model="radio" label="1">备选项</el-radio>
<el-radio v-model="radio" label="2">备选项</el-radio>
```

#### radio

##### value/v-model

组件上的`v-model`默认会利用名为`value`的`prop`和名为`input`的事件。可以使用`model`来改变prop名和事件名

```html
<!--
  这里的 lovingVue 的值将会传入这个名为 checked 的 prop。
  同时当 <base-checkbox> 触发一个 change 事件并附带一个新的值的时候
  这个 lovingVue 的 property 将会被更新
-->
<div id="app">
  <base-checkbox v-model="lovingVue"></base-checkbox>
</div>

<script>
Vue.component('base-checkbox', {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  },
  template: `
    <input
      type="checkbox"
      v-bind:checked="checked"
      v-on:change="$emit('change', $event.target.checked)"
    >
  `
})
</script>
```

```vue
<template>
  <label
    :class="[
      { 'is-checked': model === label }
    ]"
  >
  </label>
</template>

<script>
export default {
  props: {
    value: {},
    label: {}
  },

  computed: {
    model: {
      get() {
        return this.isGroup ? this._radioGroup.value : this.value
      },
      set(val) {
        // 自定义组件了使用v-model，在更改值的时候
        // el-radio-group和el-radio都使用了默认的input事件
        if (this.isGroup) {
          this.dispatch('ElRadioGroup', 'input', [val])
        } else {
          this.$emit('input', val)
        }
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
  },

  computed: {
    isDisabled() {
      return this.isGroup
        ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
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
    <!-- 左边圆点 -->
    <span class="el-radio__circle-wrapper">
      <span class="el-radio__circle"></span>
      <input
        class="el-radio__input"
        type="radio"
        :value="label"
        v-model="model"
        :disabled="isDisabled"
        @change="handleChange"
      >
    </span>
    <!-- 右边文字 -->
    <span class="el-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script>
export default {
  props: {
    label: {}
  },

  methods: {
    handleChange() {
      // 在源码里，使用了$nextTick，因为他传递的是this.model，它是计算属性
      // 而点击label后立刻执行handleChange，此时this.model是上一个值
      // 所以需要使用$nextTick
      // this.$nextTick(() => {
      //   this.$emit('change', this.model)
      //   this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model)
      // })
      // 按照官方文档，change事件传递的是选中的 Radio label 值
      // 所以我这里传递了this.label，因此不需要使用$nextTick
      this.$emit('change', this.label)
      // 触发在el-radio-group上绑定的change事件
      this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.label)
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
      border && radioSize ? 'el-radio--' + radioSize : ''
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
    radioSize() {
      const temRadioSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
      return this.isGroup ? this._radioGroup.radioGroupSize : temRadioSize
    }
  }
}
</script>
```

#### radio-group

```vue
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import Emitter from '../../mixins/emitter'

export default {
  name: 'ElRadioGroup',

  // 私有属性，el-radio会递归向上寻找是否在el-radio-group内
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
    radioGroupSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    }
  },

  created() {
    // 当el-radio触发change的时候，会告诉el-radio-group
    this.$on('handleChange', value => {
      this.$emit('change', value)
    })
  },

  watch: {
    value(value) {
      // 改变的时候，通知el-form
      // 如果设置的change的时候校验
      this.dispatch('ElFormItem', 'el.form.change', [this.value])
    }
  }
}
</script>
```