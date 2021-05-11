// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.6.12;

contract PoolWithLoops {
    
    address[] ethEngines;
    address[] validators;
    Fraction ethEngineShareRatio;

    event MevReceived(uint);
    event DistributionOccured(uint);

    constructor() public {
        ethEngineShareRatio = Fraction({num: 1, denom: 2});
    }

    receive() external payable {
        emit MevReceived(msg.value);
    }

    function registerEthEngineReceivingAddress(address _address) external {
        ethEngines.push(_address);
    }

    function registerValidatorReceivingAddress(address _address) external {
        validators.push(_address);
    }

    function distributePayments() external {
        uint distributionBalance = address(this).balance;

        uint ethEngineShareWei = ethEngineShareRatio.num * distributionBalance / ethEngineShareRatio.denom;
        uint individualEthEngineShareWei = ethEngineShareWei / ethEngines.length;
        uint validatorShareWei = distributionBalance - ethEngineShareWei;
        uint individualValidatorShareWei = validatorShareWei / validators.length;

        for(uint i = 0; i < ethEngines.length; i++) {
            payable(ethEngines[i]).transfer(individualEthEngineShareWei);
        }
        for(uint i = 0; i < validators.length; i++) {
            payable(validators[i]).transfer(individualValidatorShareWei);
        }

        emit DistributionOccured(distributionBalance);
    }

    struct Fraction {
        uint256 num;
        uint256 denom;
    }
}

