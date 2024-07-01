import {
    Abi,
    encodeFunctionData
  } from "viem";
  import { frames } from "../frames";
  import { raffleABI } from "./contracts/RaffleABI";
  import { transaction } from "frames.js/core";
  
  export const POST = frames(async (ctx) => {
    if (!ctx?.message) {
      throw new Error("Invalid frame message");
    }
    

    const userSign = ctx.searchParams.userSign;
    if (!userSign) {
      throw new Error("User signature is required");
    }
    console.log(userSign)
  
    const calldata = encodeFunctionData({
      abi: raffleABI,
      functionName: "joinRaffle",
      args: [
        userSign
      ] as const,
    });
  
  
    const RAFFLE_ADDRESS = "0x1861403BcdEd0825c4D942D0F3169f4be68140cc";

    if (!RAFFLE_ADDRESS || !RAFFLE_ADDRESS.startsWith('0x')) {
      throw new Error("RAFFLE_ADDRESS is not defined or does not start with '0x'");
    }

    const validatedRaffleAddress = RAFFLE_ADDRESS as `0x${string}`;
    

    return transaction({
      chainId: "eip155:84532", // Base sepolia
      method: "eth_sendTransaction",
      params: {
        abi: raffleABI as Abi,
        to: validatedRaffleAddress,
        data: calldata,
        value: "0",
      },
    });
  });
  