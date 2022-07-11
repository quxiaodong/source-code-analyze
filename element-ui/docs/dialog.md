#### usage

```vue
<el-dialog :visible.sync="visible">
  <span>这是一段信息</span>
  <span slot="footer">
    <el-button @click="visible = false">取 消</el-button>
    <el-button @click="visible = false">确 定</el-button>
  </span>
</el-dialog>
```

#### dialog

使用`.sync`修饰符的形式来传入`visible`属性，组件通过`this.$emit('update:visible', false)`来修改传入的`visible`

```vue
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
        <div class="el-dialog__body">
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
export default {
  name: 'ElDialog',

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
    beforeClose: Function, // 只针对通过点击关闭按钮或遮罩层时才触发
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
      closed: false // 标识弹窗是否已关闭
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
        this.$emit('open') // 向父组件触发open事件
        this.$nextTick(() => { // 如果弹窗过长，发生了滚动，在显示的时候恢复原位
          this.$refs.dialog.scrollTop = 0
        })
      } else {
        this.closed = true
        this.$emit('close') // 向父组件触发close事件
      }
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
```

##### destroy-on-close

`Dialog`通过给外围`div`添加动态`key`来重新渲染元素，并不是所谓的销毁。如果`Dialog`的插槽传入的是组件，则会重新渲染组件，并执行组件的生命周期函数

```vue
<template>
  <transition name="el-dialog-fade">
    <div class="el-dialog__wrapper">
      <div class="el-dialog" :key="key"></div>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      key: 0
    }
  },

  watch: {
    visible(val) {
      if (val) {
        // ...
      } else {
        // ...
        if (this.destroyOnClose) { // 弹窗关闭的时候重新渲染
          this.$nextTick(() => {
            this.key++
          })
        }
      }
    }
  }
}
</script>
```

##### append-to-body

```vue
<script>
export default {
  watch: {
    visible(val) {
      if (val) {
        // ...
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      }
    }
  },

  mounted() {
    // 如果visible的初始值就是true
    // 由于watch visible没有设置immediate: true
    // 所以不会执行watch visible里的方法
    // 需要在mounted的时候手动执行相应方法
    // 那如果watch visible的时候设置immediate: true可不可行呢？
    // 不可行，因为当visible初始值是false时，会执行this.$emit('close')等方法
    if (this.visible) {
      // ...
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
  }
}
</script>
```

##### lock-scroll

```vue
<template>
  <div class="el-dialog__body" v-if="rendered">
    <slot></slot>
  </div>
</template>

<script>
import Popup from '../../utils/popup'

export default {
  mixins: [Popup],

  mounted() {
    if (this.visible) {
      // open方法是Popup mixin里的
      // 执行以后会添加遮罩层并计算lockScroll
      this.open()
    }
  }
}
</script>
```

`Dialog`和`MessageBox`等弹窗组件共用了`Popup mixin`，这里只提取了跟`Dialog`有关的代码

```javascript
// /src/utils/popup/index.js

import Vue from 'vue'
import PopupManager from './popup-manager'
import merge from '../merge'
import { getStyle, addClass, removeClass, hasClass } from '../dom'
import getScrollBarWidth from '../scrollbar-width'

let scrollBarWidth

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      rendered: false, // 为了性能优化，当visible初始值为false时，不渲染DOM
      withoutHiddenClass: true, // 记录当前body上是否有el-popup-parent--hidden类
      bodyPaddingRight: null, // 记录body标签上style的padding-right
      computedBodyPaddingRight: 0 // body实际的padding-right
    }
  },

  watch: {
    visible(val) {
      if (val) {
        // 如果visible初始值为false，watch到visible变更
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

  beforeDestroy() {
    // 在SPA中，如果不重置，会影响所有页面
    this.restoreBodyStyle()
  },

  methods: {
    // 针对Dialog组件，open方法的调用时机
    // visible初始值为true时，组件的mounted会调用open
    // visible初始值为false时，watch到visible变更会调用open
    open(options) {
      // 如果visible初始值为true，mounted的时候会调用open
      // 但此时rendered为false，所以需要置为true
      // 并且不需要使用nextTick
      if (!this.rendered) {
        this.rendered = true
      }

      const props = merge({}, this.$props || this, options)

      this.doOpen(props)
    },

    doOpen(props) {
      const modal = props.modal

      if (modal) { // 如果有遮罩层
        // ...
        if (props.lockScroll) {
          // 记录body上是否有el-popup-parent--hidden类
          // 在dialog嵌套dialog中，如果外层dialog打开了
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
          // 通过创建两个嵌套div，外围的div宽度是100px，内部的div宽度是100%
          // 通过设置外围div的overflow: scroll
          // 内部div的宽度加上滚动条的宽度等于外围div的宽度
          scrollBarWidth = getScrollBarWidth()
          // 下面两个是浏览器会出现滚动条的情况
          let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight
          let bodyOverflowY = getStyle(document.body, 'overflowY')
          // 如果滚动条有宽度，并且出现了滚动条，并且body上没有el-popup-parent--hidden类
          if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll') && this.withoutHiddenClass) {
            document.body.style.paddingRight = this.computedBodyPaddingRight + scrollBarWidth + 'px'
          }
          addClass(document.body, 'el-popup-parent--hidden')
        }
      }
    },

    close() {
      this.doClose()
    },

    doClose() {
      if (this.lockScroll) {
        setTimeout(this.restoreBodyStyle, 200) // 200ms应该是为了配合v-modal-leave效果的
      }
    },

    restoreBodyStyle() {
      if (this.modal && this.withoutHiddenClass) {
        document.body.style.paddingRight = this.bodyPaddingRight
        removeClass(document.body, 'el-popup-parent--hidden')
      }
    }
  }
}
```

