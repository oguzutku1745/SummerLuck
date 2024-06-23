// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Raffle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RaffleFactory is Ownable {
    address[] public raffles;
    uint256 public constant MUST_DEPOSIT = 0.00075 ether;
    uint256 public constant INCENTIVE = 0.0005 ether;

    event RaffleCreated(address indexed raffle, address indexed host);

    function createRaffle(
        uint256 numberOfUsers,
        address tokenAddress,
        uint256 tokensPerWinner,
        address host,
        uint256 winnerCount,
        string memory channel
    ) public payable returns (address) {
        uint256 totalReward = tokensPerWinner * winnerCount;
        uint256 hostDeposit = totalReward + (totalReward / 20); // Adding 5% to the total reward

        require(msg.value >= MUST_DEPOSIT, "Incorrect ETH amount sent for incentive");

        // Check the allowance before attempting the transfer
        uint256 allowance = IERC20(tokenAddress).allowance(host, address(this));

        require(allowance >= hostDeposit, "Insufficient allowance");

        // Transfer the host's deposit of ERC-20 tokens to the factory contract
        bool success = IERC20(tokenAddress).transferFrom(host, address(this), hostDeposit);
        require(success, "Token transfer failed");

        // Create the new raffle contract
        Raffle newRaffle = new Raffle{value: msg.value}(
            numberOfUsers,
            tokenAddress,
            tokensPerWinner,
            host,
            winnerCount,
            INCENTIVE,
            channel
        );

        // Transfer the host's deposit of ERC-20 tokens from factory to raffle contract
        success = IERC20(tokenAddress).transfer(address(newRaffle), hostDeposit);
        require(success, "Token transfer to raffle contract failed");

        // Store the new raffle's address
        raffles.push(address(newRaffle));
        emit RaffleCreated(address(newRaffle), host);

        return address(newRaffle);
    }
}
