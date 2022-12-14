<template>
  <div
    class="el-carousel"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave"
  >
    <div
      class="el-carousel__container"
      :style="{ height: height }"
    >
      <transition
        v-if="arrowDisplay"
        name="carousel-arrow-left">
        <button
          type="button"
          v-show="(arrow === 'always' || hover) && (loop || activeIndex > 0)"
          @click="throttledArrowClick(activeIndex - 1)"
          class="el-carousel__arrow el-carousel__arrow--left">
          <i class="el-icon-arrow-left"></i>
        </button>
      </transition>
      <transition
        v-if="arrowDisplay"
        name="carousel-arrow-right">
        <button
          type="button"
          v-show="(arrow === 'always' || hover) && (loop || activeIndex < items.length - 1)"
          @click="throttledArrowClick(activeIndex + 1)"
          class="el-carousel__arrow el-carousel__arrow--right">
          <i class="el-icon-arrow-right"></i>
        </button>
      </transition>
      <slot></slot>
    </div>
    <ul
      v-if="indicatorPosition !== 'none'"
      :class="indicatorsClasses"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'el-carousel__indicator',
          { 'is-active': index === activeIndex }
        ]"
        @click="handleIndicatorClick(index)"
      >
        <button class="el-carousel__button"></button>
      </li>
    </ul>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce'

export default {
  name: 'ElCarousel',

  props: {
    type: String,
    height: String,
    indicatorPosition: String,
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
    },
    arrow: {
      type: String,
      default: 'hover'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 3000
    }
  },

  data() {
    return {
      items: [],
      activeIndex: -1,
      timer: null,
      hover: false
    }
  },

  computed: {
    arrowDisplay() {
      return this.arrow !== 'never' && this.direction !== 'vertical'
    },

    indicatorsClasses() {
      const classes = ['el-carousel__indicators', 'el-carousel__indicators--' + this.direction]
      if (this.indicatorPosition === 'outside' || this.type === 'card') {
        classes.push('el-carousel__indicators--outside')
      }
      return classes
    }
  },

  created() {
    this.throttledArrowClick = throttle(300, index => {
      this.setActiveItem(index)
    })
  },

  watch: {
    items(val) { // ??????????????????items
      if (val.length > 0) {
        this.setActiveItem(this.initialIndex)
      }
    },
    activeIndex(val, oldVal) { // ??????????????????activeIndex
      this.resetItemPosition(oldVal)
    },
    autoplay(val) {
      console.log(val)
      val ? this.startTimer() : this.pauseTimer()
    },
    interval() {
      this.pauseTimer()
      this.startTimer()
    }
  },

  mounted() {
    this.updateItems() // ??????????????????
  },

  methods: {
    updateItems() { // ????????????????????????el-carousel-item??????
      this.items = this.$children.filter(child => child.$options.name === 'ElCarouselItem')
    },

    setActiveItem(index) { // ??????????????????activeIndex
      if (typeof index === 'string') {
        // ??????el-carousel-item?????????name
        // ??????????????????name??????????????????????????????
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
        // ?????????????????????????????????????????????????????????????????????????????????????????????
        this.activeIndex = this.loop ? length - 1 : 0
      } else if (index >= length) {
        // ????????????????????????????????????????????????????????????????????????????????????????????????
        this.activeIndex = this.loop ? 0 : length - 1
      } else {
        this.activeIndex = index
      }
      // ??????????????????????????????????????????????????????watch:activeIndex
      // ?????????????????? resetItemPosition
      if (oldIndex === this.activeIndex) {
        this.resetItemPosition(oldIndex)
      }

      this.resetTimer()
    },

    resetItemPosition(oldIndex) { // ??????????????????el-carousel-item??????
      this.items.forEach((item, index) => {
        item.translateItem(index, this.activeIndex, oldIndex)
      })
    },

    handleIndicatorClick(index) {
      this.activeIndex = index
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