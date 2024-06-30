'use client';
import React, { useState } from 'react';
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
  position: relative; /* To position Connect Wallet Button */
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

  const handleWalletConnect = (account: string) => {
    setHostAddress(account);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      casterName,
      tokenAddress,
      numberOfParticipants,
      numberOfWinners,
      amountPerWinner,
      hostAddress
    });
  };

  return (
    <FormContainer>
      <WalletButtonWrapper>
        <ConnectWallet onConnect={handleWalletConnect} />
      </WalletButtonWrapper>
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
        <br />
        {hostAddress && (
          <div>
            <p>Host Address Will Be Settled to: {hostAddress}</p>
          </div>
        )}
      </Form>
    </FormContainer>
  );
};

export default CreateRaffle;
