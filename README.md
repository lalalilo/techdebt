# techdebt

Utils function to compute technical debt metrics and send them to datadog.

## Install

`npm install --save-dev techdebt`

## Usage

Create a script computing the metrics you want to display. For example:

```javascript
const techdebt = require('techdebt')

var options = {
  api_key: "xxx",
  app_key: "xxx",
}

Promise.all([
  techdebt.dependenciesUpgrade('lalilo.techdebt.dependencies'),
  techdebt.countLinesWithExtension('src', '.css'),
  techdebt.countFilesWithExtension('src', '.css'),
  techdebt.countLinesWithExtension('src', '.js')
])
.then(([dependenciesMetrics, cssLinesCount, cssFilesCount, jsLinesCount]) => {
  return techdebt.sendMetrics(
    dependenciesMetrics.concat([
      {
        metric: 'lalilo.techdebt.css_in_js.files',
        points: cssFilesCount
      },
      {
        metric: 'lalilo.techdebt.css_in_js.lines',
        points: cssLinesCount
      },
      {
        metric: 'lalilo.techdebt.js.lines',
        points: jsLinesCount
      }
    ]),
    options
  )
})
.then(() => {
  process.exit(0)

})
.catch((error) => {
  console.log(error)
  process.exit(1)
})
```
