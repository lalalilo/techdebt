const run = (techdebtMetrics) => {
  return Promise.all(techdebtMetrics.map(metric => metric.get()))
  .then(metrics => {
    return Promise.all(
      metrics.map((metric, index) => {
        return techdebtMetrics[index].save && techdebtMetrics[index].save(metric)
      })
    ).then(_ => metrics)
  })
  .then(metrics => {
    return Promise.all(
      metrics.map((metric, index) => techdebtMetrics[index].format(metric))
    )
  })
}

module.exports = {
  run
}
