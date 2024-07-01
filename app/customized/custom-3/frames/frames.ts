import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";


export const frames = createFrames({
  basePath: "/customized/custom-1/frames",
  debug: process.env.NODE_ENV === "development",
  baseUrl: "https://summer-luck.vercel.app/customized/custom-3",
  middleware: [
    farcasterHubContext(),
  ],
});