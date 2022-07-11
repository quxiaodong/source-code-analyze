#### usage

```vue
<el-button type="primary">Button</el-button>
```

#### button

##### type

```vue
<template>
  <button
    :class="[
      type ? 'el-button--' + type : ''
    ]"
  >
  </button>
</template>

<script>
export default {
  props: {
    type: {
      validator: value => ['primary', 'success', 'warning', 'danger', 'info', 'text'].includes(value) !== -1
    }
  }
}
</script>
```

##### size

```vue
<template>
  <button
    :class="[
      buttonSize ? 'el-button--' + buttonSize : ''
    ]"
  >
  </button>
</template>

<script>
export default {
  inject: {
    elFormItem: {
      default: ''
    }
  },

  props: {
    size: {
      validator: value => ['medium', 'small', 'mini'].includes(value) !== -1
    }
  },

  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize
    },
    buttonSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size
    }
  }
}
</script>
```

##### icon

使用`span`标签来包裹`<slot>`是为了`icon`和插槽之间有`5px`的间隔

```vue
<template>
  <button>
    <i class="el-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
```

##### disabled

当在`props`里声明属性时，如果传了参数，可以通过`this.$options.propsData`来获取传递的值

```vue
<template>
  <button
    :class="[
      {
        'is-disabled': buttonDisabled
      }
    ]"
    :disabled="buttonDisabled || loading"
  >
  </button>
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
    buttonDisabled() {
      return this.$options.propsData.hasOwnProperty('disabled') ? this.disabled : (this.elForm || {}).disabled
    }
  }
}
</script>
```

##### loading

通过`css`的`pointer-events: none`来禁用按钮的事件，以及`hover`等样式

```vue
<template>
  <button
    :class="[
      {
        'is-loading': loading
      }
    ]"
  >
    <i class="el-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script>
export default {
  props: {
    loading: Boolean
  }
}
</script>
```