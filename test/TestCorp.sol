pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Corp.sol";

contract TestCorp {


  function testCorpCompiles() {
    Corp corp = new Corp();
  }
  

}
