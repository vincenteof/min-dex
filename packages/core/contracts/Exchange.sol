// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IFactory {
    function getExchange(address _tokenAddress) external returns (address);
}

interface IExchange {
    function ethToTokenSwap(uint256 _minTokens) external payable;

    function ethToTokenTransfer(
        uint256 _minTokens,
        address _recipient
    ) external payable;
}

uint256 constant FEE_PERCENTAGE = 1;

contract Exchange is ERC20 {
    address public tokenAddress;
    address public factoryAddress;

    constructor(address _tokenAddress) ERC20("Web3-From-Scratch", "W3FS") {
        require(_tokenAddress != address(0), "invalid token address");
        tokenAddress = _tokenAddress;
        factoryAddress = msg.sender;
    }

    function getReserve() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function addLiquidity(
        uint256 _tokenAmount
    ) public payable returns (uint256) {
        if (getReserve() == 0) {
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            uint256 liquidity = address(this).balance;
            _mint(msg.sender, liquidity);
            return liquidity;
        } else {
            uint256 ethReserve = address(this).balance - msg.value;
            uint256 tokenReserve = getReserve();
            uint256 tokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_tokenAmount >= tokenAmount, "insufficient token amount");
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), tokenAmount);
            uint256 liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
            return liquidity;
        }
    }

    function removeLiquidity(
        uint256 _amount
    ) public returns (uint256, uint256) {
        require(_amount > 0, "invalid amount");
        uint256 ethAmount = (address(this).balance * _amount) / totalSupply();
        uint256 tokenAmount = (getReserve() * _amount) / totalSupply();
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        return (ethAmount, tokenAmount);
    }

    // (inputReserve + inputAmount) * (outputReserve - outputAmount) = inputReserve * outputReserve
    function getAmount(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) private pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        uint256 inputAmountWithFee = inputAmount * (100 - FEE_PERCENTAGE);
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        // result should be `(inputAmount * outputReserve) / (inputReserve + inputAmount)` in mathematical aspect
        // since soldity doesn't support float number, here both numerator and denominator are multiplied by a power of 10
        // and the fees are calculated into the exchange reserves automatically
        return numerator / denominator;
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

    function ethToToken(uint256 _minTokens, address recipent) private {
        uint256 tokenReserve = getReserve();
        // this method is payeable so then it executed the total balance has changed
        uint256 tokenBought = getAmount(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );
        require(tokenBought >= _minTokens, "insufficient output amount");
        IERC20(tokenAddress).transfer(recipent, tokenBought);
    }

    function ethToTokenSwap(uint256 _minTokens) public payable {
        ethToToken(_minTokens, msg.sender);
    }

    function ethToTokenTransfer(
        uint256 _minTokens,
        address _recipient
    ) public payable {
        ethToToken(_minTokens, _recipient);
    }

    function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth) public {
        uint256 ethBought = getEthAmount(_tokenSold);
        require(ethBought >= _minEth, "insufficient output amount");
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenSold
        );
        payable(msg.sender).transfer(ethBought);
    }

    // token to token swapping is just to find another exchange and do 2 times swap
    function tokenToTokenSwap(
        uint256 _tokenSold,
        uint256 _minTokensBought,
        address _tokenAddress
    ) public {
        address exchangeAddress = IFactory(factoryAddress).getExchange(
            _tokenAddress
        );
        require(
            exchangeAddress != address(this) && exchangeAddress != address(0),
            "invalid exchange address"
        );
        // here we are not using `tokenToEthSwap` because we don't want recieve the eth
        // the eth should be sent to another exchange doing another swap
        uint256 ethBought = getEthAmount((_tokenSold));
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenSold
        );
        // `ethToTokenSwap` will send the target tokens to this contract
        // so we create a new method to send target tokens to the requesting address
        IExchange(exchangeAddress).ethToTokenTransfer{value: ethBought}(
            _minTokensBought,
            msg.sender
        );
    }
}
