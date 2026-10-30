/**
 * Feature: Sign up, Profile and profile completion, Experience verification (register FN-01, FN-02, FN-03).
 * Owns /api/people/*, /api/signup, /api/me/* (except GET /api/me, which core.ts serves) and /api/confirm/*.
 */
import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { one, rows } from '../db.js';
import { currentUser, getMe, person, slugify, toWorkCard, viewer, VISITOR, WORK_CARDS, type CompletionKey, type Tone, type UserRow, type WorkCardRow } from '../core.js';

const TONES: Tone[] = ['blue', 'orange', 'lav', 'gold'];
/** Colours for an organisation's initial tile, as the seeded roles use. Data, not UI tokens. */
const ORG_COLORS = ['#07142F', '#5B43AE', '#A84B06', '#1565D8', '#0B5E56'];
const DESCRIBES = ['student', 'professional', 'founder', 'freelancer'] as const;
export const STUDY_YEARS = ['First year', 'Second year', 'Third year', 'Final year'];
const STEP_KEYS: CompletionKey[] = ['describe', 'college', 'communities', 'skills', 'experience'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/* ---------- People ---------- */

interface ExperienceRow {
  id: number;
  role: string;
  company: string;
  initial: string;
  color: string;
  period: string;
  verification: 'manager' | 'offer_letter';
  status: 'verified' | 'pending';
  manager_email: string | null;
}

/**
 * A role and whether it is verified. Offer letters are never shown, only that the role is verified.
 * `waitingOn` (the manager's email) is only for the person themselves.
 */
const toExperience = (e: ExperienceRow, own: boolean) => ({
  id: e.id,
  role: e.role,
  company: e.company,
  initial: e.initial,
  color: e.color,
  period: e.period,
  verification: e.verification,
  status: e.status,
  waitingOn: own && e.status === 'pending' && e.verification === 'manager' ? e.manager_email : null,
});

const experiencesOf = (userId: number) =>
  rows<ExperienceRow>('SELECT id, role, company, initial, color, period, verification, status, manager_email FROM experiences WHERE user_id = $1 ORDER BY position, id', [userId]);

interface MyWorkRow {
  slug: string;
  card_title: string;
  kind: string;
  month: string;
  skills: string[];
  role: string;
  share: number;
  team_size: number;
}

type JourneyKind = 'project' | 'skill' | 'milestone';

const monthValue = (month: string) => {
  const t = Date.parse(`1 ${month}`);
  return Number.isNaN(t) ? 0 : t;
};

/**
 * The journey: projects (verified work), skills (the first verified work that showed each one) and milestones,
 * newest first. Milestones are the person's recorded ones, or their first verified work when none are recorded.
 */
function journeyOf(works: MyWorkRow[], recorded: { month: string; title: string; sub: string }[]) {
  const items: { month: string; kind: JourneyKind; title: string; sub: string; slug: string | null }[] = [];
  const seen = new Set<string>();
  const oldestFirst = [...works].sort((a, b) => monthValue(a.month) - monthValue(b.month));
  for (const w of oldestFirst) {
    items.push({ month: w.month, kind: 'project', title: w.card_title, sub: w.team_size > 1 ? `${w.kind} · ${w.role}` : `${w.kind} · Solo`, slug: w.slug });
    const fresh = w.skills.filter((s) => !seen.has(s.toLowerCase()));
    fresh.forEach((s) => seen.add(s.toLowerCase()));
    if (fresh.length) items.push({ month: w.month, kind: 'skill', title: fresh.join(', '), sub: `First shown in ${w.card_title}`, slug: w.slug });
  }
  for (const r of recorded) items.push({ month: r.month, kind: 'milestone', title: r.title, sub: r.sub, slug: null });
  if (!recorded.length && oldestFirst.length) {
    const first = oldestFirst[0];
    items.push({ month: first.month, kind: 'milestone', title: 'First verified work', sub: first.card_title, slug: first.slug });
  }
  const rank: Record<JourneyKind, number> = { milestone: 2, project: 1, skill: 0 };
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => monthValue(b.item.month) - monthValue(a.item.month) || rank[b.item.kind] - rank[a.item.kind] || b.i - a.i)
    .map(({ item }) => item);
}

/**
 * A person's profile. Anyone can see it, signed in or not.
 * Open question R-07: what people can see without signing in; profiles are treated as public links.
 */
