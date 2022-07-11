#### usage

```vue
<el-carousel height="150px">
  <el-carousel-item v-for="item in 4" :key="item">
    <h3>{{ item }}</h3>
  </el-carousel-item>
</el-carousel>
```

#### carousel

```vue
<template>
  <div class="el-carousel">
    <div class="el-carousel__container">
      <slot></slot>
    </div>
    <ul class="el-carousel__indicators">
      <li
        v-for="(item, index) in items"
        :key="index"
        @click="handleIndicatorClick(index)"
      ></li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    initialIndex: {
      type: Number,
      default: 0
    },
    loop: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator(val) {
        return ['horizontal', 'vertical'].indexOf(val) !== -1
      }
    }
  },

  data() {
    return {
      items: [],
      activeIndex: -1
    }
  },

  watch: {
    items(val) { // 第三步：监听items
      if (val.length > 0) {
        this.setActiveItem(this.initialIndex)
      }
    },
    activeIndex(val, oldVal) { // 第五步：监听activeIndex
      this.resetItemPosition(oldVal)
    }
  },

  mounted() {
    this.updateItems() // 第一步：挂载
  },

  methods: {
    updateItems() { // 第二步：获取所有el-carousel-item元素
      this.items = this.$children.filter(child => child.$options.name === 'ElCarouselItem')
    },

    setActiveItem(index) { // 第四步：设置activeIndex
      if (typeof index === 'string') {
        // 因为el-carousel-item可以传name
        // 并且可以根据name来设置激活当前幻灯片
        const filteredItems = this.items.filter(item => item.name === index)
        if (filteredItems.length > 0) {
          index = this.items.indexOf(filteredItems[0])
        }
      }

      index = Number(index)
      if (isNaN(index) || index !== Math.floor(index)) return

      let length = this.items.length
      const oldIndex = this.activeIndex

      if (index < 0) {
        // 当前索引是负数，如果是循环滚动，则展示最后一个，否则展示第一个
        this.activeIndex = this.loop ? length - 1 : 0
      } else if (index >= length) {
        // 当前索引超过长度，如果是循环滚动，则展示第一个，否则展示最后一个
        this.activeIndex = this.loop ? 0 : length - 1
      } else {
        this.activeIndex = index
      }
      // 新的索引就是当前的索引，此时不会触发watch:activeIndex
      // 需要手动调用 resetItemPosition
      if (oldIndex === this.activeIndex) {
        this.resetItemPosition(oldIndex)
      }
    },

    resetItemPosition(oldIndex) { // 第六步：设置el-carousel-item位置
      this.items.forEach((item, index) => {
        item.translateItem(index, this.activeIndex, oldIndex)
      })
    },

    handleIndicatorClick(index) {
      this.activeIndex = index
    }
  }
}
</script>
```

#### carousel-item

```vue
<template>
  <div :style="itemStyle">
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      translate: 0,
      scale: 1,
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
      // 假设有4个幻灯片，展示幻灯片1的时候，它们的顺序是：
      // [3] [4] | [1] | [2]
      // 此时通过手动调用setActiveItem(3)
      // 在移动的过程中，会闪过空白幻灯片
      // 所以这里我没有使用源码的思路
      // if (activeIndex === 0 && index === length - 1) {
      //   return -1
      // } else if (activeIndex === length - 1 && index === 0) {
      //   return length
      // } else if (index < activeIndex - 1 && activeIndex - index >= length / 2) {
      //   return length + 1
      // } else if (index > activeIndex + 1 && index - activeIndex >= length / 2) {
      //   return -2
      // }
      // return index

      // 假设把幻灯片分成3个区域，分别是当前展示的区域，左侧区域和右侧区域
      // 当展示1号幻灯片时，此时区域为[4]   [1] [2,3]
      // 当展示2号幻灯片时，此时区域为[1]   [2] [3,4]
      // 当展示3号幻灯片时，此时区域为[1,2] [3] [4]
      // 当展示4号幻灯片时，此时区域为[2,3] [4] [1]
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
        // ...
      } else {
        const isVertical = parentDirection === 'vertical'
        index = this.processIndex(index, activeIndex, length)
        this.translate = this.calcTranslate(index, activeIndex, isVertical)
      }
    },

    calcTranslate(index, activeIndex, isVertical) {
      const distance = this.$parent.$el[isVertical ? 'offsetHeight' : 'offsetWidth']
      return distance * index
    }
  }
}
</script>
```

#### achieve

##### autoplay & interval

```vue
<!-- el-carousel.vue -->
<template>
  <div
    class="el-carousel"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave"
  >
  </div>
</template>

<script>
export default {
  props: {
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 3000
    }
  },

  watch: {
    autoplay(val) {
      val ? this.startTimer() : this.pauseTimer()
    },
    interval() {
      this.pauseTimer()
      this.startTimer()
    }
  },

  methods: {
    setActiveItem(index) {
      // ...
      // 设置展示的幻灯片后，重新开始轮播
      this.resetTimer()
    },

    handleMouseEnter() {
      this.hover = true
      this.pauseTimer()
    },

    handleMouseLeave() {
      this.hover = false
      this.startTimer()
    },

    resetTimer() {
      this.pauseTimer()
      this.startTimer()
    },

    playSlides() {
      if (this.activeIndex < this.items.length - 1) {
        this.activeIndex++
      } else if (this.loop) {
        this.activeIndex = 0
      }
    },

    pauseTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    startTimer() {
      if (this.interval <= 0 || !this.autoplay || this.timer) return
      this.timer = setInterval(this.playSlides, this.interval)
    }
  }
}
</script>
```

##### type

```vue
<!-- el-carousel-item.vue -->
<template>
  <div
    class="el-carousel__item"
    :class="{
      'is-in-stage': inStage,
      'el-carousel__item--card': $parent.type === 'card'
    }"
  >
  </div>
</template>

<script>
const CARD_SCALE = 0.83

export default {
  data() {
    return {
      scale: 1,
      inStage: false
    }
  },

  methods: {
    translateItem(index, activeIndex, oldIndex) {
      // ...
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
        // ...
      }
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
    }
  }
}
</script>
```

> 在`type=card`的时候，初始化的时候，每个幻灯片都会初始下位置，效果不好

```vue
<template>
  <div v-show="ready">
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ready: false
    }
  },

  methods: {
    translateItem() {
      // ...
      this.ready = true
    }
  }
}
</script>
```

