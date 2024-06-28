import { createFrames } from "frames.js/next";
import { farcasterHubContext } from "frames.js/middleware";

type State = {
  follows: boolean;
};
 
export const frames = createFrames<State>({
  initialState: {
    follows: false,
  },
  basePath: "/frames",
  debug: process.env.NODE_ENV === "development",
  middleware: [
    farcasterHubContext(),
  ],
});