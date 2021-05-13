pragma solidity ^0.6.12;

contract Setter {
    uint value = 15;

    function set() public {
        value = 25;
    }
}