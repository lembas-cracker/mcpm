var install, util, winston;

install = require("./install");

util = require("./util");

winston = require("winston");

module.exports = {
  install: function(packageString) {
    var parsed;
    winston.verbose("mcpm.install: starting");
    parsed = install.parsePackageString(packageString);
    winston.silly("mcpm.install: parsed string:", parsed);
    if ((parsed != null ? parsed.type : void 0) === "folder") {
      winston.silly("mcpm.install: installing as folder");
      return install.fromFolder(parsed.name);
    } else if ((parsed != null ? parsed.type : void 0) === "zip") {
      winston.silly("mcpm.install: installing as zip");
      return install.fromZip(parsed.name);
    } else {
      winston.debug("mcpm.install: invalid package string, returning error");
      return new Error("Invalid package string!");
    }
  }
};
