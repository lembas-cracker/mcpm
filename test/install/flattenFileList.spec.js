/* eslint-env mocha */

let proxyquire = require('proxyquire')
let chai = require('chai')
chai.should()
chai.use(require('sinon-chai'))

// Disabling logging in tests.
require('winston').level = Infinity

let path = require('path')

let unpackedPath = 'path-to-unpacked'
let zipPath = 'path-to-zip'

let fakeFileList = {
  'mods/1.8/./../1.8': 'fake.mod',
  './config': 'configfiles/*.cfg'
}

let flattenedFakeFileList = {
  [`mods${path.sep}1.8`]: [ 'fake.mod' ],
  'config': [ `configfiles${path.sep}1.cfg`, `configfiles${path.sep}2.cfg` ]
}

let flattenFileList = proxyquire('../../lib/install/flattenFileList', {
  glob: {
    sync (glob, opts) {
      opts.cwd.should.equal(unpackedPath)
      if (glob === 'configfiles/*.cfg') {
        return [ 'configfiles/1.cfg', 'configfiles/2.cfg' ]
      } else {
        return [ glob ]
      }
    }
  }
}
)

describe('install.flattenFileList', function () {
  it('treats items as globs', function () {
    let flattened = flattenFileList(fakeFileList, unpackedPath, zipPath)
    return flattened.should.deep.equal(flattenedFakeFileList)
  }
  )

  it('returns an Error when packageDirectory not specified', function () {
    let result = flattenFileList(fakeFileList)
    return result.should.be.an.instanceof(Error)
  }
  )

  it('returns an Error when trying to copy from outside of the package', function () {
    let result = flattenFileList(
      {'malicious': 'whatever/../..'}
      , unpackedPath, zipPath)
    return result.should.be.an.instanceof(Error)
  }
  )

  it('returns an Error when trying to copy from an absolute path', function () {
    let result = flattenFileList(
      {'malicious': path.resolve('whatever')}
      , unpackedPath, zipPath)
    return result.should.be.an.instanceof(Error)
  }
  )

  it('returns an Error when trying to copy to outside of Minecraft', function () {
    let result = flattenFileList(
      {'whatever/../..': 'malicious'}
      , unpackedPath, zipPath)
    return result.should.be.an.instanceof(Error)
  }
  )

  it('returns an Error when trying to copy to an absolute path', function () {
    let list = {}
    list[ path.resolve('whatever') ] = 'malicious'
    let result = flattenFileList(list, unpackedPath, zipPath)
    return result.should.be.an.instanceof(Error)
  }
  )

  it('allows to specify arrays of globs', function () {
    let list = {
      'mods/1.8/./../1.8': [ 'fake.mod' ],
      './config': 'configfiles/*.cfg'
    }

    let result = flattenFileList(list, unpackedPath, zipPath)
    return result.should.deep.equal(flattenedFakeFileList)
  }
  )

  it('handles several denormalized paths pointing to the same folder', function () {
    let list = {
      'mods/1.8/./../1.8': 'foo',
      './mods/1.8': 'bar',
      'mods/1.8': 'qux'
    }

    let result = flattenFileList(list, unpackedPath, zipPath)
    result.should.deep.equal({[`mods${path.sep}1.8`]: [ 'foo', 'bar', 'qux' ]})
  }
  )

  it("allows to specify '@' as a way to copy an archive with the package", function () {
    let list =
    {'mods/1.8': '@'}

    let result = flattenFileList(list, unpackedPath, zipPath)
    result.should.deep.equal({[`mods${path.sep}1.8`]: [ zipPath ]})
  }
  )

  it("ignores '@' when installing from a folder", function () {
    let list =
    {'mods/1.8': [ '@', 'other-file' ]}

    let result = flattenFileList(list, 'path-to-unpacked')
    result.should.deep.equal({[`mods${path.sep}1.8`]: [ 'other-file' ]})
  }
  )
}
)
