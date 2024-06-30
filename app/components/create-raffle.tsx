'use client';
import dynamic from 'next/dynamic';
import React, { useState } from "react";

const DynamicConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then(mod => mod.ConnectButton),
  { ssr: false }
);

export default function CreateRaffle() {
  const [casterName, setCasterName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [numberOfParticipants, setNumberOfParticipants] = useState(0);
  const [numberOfWinners, setNumberOfWiners] = useState(0);
  const [amountPerWinner, setAmountPerWinner] = useState(0);
  const [hostAddress, setHostAddress] = useState("");

  return (
    <div>
      <DynamicConnectButton />
      Give the inputs to create your own raffle!
    </div>
  );
}
