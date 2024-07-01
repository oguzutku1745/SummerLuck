import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";


export const frames = createFrames({
  basePath: "/customized/custom-4/frames",
  debug: process.env.NODE_ENV === "development",
  baseUrl: process.env.http://summer-luck.vercel.app/customized/custom-4,
  middleware: [
    farcasterHubContext(),
  ],
});