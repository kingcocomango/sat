var Corp = artifacts.require("./Corp.sol");

module.exports = function(deployer) {
  deployer.deploy(Corp,10000);
};
