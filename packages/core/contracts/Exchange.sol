// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    address public tokenAddress;

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "invalid token address");
        tokenAddress = _tokenAddress;
    }

    function getReserve() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint256 _tokenAmount) public payable {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, address(this), _tokenAmount);
    }

    // (inputReverse + inputAmount) * (outputReverse - outputAmount) = inputReverse * outputReverse
    function getAmount(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) private pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        return (inputAmount * outputReserve) / (inputReserve + inputAmount);
    }

    // when someone sell eth for token,
    // this contract has more eth and less token
    function getTokenAmount(uint256 _ethSold) public view returns (uint256) {
        require(_ethSold > 0, "ethSold is too small");
        uint256 tokenReserve = getReserve();
        return getAmount(_ethSold, address(this).balance, tokenReserve);
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256) {
        require(_tokenSold > 0, "tokenSold is too small");
        uint256 tokenReserve = getReserve();
        return getAmount(_tokenSold, tokenReserve, address(this).balance);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        // this method is payeable so then it executed the total balance has changed
        uint256 tokenBought = getAmount(msg.value, address(this).balance - msg.value, tokenReserve);
        require(tokenBought >= _minTokens, "insufficient output amount");
        IERC20(tokenAddress).transfer(msg.sender, tokenBought);
    }

     function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public {
        uint256 ethBought = getEthAmount(_tokenSold);
        require(ethBought >= _minEth, "insufficient output amount");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokenSold);
        payable(msg.sender).transfer(ethBought);
     }
}
