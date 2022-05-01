import defaults from '../defaults/index.js'

function dispatchRequest(config) {
  const adapter = config.adapter || defaults.adapter

  return adapter(config)
}

export default dispatchRequest