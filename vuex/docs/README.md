1. 第一步，我们根据`vuex`的用法来创建一个对象，包含`install`方法和`Store`类

- [vuex](/vuex/docs/vuex.md)

2. 完善`install`方法，通过`Vue.mixin`的形式给每个`Vue`实例注入`$store`属性

- [install](/vuex/docs/install.md)

3. 接下来，我们来完成`store.commit`方法

- [commit](/vuex/docs/commit.md)

4. 接下来，我们来完成`store.dispatch`方法

- [dispatch](/vuex/docs/dispatch.md)

5. 根据传入`Store`类的参数构建`module`树。`module`树挂载在`store._modules`上，`store._modules`的`root`属性代表根模块，`_children`包含当前模块下的所有子模块

- [module](/vuex/docs/module.md)

6. 根据创建的`module`树，收集所有模块的`state`、`getters`、`mutations`、`actions`，并把它们绑定到相应的对象上

- [install-module](/vuex/docs/install-module.md)
- [install-module-state](/vuex/docs/install-module-state.md)
- [install-module-context](/vuex/docs/install-module-context.md)
- [install-module-mutations](/vuex/docs/install-module-mutations.md)
- [install-module-actions](/vuex/docs/install-module-actions.md)
- [install-module-getters](/vuex/docs/install-module-getters.md)
- [install-module-fixbug](/vuex/docs/install-module-fixbug.md)

7. 创建`Vue`实例，`store.state`和`store.getters`都是读取的实例数据

- [resetStoreVM](/vuex/docs/reset-storevm.md)
