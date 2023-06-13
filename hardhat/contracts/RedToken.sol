//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RedToken is ERC20{
    uint tokenPrice = 0.001 ether;

    constructor ()ERC20("Red Token","RTKN"){}

    function mint(uint amount) external payable{
        require(msg.value >= tokenPrice * amount,"Insufficient ether to buy tokens");
        _mint(msg.sender, amount * 10**18);
    }
}