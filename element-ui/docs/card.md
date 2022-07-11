#### usage

```vue
<el-card header="card title">
  card body
</el-card>
```

#### card

##### header

可以设置`header`，也可以使用`slot#header`插槽

```vue
<template>
  <div>
    <div class="el-card__header" v-if="$slots.header || header">
      <slot name="header">{{ header }}</slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    header: String
  }
}
</script>
```

##### body-style

在使用`:style`绑定样式时，可以使用`对象形式`或`数组形式`

```vue
<template>
  <div>
    <div class="el-card__body" :style="bodyStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bodyStyle: [Object, Array]
  }
}
</script>
```

##### shadow

在传递`shadow`时，做了校验，只能传递`always`、`hover`和`never`

```vue
<template>
  <div
    :class="[
      shadow ? `is-${shadow}-shadow` : 'is-always-shadow'
    ]"
  >
  </div>
</template>

<script>
export default {
  props: {
    shadow: {
      validator: value => ['always', 'hover', 'never'].includes(value) !== -1
    }
  }
}
</script>
```