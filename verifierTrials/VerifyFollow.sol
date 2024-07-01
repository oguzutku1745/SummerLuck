// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerifyFollow {
    address public verifier;

    event Debug(address verifier,bytes signature, address user, string channel, bytes32 messageHash, bytes32 ethSignedMessageHash, address recoveredSigner, bool verificationResult);

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function verifySignature(bytes memory signature, address user, string memory channel) public returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(user, channel));
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        bool verificationResult = recoveredSigner == verifier;
        
        emit Debug(verifier,signature, user, channel, messageHash, ethSignedMessageHash, recoveredSigner, verificationResult);

        return verificationResult;
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
}
