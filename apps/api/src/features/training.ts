/**
 * Feature: Training program, Problem statements and paid projects (register FN-11, FN-12).
 * Owns /api/training*, /api/problems*, /api/companies*.
 *
 * Training (client PDF §3): after selection the Core Team runs a structured program of projects, tasks and challenges,
 * alumni sessions, industry sessions and curated learning paths. Meaningful work ends in Proof of Work, linked to its
 * task through works.training_item_id.
 *
 * Problem statements (PDF §5–§9): company → problem → student team → solution → Proof of Work. Companies register once
 * (website and app), Industry & Outreach collects problems, coordinates requirements and follows up; the Core Team
 * manages projects. The company pays the club and Vinden takes no share; pricing and payment are open (R-19).
 */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { one, rows } from '../db.js';
import { coreSeat, currentUser, person, slugify, freeSlug, viewer, type Tone, type UserRow } from '../core.js';

/* ---------- Shapes ---------- */

const KINDS = ['project', 'task', 'session', 'path'] as const;
type Kind = (typeof KINDS)[number];
const SESSION_TYPES = ['alumni', 'industry'] as const;
type SessionType = (typeof SESSION_TYPES)[number];
/** The resource types the PDF lists for learning paths (§3E). */
export const RESOURCE_TYPES = ['Course', 'Article', 'Book', 'Video', 'Case study', 'Industry report', 'Tool', 'Template'] as const;

interface Resource { type: string; title: string; link?: string }

interface ItemRow {
  id: number;
  club_id: number;
  kind: Kind;
  title: string;
  body: string | null;
  skill: string | null;
  when_text: string | null;
  session_type: SessionType | null;
  resources: Resource[];
  position: number;
  posted: number;
}

const toItem = (r: ItemRow) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  skill: r.skill,
  when: r.when_text,
  sessionType: r.session_type,
  resources: r.resources ?? [],
  posted: r.posted ?? 0,
});

/** Members who posted work linked to an item (any status), so the plan shows how a task is going. */
const ITEMS = `
  SELECT t.*, (SELECT count(DISTINCT m.user_id)::int FROM works w JOIN work_members m ON m.work_id = w.id WHERE w.training_item_id = t.id) AS posted
  FROM training_items t`;

const STAGES = ['problem', 'team', 'solution', 'pow'] as const;
type Stage = (typeof STAGES)[number];

/** What a company can ask for back (register FN-12-I02). */
const NEEDS = ['Research', 'Analysis', 'Recommendations', 'A report', 'A build'] as const;
/**
 * Briefs need a category for Explore's filters; a new problem takes it from the first thing the company needs back.
 * Open question R-24: how a problem reaches a club, and who sets its category, isn't described.
 */
const NEED_CATEGORY: Record<(typeof NEEDS)[number], string> = {
  Research: 'Research', Analysis: 'Data', Recommendations: 'Business', 'A report': 'Research', 'A build': 'Design',
};
/** Company tiles are a coloured square with a white initial; new companies take one of the seeded colours. */
const COMPANY_COLORS = ['#07142F', '#1565D8', '#5B43AE', '#A84B06', '#0F6E66'];

interface ProblemRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  needs: string | null;
  stage: Stage;
  requirements: string | null;
  follow_up: string | null;
  created_at: string;
  company_name: string;
  initial: string;
  color: string;
  sector: string;
  club_slug: string | null;
  club_name: string | null;
  college: string | null;
}

const PROBLEMS = `
  SELECT b.id, b.slug, b.title, b.description, b.needs, b.stage, b.requirements, b.follow_up, b.created_at,
    c.name AS company_name, c.initial, c.color, c.sector,
    cl.slug AS club_slug, COALESCE(cl.short_name, cl.name) AS club_name, cl.college
  FROM briefs b
  JOIN companies c ON c.id = b.company_id
  LEFT JOIN clubs cl ON cl.id = b.club_id`;

