chai = require "chai"
sinon = require "sinon"

mcpm = require "../lib/mcpm.js"

chai.should()
chai.use require "sinon-chai"

install = require "../lib/install"

describe "mcpm", ->

	describe "install", ->

		it "returns an Error when parsePackageString returns null", ->
			sinon.stub install, "parsePackageString", -> null
			result = mcpm.install "whatever"
			result.should.be.instanceof Error
			install.parsePackageString.should.have.been.calledOnce
			install.parsePackageString.restore()

		it "calls install.fromFolder when package is of 'folder' type", ->
			sinon.stub install, "parsePackageString", ->
				type: "folder"
				name: "whatever"

			sinon.stub install, "fromFolder", ( dir ) ->
				dir.should.equal "whatever"

			result = mcpm.install "whatever"

			install.fromFolder.should.have.been.calledOnce
			install.fromFolder.restore()
			install.parsePackageString.restore()
