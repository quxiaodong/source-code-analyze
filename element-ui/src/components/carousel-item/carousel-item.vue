<template>
  <div v-show="ready"
    class="el-carousel__item"
    :class="{
      'is-active': active,
      'is-animating': animating,
      'is-in-stage': inStage,
      'el-carousel__item--card': $parent.type === 'card'
    }"
    :style="itemStyle"
  >
    <slot></slot>
  </div>
</template>

<script>
const CARD_SCALE = 0.83

export default {
  name: 'ElCarouselItem',

  props: {
    name: String,
    label: {
      type: [String, Number],
      default: ''
    }
  },

  data() {
    return {
      ready: false,
      translate: 0,
      scale: 1,
      inStage: false,
      active: false,
      animating: false // 移动动画效果
    }
  },

  computed: {
    itemStyle() {
      const translateType = this.$parent.direction === 'vertical' ? 'translateY' : 'translateX'
      const value = `${translateType}(${ this.translate }px) scale(${ this.scale })`
      const style = {
        transform: value
      }
      return style
    }
  },

  created() {
    this.$parent && this.$parent.updateItems()
  },

  destroyed() {
    this.$parent && this.$parent.updateItems()
  },

  methods: {
    processIndex(index, activeIndex, length) {
      if (this.$parent.loop) {
        if (activeIndex === 0 && index === length - 1) { // 展示1号，此时4号需要在左侧区域
          return -1
        } else if (activeIndex === length - 1 && index === 0) { // 展示4号，此时1号需要在右侧区域
          return 1
        }
      }
      if (index > activeIndex) {
        return 1
      } else if (index < activeIndex) {
        return -1
      } else if (index === activeIndex) {
        return 0
      }
      return index
    },

    translateItem(index, activeIndex, oldIndex) {
      const parentType = this.$parent.type
      const parentDirection = this.$parent.direction
      const length = this.$parent.items.length

      this.active = index === activeIndex
      this.animating = index === activeIndex || index === oldIndex

      if (parentType === 'card') {
        this.inStage =
          Math.round(Math.abs(index - activeIndex)) === 1 ||
          this.$parent.loop && (
            (index === 0 && activeIndex === length - 1) ||
            (index === length - 1 && activeIndex === 0)
          )
        index = this.processIndex(index, activeIndex, length)
        this.translate = this.calcCardTranslate(index, activeIndex)
        this.scale = this.active ? 1 : CARD_SCALE
      } else {
        const isVertical = parentDirection === 'vertical'
        index = this.processIndex(index, activeIndex, length)
        this.translate = this.calcTranslate(index, activeIndex, isVertical)
        this.scale = 1
      }
      this.ready = true
    },

    calcCardTranslate(index, activeIndex, length) {
      const parentWidth = this.$parent.$el.offsetWidth
      // 每个幻灯片的宽度
      const itemWidth = parentWidth / 2
      // 缩小后，相比原来的左右间距
      const space = (itemWidth - itemWidth * CARD_SCALE) / 2
      if (this.active) {
        // 激活的幻灯片宽度是 parentWidth / 2，距离左边是
        return (parentWidth - itemWidth) / 2
      }
      if (this.inStage) {
        if (index === -1) {
          // 左侧幻灯片距离左边的距离原本应该是0
          // 但是item进行了缩小，导致左侧有空隙
          // 所以向左移空隙的距离
          return -space
        } else {
          // 右侧幻灯片距离左边的距离是
          // 容器一半的宽度加上空隙
          return itemWidth + space
        }
      }
      if (index === -1) {
        return - (itemWidth * CARD_SCALE + space)
      } else {
        return parentWidth - space
      }
    },

    calcTranslate(index, activeIndex, isVertical) {
      const distance = this.$parent.$el[isVertical ? 'offsetHeight' : 'offsetWidth']
      return distance * index
    }
  }
}
</script>