async function toProblems(list: ProblemRow[]) {
  if (!list.length) return [];
  const ids = list.map((p) => p.id);
  const team = await rows<{ brief_id: number; handle: string; name: string; initials: string; tone: Tone }>(
    'SELECT t.brief_id, u.handle, u.name, u.initials, u.tone FROM brief_team t JOIN users u ON u.id = t.user_id WHERE t.brief_id = ANY($1) ORDER BY u.name',
    [ids],
  );
  // Published work first, so a delivered project links to its verified Proof of Work.
  const works = await rows<{ brief_id: number; slug: string; title: string; status: string }>(
    `SELECT DISTINCT ON (brief_id) brief_id, slug, card_title AS title, status FROM works WHERE brief_id = ANY($1)
     ORDER BY brief_id, (status = 'published') DESC, id DESC`,
    [ids],
  );
  return list.map((p) => {
    const w = works.find((x) => x.brief_id === p.id);
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      needs: p.needs,
      stage: p.stage,
      requirements: p.requirements,
      followUp: p.follow_up,
      createdAt: p.created_at,
      company: { name: p.company_name, initial: p.initial, color: p.color, sector: p.sector },
      club: p.club_slug ? { slug: p.club_slug, name: p.club_name!, college: p.college! } : null,
      team: team.filter((t) => t.brief_id === p.id).map(person),
      work: w ? { slug: w.slug, title: w.title, status: w.status } : null,
    };
  });
}

/* ---------- Helpers ---------- */

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+\n/g, '\n').slice(0, max) : '');
const fail = (reply: FastifyReply, code: number, error: string) => reply.code(code).send({ error });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The signed-in club member, or an error for everyone else. */
async function member(reply: FastifyReply) {
  const u = await viewer();
  if (!u?.club_id) {
    void fail(reply, 403, 'This is for Vinden Club members.');
    return null;
  }
  return { u, club_id: u.club_id, seat: await coreSeat(u) };
}

/**
 * Open question R-28: who designs the training (the Core Team's Learning & Development team, or third-year seniors).
 * Until it's settled any Core Team seat can add to the plan.
 */
async function coreMember(reply: FastifyReply) {
  const m = await member(reply);
  if (!m) return null;
  if (!m.seat) {
    void fail(reply, 403, 'Only the Core Team can change the training plan.');
    return null;
  }
  return m;
}

async function clubInfo(clubId: number) {
  const c = await one<{ slug: string; name: string; college: string }>('SELECT slug, COALESCE(short_name, name) AS name, college FROM clubs WHERE id = $1', [clubId]);
  return c ?? null;
}

/** The first sentence of a problem, as its title. */
function titleFrom(problem: string) {
  const first = problem.split('\n')[0].match(/^.*?[?.!](?=\s|$)/)?.[0] ?? problem.split('\n')[0];
  return first.length > 120 ? `${first.slice(0, 117).trimEnd()}…` : first;
}

async function freeHandle(text: string) {
  const base = slugify(text).slice(0, 30) || 'company';
  let handle = base;
  for (let i = 2; await one('SELECT 1 FROM users WHERE handle = $1', [handle]); i++) handle = `${base}-${i}`;
  return handle;
}

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';

/* ---------- Routes ---------- */

