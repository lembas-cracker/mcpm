#!/usr/bin/env node
;
var commander, mcpm, minecraftUtils;

commander = require("commander");

mcpm = require("../lib/mcpm");

minecraftUtils = require("../lib/minecraftUtils");

commander.version(require("../package.json").version);

commander.command("install <packages...>").alias("i").description("install one or more packages").action(function(packages) {
  var i, len, pkg, results;
  results = [];
  for (i = 0, len = packages.length; i < len; i++) {
    pkg = packages[i];
    console.log("Installing " + pkg + "...");
    results.push(console.log(mcpm.install(pkg)));
  }
  return results;
});

commander.command("minecraft-version").alias("mc").description("display currently selected Minecraft version").action(function() {
  return console.log(minecraftUtils.getCurrentProfile().version);
});

commander.parse(process.argv);
