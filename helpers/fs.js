const fs = require('fs')
const path = require('path')

const readRecursively = (dir) => {
  return fs.readdirSync(dir)
  .reduce((files, file) => {
    if(fs.statSync(path.join(dir, file)).isDirectory()) {
      return files.concat(readRecursively(path.join(dir, file)))
    }
    return files.concat(path.join(dir, file))
  }, [])
}

const countFileLines = (file) => {
  return new Promise((resolve, reject) => {
    let count = 0
    fs.createReadStream(file)
    .on('data', function(chunk) {
      for (let i=0; i < chunk.length; ++i)
        if (chunk[i] === 10) count++
    })
    .on('end', () => resolve(count))
    .on('error', reject)
  })
}

const countLines = (root, options = {}) => {
  return Promise.all(readRecursively(root)
  .filter((file) => options.extension ? file.split('.').splice(-1)[0] === options.extension : true)
  .map((file) => countFileLines(file)))
  .then(counts => counts.reduce((total, count) => {
    total += count
    return total
  }, 0))
}

const countRegex = (root, regex, options = {}) => {
  return readRecursively(root)
  .filter((file) => options.extension ? file.split('.').splice(-1)[0] === options.extension : true)
  .map((file) => {
    const data = fs.readFileSync(file, 'utf8')
    const matches = data.toString().match(regex)
    return matches ? matches.length : 0
  })
  .reduce((total, count) => {
    total += count
    return total
  }, 0)
}

const getRegexMatches = (root, regex, options = {}) => {
  return readRecursively(root)
  .filter((file) => options.extension ? file.split('.').splice(-1)[0] === options.extension : true)
  .map((file) => {
    const data = fs.readFileSync(file, 'utf8')
    const matches = data.toString().match(regex)
    return matches ? matches : []
  })
  .reduce((allMatches, fileMatches) => allMatches.concat(fileMatches), [])
}

module.exports = {
  readRecursively,
  countLines,
  countRegex,
  getRegexMatches
}
