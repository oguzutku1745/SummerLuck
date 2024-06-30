/* eslint-disable react/jsx-key */
import { frames } from "./frames";
import { Button } from "frames.js/next";
import { ethers } from 'ethers';

interface CustomMessage {
  requesterFollowsCaster: boolean;
  requesterVerifiedAddresses?: string[];
}

const frameHandler = frames(async (ctx) => {
  const page = ctx.searchParams?.page ?? "initial";
  const message = ctx.message as CustomMessage | undefined;
  const followState = message?.requesterFollowsCaster;
  const verifiedAddress = message?.requesterVerifiedAddresses;
  const casterName = process.env.FARCASTER_NAME;
  let signature;
  
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is not set.');
  }
  const wallet = new ethers.Wallet(privateKey);
  
  const createSignature = async () => {
    console.log("called")
    const messageHash = ethers.utils.solidityKeccak256(['address', 'string'], [verifiedAddress?.[0], casterName]);
    console.log(messageHash)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature
  }
  
  console.log(message?.requesterVerifiedAddresses?.[0] ?? 'Address not available');
  console.log(ctx.searchParams?.page);
  if(ctx.searchParams?.page == "result") {
    if (true && verifiedAddress) (
      signature = await createSignature()
    )
  }
  if (ctx.message?.transactionId) {
    return {
      image: (
        <div tw="bg-purple-800 text-white w-full h-full justify-center items-center flex">
          Transaction submitted! {ctx.message.transactionId}
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button
          action="link"
          target={`https://sepolia.basescan.org/tx/${ctx.message.transactionId}`}
        >
          View on block explorer
        </Button>,
      ],
    };
  }

  if (page === "initial")
    return {
      image: `${process.env.APP_URL}/entrance.png`,
      buttons: [
        <Button action="post" target={{ query: { page: "result" } }}>
          Am I?
        </Button>,
      ],
    };

  if (message) {
      const imageUrl = followState 
        ? `${process.env.APP_URL}/follow_true.png` 
        : `${process.env.APP_URL}/follow_false.png`;
  
    return {
      image: imageUrl,
      buttons: [
        followState && message.requesterVerifiedAddresses ? (
          <Button action="tx" target={{ pathname: "/txdata", query: { userSign: signature } }} post_url="/" >
            Mint
          </Button>
        ) : (
          <Button action="post" target={{ query: { page: "result" } }}>
            Make sure you have custody address & check again
          </Button>
        ),
      ],
    };
  }

  return {
    image: `${process.env.APP_URL}/error.png`,
    buttons: [
      <Button action="post" target="/">
        Go Back
      </Button>,
    ],
  };
});
 
export const GET = frameHandler;
export const POST = frameHandler;