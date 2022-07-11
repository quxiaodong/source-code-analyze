<template>
  <transition
    name="el-dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      class="el-dialog__wrapper"
      v-show="visible"
      @click.self="handleWrapperClick"
    >
      <div
        ref="dialog"
        class="el-dialog"
        :class="[
          {
            'is-fullscreen': fullscreen,
            'is-center': center
          },
          customClass
        ]"
        :style="style"
        :key="key"
      >
        <div class="el-dialog__header">
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <i
            class="el-dialog__close el-icon-close"
            v-if="showClose"
            @click="handleClose"></i>
        </div>
        <div class="el-dialog__body" v-if="rendered">
          <slot></slot>
        </div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from '../../utils/popup'

export default {
  name: 'ElDialog',

  mixins: [Popup],

  props: {
    title: String,
    visible: Boolean,
    width: {
      type: String,
      default: '50%'
    },
    top: {
      type: String,
      default: '15vh'
    },
    customClass: String,
    fullscreen: Boolean,
    center: Boolean,
    destroyOnClose: Boolean,
    appendToBody: Boolean,
    beforeClose: Function,
    modal: {
      type: Boolean,
      default: true
    },
    modalAppendToBody: {
      type: Boolean,
      default: true
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      closed: false,
      key: 0
    }
  },

  computed: {
    style() {
      let style = {}
      if (!this.fullscreen) { // 不是全屏
        style.marginTop = this.top
        if (this.width) {
          style.width = this.width
        }
      }
      return style
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.closed = false
        this.$emit('open')
        this.$nextTick(() => {
          this.$refs.dialog.scrollTop = 0
        })
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      } else {
        this.closed = true
        this.$emit('close')
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.key++
          })
        }
      }
    }
  },

  mounted() {
    if (this.visible) {
      // open是mixins里的
      // 执行以后会添加遮罩层并计算lockScroll
      this.open()
      if (this.appendToBody) {
        document.body.appendChild(this.$el)
      }
    }
  },

  destroyed() {
    // 当在SPA中，如果切换路由
    // 此时dialog在#app外面，无法销毁
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },

  methods: {
    handleWrapperClick() {
      if (!this.closeOnClickModal) return
      this.handleClose()
    },
    handleClose() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide)
      } else {
        this.hide()
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.closed = true
      }
    },
    afterEnter() {
      this.$emit('opened')
    },
    afterLeave() {
      this.$emit('closed')
    }
  }
}
</script>