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

const countLines = (file) => {
  return new Promise((resolve, reject) => {
    let count = 0
    fs.createReadStream(file)
    .on('data', function(chunk) {
      for (i=0; i < chunk.length; ++i)
        if (chunk[i] == 10) count++
    })
    .on('end', () => resolve(count))
    .on('error', reject)
  })
}

module.exports = {
  countLines,
  readRecursively
}
