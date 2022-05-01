#### usage

```javascript
const user = {
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {}
}

const store = new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: { user }
})
```

> 从上述结构可知，不管是直接传入`Store`的对象还是`module`，它们都具有相同的属性。因此，我们可以封装一个`module`类和用于存放所有`module`类的集合

#### achieve

```javascript
// /src/module/module.js
class Module {
  constructor(rawModule, runtime) {
    // 存储所有子模块
    this._children = Object.create(null)
    // 记录原始数据
    this._rawModule = rawModule
    // 初始化原始数据中的state
    const rawState = rawModule.state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }

  get namespaced () { // 判断子模块是否是命名空间模块
    return !!this._rawModule.namespaced
  }

  addChild (key, module) { // 添加子模块
    this._children[key] = module
  }

  getChild (key) { // 获取子模块
    return this._children[key]
  }
}

export default Module
```

```javascript
// /src/module/module-collection.js
import Module from './module.js'

class ModuleCollection {
  constructor(rawRootModule) { // rawRootModule是创建store实例时传入的参数
    this.register([], rawRootModule, false)
  }

  register(path, rawModule, runtime = true) {
    const newModule = new Module(rawModule, runtime)

    if (path.length === 0) {
      this.root = newModule
    } else {
      // modules: { a: { modules: { aa: { modules: { aaa: {} } } } } }
      // ['a'].slice(0, -1)              => []
      // ['a', 'aa'].slice(0, -1)        => ['a']
      // ['a', 'aa', 'aaa'].slice(0, -1) => ['a', 'aa']
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) {
      // modules: { a, b, c }
      // path.concat(key) => ['a'] ['b'] ['c']
      // ------------------------------------------------------------------
      // modules: { a: { modules: { aa: { modules: { aaa: {} } } } } }
      // path.concat(key) => ['a'] ['a', 'aa'] ['a', 'aa', 'aaa']
      Object.keys(rawModule.modules).forEach(key => {
        this.register(path.concat(key), rawModule.modules[key], runtime)
      })
    }
  }

  get(path) {
    // 以根模块为起点，遍历数组以获取最终模块
    // [a, aa] 找到this.root下的a模块，再找到a模块下的aa模块
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }
}

export default ModuleCollection
```

```javascript
// /src/store.js
import ModuleCollection from './module/module-collection.js'

export class Store {
  constructor(options = {}) {
    // 初始化module树
    this._modules = new ModuleCollection(options)
  }
}
```