/** The Vinden demo API: routes and start-up (migrate, then seed an empty database). server.ts listens locally. */
import Fastify from 'fastify';
import { migrate } from './schema.js';
import { seed } from './seed.js';
import { getHome, getMe, getPerson, getWork, toggleSave, vouch } from './queries.js';

export const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'warn' } });

await migrate();
await seed();

app.get('/api/health', async () => ({ ok: true }));

app.get('/api/me', async () => getMe());

app.get('/api/home', async () => getHome());

app.get<{ Params: { slug: string } }>('/api/works/:slug', async (req, reply) => {
  const work = await getWork(req.params.slug);
  return work ?? reply.code(404).send({ error: 'No proof of work with that link.' });
});

app.post<{ Params: { slug: string } }>('/api/works/:slug/vouch', async (req, reply) => {
  if (!(await vouch(req.params.slug, true))) return reply.code(404).send({ error: 'No proof of work with that link.' });
  return getWork(req.params.slug);
});

app.delete<{ Params: { slug: string } }>('/api/works/:slug/vouch', async (req, reply) => {
  if (!(await vouch(req.params.slug, false))) return reply.code(404).send({ error: 'No proof of work with that link.' });
  return getWork(req.params.slug);
});

app.get<{ Params: { handle: string } }>('/api/people/:handle', async (req, reply) => {
  const profile = await getPerson(req.params.handle);
  return profile ?? reply.code(404).send({ error: 'No one with that profile link.' });
});

app.post<{ Body: { kind: 'work' | 'brief'; slug: string } }>(
  '/api/saves',
  {
    schema: {
      body: {
        type: 'object',
        required: ['kind', 'slug'],
        properties: { kind: { enum: ['work', 'brief'] }, slug: { type: 'string' } },
      },
    },
  },
  async (req, reply) => {
    const result = await toggleSave(req.body.kind, req.body.slug);
    return result ?? reply.code(404).send({ error: 'Nothing to save at that link.' });
  },
);