> 当页面上有多个`dialog`，执行`visible1=flase; visible2=true`时，`lockScroll`会失效。因为`doClose`里执行`restoreBodyStyle`有200ms的延迟
>
> 方法一：去掉延迟，直接执行`restoreBodyStyle`方法
>
> 方法二：添加一个变量`lockScrollCount`来存储`lockScroll`弹窗个数

##### modal

```javascript
// /src/utils/popup/index.js

let idSeed = 1

export default {
  props: {
    // 是否有遮罩层动画效果
    // 会添加v-modal-enter和v-modal-leave效果
    modalFade: {
      type: Boolean,
      default: true
    }
  },

  beforeMount() {
    this._popupId = 'popup-' + idSeed++
    PopupManager.register(this._popupId, this)
  },

  beforeDestroy() {
    PopupManager.deregister(this._popupId)
    PopupManager.closeModal(this._popupId)
  },

  methods: {
    doOpen(props) {
      const dom = this.$el
      const modal = props.modal

      if (modal) {
        PopupManager.openModal(
          this._popupId,
          PopupManager.nextZIndex(),
          this.modalAppendToBody ? undefined : dom,
          props.modalClass,
          props.modalFade
        )
      }

      dom.style.zIndex = PopupManager.nextZIndex()
    },

    doAfterClose() {
      PopupManager.closeModal(this._popupId)
    }
  }
}
```

```javascript
// /src/utils/popup/popup-manager.js

import Vue from 'vue'
import { addClass, removeClass } from '../dom'

let hasModal = false
// 用于标识是否初始化过zIndex
let hasInitZIndex = false
let zIndex

const getModal = function() {
  let modalDom = PopupManager.modalDom
  if (modalDom) {
    hasModal = true
  } else {
    hasModal = false
    modalDom = document.createElement('div')
    PopupManager.modalDom = modalDom
  }

  return modalDom
}

const instances = {}

const PopupManager = {
  modalFade: true,

  // 以dialog举例，dialog嵌套dialog时
  // 关闭了内层dialog，此时需要判断modalStack里面是为空
  // 如果不为空，代表还有其他弹窗，是不应该关闭遮罩层的
  modalStack: [],

  register(id, instance) {
    if (id && instance) {
      instances[id] = instance
    }
  },

  deregister(id) {
    if (id) {
      instances[id] = null
      delete instances[id]
    }
  },

  nextZIndex() {
    return PopupManager.zIndex++
  },

  openModal(id, zIndex, dom, modalClass, modalFade) {
    if (!id || zIndex === undefined) return

    this.modalFade = modalFade

    const modalDom = getModal()

    addClass(modalDom, 'v-modal')
    // 当第一次打开Dialog的时候
    // 由于PopupManager.modalDom没有值
    // 所以hasModal=false
    // 所以会给遮罩层添加v-modal-enter效果
    if (this.modalFade && !hasModal) {
      addClass(modalDom, 'v-modal-enter')
    }

    setTimeout(() => {
      removeClass(modalDom, 'v-modal-enter')
    }, 200) // 因为v-modal-enter的动画持续时间是200ms

    // 如果传了DOM，说明不是添加到body上的
    if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
      dom.parentNode.appendChild(modalDom)
    } else {
      document.body.appendChild(modalDom)
    }

    if (zIndex) {
      modalDom.style.zIndex = zIndex
    }

    // 记录所有打开的遮罩层
    this.modalStack.push({ id, zIndex, modalClass })
  },

  closeModal(id) {
    const modalStack = this.modalStack
    const modalDom = getModal()

    if (modalStack.length > 0) {
      const topItem = modalStack[modalStack.length - 1]
      if (topItem.id === id) { // 如果当前关闭的遮罩层是最后打开的
        // 移除最后一个遮罩层
        modalStack.pop()
        if (modalStack.length > 0) {
          // 如果移除了以后modalStack里面还有值
          // 需要把遮罩层的层级降低
          modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex
        }
      } else { // 如果当前遮罩层不是最后一个打开的
        for (let i = modalStack.length - 1; i >= 0; i--) {
          if (modalStack[i].id === id) {
            modalStack.splice(i, 1)
            break
          }
        }
      }
    }

    // 如果modalStack为空，说明已经移除了所有弹窗
    if (modalStack.length === 0) {
      if (this.modalFade) {
        addClass(modalDom, 'v-modal-leave')
      }
      setTimeout(() => {
        // 在移除动画结束后，如果modalStack还是为空
        // 就移除遮罩层
        // 因为在移除过程中，200ms的时间内有可能打开其他弹窗
        if (modalStack.length === 0) {
          if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom)
          // 手动置为undefined
          // 下次再打开弹窗的时候
          // hasModal=false
          // 这样dialog的遮罩层又可以有v-modal-enter动画了
          PopupManager.modalDom = undefined
        }
        removeClass(modalDom, 'v-modal-leave')
      }, 200) // v-modal-leave的动画持续时间是200ms
    }
  }
}

Object.defineProperty(PopupManager, 'zIndex', {
  get() {
    if (!hasInitZIndex) {
      zIndex = zIndex || (Vue.prototype.$ELEMENT || {}).zIndex || 2000
      hasInitZIndex = true
    }
    return zIndex
  },
  set(value) {
    zIndex = value
  }
})

export default PopupManager
```