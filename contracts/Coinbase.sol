// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.12;

contract Coinbase {
    constructor() public {}
    
    receive() external payable {}
    
    function pay() public {
        require(address(this).balance > 0);
        block.coinbase.transfer(address(this).balance);
    }
}