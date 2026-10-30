/**
 * Shared by every feature module: who is signed in, people and work-card shapes, and /api/me.
 * Feature modules (features/*.ts) import from here and never from each other.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { one, rows } from './db.js';
import { scoreFrom } from './score.js';
import { ME } from './seed.js';

export type Tone = 'blue' | 'orange' | 'lav' | 'gold';

/* ---------- Who is signed in ---------- */

/**
 * The demo has no passwords: the web app says who it is acting as in the x-vinden-as header (a user's handle, or
 * 'visitor' for someone who hasn't signed in: HR, managers and founders browsing). app.ts stores it per request.
 */
export const requestContext = new AsyncLocalStorage<{ as: string }>();
export const VISITOR = 'visitor';
export const actingAs = () => requestContext.getStore()?.as || ME;

export interface UserRow {
  id: number;
  handle: string;
  name: string;
  initials: string;
  tone: Tone;
  headline: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  joined: number | null;
  years: number | null;
  club_id: number | null;
  club_role: string | null;
  vouch_weight: number;
  profile_strength: number | null;
  email: string | null;
  account: 'person' | 'company';
  company_id: number | null;
  describes: 'student' | 'professional' | 'founder' | 'freelancer' | null;
  college: string | null;
  study_year: string | null;
  skills: string[];
  interests: string[];
  skipped: string[];
}

/** Someone who hasn't signed in. id -1 matches no rows, so saved flags and memberships come back empty. */
const VISITOR_ROW: UserRow = {
  id: -1, handle: VISITOR, name: 'Visitor', initials: 'V', tone: 'blue', headline: '', bio: null, location: null, website: null,
  joined: null, years: null, club_id: null, club_role: null, vouch_weight: 0, profile_strength: null, email: null, account: 'person',
  company_id: null, describes: null, college: null, study_year: null, skills: [], interests: [], skipped: [],
};

/** The signed-in user, or the visitor row. Unknown handles fall back to the default demo user. */
export async function currentUser(): Promise<UserRow> {
  const as = actingAs();
  if (as === VISITOR) return VISITOR_ROW;
  return (await one<UserRow>('SELECT * FROM users WHERE handle = $1', [as])) ?? (await one<UserRow>('SELECT * FROM users WHERE handle = $1', [ME]))!;
}

/** The signed-in user, or null for a visitor. */
export async function viewer(): Promise<UserRow | null> {
  const u = await currentUser();
  return u.id === -1 ? null : u;
}

/** The viewer's Core Team seat in their club, if they hold one. */
export async function coreSeat(u: UserRow): Promise<string | null> {
  if (!u.club_id) return null;
  return (await one<{ role: string }>('SELECT role FROM core_team WHERE user_id = $1 AND club_id = $2', [u.id, u.club_id]))?.role ?? null;
}

export const person = (u: Pick<UserRow, 'handle' | 'name' | 'initials' | 'tone'>) => ({ handle: u.handle, name: u.name, initials: u.initials, tone: u.tone });
export const level = (weight: number) => (weight >= 7 ? 'Professional' : 'Peer');

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'item';

/** A slug not yet used in `table`. */
export async function freeSlug(table: string, text: string) {
  const base = slugify(text);
  let slug = base;
  for (let i = 2; await one(`SELECT 1 FROM ${table} WHERE slug = $1`, [slug]); i++) slug = `${base}-${i}`;
  return slug;
}

/* ---------- Profile completion (register FN-02-I02) ---------- */

export type CompletionKey = 'describe' | 'college' | 'communities' | 'skills' | 'experience';

/**
 * Sign-up asks no questions, so the completion bar on Home asks for the rest. College is for students and experience
 * for professionals; until someone says what describes them, both are listed (open question R-03).
 */
export async function completion(u: UserRow) {
  const steps: { key: CompletionKey; label: string; done: boolean; skipped: boolean }[] = [];
  const add = (key: CompletionKey, label: string, done: boolean) => steps.push({ key, label, done, skipped: u.skipped.includes(key) });
  add('describe', 'What describes you', !!u.describes);
  if (!u.describes || u.describes === 'student') add('college', 'College and year', !!(u.college && u.study_year));
  add('communities', 'Join communities', !!(await one("SELECT 1 FROM community_members WHERE user_id = $1 LIMIT 1", [u.id])));
  add('skills', 'Skills and interests', u.skills.length > 0);
  if (!u.describes || u.describes === 'professional') add('experience', 'Experience', !!(await one('SELECT 1 FROM experiences WHERE user_id = $1 LIMIT 1', [u.id])));
  const done = steps.filter((s) => s.done).length;
  return { percent: Math.round((100 * done) / steps.length), steps };
}

/* ---------- /api/me ---------- */

export async function getMe() {
  const u = await currentUser();
  if (u.id === -1) {
    return {
      ...person(u), account: 'visitor' as const, firstName: 'there', vouchWeight: 0, vouchLevel: 'Peer',
      company: null, club: null, describes: null, completion: null,
    };
  }
  const company = u.company_id
    ? await one<{ slug: string; name: string; initial: string; color: string }>('SELECT slug, name, initial, color FROM companies WHERE id = $1', [u.company_id])
    : undefined;
  const club = u.club_id
    ? await one<{ slug: string; name: string; short_name: string | null; college: string }>('SELECT slug, name, short_name, college FROM clubs WHERE id = $1', [u.club_id])
    : undefined;
  return {
    ...person(u),
    account: u.account,
    firstName: u.name.split(' ')[0],
    vouchWeight: u.vouch_weight,
    vouchLevel: level(u.vouch_weight),
    company: company ?? null,
    club: club ? { slug: club.slug, name: club.short_name ?? club.name, college: club.college, coreRole: await coreSeat(u) } : null,
    describes: u.describes,
    completion: u.account === 'person' ? await completion(u) : null,
  };
}

