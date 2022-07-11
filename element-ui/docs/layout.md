#### usage

```vue
<el-row>
  <el-col :span="24"></el-col>
</el-row>
```

#### row

```javascript
// /components/row/row.js
export default {
  name: 'ElRow',

  // 自定义属性，主要用来做标识
  // col组件会递归向上寻找componentName为ElRow的父元素
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

      // 当传递了gutter
      // col组件会设置padding-left和padding-right
      // 这样就会导致最左边和最右边会有空白
      // row组件需要设置负padding来填补空白
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
```

#### col

```javascript
// /components/col/col.js
export default {
  name: 'ElCol',

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    span: {
      type: Number,
      default: 24
    },
    offset: Number,
    push: Number,
    pull: Number,
    xs: [Number, Object],
    sm: [Number, Object],
    md: [Number, Object],
    lg: [Number, Object],
    xl: [Number, Object]
  },

  computed: {
    gutter() {
      let parent = this.$parent
      while(parent && parent.$options.componentName !== 'ElRow') {
        parent = parent.$parent
      }
      return parent ? parent.gutter : 0
    }
  },

  render(h) {
    const classList = []
    const style = {}

    if (this.gutter) {
      style.paddingLeft = this.gutter / 2 + 'px'
      style.paddingRight = style.paddingLeft
    }

    // :span="4" :offset="4"
    ;['span', 'offset', 'pull', 'push'].forEach(prop => {
      if (this[prop] || this[prop] === 0) {
        classList.push(
          prop !== 'span'
            ? `el-col-${prop}-${this[prop]}` // el-col-offset-4
            : `el-col-${this[prop]}` // `el-col-4`
        )
      }
    })

    // :xs="4" ==> el-col-xs-4
    // :xs="{span: 4, offset: 4}" ==> el-col-xs-4 el-col-xs-offset-4
    ;['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
      if (typeof this[size] === 'number') { // 第一种情况
        classList.push(`el-col-${size}-${this[size]}`) // el-col-xs-4
      } else if (typeof this[size] === 'object') { // 第二种情况
        let props = this[size] // {span: 4, offset: 4}
        Object.keys(props).forEach(prop => { // [span, offset]
          classList.push(
            prop !== 'span'
              ? `el-col-${size}-${prop}-${props[prop]}` // el-col-xs-offset-4
              : `el-col-${size}-${props[prop]}` // el-col-xs-4
          )
        })
      }
    })

    return h(
      this.tag,
      {
        class: ['el-col', classList],
        style
      },
      this.$slots.default
    )
  }
}
```