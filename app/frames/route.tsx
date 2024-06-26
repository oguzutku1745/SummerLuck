/* eslint-disable react/jsx-key */
import { frames } from "./frames";
import { Button } from "frames.js/next";


const frameHandler = frames(async () => {
  return {
    image: <div tw="flex">Welcome to Lucky Summer!</div>,
    buttons: [
      <Button action="post" target="/route1">Create Your Mint</Button>,
      <Button action="post" target="/route2">Join This Raffle!</Button>,
    ],
  };
});
 
export const GET = frameHandler;
export const POST = frameHandler;