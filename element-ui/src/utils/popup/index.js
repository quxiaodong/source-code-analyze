import Vue from 'vue'
import PopupManager from './popup-manager'
import merge from '../merge'
import { getStyle, addClass, removeClass, hasClass } from '../dom'
import getScrollBarWidth from '../scrollbar-width'

let idSeed = 1

let scrollBarWidth

let lockScrollCount = 0

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 是否有遮罩层动画效果
    // 在dialog组件中，一直是true
    // 所以在添加和移除遮罩层的时候
    // 会添加v-modal-enter和v-modal-leave效果
    modalFade: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      rendered: false, // 为了性能优化，当visible为false时，默认不渲染DOM
      withoutHiddenClass: true,
      bodyPaddingRight: null, // 记录body标签上style的padding-right
      computedBodyPaddingRight: 0 // body实际的padding-right
    }
  },

  watch: {
    visible(val) {
      if (val) {
        // 如果visible默认值为false，watch到visible变更
        // 但此时rendered为false，所以需要置为true
        if (!this.rendered) {
          this.rendered = true
          // 后续的操作都需要基于DOM已经挂载，所以使用nextTick
          Vue.nextTick(() => {
            this.open()
          })
        } else {
          // 之前打开过了，DOM已经挂载，不需要使用nextTick
          this.open()
        }
      } else {
        this.close()
      }
    }
  },

  beforeMount() {
    this._popupId = 'popup-' + idSeed++
    PopupManager.register(this._popupId, this)
  },

  beforeDestroy() {
    PopupManager.deregister(this._popupId)
    PopupManager.closeModal(this._popupId)

    this.restoreBodyStyle()
  },

  methods: {
    // 针对Dialog组件，open方法的调用时机
    // visible默认值为true时，组件的mounted会调用open
    // visible默认值为false时，watch到visible变更会调用open
    open(options) {
      // 如果visible默认值为true，mounted的时候会调用open
      // 但此时rendered为false，所以需要置为true
      // 并且不需要使用nextTick
      if (!this.rendered) {
        this.rendered = true
      }

      const props = merge({}, this.$props || this, options)

      this.doOpen(props)
    },

    doOpen(props) {
      const dom = this.$el
      const modal = props.modal

      if (modal) { // 如果有遮罩层
        PopupManager.openModal(
          this._popupId,
          PopupManager.nextZIndex(),
          this.modalAppendToBody ? undefined : dom,
          props.modalClass,
          props.modalFade
        )
        if (props.lockScroll) {
          lockScrollCount++
          // 记录body上是否有el-popup-parent--hidden类
          // 在dialog嵌套dialog中，外层dialog打开了
          // 再打开内层dialog，此时withoutHiddenClass = false
          // 在内层dialog关闭时执行restoreBodyStyle
          // 就不会移除el-popup-parent--hidden类了
          this.withoutHiddenClass = !hasClass(document.body, 'el-popup-parent--hidden')
          // 如果没有el-popup-parent--hidden类，计算padding-right
          if (this.withoutHiddenClass) {
            this.bodyPaddingRight = document.body.style.paddingRight
            this.computedBodyPaddingRight = parseInt(getStyle(document.body, 'paddingRight'), 10)
          }
          // 获取滚动条宽度
          scrollBarWidth = getScrollBarWidth()
          // 下面两个是游览器会出现滚动条的情况
          let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight
          let bodyOverflowY = getStyle(document.body, 'overflowY')
          // 如果滚动条有宽度，并且出现了滚动条，并且body上没有el-popup-parent--hidden类
          if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll') && this.withoutHiddenClass) {
            document.body.style.paddingRight = this.computedBodyPaddingRight + scrollBarWidth + 'px'
          }
          addClass(document.body, 'el-popup-parent--hidden')
        }
      }

      dom.style.zIndex = PopupManager.nextZIndex()
    },

    close() {
      this.doClose()
    },

    doClose() {
      if (this.lockScroll) {
        setTimeout(this.restoreBodyStyle, 200)
      }

      this.doAfterClose()
    },

    doAfterClose() {
      PopupManager.closeModal(this._popupId)
    },

    restoreBodyStyle() {
      lockScrollCount--
      if (lockScrollCount === 0) {
        document.body.style.paddingRight = this.bodyPaddingRight
        removeClass(document.body, 'el-popup-parent--hidden')
      }
    }
  }
}

export { PopupManager }