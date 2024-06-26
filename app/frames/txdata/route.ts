import {
    Abi,
    createPublicClient,
    encodeFunctionData,
    getContract,
    http,
  } from "viem";
  import { base } from "viem/chains";
  import { frames } from "../frames";
  import { raffleABI } from "./contracts/RaffleABI";
  import { transaction } from "frames.js/core";
  
  export const POST = frames(async (ctx) => {
    if (!ctx?.message) {
      throw new Error("Invalid frame message");
    }
  
  
    const calldata = encodeFunctionData({
      abi: raffleABI,
      functionName: "joinLottery",
      args: [
        BigInt(ctx.message.requesterFid), units
    ] as const,
    });
  
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });
  
    const STORAGE_REGISTRY_ADDRESS = process.env.RAFFLE_ADDRESS;
  
    const storageRegistry = getContract({
      address: STORAGE_REGISTRY_ADDRESS,
      abi: storageRegistryABI,
      client: publicClient,
    });
  
    const unitPrice = await storageRegistry.read.price([units]);
  
    return transaction({
      chainId: "eip155:10", // OP Mainnet 10
      method: "eth_sendTransaction",
      params: {
        abi: storageRegistryABI as Abi,
        to: STORAGE_REGISTRY_ADDRESS,
        data: calldata,
        value: unitPrice.toString(),
      },
    });
  });
  