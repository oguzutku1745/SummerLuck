import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";


export const frames = createFrames({
  basePath: "/frames",
  debug: process.env.NODE_ENV === "development",
  baseUrl: process.env.APP_URL,
  middleware: [
    farcasterHubContext(),
  ],
});