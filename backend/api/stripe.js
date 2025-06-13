// File: /api/stripe.js

import { stripeWebhooks } from '../controllers/webhook.js';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false, // 🔥 Critical: disables Vercel's default body parser
  },
};

// 🔧 Helper to get raw body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const rawBody = await buffer(req);
  req.rawBody = rawBody; // 👈 attach for use inside your controller
  return stripeWebhooks(req, res);
}
