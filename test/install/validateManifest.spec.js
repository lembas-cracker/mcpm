/* eslint-env mocha */

let proxyquire = require('proxyquire')

let validateManifest = proxyquire('../../lib/install/validateManifest', {
  './readManifest' (str) { return str },
  '../util': {
    getCurrentProfile () {
      return {version: '1.8.0'}
    }}
})

describe('install.validateManifest', function () {
  it('returns a SyntaxError when invalid JSON', function () {
    let result = validateManifest("{'nope'}")
    result.should.be.an.instanceof(SyntaxError)
  })

  it('returns an Error when no name', function () {
    let result = validateManifest(JSON.stringify({
      version: '0.1.0',
      mc: '1.8',
      install_executable: 'index.js'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('name')
  })

  it('returns an Error when no version', function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      mc: '1.8',
      install_executable: 'index.js'
    })
    )
    result.should.be.an.instanceof(Error)
    result.message.should.contain('version')
  })

  it('returns an Error when no mc', function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version: '0.1.0',
      install_executable: 'index.js'
    })
    )
    result.should.be.an.instanceof(Error)
    result.message.should.contain('mc')
  })

  let names = [ '', undefined, '-', '1sdf', 'π', 'mcpm/mcpm' ]
  names.forEach(name => it(`returns an Error when invalid name: ${name}`, function () {
    let result = validateManifest(JSON.stringify({
      name,
      version: '0.1.0',
      mc: '1.8',
      install_executable: 'index.js'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('name')
  }))

  let versions = [ '', undefined, '1', '1.2', '1.2.', '1-2-3' ]
  versions.forEach(version => it(`returns an Error when invalid version: ${version}`, function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version,
      mc: '1.8',
      install_executable: 'index.js'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('version')
  }))

  versions = [ '', undefined, true, '1.', '1.2.', '1-2-3', 'all' ]
  versions.forEach(mc => it(`returns an Error when invalid mc: ${mc}`, function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version: '0.1.0',
      mc,
      install_executable: 'index.js'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('mc')
  }))

  it('returns an Error when incompatible with current Minecraft version', function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version: '0.1.0',
      mc: '1.5',
      install_executable: 'index.js'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('version')
  })

  it('returns the config when it is valid', function () {
    let config = {
      name: 'fake',
      version: '0.1.0',
      mc: '1.8',
      install_executable: 'index.js'
    }
    let result = validateManifest(JSON.stringify(config))
    result.should.deep.equal(config)
  })

  it('allows install_file_list instead of install_executable', function () {
    let config = {
      name: 'fake',
      version: '0.1.0',
      mc: '1.8',
      install_file_list: { 'mods/fake-mod': 'index.js'
      }
    }
    let result = validateManifest(JSON.stringify(config))
    result.should.deep.equal(config)
  })

  it('returns an Error when install_file_list is not an object', function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version: '0.1.0',
      mc: '1.8',
      install_file_list: [ 'index.js' ]
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('install')
  })

  it('returns an Error when no install_file_list/install_executable', function () {
    let result = validateManifest(JSON.stringify({
      name: 'fake',
      version: '0.1.0',
      mc: '1.8'
    }))
    result.should.be.an.instanceof(Error)
    result.message.should.contain('install')
  })

  it('allows custom fields', function () {
    let config = {
      name: 'fake',
      version: '0.1.0',
      mc: '1.8',
      install_executable: 'index.js',
      custom: 'whatever',
      field: 5
    }
    let result = validateManifest(JSON.stringify(config))
    result.should.deep.equal(config)
  })
})
