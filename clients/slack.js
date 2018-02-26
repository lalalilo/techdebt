const request = require('request')

let options = {}

const initialize = (_options) => {
  options = _options
}

const post = (text, attachments) => {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: options.hookUrl,
      body: JSON.stringify({
        username: options.username || 'Techdebt bot',
        text: text,
        channel: options.channel,
        attachments: attachments
      })
    }, (error, res) => {
      if (error) return reject(error)
      return resolve()
    })
  })
}

module.exports = {
  post,
  initialize
}
