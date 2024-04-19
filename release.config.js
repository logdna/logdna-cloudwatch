'use strict'

/* istanbul ignore file */
const config = require('semantic-release-config-logdna')

module.exports = {
  ...config
, npmPublish: false
, plugins: remap(config.plugins)
}

function remap(plugins) {
  const remapped = []

  for (const [name, config] of plugins) {
    if (name === '@semantic-release/github') {
      remapped.push([
        '@semantic-release/github', {
          ...(config || {})
        , assets: [
            'pkg/*.zip'
          ]
        }
      ])
      continue
    }

    remapped.push([name, config])
  }

  return remapped
}
