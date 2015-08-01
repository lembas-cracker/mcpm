proxyquire = require( "proxyquire" ).noPreserveCache()
chai = require "chai"
sinon = require "sinon"
chai.should()
expect = chai.expect
chai.use require "sinon-chai"

# Disabling logging in tests.
require( "winston" ).level = Infinity

describe "install.fromZip", ->

	it "returns an Error when the target is actually a folder", ->
		fromZip = require "../../lib/install/fromZip"

		result = fromZip "test/fixtures/fake-mod"
		result.should.be.an.instanceof Error

	it "returns an Error when the file is not a zip", ->
		fromZip = require "../../lib/install/fromZip"

		result = fromZip "test/fixtures/not-a-zip.zip"
		result.should.be.an.instanceof Error

	it "returns an Error when there's no manifest file in the zip", ->
		fromZip = require "../../lib/install/fromZip"

		result = fromZip "test/fixtures/empty.zip"
		result.should.be.an.instanceof Error

	it "returns an Error when can't unzip returns an error", ->
		getEntryStub = sinon.stub().returns {}
		extractAllToStub = sinon.stub().returns new Error

		fromZip = proxyquire "../../lib/install/fromZip",
			"fs":
				statSync: ->
					isFile: -> true
			"tmp":
				dirSync: ->
					name: "fake-temp-dir"
			"adm-zip": class FakeAdmZip
				getEntry: getEntryStub
				extractAllTo: extractAllToStub

		result = fromZip "fake-path-to-zip"
		result.should.be.an.instanceof Error

		getEntryStub.should.have.been.called
		extractAllToStub.should.have.been.calledOnce

	it "returns an Error when can't unzip throws", ->
		getEntryStub = sinon.stub().returns {}
		extractAllToStub = sinon.stub().throws()

		fromZip = proxyquire "../../lib/install/fromZip",
			"fs":
				statSync: ->
					isFile: -> true
			"tmp":
				dirSync: ->
					name: "fake-temp-dir"
			"adm-zip": class FakeAdmZip
				getEntry: getEntryStub
				extractAllTo: extractAllToStub

		result = fromZip "fake-path-to-zip"
		result.should.be.an.instanceof Error

		getEntryStub.should.have.been.called
		extractAllToStub.should.have.been.calledOnce

	it "returns the result of calling 'fromFolder' on the unziped folder", ->
		fromZip = proxyquire "../../lib/install/fromZip",
			"fs":
				statSync: ->
					isFile: -> true
			"tmp":
				dirSync: -> name: "fake-temp-dir"
			"adm-zip": class FakeAdmZip
				constructor: ( name ) ->
					name.should.equal "fake-path-to-zip"
				getEntry: ->
					{}
				extractAllTo: ->
					true
			"./fromFolder": ( packageDirectory ) ->
				packageDirectory.should.equal "fake-temp-dir"
				"fake-fromFolder-result"

		result = fromZip "fake-path-to-zip"
		result.should.equal "fake-fromFolder-result"
