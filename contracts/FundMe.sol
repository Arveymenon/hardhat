// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error Codes
error FundMe__NotOwner();

contract FundMe {
  using PriceConverter for uint256;

  mapping(address => uint256) public s_addressToAmountFunded;
  address[] public s_funders;
  address public s_owner;
  AggregatorV3Interface public s_priceFeed;

  constructor(address priceFeed) {
    s_priceFeed = AggregatorV3Interface(priceFeed);
    s_owner = msg.sender;
  }

  function fund() public payable {
    uint256 minimumUSD = 50 * 10**18;
    require(
      msg.value.getConversionRate(s_priceFeed) >= minimumUSD,
      "You need to spend more ETH!"
    );
    // require(PriceConverter.getConversionRate(msg.value) >= minimumUSD, "You need to spend more ETH!");
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function getVersion() public view returns (uint256) {
    return s_priceFeed.version();
  }

  modifier onlyOwner() {
    // require(msg.sender == s_owner);
    if(msg.sender != s_owner) revert FundMe__NotOwner();
    _;
  }

  function withdraw() public payable onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
  }

  function cheaperWithdraw() public payable onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
    uint256 funderCount = s_funders.length;
    for (uint256 funderIndex = 0; funderIndex < funderCount; funderIndex++) {
        address funder = s_funders[funderIndex];
        s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
  }
}