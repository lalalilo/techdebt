# techdebt

Utils function to compute technical debt metrics and display them on the support of your choice.

## Install

```bash
npm install --save-dev techdebt
```

## Get started

This package is nothing more than an aggregation of helpers to get, save and display metrics.

It helps you to easily write a small script that computes metrics representing your technical debt. A good idea would be to run this script during continuous integration so that it updates a technical debt dashboard or Slack channel.

### Simple example: display the count of todos in Slack

```javascript
const techdebt = require('techdebt')
const slackClient = require('techdebt/clients/slack')
const fsHelper = require('techdebt/helpers/fs')

slackClient.initialize({
  HOOK_URL: 'https://hooks.slack.com/services/xx/xx/xx',
  channel: '#techdebt',
  username: 'Techdebt bot'
})

techdebt.run([
  {
    get: () => fsHelper.countRegex('src', /todo/gi),
    format: (count) => ({
      title: 'Todos count in code',
      text: count
    })
  }
])
.then(formatedMetrics => slackClient.post('Techdebt report', formatedMetrics))
.then(() => {
  return process.exit()
})
.catch(error => {
  console.error(error)
  return process.exit(1)
})
```

todo: add screenshot

### More complex example: display the historic of todos count in Slack

Sometimes it's useful to get the history of a metric and display it as a graph. To save a metric you can use any API that you like such as Google Spreadsheet API. The simplest API I found is to use [datadog API](https://www.datadoghq.com/) that allow to save metrics and take a snapshot of a graph.

```javascript
const techdebt = require('techdebt')
const slackClient = require('techdebt/clients/slack')
const fsHelper = require('techdebt/helpers/fs')

slackClient.initialize({
  HOOK_URL: 'https://hooks.slack.com/services/xx/xx/xx',
  channel: '#techdebt',
  username: 'Techdebt bot'
})
datadogClient.initialize({
  api_key: 'xxx',
  app_key: 'xxx'
})

techdebt.run([
  {
    get: () => {
      const count = fsHelper.countRegex('src', /todo/gi)
      return count
    },
    save: (count) => datadogClient.post('techdebt.todos', count),
    format: (count) => datadogClient.get('techdebt.todos', 3600 * 24 * 30)
      .then(snapshotUrl => ({ text: 'Todos in code', image_url: snapshotUrl }))
  }
])
.then(formatedMetrics => slackClient.post('Techdebt report', formatedMetrics))
.then(() => {
  return process.exit()
})
.catch(error => {
  console.error(error)
  return process.exit(1)
})
```



## API doc

### main

#### techdebt.run(metrics)

