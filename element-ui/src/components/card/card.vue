<template>
  <div
    class="el-card"
    :class="[
      shadow ? `is-${shadow}-shadow` : 'is-always-shadow'
    ]"
  >
    <div class="el-card__header" v-if="$slots.header || header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="el-card__body" :style="bodyStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElCard',

  props: {
    header: String,
    bodyStyle: [Object, Array],
    shadow: {
      validator: value => ['always', 'hover', 'never'].includes(value) !== -1
    }
  }
}
</script>