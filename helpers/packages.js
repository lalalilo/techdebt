const npmCheck = require('npm-check')

const packagesPromise = npmCheck().then(currentState => currentState.get('packages'))

const types = {
  major: {
    title: 'Major update available 🤔',
    filter: item => item.bump === 'major',
    text: item => `${item.moduleName}: ${item.installed} → ${item.latest}`,
    color: 'danger'
  },
  minor: {
    title: 'Minor update available 😍',
    filter: item => item.bump === 'minor',
    text: item => `${item.moduleName}: ${item.installed} → ${item.latest}`,
    color: 'warning'
  },
  unused: {
    title: 'Packages that seem unused 😬',
    filter: item => item.unused,
    text: item => item.moduleName,
    color: 'warning'
  },
  upToDate: {
    title: 'Up to date packages 😇',
    filter: item => item.bump === null,
    text: item => `${item.moduleName}: ${item.installed} → ${item.latest}`,
    color: 'good'
  }
}


const get = (type) => {
  const state = types[type]
  return packagesPromise
  .then(packages => packages.filter(state.filter))
}

const slackFormat = (type, packages) => ({
  fallback: types[type].title,
  title: types[type].title,
  color: types[type].color,
  text: packages.map(types[type].text).join('\n')
})

module.exports = {
  get,
  slackFormat
}
