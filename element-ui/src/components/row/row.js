export default {
  name: 'ElRow',

  componentName: 'ElRow',

  props: {
    gutter: Number,
    type: String,
    align: String,
    justify: {
      type: String,
      default: 'start'
    },
    tag: {
      type: String,
      default: 'div'
    }
  },

  computed: {
    style() {
      const style = {}

      if (this.gutter) {
        style.marginLeft = `-${this.gutter / 2}px`
        style.marginRight = style.marginLeft
      }

      return style
    }
  },

  render(h) {
    return h(
      this.tag,
      {
        class: [
          'el-row',
          this.justify !== 'start' ? `is-justify-${this.justify}` : '',
          this.align ? `is-align-${this.align}` : '',
          { 'el-row--flex': this.type === 'flex' }
        ],
        style: this.style
      },
      this.$slots.default
    )
  }
}