/* ---------- Demo personas ---------- */

/** Who the demo can act as, so every role's flows can be tried. 'visitor' is someone who hasn't signed in. */
const PERSONAS: [as: string, label: string][] = [
  ['ishaan', 'Student · club member'],
  ['tara', 'New student · profile not complete'],
  ['ananya', 'Core Team · President'],
  ['meera', 'Core Team · Proof of Work & Quality'],
  ['kabir', 'Core Team · Learning & Development'],
  ['rahul', 'Core Team · Industry & Outreach'],
  ['rohan', 'Core Team · Community & Events'],
  ['priya', 'Professional · vouches for work'],
  ['arjun', 'Company · Pebble Pay'],
];

export async function getPersonas() {
  const users = await rows<{ handle: string; name: string }>('SELECT handle, name FROM users WHERE handle = ANY($1)', [PERSONAS.map(([as]) => as)]);
  const listed = PERSONAS.flatMap(([as, label]) => {
    const u = users.find((x) => x.handle === as);
    return u ? [{ as, name: u.name, label }] : [];
  });
  // People and companies who signed up in this demo can be switched back to.
  const joined = await rows<{ handle: string; name: string; account: string; company: string | null }>(
    // Seeded people have example addresses; anyone else signed up through the app.
    `SELECT u.handle, u.name, u.account, c.name AS company FROM users u LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.email IS NOT NULL AND u.email NOT LIKE '%example%' AND NOT (u.handle = ANY($1)) ORDER BY u.id DESC LIMIT 6`,
    [PERSONAS.map(([as]) => as)],
  );
  return [
    ...listed,
    ...joined.map((u) => ({ as: u.handle, name: u.name, label: u.account === 'company' ? `Company · ${u.company ?? 'registered in this demo'}` : 'Signed up in this demo' })),
    { as: VISITOR, name: 'Not signed in', label: 'HR, managers and founders' },
  ];
}

/* ---------- Work cards ---------- */

export interface WorkCardRow {
  id: number;
  slug: string;
  card_title: string;
  cover: string;
  cover_tone: string | null;
  format: string | null;
  files: number;
  kind: string;
  category: string;
  ai_checked: string | null;
  club_reviewed: string | null;
  company_signed: string | null;
  college: string | null;
  weight_sum: number;
  vouch_count: number;
  lead_name: string;
  team_size: number;
  saved: boolean;
}

/** `$1` is the signed-in user's id, for the saved flag. */
export const WORK_CARDS = `
  SELECT w.id, w.slug, w.card_title, w.cover, w.cover_tone, w.format, w.files, w.kind, w.category, w.ai_checked, w.club_reviewed, w.company_signed, cl.college,
    COALESCE(v.total, 0)::float8 AS weight_sum, COALESCE(v.n, 0)::int AS vouch_count,
    (SELECT u.name FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = w.id ORDER BY m.position LIMIT 1) AS lead_name,
    (SELECT count(*)::int FROM work_members m WHERE m.work_id = w.id) AS team_size,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.kind = 'work' AND s.ref_id = w.id) AS saved
  FROM works w
  LEFT JOIN clubs cl ON cl.id = w.club_id
  LEFT JOIN (SELECT work_id, sum(weight) AS total, count(*) AS n FROM vouches GROUP BY work_id) v ON v.work_id = w.id`;

export function toWorkCard(r: WorkCardRow) {
  const others = r.team_size - 1;
  return {
    slug: r.slug,
    title: r.card_title,
    cover: r.cover,
    coverTone: r.cover_tone,
    format: r.format,
    files: r.files,
    category: r.category,
    score: scoreFrom(r.weight_sum),
    vouchCount: r.vouch_count,
    byline: `${r.lead_name}${others > 0 ? ` + ${others}` : ''}${r.college ? ` · ${r.college}` : ''}`,
    kindLine: `${r.kind} · ${r.team_size > 1 ? `Team of ${r.team_size}` : 'Solo'}`,
    checks: { ai: !!r.ai_checked, club: !!r.club_reviewed, company: !!r.company_signed },
    saved: r.saved,
  };
}

/** Today as the short date the checks record, e.g. '30 Oct'. */
export const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* ---------- Problem statement cards ---------- */

interface BriefRow {
  slug: string;
  title: string;
  category: string;
  team_size: number | null;
  weeks: number | null;
  fee: number | null;
  cover: string | null;
  company_name: string;
  initial: string;
  color: string;
  sector: string;
  saved: boolean;
}

export const toBrief = (b: BriefRow) => ({
  slug: b.slug,
  title: b.title,
  category: b.category,
  teamSize: b.team_size,
  weeks: b.weeks,
  fee: b.fee,
  cover: b.cover ?? '',
  company: { name: b.company_name, initial: b.initial, color: b.color, sector: b.sector },
  saved: b.saved,
});

/** Problem statements a club has taken on and not yet delivered as Proof of Work. New ones without a club stay off these lists (R-24). */
export function liveBriefs(userId: number) {
  return rows<BriefRow>(
    `SELECT b.*, c.name AS company_name, c.initial, c.color, c.sector,
       EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.kind = 'brief' AND s.ref_id = b.id) AS saved
     FROM briefs b JOIN companies c ON c.id = b.company_id WHERE b.stage <> 'pow' AND b.club_id IS NOT NULL ORDER BY b.position`,
    [userId],
  ).then((r) => r.map(toBrief));
}
