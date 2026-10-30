/**
 * Vercel serverless entry for the demo API. vercel.json rewrites every /api/* request here; the request keeps its
 * original URL, so the Fastify routes in apps/api match as they do locally. Start-up (migrate and seed) runs once per
 * function instance, on the first request.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { app } from '../apps/api/src/app.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await app.ready();
  app.server.emit('request', req, res);
}
