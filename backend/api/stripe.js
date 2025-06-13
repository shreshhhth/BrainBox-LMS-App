// File: /api/stripe.js

import { stripeWebhooks } from '../controllers/webhook.js';
import { Readable } from 'stream';

// 🔒 This is REQUIRED — disables body parsing so you get raw payload
export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔧 Helper to buffer the stream body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const rawBody = await buffer(req);
    req.rawBody = rawBody; // attach to req so controller can access
    await stripeWebhooks(req, res);
  } catch (error) {
    console.error('❌ Error buffering request:', error);
    res.status(500).send('Internal Server Error');
  }
}
