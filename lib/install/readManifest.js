let path = require('path')
let fs = require('fs-extra-promise')

module.exports = function readManifest (folderPath) {
  return fs.readFile(path.join(folderPath, 'mcpm-package.json'), 'utf8')
  .then(rawJson => JSON.parse(rawJson))
}
