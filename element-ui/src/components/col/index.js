import Col from './col'

Col.install = Vue => {
  Vue.component(Col.name, Col)
}

export default Col