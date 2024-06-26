/* eslint-disable react/jsx-key */
import { frames } from "../frames";
import { Button } from "frames.js/next";
import { button } from "frames.js/core";
import dotenv from 'dotenv';
import { init, fetchQuery } from '@airstack/node';
import { ethers } from 'ethers';
import { getAddressForFid } from "frames.js"
import {
  getFarcasterUserDetails,
  FarcasterUserDetailsInput,
  FarcasterUserDetailsOutput,
} from "@airstack/frames";
 


init(process.env.AIRSTACK_API_KEY ?? "0x");
 
interface Message {
  requesterFid: number;
  requesterUserData?: {
    displayName?: string;
  };
}

const handler = frames(async (ctx) => {
  const message = ctx.message as Message | "";
  let state = ctx.state;

  let userFid: number | null = null;
  let userName: string = "anonymous";

  if (typeof message === 'object' && message !== null) {
    userFid = message.requesterFid;

    const address = await getAddressForFid({
      fid: userFid,
      options: { fallbackToCustodyAddress: true }
    });
    if (message.requesterUserData) {
      userName = message.requesterUserData.displayName ?? "anonymous";
    }
  }

  const followQuery = `
    query FollowQuery {
      FarcasterChannelParticipants(
        input: {
          filter: {
            participant: { _eq: "fc_fid:${userFid}" }
            channelId: { _eq: "books" }
            channelActions: { _eq: follow }
          }
          blockchain: ALL
        }
      ) {
        FarcasterChannelParticipant {
          lastActionTimestamp
        }
      }
    }
  `;

  const action = ctx.searchParams.__bi;
  console.log(action)
  switch (action) {
  case '2-p':
    if (userFid !== null) {
        const variables = { userFid };
        const { data, error } = await fetchQuery(followQuery, variables);
        console.log(data)
    }
  case '3-p':

  }
  
  return {
    image: <div tw="flex">{userFid}</div>,
    buttons: [
      {
        action: "post",
        target: { query: { action: "goBack" } },
        label: "Go Back"
      },
      {
        action: "post",
        target: { query: { action: "checkFollow" } },
        label: "Check"
      },
      <Button action="tx" target="/txdata" post_url="/">
        Buy a unit
      </Button>,
    ],
    state,
  };
  
}
);

export const GET = handler;
export const POST = handler;