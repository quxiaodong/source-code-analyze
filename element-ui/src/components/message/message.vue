<template>
  <transition name="el-message-fade" @after-leave="handleAfterLeave">
    <div
      class="el-message"
      :class="[
        type && !iconClass ? `el-message--${ type }` : '',
        center ? 'is-center' : '',
        showClose ? 'is-closable' : '',
        customClass
      ]"
      :style="positionStyle"
      v-show="visible"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <i :class="iconClass" v-if="iconClass"></i>
      <i :class="typeClass" v-else></i>
      <slot>
        <p v-if="!dangerouslyUseHTMLString" class="el-message__content">{{ message }}</p>
        <p v-else v-html="message" class="el-message__content"></p>
      </slot>
      <i v-if="showClose" class="el-message__closeBtn el-icon-close" @click="close"></i>
    </div>
  </transition>
</template>

<script>
const typeMap = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error'
}

export default {
  data() {
    return {
      visible: false,
      message: '',
      duration: 3000,
      type: 'info',
      iconClass: '',
      customClass: '',
      onClose: null,
      showClose: false,
      closed: false,
      verticalOffset: '',
      timer: null,
      dangerouslyUseHTMLString: false,
      center: false
    }
  },

  computed: {
    typeClass() {
      return this.type && !this.iconClass
        ? `el-message__icon el-icon-${ typeMap[this.type] }`
        : ''
    },
    positionStyle() {
      return {
        'top': `${ this.verticalOffset }px`
      }
    }
  },

  mounted() {
    this.startTimer()
    document.addEventListener('keydown', this.keydown)
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.keydown)
  },

  methods: {
    handleAfterLeave() {
      // 销毁组件
      this.$destroy()
      // 移除message时，顺便清除DOM
      // 如果单单使用v-if，会遗留<!---->这种注释
      this.$el.parentNode.removeChild(this.$el)
    },

    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close()
        }, this.duration)
      }
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    keydown(e) {
      if (e.keyCode === 27) { // esc关闭消息
        this.close()
      }
    },

    close() {
      if (this.closed) return

      this.closed = true
      this.visible = false
      if (typeof this.onClose === 'function') {
        this.onClose(this)
      }
    }
  }
}
</script>