const dogapi = require('dogapi')
const endsWith = require('lodash.endswith')
const fs = require('./fs')
const npmCheck = require('npm-check')

const dependenciesUpgrade = (metric) => {
  return npmCheck()
  .then(currentState => {
    return currentState.get('packages').map((item) => {
      return {
        metric,
        points: 1,
        tags: [
          `dependencies:${item.moduleName}`,
          item.bump ? `bump:${item.bump}` : 'up_to_date'
        ]
      }
    })
  })
}

const countFilesWithExtension = (root, extension) => {
  return fs.readRecursively(root)
  .filter((file) => endsWith(file, extension))
  .length
}

const countLinesWithExtension = (root, extension) => {
  return Promise.all(fs.readRecursively(root)
  .filter((file) => endsWith(file, extension))
  .map((file) => fs.countLines(file)))
  .then(counts => counts.reduce((total, count) => {
    total += count
    return total
  }, 0))
}

const sendMetrics = (metrics, options) => {
  dogapi.initialize(options)
  return new Promise((resolve, reject) => {
    dogapi.metric.send_all(metrics, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

module.exports = {
  dependenciesUpgrade,
  countFilesWithExtension,
  countLinesWithExtension,
  sendMetrics
}