export async function getPerson(handle: string) {
  const me = await currentUser();
  const u = await one<UserRow>('SELECT * FROM users WHERE handle = $1', [handle]);
  if (!u) return undefined;
  const own = me.id === u.id;

  // Only verified work: posted work stays off the profile until its checks pass ('published').
  const cards = await rows<WorkCardRow>(
    `${WORK_CARDS} WHERE w.status = 'published' AND EXISTS (SELECT 1 FROM work_members m WHERE m.work_id = w.id AND m.user_id = $2)
     ORDER BY COALESCE(v.total, 0) DESC`,
    [me.id, u.id],
  );
  const mine = await rows<MyWorkRow>(
    `SELECT w.slug, w.card_title, w.kind, w.month, w.skills, m.role, m.share,
       (SELECT count(*)::int FROM work_members t WHERE t.work_id = w.id) AS team_size
     FROM work_members m JOIN works w ON w.id = m.work_id
     WHERE m.user_id = $1 AND w.status = 'published'`,
    [u.id],
  );
  const bySlug = new Map(mine.map((w) => [w.slug, w]));
  const works = cards.map((r) => {
    const m = bySlug.get(r.slug);
    const team = r.team_size > 1;
    return { ...toWorkCard(r), team, part: team && m ? { role: m.role, share: m.share } : null };
  });
  const inReview = own
    ? (await one<{ n: number }>(
        "SELECT count(*)::int AS n FROM works w JOIN work_members m ON m.work_id = w.id WHERE m.user_id = $1 AND w.status <> 'published'", [u.id],
      ))!.n
    : 0;

  const experiences = (await experiencesOf(u.id)).map((e) => toExperience(e, own));
  const milestones = await rows<{ title: string; sub: string; icon: string; tone: Tone }>('SELECT title, sub, icon, tone FROM milestones WHERE user_id = $1 ORDER BY position', [u.id]);
  const recorded = await rows<{ month: string; title: string; sub: string }>('SELECT month, title, sub FROM journey WHERE user_id = $1 ORDER BY position', [u.id]);

  // Skills they listed, then skills only their verified work shows. `verified` means a verified work shows it.
  const shown = new Map<string, string>();
  for (const w of mine) for (const s of w.skills) if (!shown.has(s.toLowerCase())) shown.set(s.toLowerCase(), s);
  const listed = new Set(u.skills.map((s) => s.toLowerCase()));
  const skills = [
    ...u.skills.map((name) => ({ name, verified: shown.has(name.toLowerCase()) })),
    ...[...shown.entries()].filter(([key]) => !listed.has(key)).map(([, name]) => ({ name, verified: true })),
  ];

  return {
    ...person(u),
    headline: u.headline,
    bio: u.bio,
    location: u.location,
    website: u.website,
    joined: u.joined,
    clubRole: u.club_role,
    account: u.account,
    describes: u.describes,
    college: u.college,
    studyYear: u.study_year,
    skills,
    interests: u.interests,
    stats: {
      works: works.length,
      vouches: works.reduce((sum, w) => sum + w.vouchCount, 0),
      rolesVerified: experiences.filter((e) => e.status === 'verified').length,
    },
    milestones,
    works,
    inReview,
    experiences,
    journey: journeyOf(mine, recorded),
  };
}

/* ---------- Sign up (FN-01-I01) ---------- */

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

async function freeHandle(text: string) {
  const base = slugify(text).slice(0, 30) || 'member';
  let handle = base;
  for (let i = 2; handle === VISITOR || (await one('SELECT 1 FROM users WHERE handle = $1', [handle])); i++) handle = `${base}-${i}`;
  return handle;
}

/** Sign-up asks for an email address and nothing else; the completion bar on Home asks the rest. */
async function signUp(rawEmail: unknown) {
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) return { status: 422, error: 'Enter an email address like name@example.com.' } as const;
  // Open question R-01: how people confirm their email and sign in again. Until then an address can sign up once.
  if (await one('SELECT 1 FROM users WHERE lower(email) = $1', [email])) return { status: 422, error: 'That email already has a Vinden account. Try a different one.' } as const;

  const local = email.split('@')[0];
  // Open question: the register doesn't say when a name is asked, so the name starts from the email's first part.
  const words = local.split(/[^a-zA-Z]+/).filter(Boolean).slice(0, 3);
  const name = words.length ? words.map(capital).join(' ') : local;
  const initials = (words.length ? words.map((w) => w[0]).join('') : local).slice(0, 2).toUpperCase();
  const handle = await freeHandle(local);
  await one(
    `INSERT INTO users (handle, name, initials, tone, headline, vouch_weight, email, account, joined)
     VALUES ($1, $2, $3, $4, '', 1, $5, 'person', $6)`,
    // Open question R-06: how profile strength sets vouch weight. New people start at the lowest weight.
    [handle, name, initials, TONES[hash(handle) % TONES.length], email, new Date().getFullYear()],
  );
  return { status: 201, handle } as const;
}

