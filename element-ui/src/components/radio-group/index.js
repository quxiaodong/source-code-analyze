import RadioGroup from './radio-group.vue'

RadioGroup.install = Vue => {
  Vue.component(RadioGroup.name, Radio)
}

export default RadioGroup