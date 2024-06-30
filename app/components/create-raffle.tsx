'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import ConnectWallet from './ConnectWallet';
import StyledInput from './StyledInput';
import styled from 'styled-components';

const FormContainer = styled.div`
  background-color: darkcyan;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 10px
`;

const Form = styled.form`
  width: 80%;
  max-width: 500px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: darkcyan;
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: darkcyan;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #117a6e;
  }
`;

const WalletButtonWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const CreateRaffle = () => {
  const [casterName, setCasterName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [numberOfParticipants, setNumberOfParticipants] = useState(0);
  const [numberOfWinners, setNumberOfWinners] = useState(0);
  const [amountPerWinner, setAmountPerWinner] = useState(0);
  const [hostAddress, setHostAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState("")
  const [raffleSuccess, setRaffleSuccess] = useState("")
  const [raffleAddress, setRaffleAddress] = useState("")

  const raffleFactoryAddress = '0xB8DCacEf1CDaf0CDEaa09B8e0087cC9fc90ff065';

  const handleWalletConnect = (account: string) => {
    setHostAddress(account);
    setProvider(new ethers.providers.Web3Provider((window as any).ethereum));
  };

  const handleApprove = async () => {
    if (!provider || !hostAddress) return;

    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function approve(address spender, uint256 amount) public returns (bool)'
    ], signer);

    const totalReward = amountPerWinner * numberOfWinners;
    const hostDeposit = totalReward + (totalReward / 20); // Adding 5% to the total reward

    try {
      const tx = await tokenContract.approve(raffleFactoryAddress, hostDeposit);
      await tx.wait();
      setApprovalSuccess("Approval successful")
      console.log('Approval successful');
    } catch (error) {
        console.error('Approval failed:', error);
        setApprovalSuccess("Approval failed. Check console for more information")
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !hostAddress) return;

    const signer = provider.getSigner();
    const raffleFactoryContract = new ethers.Contract(raffleFactoryAddress, [
      'function createRaffle(uint256 numberOfUsers, address tokenAddress, uint256 tokensPerWinner, address host, uint256 winnerCount, string memory casterName) public payable returns (address)'
    ], signer);

    const totalReward = amountPerWinner * numberOfWinners;
    const mustDeposit = ethers.utils.parseEther("0.00075"); 

    try {
      const tx = await raffleFactoryContract.createRaffle(
        numberOfParticipants,
        tokenAddress,
        amountPerWinner,
        hostAddress,
        numberOfWinners,
        casterName,
        { value: mustDeposit }
      );
      const receipt = await tx.wait();
      console.log('Raffle created successfully', receipt.logs?.[1].address);
      setRaffleSuccess("Raffle created successfully")
      setRaffleAddress(receipt.logs?.[1].address)
    } catch (error) {
        console.error('Raffle creation failed:', error);
        setRaffleSuccess("Raffle creation failed. Check console for details.")
    }
  };

  return (
    <FormContainer>
      <WalletButtonWrapper>
        <ConnectWallet onConnect={handleWalletConnect} />
      </WalletButtonWrapper>
      <Form onSubmit={handleSubmit}>
        <StyledTitle>Approve Spending</StyledTitle>
        <StyledInput
          label="Token Address"
          name="tokenAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <StyledInput
          label="Number of Winners"
          name="numberOfWinners"
          type="number"
          value={numberOfWinners.toString()}
          onChange={(e) => setNumberOfWinners(Number(e.target.value))}
        />
        <StyledInput
          label="Amount Per Winner"
          name="amountPerWinner"
          type="number"
          value={amountPerWinner.toString()}
          onChange={(e) => setAmountPerWinner(Number(e.target.value))}
        />
        <SubmitButton type="button" onClick={handleApprove}>Approve Tokens</SubmitButton>
        {approvalSuccess}
      </Form>
      <Form onSubmit={handleSubmit}>
        <StyledTitle>Create Your Raffle</StyledTitle>
        <StyledInput
          label="Caster Name"
          name="casterName"
          value={casterName}
          onChange={(e) => setCasterName(e.target.value)}
        />
        <StyledInput
          label="Token Address"
          name="tokenAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <StyledInput
          label="Number of Participants"
          name="numberOfParticipants"
          type="number"
          value={numberOfParticipants.toString()}
          onChange={(e) => setNumberOfParticipants(Number(e.target.value))}
        />
        <StyledInput
          label="Number of Winners"
          name="numberOfWinners"
          type="number"
          value={numberOfWinners.toString()}
          onChange={(e) => setNumberOfWinners(Number(e.target.value))}
        />
        <StyledInput
          label="Amount Per Winner"
          name="amountPerWinner"
          type="number"
          value={amountPerWinner.toString()}
          onChange={(e) => setAmountPerWinner(Number(e.target.value))}
        />
        <SubmitButton type="submit">Create Raffle</SubmitButton>
        {hostAddress && (
          <div>
            <p>Host Address: {hostAddress}</p>
          </div>
        )}
        {raffleAddress ? `${raffleSuccess} on address ${raffleAddress}` : raffleSuccess}
      </Form>
    </FormContainer>
  );
};

export default CreateRaffle;
