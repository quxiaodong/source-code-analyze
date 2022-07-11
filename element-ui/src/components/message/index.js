import Vue from 'vue'
import MessageComponent from './message.vue'
import { isVNode } from '../../utils/vdom'
import { isObject } from '../../utils/types'
import { PopupManager } from '../../utils/popup'

const MessageConstructor = Vue.extend(MessageComponent)

let instances = []
let seed = 1

const Message = function(options) {
  options = options || {}
  if (typeof options === 'string') {
    options = {
      message: options
    }
  }
  let userOnClose = options.onClose
  let id = 'message_' + seed++
  options.onClose = function() {
    Message.close(id, userOnClose)
  }

  // 初始化弹窗距离顶部窗口的距离
  let verticalOffset = options.offset || 20
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16
  })
  options.verticalOffset = verticalOffset

  const instance = new MessageConstructor({ data: options })
  instance.id = id

  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message]
    instance.message = null
  }

  instance.$mount()
  document.body.appendChild(instance.$el)

  // 设置z-index
  instance.$el.style.zIndex = PopupManager.nextZIndex()

  instance.visible = true

  instances.push(instance)

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
  let removedHeight
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