/* ---------- Profile completion (FN-02-I03 to I06) ---------- */

/** What the completion steps edit, prefilled, plus the choices they offer. */
async function getMyProfile(u: UserRow) {
  const colleges = await rows<{ college: string }>(
    'SELECT college FROM clubs UNION SELECT college FROM users WHERE college IS NOT NULL ORDER BY 1',
  );
  const club = u.college
    ? await one<{ slug: string }>(
        "SELECT c.slug FROM communities c JOIN clubs cl ON cl.id = c.club_id WHERE c.kind = 'club' AND lower(cl.college) = lower($1) LIMIT 1", [u.college],
      )
    : undefined;
  return {
    describes: u.describes,
    college: u.college,
    studyYear: u.study_year,
    skills: u.skills,
    interests: u.interests,
    studyYears: STUDY_YEARS,
    colleges: colleges.map((c) => c.college),
    /** The community of the Vinden Club at their college, offered first on the communities step. */
    clubCommunity: club?.slug ?? null,
    experiences: (await experiencesOf(u.id)).map((e) => toExperience(e, true)),
  };
}

const cleanList = (value: unknown, max: number) => {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const v of value) {
    const s = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
    if (s.length >= 2 && s.length <= 40 && !out.some((x) => x.toLowerCase() === s.toLowerCase())) out.push(s);
  }
  return out.slice(0, max);
};

interface ProfilePatch {
  describes?: unknown;
  college?: unknown;
  studyYear?: unknown;
  skills?: unknown;
  interests?: unknown;
  skip?: unknown;
}

/** Saves what a step changed and records skipped steps. Saving a step takes it off the skipped list. */
async function patchProfile(u: UserRow, body: ProfilePatch) {
  const sets: string[] = [];
  const params: unknown[] = [u.id];
  const set = (column: string, value: unknown) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };
  const saved = new Set<CompletionKey>();

  if (body.describes !== undefined) {
    if (!DESCRIBES.includes(body.describes as (typeof DESCRIBES)[number])) return { error: 'Choose student, early-career professional, founder or freelancer.' };
    set('describes', body.describes);
    saved.add('describe');
  }
  if (body.college !== undefined) {
    const college = typeof body.college === 'string' ? body.college.trim().replace(/\s+/g, ' ') : '';
    if (college.length < 2 || college.length > 100) return { error: 'Add the name of your college.' };
    set('college', college);
    saved.add('college');
  }
  if (body.studyYear !== undefined) {
    if (!STUDY_YEARS.includes(body.studyYear as string)) return { error: 'Choose your year of study.' };
    set('study_year', body.studyYear);
    saved.add('college');
  }
  if (body.skills !== undefined) {
    const skills = cleanList(body.skills, 20);
    if (!skills) return { error: 'Skills should be a list.' };
    set('skills', skills);
    saved.add('skills');
  }
  if (body.interests !== undefined) {
    const interests = cleanList(body.interests, 20);
    if (!interests) return { error: 'Interests should be a list.' };
    set('interests', interests);
    saved.add('skills');
  }
  const skip = (Array.isArray(body.skip) ? body.skip : body.skip === undefined ? [] : [body.skip]) as CompletionKey[];
  if (skip.some((k) => !STEP_KEYS.includes(k))) return { error: 'That isn’t a step of your profile.' };

  if (saved.size || skip.length) {
    const skipped = new Set(u.skipped.filter((k) => !saved.has(k as CompletionKey)));
    skip.forEach((k) => skipped.add(k));
    set('skipped', [...skipped]);
  }
  if (sets.length) await one(`UPDATE users SET ${sets.join(', ')} WHERE id = $1`, params);
  return { me: await getMe() };
}

/* ---------- Experience verification (FN-03) ---------- */

