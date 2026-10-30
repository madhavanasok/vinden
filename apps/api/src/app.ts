/** The Vinden demo API: start-up (migrate, then seed), the per-request persona, and the feature modules. */
import Fastify from 'fastify';
import { getMe, getPersonas, requestContext, VISITOR } from './core.js';
import { routes as communityRoutes } from './features/community.js';
import { routes as peopleRoutes } from './features/people.js';
import { routes as trainingRoutes } from './features/training.js';
import { routes as workRoutes } from './features/work.js';
import { migrate } from './schema.js';
import { seed, seedAdminsJoined, seedBuild, seedClub, seedCommunities, seedCovers } from './seed.js';

export const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'warn' } });

await migrate();
await seed();
await seedClub();
await seedCovers();
await seedCommunities();
await seedBuild();
await seedAdminsJoined();

/** Writes a visitor may make: signing up, registering a company, and a manager confirming a role from an email. */
const VISITOR_WRITES = [/^\/api\/signup$/, /^\/api\/companies\/register$/, /^\/api\/confirm\/[^/]+$/];

app.addHook('onRequest', (req, reply, done) => {
  const header = req.headers['x-vinden-as'];
  const as = (Array.isArray(header) ? header[0] : header) ?? '';
  const path = req.url.split('?')[0];
  if (as === VISITOR && req.method !== 'GET' && !VISITOR_WRITES.some((r) => r.test(path))) {
    void reply.code(401).send({ error: 'Sign up or sign in to do that.' });
    return;
  }
  requestContext.run({ as }, done);
});

app.get('/api/health', async () => ({ ok: true }));
app.get('/api/me', async () => getMe());
app.get('/api/personas', async () => getPersonas());

await peopleRoutes(app);
await workRoutes(app);
await communityRoutes(app);
await trainingRoutes(app);
