const request = require('request')
const dogapi = require('dogapi')

const post = (metric, value) => {
  const now = parseInt(new Date().getTime() / 1000, 10)
  return getLastPointsCount(metric, now).then(lastPointsCount => {
    return new Promise((resolve, reject) => {
      dogapi.metric.send(metric, [[now, value]], function(err, results) {
        if (err) return reject(err)
        return waitForMetricAvailable(metric, lastPointsCount, now, 10).then(resolve).catch(reject)
      })
    })
  })
}

const get = (metric, period) => {
  return new Promise((resolve, reject) => {
    const to = dogapi.now()
    const from = to - period
    dogapi.graph.snapshot(`${metric}{*}`, from, to, function(err, res){
      if (err) return reject(err)
      waitForResourceAvailable(res.snapshot_url, 10)
      .then(() => resolve(res.snapshot_url))
      .catch(reject)
    })
  })
}

const waitForResourceAvailable = (url, maxRetry) => {
  return new Promise((resolve, reject) => {
    if (maxRetry === 0) {
      console.warn(`max retry reached`)
      return resolve()
    }
    request({ url }, (err, res) => {
      if (err) return reject(err)
      // the resource is available for a while but without content
      if (parseInt(res.headers['content-length'], 10) > 180) return resolve()
      setTimeout(() => waitForResourceAvailable(url, maxRetry - 1).then(resolve).catch(reject), 200)
    })
  })
}

const getLastPointsCount = (metric, now) => {
  return new Promise((resolve, reject) => {
    dogapi.metric.query(now - 1000, now + 1000, `${metric}{*}`, (err, res) => {
      if (err) return reject(err)
      if (!res.series[0]) return resolve(0)
      return resolve(res.series[0].length)
    })
  })
}
const waitForMetricAvailable = (metric, lastPointsCount, now, maxRetry) => {
  return new Promise((resolve, reject) => {
    if (maxRetry === 0) {
      console.warn(`max retry reached for ${metric}`)
      return resolve()
    }
    dogapi.metric.query(now - 1000, now + 1000, `${metric}{*}`, (err, res) => {
      if (err) return reject(err)
      if (res.series[0] && res.series[0].length > lastPointsCount) return resolve()
      setTimeout(
        () => waitForMetricAvailable(metric, lastPointsCount, now, maxRetry - 1).then(resolve).catch(reject),
        2000
      )
    })
  })
}

module.exports = {
  get,
  post,
  initialize: dogapi.initialize
}
