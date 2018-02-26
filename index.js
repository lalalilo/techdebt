const run = (techdebtMetrics) => {
  Promise.all(techdebtMetrics.map(metric => metric.get()))
  .then(metrics => {
    return Promise.all(
      metrics.map((metric, index) => {
        return techdebtMetrics[index].save && techdebtMetrics[index].save(metric)
        .catch(err => {
          console.error(err)
        })
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
