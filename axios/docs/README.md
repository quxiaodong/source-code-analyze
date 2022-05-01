1. 第一步：我们先来创建一个构造函数，在上面挂载需要用到的原型方法，如`request`、`get`、`post`等

- [Axios Constructor](/axios/docs/constructor.md)

2. `axios`是一个适用于`browser`和`node.js`的`Http`库。在`browser`上，它使用`XMLHttpRequest`方法

- [XMLHttpRequest](/axios/docs/xhr.md)

3. 接下来，我们创建一个默认配置文件，包含`timeout`等配置

- [Default Config](/axios/docs/defaults.md)

4. 完成上述操作后，我们创建一个返回`axios`实例的工厂函数，创建并导出一个实例，用户可以通过`import axios from 'axios'`来使用

- [Create Instance](/axios/docs/instance.md)

5. `axios`的所有请求本质都是调用`axios.request`来实现，我们完善`axios.request`方法，对传入函数的参数进行初始化

- [Axios.prototype.request](/axios/docs/axios.prototype.request.md)

6. `axios`的其他方法都是通过调用`axios.request`来实现请求。接下来，我们完善`get`、`post`等方法

- [Axios.prototype.method](/axios/docs/axios.prototype.method.md)

7. 创建统一触发请求的函数，所有的请求都通过`dispatchRequest`来触发

- [Dispatch Request](/axios/docs/dispatch-request.md)

8. 添加请求拦截器和响应拦截器，通过`Promise`链式地调用拦截器

- [Interceptors](/axios/docs/interceptors.md)

9. 添加请求取消事件，通过外部函数来控制`Promise`的状态

- [CancelToken](/axios/docs/cancel-token.md)