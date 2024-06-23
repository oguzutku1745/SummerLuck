// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract Raffle is Ownable, IEntropyConsumer {
    uint256 public numberOfUsers;
    address public tokenAddress;
    uint256 public tokensPerWinner;
    address public verifier;
    address public host;
    uint256 public winnerCount;
    uint256 public incentive;
    uint256 public endTime;
    string public channel;

    address[] public participants;
    bool public isEnded;
    mapping(address => bool) public hasJoined;

    IEntropy private entropy;
    address private entropyProvider;

    event RaffleJoined(address participant);
    event RaffleEnded(address[] winners);
    event IncentivePaid(address lastUser, uint256 amount);
    event FlipRequest(uint64 sequenceNumber);
    event DistributedPrizes(address winner, uint64 amount);

    constructor(
        uint256 _numberOfUsers,
        address _tokenAddress,
        uint256 _tokensPerWinner,
        address _host,
        uint256 _winnerCount,
        uint256 _incentive,
        string memory _channel
    ) payable {
        numberOfUsers = _numberOfUsers;
        tokenAddress = _tokenAddress;
        tokensPerWinner = _tokensPerWinner;
        verifier = 0x36459f146B6a1CF348df19288559F705c1FeFb84; // Hardcoded verifier address
        host = _host;
        winnerCount = _winnerCount;
        incentive = _incentive;
        endTime = block.timestamp + 24 hours;
        channel = _channel;

        entropy = IEntropy(0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c); // Hardcoded Pyth VRF address
        entropyProvider = 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344;

    }

    modifier onlyHost() {
        require(msg.sender == host, "Only the host can call this function");
        _;
    }

    function joinRaffle(bytes memory signature) public {
        require(!isEnded, "Raffle has ended");
        require(participants.length < numberOfUsers, "Raffle is full");
        require(block.timestamp < endTime, "Raffle has expired");
        require(!hasJoined[msg.sender], "User has already joined the raffle");

        // Verify signature
        require(verify(signature, msg.sender), "Signature verification failed");

        participants.push(msg.sender);
        hasJoined[msg.sender] = true;
        emit RaffleJoined(msg.sender);

        if (participants.length == numberOfUsers) {
            endRaffle(0); // Placeholder value, as the user won't provide random number in this case
        }
    }

    function endRaffle(bytes32 userRandomNumber) public {
        require(block.timestamp >= endTime || participants.length == numberOfUsers, "Cannot end raffle yet");
        require(!isEnded, "Raffle has already ended");

        isEnded = true;

        // Request random number and determine winners
        uint256 fee = entropy.getFee(entropyProvider);
        require(address(this).balance >= fee, "Insufficient balance for fee");
        uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(entropyProvider, userRandomNumber);
        
        emit FlipRequest(sequenceNumber);

        // Pay incentive to the last user
        payable(msg.sender).transfer(incentive);
        emit IncentivePaid(msg.sender, incentive);
    }

    function entropyCallback(
        uint64 sequenceNumber,
        address, // This is not used in this example
        bytes32 randomNumber
    ) internal override {
        address[] memory winners = determineWinners(randomNumber);
        distributePrizes(winners);
        emit RaffleEnded(winners);
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function determineWinners(bytes32 randomNumber) internal view returns (address[] memory) {
        address[] memory winners = new address[](winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 index = uint256(keccak256(abi.encode(randomNumber, i))) % participants.length;
            winners[i] = participants[index];
        }
        return winners;
    }

    function distributePrizes(address[] memory winners) internal {
        uint256 prize = tokensPerWinner;
        for (uint256 i = 0; i < winners.length; i++) {
            IERC20(tokenAddress).transfer(winners[i], prize);
            emit DistributedPrizes(prize, winners[i]);
        }
        // Return 5% extra to host
        uint256 hostShare = (tokensPerWinner * winnerCount * 5) / 100;
        IERC20(tokenAddress).transfer(host, hostShare);
    }

    function verify(bytes memory signature, address user) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(user, channel));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        return recoverSigner(ethSignedMessageHash, signature) == verifier;
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (r, s, v);
    }

    receive() external payable {}
}
