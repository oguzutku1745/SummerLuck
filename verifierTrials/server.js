import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { init, fetchQuery } from '@airstack/node';
import { ethers } from 'ethers';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

init(process.env.AIRSTACK_API_KEY);

const socialQuery = `
  query MyQuery {
    Socials(
      input: {
        filter: {
          dappName: { _eq: farcaster }
          identity: { _eq: "fc_fname:kyatzu" }
        }
        blockchain: ethereum
      }
    ) {
      Social {
        id
        chainId
        blockchain
        userId
        userAddress
        userAssociatedAddresses
      }
    }
  }
`;

const followQuery = `
  query FollowQuery {
    FarcasterChannelParticipants(
      input: {
        filter: {
          participant: { _eq: "fc_fid:439578" }
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

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey);

console.log(wallet)

async function getUserAssociatedAddress(fid) {
  const { data: socialData, error: socialError } = await fetchQuery(socialQuery);

  if (socialError) {
    throw new Error(`Error fetching social data: ${socialError}`);
  }

  const socials = socialData.Socials.Social;
  if (socials.length > 0) {
    return socials[0].userAssociatedAddresses[1]; // Take the associatedAddress[1] for the user wallet
  } else {
    throw new Error('No social data found');
  }
}

async function checkFollowStatus() {
  const { data: followData, error: followError } = await fetchQuery(followQuery);

  console.log(followData.FarcasterChannelParticipants)

  if (followError) {
    throw new Error(`Error fetching follow data: ${followError}`);
  }

  return followData.FarcasterChannelParticipants;
}

app.post('/api/verify-follow', async (req, res) => {
  const { fid } = req.body;

  const channel = "books";

  try {
    const userAddress = await getUserAssociatedAddress();
    console.log(userAddress)

    const isFollowing = await checkFollowStatus();

    if (isFollowing) {
      const messageHash = ethers.utils.solidityKeccak256(['address', 'string'], [userAddress, channel]);
      console.log(messageHash)
      const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
      res.json({ signature, userAddress });
    } else {
      res.status(400).json({ error: 'User does not follow the channel' });
    }
  } catch (error) {
    console.error('Error verifying follow status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
