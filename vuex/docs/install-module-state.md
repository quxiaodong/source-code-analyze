把当前模块的state挂载在父级模块的state上，属性名是模块名

#### usage

```javascript
const store = new Vuex.Store({
  modules: {
    a: {
      state: { id: 456 },
      modules: {
        aa: {
          state: { id: 789 }
        }
      }
    },
    b: {}
  }
})
// store._modules.root.state = {
//   a: {
//     id: 456,
//     aa: { id: 789 }
//   },
//   b: {}
// }
// round1 path=[a]     parentState=rootState    moduleName=a
// round2 path=[a, aa] parentState=rootState[a] moduleName=aa
// round3 path=[b]     parentState=rootState    moduleName=b
```

#### achieve

```javascript
if (!isRoot && !hot) { // 根模块的state是在resetStoreVM函数上设置的
  // 以根state为起点，遍历数组，得到当前模块的父级state
  const parentState = getNestedState(rootState, path.slice(0, -1))
  const moduleName = path[path.length - 1]
  parentState[moduleName] = module.state
}
```