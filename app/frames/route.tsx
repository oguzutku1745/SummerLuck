/* eslint-disable react/jsx-key */
import { frames } from "./frames";
import { Button } from "frames.js/next";
 
const frameHandler = frames(async () => {
  return {
    image: <div tw="flex">Welcome</div>,
    buttons: [
      <Button action="post" target="/route1">Go to route 1</Button>,
      <Button action="post" target="/route2">Go to route 2</Button>,
    ],
  };
});
 
export const GET = frameHandler;
export const POST = frameHandler;