interface NewExperience {
  role?: unknown;
  company?: unknown;
  path?: unknown;
  managerEmail?: unknown;
  letter?: { name?: unknown } | null;
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

/**
 * Adds a role waiting for verification. The manager path emails the manager a one-time link (/confirm/:token);
 * the offer letter path keeps the letter private.
 * Open question R-08: who checks offer letters, and what happens if a manager doesn't confirm. Both stay pending.
 */
async function addExperience(u: UserRow, body: NewExperience) {
  const role = text(body.role);
  const company = text(body.company);
  const errors: Record<string, string> = {};
  if (role.length < 2 || role.length > 80) errors.role = 'Add your role, e.g. Marketing Intern.';
  if (company.length < 2 || company.length > 80) errors.company = 'Add the organisation you worked at.';
  const path = body.path === 'manager' || body.path === 'offer_letter' ? body.path : null;
  if (!path) errors.path = 'Choose how to verify this role.';
  const managerEmail = text(body.managerEmail).toLowerCase();
  if (path === 'manager') {
    if (!EMAIL.test(managerEmail)) errors.managerEmail = 'Enter your manager’s email, like name@company.com.';
    else if (u.email && managerEmail === u.email.toLowerCase()) errors.managerEmail = 'Use your manager’s email, not yours.';
  }
  if (path === 'offer_letter' && !text(body.letter?.name)) errors.letter = 'Add your offer letter.';
  if (Object.keys(errors).length) return { errors };

  const token = path === 'manager' ? randomBytes(18).toString('base64url') : null;
  const position = (await one<{ p: number }>('SELECT COALESCE(min(position), 0) - 1 AS p FROM experiences WHERE user_id = $1', [u.id]))!.p;
  // The letter itself isn't stored in the demo; it would go to private storage only Vinden can read.
  const row = (await one<{ id: number }>(
    `INSERT INTO experiences (user_id, role, company, initial, color, period, verification, position, status, manager_email, token)
     VALUES ($1, $2, $3, $4, $5, '', $6, $7, 'pending', $8, $9) RETURNING id`,
    [u.id, role, company, company[0].toUpperCase(), ORG_COLORS[hash(company.toLowerCase()) % ORG_COLORS.length], path, position, path === 'manager' ? managerEmail : null, token],
  ))!;
  // Demo only: no email is sent, so the link the manager would get comes back to show on screen.
  return { experience: { id: row.id, role, company, verification: path, status: 'pending' as const, managerEmail: path === 'manager' ? managerEmail : null, token } };
}

/** What a manager sees on the emailed link: who is asking and the role they claim. */
async function getConfirmation(token: string) {
  const e = await one<ExperienceRow & { user_id: number }>(
    "SELECT * FROM experiences WHERE token = $1 AND verification = 'manager'", [token],
  );
  if (!e) return undefined;
  const u = (await one<UserRow>('SELECT * FROM users WHERE id = $1', [e.user_id]))!;
  return { person: person(u), role: e.role, company: e.company, period: e.period, status: e.status };
}

/* ---------- Routes ---------- */

export async function routes(app: FastifyInstance) {
  app.get<{ Params: { handle: string } }>('/api/people/:handle', async (req, reply) => {
    const profile = await getPerson(req.params.handle);
    return profile ?? reply.code(404).send({ error: 'No one with that profile link.' });
  });

  app.post<{ Body: { email?: unknown } | null }>('/api/signup', async (req, reply) => {
    const result = await signUp(req.body?.email);
    if ('error' in result) return reply.code(result.status).send({ error: result.error });
    return reply.code(201).send({ handle: result.handle });
  });

  /** The signed-in person (not a company): visitors are stopped before this by the 401 hook in app.ts. */
  const personOnly = async () => {
    const u = await viewer();
    return u && u.account === 'person' ? u : null;
  };

  app.get('/api/me/profile', async (_req, reply) => {
    const u = await personOnly();
    if (!u) return reply.code(403).send({ error: 'Profiles are for personal accounts.' });
    return getMyProfile(u);
  });

  app.patch<{ Body: ProfilePatch | null }>('/api/me/profile', async (req, reply) => {
    const u = await personOnly();
    if (!u) return reply.code(403).send({ error: 'Profiles are for personal accounts.' });
    const result = await patchProfile(u, req.body ?? {});
    if (result.error) return reply.code(422).send({ error: result.error });
    return result.me;
  });

  app.post<{ Body: NewExperience | null }>('/api/me/experiences', async (req, reply) => {
    const u = await personOnly();
    if (!u) return reply.code(403).send({ error: 'Roles are for personal accounts.' });
    const result = await addExperience(u, req.body ?? {});
    if (result.errors) return reply.code(422).send({ error: Object.values(result.errors)[0], errors: result.errors });
    return reply.code(201).send(result.experience);
  });

  // A manager opens this from the email without signing in; the token is their proof.
  app.get<{ Params: { token: string } }>('/api/confirm/:token', async (req, reply) => {
    const c = await getConfirmation(req.params.token);
    return c ?? reply.code(404).send({ error: 'This confirmation link doesn’t work.' });
  });

  app.post<{ Params: { token: string } }>('/api/confirm/:token', async (req, reply) => {
    const c = await getConfirmation(req.params.token);
    if (!c) return reply.code(404).send({ error: 'This confirmation link doesn’t work.' });
    if (c.status === 'verified') return reply.code(409).send({ error: 'This role is already confirmed.' });
    await one("UPDATE experiences SET status = 'verified' WHERE token = $1", [req.params.token]);
    return { ...c, status: 'verified' as const };
  });
}