Takes an array of [metrics](#metrics) and return a promise of formated metrics.

Example:

```javascript
const techdebt = require('techdebt')

techdebt.run(metrics)
.then(formatedMetrics => {
  // do whatever you want with formated metrics
})
```

### Metric

```javascript
{

  get: Function
  save: Function
  format: Function
}
```

#### get()

A function that fetch the metric value. It returns a value of any type (you'll have to handle the value).

It can return a value or the promise of a value.

Example:

```javascript
get: () => fsHelper.countRegex('src', /todo/gi)
```

#### save(metricValue) (optional)

A function that save the value on a third party tool such as Datadog, Google Spreadsheet etc.

If it returns a promise, the format function will wait for this promise to be resolved before execution.

Example:

```javascript
const save = (metricValue) => datadogClient.post('techdebt.my_metric', metricValue)
```

#### format(metricValue)

A function that format the value as expected.

Example:

```javascript
format = (metricValue) => ({
  title: 'Todos count in code',
  text: metricValue
})
```

### Clients

#### Slack

##### slackClient.initialize(options)

Initialize the client with options

Example:

```javascript
const slackClient = require('techdebt/clients/slack')

slackClient.initialize({
  hookUrl: 'https://hooks.slack.com/services/xx/xx/xx', // required
  channel: '#techdebt', // required
  username: 'Techdebt bot' // optional
})
```

##### slackClient.post(title, attachments)

Post attachments to Slack.

#### Datadog

Using this client requires to install dogapi package:

```bash
npm install --save-dev dogapi
```

##### datadogClient.initialize(options)

```javascript
const datadogClient = require('techdebt/clients/datadog')

datadogClient.initialize({
  api_key: 'xxx', //required
  app_key: 'xxx' // required
})
```

##### datadogClient.post(metricName, metricValue)

Post a metric value that will be saved to datadog and wait for the metric to be fetchable (datadog has a delay in serving posted metrics).

It returns a promise that resolves when the metric is saved.

##### datadogClient.get(metricName, period)

Get the snapshot of a graph of a metric.

It returns a promise of the URL of the snapshot image.

#### missing a client? Trello, Google sheet ? Please [write an issue](https://github.com/lalalilo/techdebt/issues)

### Helpers

#### packages

This helper requires to install `npm-check`

```bash
npm install --save-dev npm-check
```

This helper allow you to know which of your dependencies are unused or need upgrades

##### packages.get(type)

type can be one of `major`, `minor`, `unused`, `upToDate`.

It returns a promise of the list of packages corresponding to the type.

##### packages.slackFormat(type, packages)

Returns a predefined Slack attachment format

Example:

```javascript
const slackClient = require('techdebt/clients/slack')
const packages = require('techdebt/helpers/packages')
const techdebt = require('techdebt')

slackClient.initialize({
  HOOK_URL: 'https://hooks.slack.com/services/xx/xx/xx',
  channel: '#techdebt',
  username: 'Techdebt bot'
})

techdebt.run([
  {
    get: () => packages.get('major'),
    format: (items) => packages.slackFormat('major', items)
  },
  {
    get: () => packages.get('minor'),
    format: (items) => packages.slackFormat('minor', items)
  },
  {
    get: () => packages.get('unused'),
    format: (items) => packages.slackFormat('unused', items)
  },
  {
    get: () => packages.get('upToDate'),
    format: (items) => packages.slackFormat('upToDate', items)
  }
])
.then(formatedMetrics => {
  return slackClient.post('Techdebt report', formatedMetrics)
})
.then(() => {
  return process.exit()
})
.catch(error => {
  console.error(error)
  return process.exit(1)
})
```

#### fsHelper

A librairy of helper functions to analyse source files.

##### fsHelper.readRecursively(root)

Get the recursive list of files in a directory.

Example:

```javascript
fsHelper.readRecursively('src')
```

##### fsHelper.countLines(root, options)

Sum the lines of files in a directory (recursively).
You can specify an extension in the options.
The returned value is a promise of the line count.

Example:

```javascript
fsHelper.countLines('src', { extension: 'js' }).then(lineCount => ...)
```

##### fsHelper.countRegex(root, regex, options)

Sum the number of occurence if a regex in a directory (recursively).
You can specify an extension in the options.
The returned value is a promise of the count.

Example:

```javascript
fsHelper.countRegex('src', /todo/gi, { extension: 'js' }).then(count => ...)
```

```javascript
const slackClient = require('techdebt/clients/slack')
const datadogClient = require('techdebt/clients/datadog')
const fsHelper = require('techdebt/helpers/fs')
const techdebt = require('techdebt')

slackClient.initialize({
  HOOK_URL: 'https://hooks.slack.com/services/xx/xx/xx',
  channel: '#techdebt',
  username: 'Techdebt bot'
})
datadogClient.initialize({
  api_key: 'xxx',
  app_key: 'xxx'
})

techdebt.run([
  {
    get: () => {
      const count = fsHelper.countRegex('src', /todo/gi)
      return count
    },
    save: (value) => datadogClient.post('techdebt.todos', value),
    format: (count) => datadogClient.get('techdebt.todos', 3600 * 24 * 30).then(snapshotUrl => ({
      text: 'Todos in code',
      image_url: snapshotUrl
    }))
  },
  {
    get: () => fsHelper.getRegexMatches('src', /todo(.*)/gi),
    format: (matches) => ({
      title: 'Todos in code',
      text: matches.join('\n'),
      color: 'warning'
    })
  }
])
.then(formatedMetrics => {
  return slackClient.post('Techdebt report', formatedMetrics)
})
.then(() => {
  return process.exit()
})
.catch(error => {
  console.error(error)
  return process.exit(1)
})
```

##### fsHelper.getRegexMatches(root, regex, options)

Get the matches of a regex in a directory (recursively).
You can specify an extension in the options.
The returned value is a promise of the matches.

Example:

```javascript
fsHelper.getRegexMatches('src', /todo(.*)/gi, { extension: 'js' }).then(matches => ...)
```
