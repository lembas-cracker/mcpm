#!/usr/bin/env node
;
var commander, increaseVerbosity, mcpm, minecraftUtils, verbosityLevels, winston;

commander = require("commander");

winston = require("winston");

mcpm = require("../lib/mcpm");

minecraftUtils = require("../lib/minecraftUtils");

winston.setLevels(winston.config.cli.levels);

winston.cli();

verbosityLevels = ["info", "debug", "verbose", "silly"];

increaseVerbosity = function(v, total) {
  winston.level = verbosityLevels[total];
  return total + (total < verbosityLevels.length - 1);
};

commander.version(require("../package.json").version).option("-v, --verbose", "Increase verbosity", increaseVerbosity, 0);

commander.command("install <packages...>").alias("i").description("install one or more packages").action(function(packages) {
  var endProfile, i, len, pkg, result, startProfile;
  startProfile = minecraftUtils.getCurrentProfile();
  winston.info("Current Minecraft version: " + startProfile.version);
  winston.info("Current profile name: " + startProfile.originalInfo.name);
  console.log();
  for (i = 0, len = packages.length; i < len; i++) {
    pkg = packages[i];
    winston.info(pkg + ": Deciding what to do...");
    result = mcpm.install(pkg);
    if (result instanceof Error) {
      winston.error(pkg + ": " + result.name + ": " + result.message, winston.debug(pkg + ":", result));
    }
  }
  endProfile = minecraftUtils.getCurrentProfile();
  if ((endProfile.version !== startProfile.version) || (endProfile.originalInfo.name !== startProfile.originalInfo.name)) {
    console.log();
    winston.info("Current Minecraft version: " + endProfile.version);
    return winston.info("Current profile name: " + endProfile.originalInfo.name);
  }
});

commander.command("minecraft-version").alias("mc").description("display currently selected Minecraft version").action(function() {
  return console.log(mcpm.getMinecraftVersion());
});

commander.parse(process.argv);
