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
  const casterName = "kyatzu";
  let signature;
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is not set.');
  }
  const wallet = new ethers.Wallet(privateKey);
  
  const createSignature = async () => {
    const messageHash = ethers.utils.solidityKeccak256(['address', 'string'], [verifiedAddress?.[0], casterName]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature
  }

  if (ctx.searchParams?.page === "result") {
    if (verifiedAddress) {
      signature = await createSignature();
    }
  }

  if (ctx.message?.transactionId) {
    return {
      image: (`${"https://summer-luck.vercel.app/customized/custom-4"}/transaction_submitted.png`),
      imageOptions: {
        width: 100,
        height: 100,
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

  if (page === "initial") {
    return {
      image: (`${"https://summer-luck.vercel.app/customized/custom-4"}/entrance.png`),
      imageOptions: {
        width: 100,
        height: 100,
      },
      buttons: [
        <Button action="post" target={{ query: { page: "result" } }}>
          Am I?
        </Button>,
        <Button action="link" target="https://summer-luck.vercel.app">
        Create Your Own Raffle
      </Button>
      ],
    };
  }

  if (message) {
    const imageUrl = followState 
      ? `${"https://summer-luck.vercel.app/customized/custom-4"}/follow_true.png` 
      : `${"https://summer-luck.vercel.app/customized/custom-4"}/follow_false.png`;

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
    image: `${"https://summer-luck.vercel.app/customized/custom-4"}/error.png`,
    buttons: [
      <Button action="post" target="/">
        Go Back
      </Button>,
    ],
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
