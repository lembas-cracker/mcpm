let _ = require('lodash')
let path = require('path')
let glob = require('glob')

function flattenFileList (list, unpackedPath, zipPath) {
  if (!unpackedPath) {
    return new Error('Package directory not specified!')
  }

  let flattened = _(list)
    .mapValues(_.castArray)
    .mapValues(globList => _.map(globList, oneGlob => {
      if (oneGlob === '@') return zipPath
      return glob.sync(oneGlob, {cwd: unpackedPath})
    }))
    .mapValues(_.flatten)
    .mapValues(_.compact)
    .mapValues(fileList => _.map(fileList, path.normalize))
    .omitBy(_.isEmpty)
    .transform((result, fromList, toKey) => {
      let normalizedTo = path.normalize(toKey)
      result[normalizedTo] = (result[normalizedTo] || []).concat(fromList)
    })
    .mapValues(_.uniq)
    .value()

  let thingsToCheck = [
    {array: _.keys(flattened), preposition: 'to'},
    {array: _.flatten(_.values(flattened)), preposition: 'from'}
  ]
  thingsToCheck.forEach(thing => {
    if (_.some(thing.array, item => item.startsWith(`..${path.sep}`) || item === '..')) {
      return new Error(`Trying to copy ${thing.preposition} outside of Minecraft!`)
    } else if (_.some(thing.array, path.isAbsolute)) {
      return new Error(`Trying to copy ${thing.preposition} an absolute path!`)
    }
  })

  return flattened
}

module.exports = flattenFileList
