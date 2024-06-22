const Raffle = artifacts.require("Raffle");
const IERC20 = artifacts.require("IERC20");
const assert = require('assert');

contract("Raffle", (accounts) => {
  let raffle;
  const host = accounts[0];
  const participant1 = accounts[1];
  const participant2 = accounts[2];
  const participant3 = accounts[3]; // Adding a third participant
  const tokenAddress = '0xDf9c90f40819cd3E5941d148b88bf47aCcacBf06'; // Your token contract address
  const verifier = '0x36459f146B6a1CF348df19288559F705c1FeFb84'; // Hardcoded verifier address in contract
  const numberOfUsers = 3;
  const tokensPerWinner = web3.utils.toWei('100', 'wei'); // Example token amount per winner
  const winnerCount = 1;
  const channel = 'books';

  before(async function () {
    this.timeout(60000); // Increase timeout to 60 seconds
    raffle = await Raffle.at('0x70E3F5EDc71E98422151357575D234770E4A8AD1');
    console.log(`Raffle contract address: ${raffle.address}`);
  });

  beforeEach(async function () {
    console.log("Accounts: ", accounts);
    console.log(`Host: ${host}`);
    console.log(`Participant 1: ${participant1}`);
    console.log(`Participant 2: ${participant2}`);
    console.log(`Participant 3: ${participant3}`);
    assert.ok(accounts.length >= 4, "Not enough accounts provided by Truffle");
  });

  async function joinRaffle(participant, channel) {
    console.log(`Joining raffle with participant: ${participant}, channel: ${channel}`);
    const messageHash = web3.utils.soliditySha3({ t: 'address', v: participant }, { t: 'string', v: channel });
    console.log(`Generated message hash: ${messageHash}`);
    const signature = await web3.eth.sign(messageHash, verifier);
    console.log(`Generated signature: ${signature}`);
    await raffle.joinRaffle(signature, { from: participant });
  }

  it("should allow participants to join the raffle", async function () {
    this.timeout(60000); // Increase timeout to 60 seconds

    await joinRaffle(participant1, channel);
    const participantAddress1 = await raffle.participants(0);
    assert.strictEqual(participantAddress1, participant1, 'Participant 1 should have joined the raffle');

    await joinRaffle(participant2, channel);
    const participantAddress2 = await raffle.participants(1);
    assert.strictEqual(participantAddress2, participant2, 'Participant 2 should have joined the raffle');

    await joinRaffle(participant3, channel);
    const participantAddress3 = await raffle.participants(2);
    assert.strictEqual(participantAddress3, participant3, 'Participant 3 should have joined the raffle');
  });

  it("should end the raffle and pick a winner", async function () {
    this.timeout(60000); // Increase timeout to 60 seconds

    const userRandomNumber = web3.utils.randomHex(32);
    await raffle.endRaffle(userRandomNumber, { from: participant3 });

    const isEnded = await raffle.isEnded();
    assert.strictEqual(isEnded, true, 'Raffle should be ended');

    const winners = await raffle.winners();
    assert.strictEqual(winners.length, winnerCount, `There should be ${winnerCount} winner(s)`);
  });
});
