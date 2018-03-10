const request = require('request')

let options = {}

const initialize = (_options) => {
  options = _options
}

const get = () => {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: `https://codecov.io/api/gh/${options.repo}/branch/${options.branch}?access_token=${options.accessToken}`,
      json: true
    }, (error, res) => {
      if (error) return reject(error)
      return resolve({
        timestamp: new Date(Date.parse(res.body.commit.timestamp)).getTime() / 1000,
        ratio: parseFloat(res.body.commit.totals.c)
      })
    })
  })
}

module.exports = {
  get,
  initialize
}
