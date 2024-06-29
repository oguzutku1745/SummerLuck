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
    const messageHash = ethers.utils.solidityKeccak256(['address', 'string'], [verifiedAddress?.[0], casterName]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
  }

  if (ctx.searchParams?.page == "result" && verifiedAddress) {
    signature = await createSignature();
  }

  let buttons;

  if (ctx.message?.transactionId) {
    buttons = [
      <Button
        action="link"
        target={`https://sepolia.basescan.org//tx/${ctx.message.transactionId}`}
      >
        View on block explorer
      </Button>,
    ];
  } else if (page === "initial") {
    buttons = [
      <Button action="post" target={{ query: { page: "result" } }}>
        Am I?
      </Button>,
    ];
  } else if (message) {
    buttons = [
      true && message.requesterVerifiedAddresses ? (
        <Button action="tx" target={{ pathname: "/txdata", query: { userSign: signature } }} post_url="/" >
          Mint
        </Button>
      ) : (
        <Button action="post" target={{ query: { page: "result" } }}>
          Make sure you have custody address & check again
        </Button>
      ),
    ];
  } else {
    buttons = [
      <Button action="post" target="/">
        Go Back
      </Button>,
    ];
  }

  const imageUrl = `${process.env.APP_URL}api/render-image?page=${page}&transactionId=${ctx.message?.transactionId || ''}&isFollowing=${followState}`;

  return {
    image: imageUrl,
    buttons: buttons,
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