export async function routes(app: FastifyInstance) {
  // Alumni and industry sessions are both kind 'session'; the type says which (PDF §3C, §3D).
  await one('ALTER TABLE training_items ADD COLUMN IF NOT EXISTS session_type text');
  await one("UPDATE training_items SET session_type = 'alumni' WHERE kind = 'session' AND session_type IS NULL AND title ILIKE 'alumni%'");
  await one("UPDATE training_items SET session_type = 'industry' WHERE kind = 'session' AND session_type IS NULL AND title ILIKE 'industry%'");

  /* ----- Training plan (FN-11-I01) ----- */

  app.get('/api/training', async (_req, reply) => {
    const m = await member(reply);
    if (!m) return;
    const items = await rows<ItemRow>(`${ITEMS} WHERE t.club_id = $1 ORDER BY t.position, t.id`, [m.club_id]);
    return { club: await clubInfo(m.club_id), canEdit: !!m.seat, items: items.map(toItem) };
  });

  app.post<{ Body: { kind?: string; title?: string; body?: string; skill?: string; when?: string; sessionType?: string } }>('/api/training', async (req, reply) => {
    const m = await coreMember(reply);
    if (!m) return;
    const b = req.body ?? {};
    const kind = KINDS.find((k) => k === b.kind);
    if (!kind) return fail(reply, 400, 'Choose what to add: a project, task, session or learning path.');
    const skill = clean(b.skill, 60);
    const title = kind === 'path' ? skill : clean(b.title, 140);
    const body = clean(b.body, 1200);
    const when = kind === 'session' ? clean(b.when, 60) : '';
    const sessionType = kind === 'session' ? SESSION_TYPES.find((t) => t === b.sessionType) : undefined;
    if (!title) return fail(reply, 400, kind === 'path' ? 'Add the skill this path builds.' : 'Add a title.');
    if (!body) return fail(reply, 400, 'Say what it asks of members.');
    if (kind === 'session' && !sessionType) return fail(reply, 400, 'Choose an alumni or industry session.');
    if (kind === 'session' && !when) return fail(reply, 400, 'Add when the session is.');
    if (kind !== 'session' && !skill) return fail(reply, 400, 'Add the skill it builds.');
    const position = (await one<{ p: number }>('SELECT COALESCE(max(position), 0) + 1 AS p FROM training_items WHERE club_id = $1', [m.club_id]))!.p;
    const created = (await one<{ id: number }>(
      `INSERT INTO training_items (club_id, kind, title, body, skill, when_text, session_type, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [m.club_id, kind, title, body, skill || null, when || null, sessionType ?? null, position],
    ))!;
    const item = await one<ItemRow>(`${ITEMS} WHERE t.id = $1`, [created.id]);
    return reply.code(201).send(toItem(item!));
  });

  /* ----- One project, task, session or learning path (FN-11-I02, FN-11-I03) ----- */

  app.get<{ Params: { id: string } }>('/api/training/:id', async (req, reply) => {
    const m = await member(reply);
    if (!m) return;
    const id = Number(req.params.id);
    const item = Number.isInteger(id) ? await one<ItemRow>(`${ITEMS} WHERE t.id = $1 AND t.club_id = $2`, [id, m.club_id]) : undefined;
    if (!item) return fail(reply, 404, 'There’s nothing in your club’s training plan at this link.');
    // The viewer's own work for this task, solo or as a teammate: its review status, and feedback if changes were asked for.
    const mine = await one<{ slug: string; title: string; status: string; feedback: string | null }>(
      `SELECT w.slug, w.card_title AS title, w.status, w.feedback FROM works w JOIN work_members wm ON wm.work_id = w.id
       WHERE w.training_item_id = $1 AND wm.user_id = $2 ORDER BY w.id DESC LIMIT 1`,
      [item.id, m.u.id],
    );
    // The same skill elsewhere in the plan: a path to learn it, and projects and tasks to practise it.
    const related = item.skill
      ? await rows<ItemRow>(`${ITEMS} WHERE t.club_id = $1 AND t.id <> $2 AND lower(t.skill) = lower($3) ORDER BY t.position`, [m.club_id, item.id, item.skill])
      : [];
    return {
      club: await clubInfo(m.club_id),
      canEdit: !!m.seat,
      item: toItem(item),
      myWork: mine ? { slug: mine.slug, title: mine.title, status: mine.status, feedback: mine.feedback } : null,
      related: related.map(toItem),
    };
  });

  /* ----- Curating a learning path (FN-11-I02) ----- */

  app.post<{ Params: { id: string }; Body: { type?: string; title?: string; link?: string } }>('/api/training/:id/resources', async (req, reply) => {
    const m = await coreMember(reply);
    if (!m) return;
    const item = await one<ItemRow>("SELECT * FROM training_items WHERE id = $1 AND club_id = $2 AND kind = 'path'", [Number(req.params.id) || 0, m.club_id]);
    if (!item) return fail(reply, 404, 'There’s no learning path at this link.');
    const type = RESOURCE_TYPES.find((t) => t === req.body?.type);
    const title = clean(req.body?.title, 140);
    const link = clean(req.body?.link, 400);
    if (!type) return fail(reply, 400, 'Choose what kind of resource it is.');
    if (!title) return fail(reply, 400, 'Add the resource’s title.');
    if (link && !/^https?:\/\/\S+\.\S+/.test(link)) return fail(reply, 400, 'Links start with http:// or https://.');
    const resources: Resource[] = [...(item.resources ?? []), link ? { type, title, link } : { type, title }];
    await one('UPDATE training_items SET resources = $2 WHERE id = $1', [item.id, JSON.stringify(resources)]);
    return { resources };
  });

  app.delete<{ Params: { id: string; index: string } }>('/api/training/:id/resources/:index', async (req, reply) => {
    const m = await coreMember(reply);
    if (!m) return;
    const item = await one<ItemRow>("SELECT * FROM training_items WHERE id = $1 AND club_id = $2 AND kind = 'path'", [Number(req.params.id) || 0, m.club_id]);
    if (!item) return fail(reply, 404, 'There’s no learning path at this link.');
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 0 || index >= (item.resources ?? []).length) return fail(reply, 404, 'That resource isn’t on this path.');
    const resources = item.resources.filter((_, i) => i !== index);
    await one('UPDATE training_items SET resources = $2 WHERE id = $1', [item.id, JSON.stringify(resources)]);
    return { resources };
  });

  /* ----- Register your company (FN-12-I01). Visitors may call this. ----- */

  app.post<{ Body: { company?: string; name?: string; email?: string } }>('/api/companies/register', async (req, reply) => {
    const company = clean(req.body?.company, 80);
    const name = clean(req.body?.name, 80);
    const email = clean(req.body?.email, 160).toLowerCase();
    if (!company) return fail(reply, 400, 'Add your company’s name.');
    if (!name) return fail(reply, 400, 'Add your name.');
    if (!EMAIL.test(email)) return fail(reply, 400, 'Add an email address, like name@company.com.');
    if (await one('SELECT 1 FROM users WHERE lower(email) = $1', [email])) return fail(reply, 409, 'An account already uses this email. Use another one.');
    // Open question R-37: whether a company account needs separate roles (admin, recruiter). The sources describe one account.
    const count = (await one<{ n: number }>('SELECT count(*)::int AS n FROM companies'))!.n;
    const companyId = (await one<{ id: number }>(
      'INSERT INTO companies (slug, name, initial, color, sector) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [await freeSlug('companies', company), company, company[0]!.toUpperCase(), COMPANY_COLORS[count % COMPANY_COLORS.length], ''],
    ))!.id;
    const handle = await freeHandle(`${name.split(/\s+/)[0]}-${company}`);
    await one(
      `INSERT INTO users (handle, name, initials, tone, headline, vouch_weight, email, account, company_id)
       VALUES ($1, $2, $3, 'blue', $4, 0, $5, 'company', $6)`,
      [handle, name, initialsOf(name), company, email, companyId],
    );
    return reply.code(201).send({ handle });
  });

  /* ----- Your problem statements (FN-12-I04) ----- */

  app.get('/api/problems/mine', async (_req, reply) => {
    const u = await currentUser();
    if (u.account !== 'company' || !u.company_id) return fail(reply, 403, 'This is for company accounts.');
    const company = await one<{ name: string; initial: string; color: string; sector: string }>('SELECT name, initial, color, sector FROM companies WHERE id = $1', [u.company_id]);
    const list = await rows<ProblemRow>(`${PROBLEMS} WHERE b.company_id = $1 ORDER BY b.created_at DESC, b.id DESC`, [u.company_id]);
    return { company, problems: await toProblems(list) };
  });

  /* ----- Submit a problem statement (FN-12-I02) ----- */

  app.post<{ Body: { problem?: string; needs?: string[] } }>('/api/problems', async (req, reply) => {
    const u = await currentUser();
    if (u.account !== 'company' || !u.company_id) return fail(reply, 403, 'Problem statements come from company accounts. Register your company first.');
    const problem = clean(req.body?.problem, 2000);
    const needs = NEEDS.filter((n) => req.body?.needs?.includes(n));
    if (problem.length < 10) return fail(reply, 400, 'Describe the problem in a sentence or two.');
    if (!needs.length) return fail(reply, 400, 'Choose what you need back.');
    const title = titleFrom(problem);
    // The rest of what they wrote, after the sentence that became the title.
    const rest = problem.startsWith(title) ? problem.slice(title.length).trim() : problem;
    const words = needs.map((n) => n.toLowerCase());
    const needsText = words.length === 1 ? words[0]! : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
    const position = (await one<{ p: number }>('SELECT COALESCE(max(position), 0) + 1 AS p FROM briefs'))!.p;
    const slug = await freeSlug('briefs', title);
    // Open question R-24: how a problem reaches a club isn't described, so it starts with no club; a Core Team takes it on.
    // Open question R-19: pricing and payment are open, so there is no fee, team size or timeline yet.
    await one(
      `INSERT INTO briefs (slug, company_id, title, category, position, description, needs, stage, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'problem', $8)`,
      [slug, u.company_id, title, NEED_CATEGORY[needs[0]!], position, rest || null, needsText[0]!.toUpperCase() + needsText.slice(1), u.id],
    );
    return reply.code(201).send({ slug });
  });

  /* ----- The club's problem statements board (FN-12-I03) ----- */

  app.get('/api/problems/board', async (_req, reply) => {
    const m = await member(reply);
    if (!m) return;
    if (!m.seat) return fail(reply, 403, 'This is for the Core Team.');
    const list = await rows<ProblemRow>(`${PROBLEMS} WHERE b.club_id = $1 OR b.club_id IS NULL ORDER BY b.club_id NULLS FIRST, b.position`, [m.club_id]);
    const members = await rows<UserRow>('SELECT * FROM users WHERE club_id = $1 ORDER BY name', [m.club_id]);
    const seats = await rows<{ user_id: number; role: string }>('SELECT user_id, role FROM core_team WHERE club_id = $1', [m.club_id]);
    return {
      club: await clubInfo(m.club_id),
      seat: m.seat,
      members: members.map((x) => ({ ...person(x), line: seats.find((s) => s.user_id === x.id)?.role ?? 'Member' })),
      problems: await toProblems(list),
    };
  });

  /** The Core Team takes on a problem that isn't with any club yet. Open question R-24: how a problem reaches a club. */
  app.post<{ Params: { slug: string } }>('/api/problems/:slug/take', async (req, reply) => {
    const m = await member(reply);
    if (!m) return;
    if (!m.seat) return fail(reply, 403, 'Only the Core Team can take on a problem statement.');
    const b = await one<{ id: number; club_id: number | null }>('SELECT id, club_id FROM briefs WHERE slug = $1', [req.params.slug]);
    if (!b) return fail(reply, 404, 'There’s no problem statement at this link.');
    if (b.club_id && b.club_id !== m.club_id) return fail(reply, 409, 'Another club has already taken this on.');
    await one('UPDATE briefs SET club_id = $2 WHERE id = $1', [b.id, m.club_id]);
    return (await toProblems(await rows<ProblemRow>(`${PROBLEMS} WHERE b.id = $1`, [b.id])))[0];
  });

  /**
   * The Core Team manages the project: stage, student team, requirements and the outcome follow-up.
   * Industry & Outreach coordinates requirements and follows up, but per-seat permissions are open (R-26), so any seat may edit.
   * Open question R-19: who picks the student team.
   */
  app.patch<{ Params: { slug: string }; Body: { stage?: string; requirements?: string; followUp?: string; team?: string[] } }>(
    '/api/problems/:slug',
    async (req, reply) => {
      const m = await member(reply);
      if (!m) return;
      if (!m.seat) return fail(reply, 403, 'Only the Core Team can manage problem statements.');
      const b = await one<{ id: number; club_id: number | null }>('SELECT id, club_id FROM briefs WHERE slug = $1', [req.params.slug]);
      if (!b) return fail(reply, 404, 'There’s no problem statement at this link.');
      if (b.club_id !== m.club_id) return fail(reply, 409, 'Take this problem on before managing it.');
      const body = req.body ?? {};
      if (body.stage !== undefined) {
        const stage = STAGES.find((s) => s === body.stage);
        if (!stage) return fail(reply, 400, 'That isn’t a stage.');
        await one('UPDATE briefs SET stage = $2 WHERE id = $1', [b.id, stage]);
      }
      if (body.requirements !== undefined) await one('UPDATE briefs SET requirements = $2 WHERE id = $1', [b.id, clean(body.requirements, 2000) || null]);
      if (body.followUp !== undefined) await one('UPDATE briefs SET follow_up = $2 WHERE id = $1', [b.id, clean(body.followUp, 2000) || null]);
      if (body.team !== undefined) {
        if (!Array.isArray(body.team)) return fail(reply, 400, 'Choose the team from your club’s members.');
        const picked = await rows<{ id: number }>('SELECT id FROM users WHERE club_id = $1 AND handle = ANY($2)', [m.club_id, body.team]);
        await one('DELETE FROM brief_team WHERE brief_id = $1', [b.id]);
        for (const p of picked) await one('INSERT INTO brief_team (brief_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [b.id, p.id]);
      }
      return (await toProblems(await rows<ProblemRow>(`${PROBLEMS} WHERE b.id = $1`, [b.id])))[0];
    },
  );
}
