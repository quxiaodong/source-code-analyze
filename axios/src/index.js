import Axios from './core/Axios.js'
import mergeConfig from './core/mergeConfig.js'
import defaults from './defaults/index.js'
import CancelToken from './cancel/CancelToken.js'

function createInstance(defaultConfig) {
  const instance = new Axios(defaultConfig)

  instance.create = function(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig))
  }

  return instance
}

const axios = createInstance(defaults)

axios.CancelToken = CancelToken

export default axios