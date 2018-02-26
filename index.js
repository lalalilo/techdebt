const run = (techdebtMetrics) => {
  return Promise.all(techdebtMetrics.map(metric => metric.get().catch(console.error)))
  .then(metrics => {
    return Promise.all(
      metrics.map((metric, index) => {
        return techdebtMetrics[index].save && techdebtMetrics[index].save(metric)
        .catch(console.error)
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
