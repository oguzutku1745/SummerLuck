const VerifyFollow = artifacts.require("VerifyFollow");
const ethers = require('ethers');

contract("VerifyFollow", (accounts) => {
  it("should verify signature and emit Debug event", async () => {
    const verifier = accounts[0];
    const user = "0x6EE7AC91BbBc33e146726438496D407b08212b3b";
    const channel = "books";

    const verifyFollowInstance = await VerifyFollow.new(verifier);

    // Create the message hash
    const messageHash = ethers.utils.solidityKeccak256(['address', 'string'], [user, channel]);

    // Sign the message hash with the verifier's private key
    const privateKey = "0xbd45f75ea4f60d2e0a6614a7895b9595cdb99b1c0c32df2fb40c14d8485756db"; // Use the corresponding private key
    const wallet = new ethers.Wallet(privateKey);
    console.log(wallet)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log('Generated Signature:', signature);

    // Call the contract's verifySignature function
    const result = await verifyFollowInstance.verifySignature(signature, user, channel);
    const debugEvent = result.logs.find(log => log.event === "Debug");

    console.log("Debug event:", debugEvent);
    assert.equal(debugEvent.args.verificationResult, true, "Signature should be verified correctly");
  });
});
