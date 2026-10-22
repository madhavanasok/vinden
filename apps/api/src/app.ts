/** The Vinden demo API: routes and start-up (migrate, then seed an empty database). server.ts listens locally. */
import Fastify from 'fastify';
import { migrate } from './schema.js';
import { seed, seedClub } from './seed.js';
import { createWork, getClub, getHome, getMe, getPerson, getWork, toggleSave, vouch, WORK_KINDS, type NewWork } from './queries.js';

export const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'warn' } });

await migrate();
await seed();
await seedClub();

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

app.get('/api/club', async (_req, reply) => (await getClub()) ?? reply.code(404).send({ error: 'You’re not in a club yet.' }));

app.post<{ Body: NewWork }>(
  '/api/works',
  {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'kind', 'category', 'description', 'files', 'team', 'skills'],
        properties: {
          title: { type: 'string', minLength: 4, maxLength: 120 },
          kind: { enum: Object.keys(WORK_KINDS) },
          category: { enum: ['Business', 'Design', 'Data', 'Research'] },
          description: { type: 'string', minLength: 20, maxLength: 4000 },
          files: {
            type: 'array', minItems: 1, maxItems: 20,
            items: { type: 'object', required: ['name', 'size'], properties: { name: { type: 'string', maxLength: 200 }, size: { type: 'integer', minimum: 0 } } },
          },
          team: {
            type: 'array', minItems: 1, maxItems: 8,
            items: {
              type: 'object', required: ['handle', 'role', 'share'],
              properties: { handle: { type: 'string' }, role: { type: 'string', minLength: 2, maxLength: 80 }, share: { type: 'integer', minimum: 1, maximum: 100 } },
            },
          },
          skills: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'string', minLength: 2, maxLength: 40 } },
        },
      },
    },
  },
  async (req, reply) => {
    const result = await createWork(req.body);
    return 'error' in result ? reply.code(422).send(result) : reply.code(201).send(result);
  },
);

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
