import { one, rows } from './db.js';
import { scoreFrom } from './score.js';
import { ME } from './seed.js';

type Tone = 'blue' | 'orange' | 'lav' | 'gold';

interface UserRow {
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
}

const person = (u: Pick<UserRow, 'handle' | 'name' | 'initials' | 'tone'>) => ({ handle: u.handle, name: u.name, initials: u.initials, tone: u.tone });
const level = (weight: number) => (weight >= 7 ? 'Professional' : 'Peer');

async function currentUser() {
  return (await one<UserRow>('SELECT * FROM users WHERE handle = $1', [ME]))!;
}

export async function getMe() {
  const u = await currentUser();
  return { ...person(u), firstName: u.name.split(' ')[0], vouchWeight: u.vouch_weight, vouchLevel: level(u.vouch_weight) };
}

/* ---------- Cards ---------- */

interface WorkCardRow {
  id: number;
  slug: string;
  card_title: string;
  cover: string;
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
const WORK_CARDS = `
  SELECT w.id, w.slug, w.card_title, w.cover, w.kind, w.category, w.ai_checked, w.club_reviewed, w.company_signed, cl.college,
    COALESCE(v.total, 0)::float8 AS weight_sum, COALESCE(v.n, 0)::int AS vouch_count,
    (SELECT u.name FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = w.id ORDER BY m.position LIMIT 1) AS lead_name,
    (SELECT count(*)::int FROM work_members m WHERE m.work_id = w.id) AS team_size,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.kind = 'work' AND s.ref_id = w.id) AS saved
  FROM works w
  LEFT JOIN clubs cl ON cl.id = w.club_id
  LEFT JOIN (SELECT work_id, sum(weight) AS total, count(*) AS n FROM vouches GROUP BY work_id) v ON v.work_id = w.id`;

function toWorkCard(r: WorkCardRow) {
  const others = r.team_size - 1;
  return {
    slug: r.slug,
    title: r.card_title,
    cover: r.cover,
    category: r.category,
    score: scoreFrom(r.weight_sum),
    vouchCount: r.vouch_count,
    byline: `${r.lead_name}${others > 0 ? ` + ${others}` : ''}${r.college ? ` · ${r.college}` : ''}`,
    kindLine: `${r.kind} · ${r.team_size > 1 ? `Team of ${r.team_size}` : 'Solo'}`,
    checks: { ai: !!r.ai_checked, club: !!r.club_reviewed, company: !!r.company_signed },
    saved: r.saved,
  };
}

interface BriefRow {
  slug: string;
  title: string;
  category: string;
  team_size: number;
  weeks: number;
  fee: number;
  cover: string;
  company_name: string;
  initial: string;
  color: string;
  sector: string;
  saved: boolean;
}

const toBrief = (b: BriefRow) => ({
  slug: b.slug,
  title: b.title,
  category: b.category,
  teamSize: b.team_size,
  weeks: b.weeks,
  fee: b.fee,
  cover: b.cover,
  company: { name: b.company_name, initial: b.initial, color: b.color, sector: b.sector },
  saved: b.saved,
});

/* ---------- Home ---------- */

export async function getHome() {
  const u = await currentUser();
  const club = await one<{ slug: string; name: string; college: string; members: number; core_team: number; next_session: string | null }>(
    'SELECT * FROM clubs WHERE id = $1', [u.club_id],
  );
  const task = await one<{ title: string; due: string; effort: string; done: number; total: number }>(
    'SELECT * FROM tasks WHERE club_id = $1 ORDER BY id LIMIT 1', [u.club_id],
  );
  const submitted = await rows<UserRow>("SELECT * FROM users WHERE handle IN ('kabir', 'ananya', 'meera') ORDER BY id DESC");
  const requests = await rows<{ name: string }>(
    'SELECT f.name FROM vouch_requests r JOIN users f ON f.id = r.from_user WHERE r.to_user = $1 ORDER BY f.id DESC', [u.id],
  );
  const briefs = await rows<BriefRow>(
    `SELECT b.*, c.name AS company_name, c.initial, c.color, c.sector,
       EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.kind = 'brief' AND s.ref_id = b.id) AS saved
     FROM briefs b JOIN companies c ON c.id = b.company_id ORDER BY b.position`,
    [u.id],
  );
  // Work by other people: what you might learn from, vouch for or hire from.
  const works = await rows<WorkCardRow>(
    `${WORK_CARDS} WHERE NOT EXISTS (SELECT 1 FROM work_members m WHERE m.work_id = w.id AND m.user_id = $1) ORDER BY w.position`,
    [u.id],
  );

  return {
    me: await getMe(),
    journey: {
      profileStrength: u.profile_strength ?? 0,
      nextStep: 'Verify 1 more project to reach 80%',
      vouchRequests: requests.map((r) => r.name.split(' ')[0]),
      nextMilestone: 'Join your first paid brief',
    },
    club: club && {
      slug: club.slug,
      name: club.name,
      members: club.members,
      coreTeam: club.core_team,
      nextSession: club.next_session,
    },
    task: task && { title: task.title, due: task.due, effort: task.effort, done: task.done, total: task.total, people: submitted.map(person) },
    briefs: briefs.map(toBrief),
    works: works.map(toWorkCard),
  };
}

/* ---------- Proof of Work ---------- */

interface WorkRow {
  id: number;
  slug: string;
  title: string;
  card_title: string;
  kind: string;
  category: string;
  subcategory: string;
  tags: string[];
  skills: string[];
  month: string;
  weeks: number;
  summary: string[];
  files: number;
  cover: string;
  ai_checked: string | null;
  club_reviewed: string | null;
  company_signed: string | null;
  split_confirmed: boolean;
  company_name: string | null;
  company_initial: string | null;
  company_color: string | null;
  club_name: string | null;
  college: string | null;
}

export async function getWork(slug: string) {
  const u = await currentUser();
  const w = await one<WorkRow>(
    `SELECT w.*, c.name AS company_name, c.initial AS company_initial, c.color AS company_color, cl.name AS club_name, cl.college
     FROM works w LEFT JOIN companies c ON c.id = w.company_id LEFT JOIN clubs cl ON cl.id = w.club_id WHERE w.slug = $1`,
    [slug],
  );
  if (!w) return undefined;

  const team = await rows<UserRow & { role: string; share: number }>(
    'SELECT u.*, m.role, m.share FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = $1 ORDER BY m.position', [w.id],
  );
  const stats = (await one<{ total: number; n: number; pros: number }>(
    `SELECT COALESCE(sum(weight), 0)::float8 AS total, count(*)::int AS n, (count(*) FILTER (WHERE professional))::int AS pros
     FROM vouches WHERE work_id = $1`,
    [w.id],
  ))!;
  const written = await rows<UserRow & { vouch_id: number; weight: number; professional: boolean; vouch_headline: string; body: string; skills: string; helpful: number; created_at: Date }>(
    `SELECT u.*, v.id AS vouch_id, v.weight, v.professional, v.headline AS vouch_headline, v.body, v.skills, v.helpful, v.created_at
     FROM vouches v JOIN users u ON u.id = v.voucher_id
     WHERE v.work_id = $1 AND v.body IS NOT NULL ORDER BY v.weight DESC`,
    [w.id],
  );
  const myVouch = !!(await one('SELECT 1 FROM vouches WHERE work_id = $1 AND voucher_id = $2', [w.id, u.id]));
  const saved = !!(await one("SELECT 1 FROM saves WHERE user_id = $1 AND kind = 'work' AND ref_id = $2", [u.id, w.id]));

  return {
    slug: w.slug,
    title: w.title,
    cardTitle: w.card_title,
    kind: w.kind,
    category: w.category,
    subcategory: w.subcategory,
    tags: w.tags,
    skills: w.skills,
    month: w.month,
    weeks: w.weeks,
    summary: w.summary,
    files: w.files,
    cover: w.cover,
    company: w.company_name ? { name: w.company_name, initial: w.company_initial!, color: w.company_color! } : null,
    club: w.club_name ? { name: w.club_name, college: w.college! } : null,
    checks: { ai: w.ai_checked, club: w.club_reviewed, company: w.company_signed },
    splitConfirmed: w.split_confirmed,
    team: team.map((m) => ({ ...person(m), role: m.role, share: m.share })),
    score: scoreFrom(stats.total),
    vouchCount: stats.n,
    professionalCount: stats.pros,
    vouches: written.map((v) => ({
      id: v.vouch_id,
      voucher: { ...person(v), line: v.years ? `${v.headline} · ${v.years} yrs` : `${v.headline} · ${level(v.vouch_weight)}`, level: level(v.weight) },
      weight: v.weight,
      headline: v.vouch_headline,
      body: v.body,
      skills: v.skills,
      helpful: v.helpful,
      createdAt: v.created_at.toISOString(),
    })),
    myVouch,
    saved,
  };
}

export async function vouch(slug: string, on: boolean) {
  const u = await currentUser();
  const w = await one<{ id: number }>('SELECT id FROM works WHERE slug = $1', [slug]);
  if (!w) return false;
  if (on) {
    const exists = await one('SELECT 1 FROM vouches WHERE work_id = $1 AND voucher_id = $2', [w.id, u.id]);
    if (!exists) {
      await one('INSERT INTO vouches (work_id, voucher_id, weight, professional) VALUES ($1, $2, $3, $4)', [w.id, u.id, u.vouch_weight, u.vouch_weight >= 7]);
    }
  } else {
    await one('DELETE FROM vouches WHERE work_id = $1 AND voucher_id = $2', [w.id, u.id]);
  }
  return true;
}

/* ---------- People ---------- */

export async function getPerson(handle: string) {
  const me = await currentUser();
  const u = await one<UserRow>('SELECT * FROM users WHERE handle = $1', [handle]);
  if (!u) return undefined;

  const works = await rows<WorkCardRow>(
    `${WORK_CARDS} WHERE EXISTS (SELECT 1 FROM work_members m WHERE m.work_id = w.id AND m.user_id = $2)
     ORDER BY COALESCE(v.total, 0) DESC`,
    [me.id, u.id],
  ).then((r) => r.map(toWorkCard));
  const experiences = await rows<{ role: string; company: string; initial: string; color: string; period: string; verification: 'manager' | 'offer_letter' }>(
    'SELECT * FROM experiences WHERE user_id = $1 ORDER BY position', [u.id],
  );
  const milestones = await rows<{ title: string; sub: string; icon: string; tone: Tone }>('SELECT * FROM milestones WHERE user_id = $1 ORDER BY position', [u.id]);
  const journey = await rows<{ month: string; title: string; sub: string }>('SELECT * FROM journey WHERE user_id = $1 ORDER BY position', [u.id]);

  return {
    ...person(u),
    headline: u.headline,
    bio: u.bio,
    location: u.location,
    website: u.website,
    joined: u.joined,
    clubRole: u.club_role,
    stats: { works: works.length, vouches: works.reduce((sum, w) => sum + w.vouchCount, 0), rolesVerified: experiences.length },
    milestones,
    works,
    experiences: experiences.map((e) => ({ role: e.role, company: e.company, initial: e.initial, color: e.color, period: e.period, verification: e.verification })),
    journey,
  };
}

/* ---------- Saves ---------- */

export async function toggleSave(kind: 'work' | 'brief', slug: string) {
  const u = await currentUser();
  const ref = await one<{ id: number }>(`SELECT id FROM ${kind === 'work' ? 'works' : 'briefs'} WHERE slug = $1`, [slug]);
  if (!ref) return undefined;
  const removed = await rows('DELETE FROM saves WHERE user_id = $1 AND kind = $2 AND ref_id = $3 RETURNING 1', [u.id, kind, ref.id]);
  if (removed.length) return { saved: false };
  await one('INSERT INTO saves (user_id, kind, ref_id) VALUES ($1, $2, $3)', [u.id, kind, ref.id]);
  return { saved: true };
}
