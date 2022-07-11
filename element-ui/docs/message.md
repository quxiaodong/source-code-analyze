#### usage

```vue
<el-button @click="$message('这是一条消息提示')">打开消息提示</el-button>
```

#### message

```vue
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
      visible: false, // 是否展示弹窗
      message: '', // 弹窗内容
      duration: 3000, // 默认关闭时间
      type: 'info', // 默认弹窗类型
      iconClass: '', // 自定义icon类
      customClass: '', // 自定义className
      onClose: null, // 关闭回调
      showClose: false, // 是否展示关闭按钮
      closed: false, // 用于标识message是否关闭
      verticalOffset: '', // message距离窗口顶部的偏移量
      timer: null,
      dangerouslyUseHTMLString: false, // 是否渲染html标签
      center: false // 居中对齐
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
      // 弹窗可以自动关闭，也可以手动关闭
      // 如果手动关闭，在duration到期后
      // 会再次执行，所以需要closed来标识
      // 弹窗是否已经关闭
      if (this.closed) return

      this.closed = true
      this.visible = false
      if (typeof this.onClose === 'function') {
        this.onClose(this) // 关闭弹窗的回调
      }
    }
  }
}
</script>
```

```javascript
import Vue from 'vue'
import MessageComponent from './message.vue'
import { isVNode } from '../../utils/vdom'
import { isObject } from '../../utils/types'
import { PopupManager } from '../../utils/popup'

const MessageConstructor = Vue.extend(MessageComponent)

let instances = []
let seed = 1 // 自增id

const Message = function(options) {
  // 格式化options
  options = options || {}
  if (typeof options === 'string') {
    options = {
      message: options
    }
  }

  // 存储传入的关闭回调
  let userOnClose = options.onClose
  let id = 'message_' + seed++
  // 关闭弹窗时，执行Message.close
  options.onClose = function() {
    Message.close(id, userOnClose)
  }

  // 初始化弹窗距离顶部窗口的距离
  let verticalOffset = options.offset || 20
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16 // 16是两个弹窗之间的间距
  })
  options.verticalOffset = verticalOffset

  // 创建实例
  const instance = new MessageConstructor({ data: options })
  instance.id = id
  
  // 如果是虚拟DOM，通过slot形式插入内容
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message]
    instance.message = null
  }

  // 挂载DOM
  instance.$mount()
  document.body.appendChild(instance.$el)

  // 设置z-index
  instance.$el.style.zIndex = PopupManager.nextZIndex()

  // 可以通过组件实例来修改visible
  // 也可以在组件的mounted里设置visible
  instance.visible = true

  instances.push(instance)

  // 返回实例，后续可以通过close方法来手动关闭弹窗
  return instance
}

;['success', 'warning', 'info', 'error'].forEach(type => {
  Message[type] = options => {
    // 如果options是普通对象，不是虚拟DOM
    if (isObject(options) && !isVNode(options)) {
      return Message({
        ...options,
        type
      })
    }
    // 如果options是字符串或虚拟DOM
    return Message({
      message: options,
      type
    })
  }
})

Message.close = function(id, userOnClose) {
  let len = instances.length
  let index = -1
  let removedHeight // 记录当前关闭的弹窗的高度

  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      removedHeight = instances[i].$el.offsetHeight
      index = i
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i])
      }
      instances.splice(i, 1)
      break
    }
  }

  if (len <= 1 || index === -1 || index > instances.length - 1) return

  // 当前关闭的弹窗，往后的所有弹窗都需要向上移动来填充空白位置
  for (let i = index; i < len - 1 ; i++) {
    let dom = instances[i].$el
    dom.style['top'] = parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px'
  }
}

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

export default Message
```