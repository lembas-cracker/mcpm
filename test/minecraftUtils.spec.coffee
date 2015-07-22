chai = require "chai"
sinon = require "sinon"
chai.should()
chai.use require "sinon-chai"

minecraftUtils = require "../lib/minecraftUtils.js"

os = require "os"
path = require "path"
fs = require "fs"

describe "minecraftUtils", ->

	describe "getMinecraftPath", ->

		it "returns path to the Minecraft directory", ->
			originalHome = process.env.HOME
			process.env.HOME = "fakeHome"

			fakeOsPlatform = null
			sinon.stub os, "platform", -> fakeOsPlatform

			fakeOsPlatform = "win32"
			minecraftUtils.getMinecraftPath().should.equal path.join "fakeHome",
				"AppData", "Roaming", ".minecraft"

			fakeOsPlatform = "linux"
			minecraftUtils.getMinecraftPath().should.equal path.join "fakeHome",
				".minecraft"

			fakeOsPlatform = "darwin"
			minecraftUtils.getMinecraftPath().should.equal path.join "fakeHome",
				"Library", "Application Support", "minecraft"

			process.env.HOME = originalHome
			os.platform.restore()

	describe "getCurrentProfile", ->

		# cwd seems to be outside of test/
		pathToFixtures = path.resolve "test/fixtures"
		pathToTheFixture = path.join pathToFixtures, "launcher_profiles.json"

		loadFixture = ->
			JSON.parse fs.readFileSync pathToTheFixture, encoding: "utf-8"

		before ->
			sinon.stub minecraftUtils, "getMinecraftPath", -> pathToFixtures

		after ->
			minecraftUtils.getMinecraftPath.restore()

		afterEach ->
			# Roll back the changes to make the tests stateless.
			fixture = loadFixture()
			fixture.selectedProfile = "1.8 + Forge + LiteLoader"
			fs.writeFileSync pathToTheFixture, JSON.stringify fixture, null, 2

		it "returns current profile in originalInfo property", ->
			fixture = loadFixture()
			actualInfo = fixture.profiles[ "1.8 + Forge + LiteLoader" ]

			currentProfile = minecraftUtils.getCurrentProfile()
			actualInfo.should.deep.equal currentProfile.originalInfo

		it "returns current Minecraft version in version property", ->
			currentProfile = minecraftUtils.getCurrentProfile()
			"1.8".should.equal currentProfile.version

		it "reloads profiles on each call", ->
			fixture = loadFixture()
			actualInfo = fixture.profiles[ "1.8 + Forge + LiteLoader" ]

			currentProfile = minecraftUtils.getCurrentProfile()
			actualInfo.should.deep.equal currentProfile.originalInfo

			fixture.selectedProfile = "1.8"
			fs.writeFileSync pathToTheFixture, JSON.stringify fixture
			actualInfo = fixture.profiles[ "1.8" ]

			currentProfile = minecraftUtils.getCurrentProfile()
			actualInfo.should.deep.equal currentProfile.originalInfo
