import Module from './module.js'

class ModuleCollection {
  constructor(rawRootModule) {
    this.register([], rawRootModule, false)
  }

  register(path, rawModule, runtime = true) {
    const newModule = new Module(rawModule, runtime)

    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) {
      Object.keys(rawModule.modules).forEach(key => {
        this.register(path.concat(key), rawModule.modules[key], runtime)
      })
    }
  }

  get(path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }

}

export default ModuleCollection