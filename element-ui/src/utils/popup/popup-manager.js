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
  // 来关闭遮罩层
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