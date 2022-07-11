import './theme/index.scss'

import Button from './components/button'
import ButtonGroup from './components/button-group'
import Card from './components/card'
import Carousel from './components/carousel'
import CarouselItem from './components/carousel-item'
import Checkbox from './components/checkbox'
import CheckboxGroup from './components/checkbox-group'
import Col from './components/col'
import Dialog from './components/dialog'
import Message from './components/message'
import Radio from './components/radio'
import RadioGroup from './components/radio-group'
import Row from './components/row'
import Switch from './components/switch'

const components = [
  Button, ButtonGroup,
  Card, Carousel, CarouselItem, Checkbox, CheckboxGroup, Col,
  Dialog,
  Radio, RadioGroup, Row,
  Switch
]

const install = (Vue, opts = {}) => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })

  Vue.prototype.$message = Message
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  ...components
}