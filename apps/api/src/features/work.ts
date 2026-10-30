/**
 * Feature: Post Proof of Work, Verification, Proof of Work page and vouches, Explore and the work repository
 * (register FN-04, FN-05, FN-06, FN-07). Owns /api/home, /api/explore, /api/works*, /api/saves, /api/review* and
 * /api/completion.
 */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { db, one, rows } from '../db.js';
import { scoreFrom } from '../score.js';
import {
  coreSeat, currentUser, freeSlug, getMe, level, person, today, toWorkCard, viewer, WORK_CARDS, type UserRow, type WorkCardRow,
} from '../core.js';

/* ---------- Vocabulary (register FN-04-I01) ---------- */

export const KINDS = ['Project', 'Task', 'Case study', 'Real-world assignment'] as const;
export const AREAS = [
  'Business problems', 'Market research', 'Product analysis', 'Case studies', 'Data analysis', 'Design', 'Technical', 'Entrepreneurship', 'Research',
] as const;
/** What a generated cover can call the work, and its tones. The web app's Cover.tsx holds the same lists. */
export const FORMATS = ['Report', 'Deck', 'Dataset', 'Design', 'Research', 'Document', 'Code'] as const;
export const COVER_TONES = ['blue', 'teal', 'mint', 'gold', 'peach', 'rose', 'lavender', 'stone'] as const;

/** The older four categories, still stored for anything that reads works.category. */
const CATEGORY_FOR_AREA: Record<(typeof AREAS)[number], string> = {
  'Business problems': 'Business', 'Market research': 'Research', 'Product analysis': 'Business', 'Case studies': 'Business',
  'Data analysis': 'Data', Design: 'Design', Technical: 'Data', Entrepreneurship: 'Business', Research: 'Research',
};

/** Seeded work was written before areas existed; this gives each its area once. */
const SEEDED_AREAS: Record<string, (typeof AREAS)[number]> = {
  'cac-teardown': 'Business problems', 'library-booking': 'Design', 'canteen-rush': 'Data analysis', 'cafe-pricing': 'Market research',
  'onboarding-audit': 'Product analysis', 'hostel-survey': 'Research', 'laundry-deck': 'Entrepreneurship', 'banking-compare': 'Product analysis',
  'food-app-student-plan': 'Case studies', 'pune-delivery-market': 'Market research', 'canteen-preorder': 'Design',
};

/** Paths under /api/works/ and /api/review/ that aren't work slugs. */
const RESERVED_SLUGS = new Set(['new', 'completion']);

const imageUrl = (slug: string, n: number) => `/api/works/${slug}/images/${n}`;

/* ---------- Work cards ---------- */

type CardRow = WorkCardRow & { area: string | null; has_image: boolean; lead_handle: string | null };

/**
 * Work cards with the extras Explore needs: the area, the first image and the maker's handle (so the name can open the
 * profile). `where` is applied inside WORK_CARDS, where `$1` is the viewer's id and `w`/`cl` are the work and its club.
 */
async function workCards(where: string, params: unknown[], limit = 60) {
  const list = await rows<CardRow>(
    `SELECT c.*, w.area, cardinality(w.images) > 0 AS has_image,
       (SELECT u.handle FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = c.id ORDER BY m.position LIMIT 1) AS lead_handle
     FROM (${WORK_CARDS} WHERE ${where}) c JOIN works w ON w.id = c.id
     ORDER BY w.submitted_at DESC NULLS LAST, w.position LIMIT ${limit}`,
    params,
  );
  return list.map((r) => ({
    ...toWorkCard(r),
    area: r.area,
    image: r.has_image ? imageUrl(r.slug, 0) : null,
    maker: r.lead_handle ? { handle: r.lead_handle, name: r.lead_name } : null,
  }));
}

/* ---------- Home (FN-07-I01) ---------- */

export async function getHome() {
  const u = await currentUser();
  // Open question R-23: only the completion bar and verified work were discussed for Home, so that's all it carries.
  const works = await workCards(
    `w.status = 'published' AND NOT EXISTS (SELECT 1 FROM work_members m WHERE m.work_id = w.id AND m.user_id = $1)`, [u.id], 8,
  );
  return { me: await getMe(), works };
}

/* ---------- Explore (FN-07-I02) ---------- */

export async function getExplore(q: string, area: string) {
  const u = await currentUser();
  const needle = `%${q.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const works = await workCards(
    `w.status = 'published' AND ($2 = '' OR w.area = $2) AND ($3 = '%%' OR lower(concat_ws(' ', w.title, w.card_title, w.kind, w.area,
       w.subcategory, array_to_string(w.skills, ' '), cl.college)) LIKE $3
       OR EXISTS (SELECT 1 FROM work_members m JOIN users p ON p.id = m.user_id WHERE m.work_id = w.id AND lower(p.name) LIKE $3))`,
    [u.id, area, needle],
  );
  const counts = await rows<{ area: string; n: number }>("SELECT area, count(*)::int AS n FROM works WHERE status = 'published' GROUP BY area");
  return { areas: AREAS.map((a) => ({ area: a, count: counts.find((c) => c.area === a)?.n ?? 0 })), works };
}

/* ---------- Posting work (FN-04-I01) ---------- */

export interface NewWork {
  title: string;
  description: string;
  kind: (typeof KINDS)[number];
  area: (typeof AREAS)[number];
  files: { name: string; size: number }[];
  /** Optional images as data URLs, already scaled down by the browser. */
  images: string[];
  /** Solo work is just the poster; `role` is what each person did (empty for solo work). */
  team: { handle: string; role: string }[];
  /** The club project or task this completes (club members only). */
  trainingItemId: number | null;
  /** The problem statement this answers (from /post?brief=<slug>); ignored unless the poster is on its team or in its club. */
  briefSlug?: string | null;
  format: (typeof FORMATS)[number];
  coverTone: (typeof COVER_TONES)[number];
}

/** A problem statement the person can post work for: they're on its team, or it belongs to their club. */
function briefFor(u: UserRow, slug: string) {
  return one<{ id: number; slug: string; title: string; company_id: number; club_id: number | null; company: string }>(
    `SELECT b.id, b.slug, b.title, b.company_id, b.club_id, c.name AS company FROM briefs b JOIN companies c ON c.id = b.company_id
     WHERE b.slug = $1 AND (b.club_id = $2::int OR EXISTS (SELECT 1 FROM brief_team t WHERE t.brief_id = b.id AND t.user_id = $3))`,
    [slug, u.club_id, u.id],
  );
}

/**
 * What the Post form offers: the poster's club projects and tasks, people who can be added as teammates, and the problem
 * statement named in ?brief= if they can post for it.
 */
export async function getPostOptions(briefSlug = '') {
  const u = await viewer();
  if (!u || u.account !== 'person') return { club: null, items: [], people: [], brief: null };
  const brief = briefSlug ? await briefFor(u, briefSlug) : undefined;
  const club = u.club_id ? await one<{ name: string; short_name: string | null }>('SELECT name, short_name FROM clubs WHERE id = $1', [u.club_id]) : undefined;
  const items = u.club_id
    ? await rows<{ id: number; kind: 'project' | 'task'; title: string; skill: string | null }>(
      "SELECT id, kind, title, skill FROM training_items WHERE club_id = $1 AND kind IN ('project', 'task') ORDER BY position", [u.club_id],
    )
    : [];
  const people = await rows<UserRow>(
    "SELECT * FROM users WHERE account = 'person' AND id <> $1 ORDER BY (club_id = $2::int) DESC NULLS LAST, name", [u.id, u.club_id],
  );
  return {
    club: club ? { name: club.short_name ?? club.name } : null,
    items,
    people: people.map((p) => ({ ...person(p), line: p.club_id && p.club_id === u.club_id ? `${p.headline} · your club` : p.headline })),
    brief: brief ? { slug: brief.slug, title: brief.title, company: brief.company } : null,
  };
}

const IMAGE = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/**
 * Saves the work and runs the AI check (simulated: it passes and records today's date). Work linked to a club project
 * or task waits for the club's review; anything else is published once the AI check passes.
 */
export async function createWork(input: NewWork): Promise<{ slug: string } | { error: string; code: number }> {
  const u = await viewer();
  if (!u || u.account !== 'person') return { code: 403, error: 'Posting is for people with a Vinden account. Company accounts submit problem statements.' };

  const team = [...input.team].sort((a, b) => Number(b.handle === u.handle) - Number(a.handle === u.handle));
  const handles = team.map((m) => m.handle);
  if (handles[0] !== u.handle) return { code: 422, error: 'Add yourself to the team.' };
  if (new Set(handles).size !== handles.length) return { code: 422, error: 'Each teammate can only be added once.' };
  if (team.length > 1 && team.some((m) => m.role.trim().length < 2)) return { code: 422, error: 'Write what each teammate did.' };
  const members = await rows<{ id: number; handle: string }>("SELECT id, handle FROM users WHERE handle = ANY($1) AND account = 'person'", [handles]);
  if (members.length !== handles.length) return { code: 422, error: 'One of your teammates doesn’t have a Vinden account yet.' };
  if (input.images.some((i) => !IMAGE.test(i))) return { code: 422, error: 'Images must be PNG, JPEG, WebP or GIF.' };

  let item: { id: number } | undefined;
  if (input.trainingItemId !== null) {
    item = await one<{ id: number }>(
      "SELECT id FROM training_items WHERE id = $1 AND club_id = $2 AND kind IN ('project', 'task')", [input.trainingItemId, u.club_id ?? -1],
    );
    if (!item) return { code: 422, error: 'That project or task isn’t in your club.' };
  }
  // A problem statement the poster can't post for is ignored, as the form ignores an unknown ?brief=.
  const brief = input.briefSlug ? await briefFor(u, input.briefSlug) : undefined;
  const clubId = item || brief ? u.club_id ?? brief?.club_id ?? null : null;

  let slug = await freeSlug('works', input.title);
  if (RESERVED_SLUGS.has(slug)) slug = await freeSlug('works', `${input.title} work`);
  const position = (await one<{ p: number }>('SELECT COALESCE(max(position), 0) + 1 AS p FROM works'))!.p;
  // Open question R-09: the order of the checks, and what work outside a club gets, aren't decided. Here the AI check runs
  // first; club work then waits for its club's review, and work outside a club is published once the AI check passes.
  const status = clubId ? 'in_review' : 'published';

  const work = (await one<{ id: number }>(
    `INSERT INTO works (slug, title, card_title, kind, category, subcategory, area, tags, skills, month, weeks, summary, files, file_list, images,
       cover, format, cover_tone, club_id, training_item_id, split_confirmed, position, status, submitted_at, ai_checked, brief_id, company_id)
     VALUES ($1, $2, $2, $3, $4, $5, $5, $6, '{}', $7, 1, $8, $9, $10, $11, '', $12, $13, $14, $15, $16, $17, $18, now(), $19, $20, $21) RETURNING id`,
    [slug, input.title, input.kind, CATEGORY_FOR_AREA[input.area], input.area, [input.area],
      new Date().toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
      input.description.split(/\n+/).map((p) => p.trim()).filter(Boolean), input.files.length, JSON.stringify(input.files), input.images,
      input.format, input.coverTone, clubId, item?.id ?? null,
      // Open question R-11: whether teammates confirm their part isn't covered, so solo work is the only "confirmed" split.
      team.length === 1, position, status, today(), brief?.id ?? null, brief?.company_id ?? null],
  ))!;
  // Shares no longer add up to 100% (the register dropped them); an even split keeps the column filled.
  const even = Math.floor(100 / team.length);
  for (const [i, m] of team.entries()) {
    const id = members.find((x) => x.handle === m.handle)!.id;
    await one('INSERT INTO work_members (work_id, user_id, role, share, position) VALUES ($1, $2, $3, $4, $5)',
      [work.id, id, m.role.trim(), even + (i === 0 ? 100 - even * team.length : 0), i]);
  }
  return { slug };
}

/* ---------- The AI check (FN-05) ---------- */

export interface AiSignal {
  label: string;
  detail: string;
  ok: boolean;
}

/**
 * The trust signals the AI check reports. The check is simulated in the demo: the signals come from what was posted,
 * and originality always passes (a real check would compare the files with public sources).
 */
function aiSignals(w: { files: number; summary: string[]; images: number }, team: { role: string }[]): AiSignal[] {
  const words = w.summary.join(' ').trim().split(/\s+/).filter(Boolean).length;
  const roles = team.length === 1 || team.every((m) => m.role.trim().length >= 2);
  return [
    { label: 'Work attached', ok: w.files > 0, detail: w.files > 0 ? `${w.files} ${w.files === 1 ? 'file' : 'files'} attached${w.images ? `, ${w.images} ${w.images === 1 ? 'image' : 'images'}` : ''}` : 'No files to check' },
    { label: 'Description', ok: words >= 15, detail: words >= 15 ? 'Says what the problem was and what was done' : 'Short: reviewers may need more detail' },
    { label: 'Who did what', ok: roles, detail: team.length === 1 ? 'Posted as solo work' : roles ? `Each of the ${team.length} teammates has a part written down` : 'A teammate’s part is missing' },
    { label: 'Originality', ok: true, detail: 'No matching text found in public sources' },
  ];
}

/* ---------- Proof of Work (FN-06-I01, FN-05-I01) ---------- */

interface WorkRow {
  id: number;
  slug: string;
  title: string;
  card_title: string;
  kind: string;
  category: string;
  subcategory: string;
  area: string | null;
  month: string;
  summary: string[];
  files: number;
  file_list: { name: string; size: number }[] | null;
  images: string[];
  cover: string;
  cover_tone: string | null;
  format: string | null;
  ai_checked: string | null;
  club_reviewed: string | null;
  company_signed: string | null;
  status: 'published' | 'in_review' | 'changes';
  feedback: string | null;
  club_id: number | null;
  submitted_at: Date | null;
  company_name: string | null;
  company_initial: string | null;
  company_color: string | null;
  club_name: string | null;
  college: string | null;
  item_id: number | null;
  item_kind: 'project' | 'task' | null;
  item_title: string | null;
  brief_slug: string | null;
  brief_title: string | null;
  brief_company: string | null;
}

const WORK_BY_SLUG = `
  SELECT w.*, c.name AS company_name, c.initial AS company_initial, c.color AS company_color, COALESCE(cl.short_name, cl.name) AS club_name,
    cl.college, t.id AS item_id, t.kind AS item_kind, t.title AS item_title, b.slug AS brief_slug, b.title AS brief_title, bc.name AS brief_company
  FROM works w LEFT JOIN companies c ON c.id = w.company_id LEFT JOIN clubs cl ON cl.id = w.club_id
  LEFT JOIN training_items t ON t.id = w.training_item_id
  LEFT JOIN briefs b ON b.id = w.brief_id LEFT JOIN companies bc ON bc.id = b.company_id
  WHERE w.slug = $1`;

export async function getWork(slug: string) {
  const u = await currentUser();
  const w = await one<WorkRow>(WORK_BY_SLUG, [slug]);
  if (!w) return undefined;

  const team = await rows<UserRow & { role: string }>(
    'SELECT u.*, m.role FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = $1 ORDER BY m.position', [w.id],
  );
  const stats = (await one<{ total: number; n: number }>(
    'SELECT COALESCE(sum(weight), 0)::float8 AS total, count(*)::int AS n FROM vouches WHERE work_id = $1', [w.id],
  ))!;
  // Open question R-38: the sources describe only the vouch and its weight, so notes and skills aren't shown.
  const vouches = await rows<UserRow & { vouch_id: number; weight: number; created_at: Date }>(
    `SELECT u.*, v.id AS vouch_id, v.weight, v.created_at FROM vouches v JOIN users u ON u.id = v.voucher_id
     WHERE v.work_id = $1 ORDER BY v.weight DESC, v.created_at`,
    [w.id],
  );
  const onTeam = team.some((m) => m.id === u.id);
  const reviewer = u.id !== -1 && w.club_id !== null && u.club_id === w.club_id && !!(await coreSeat(u));

  return {
    slug: w.slug,
    title: w.title,
    cardTitle: w.card_title,
    kind: w.kind,
    area: w.area,
    category: w.category,
    month: w.month,
    summary: w.summary,
    files: w.files,
    fileList: w.file_list,
    images: w.images.map((_, i) => imageUrl(w.slug, i)),
    cover: w.cover,
    coverTone: w.cover_tone,
    format: w.format,
    company: w.company_name ? { name: w.company_name, initial: w.company_initial!, color: w.company_color! } : null,
    club: w.club_name ? { name: w.club_name, college: w.college! } : null,
    item: w.item_id ? { id: w.item_id, kind: w.item_kind!, title: w.item_title! } : null,
    brief: w.brief_slug ? { slug: w.brief_slug, title: w.brief_title!, company: w.brief_company } : null,
    status: w.status,
    checks: { ai: w.ai_checked, club: w.club_reviewed, company: w.company_signed },
    ai: { signals: aiSignals({ files: w.files, summary: w.summary, images: w.images.length }, team) },
    // Feedback is between the club's reviewers and the team.
    feedback: onTeam || reviewer ? w.feedback : null,
    submittedAt: w.submitted_at?.toISOString() ?? null,
    team: team.map((m) => ({ ...person(m), role: m.role })),
    score: scoreFrom(stats.total),
    vouchCount: stats.n,
    vouches: vouches.map((v) => ({
      id: v.vouch_id,
      voucher: { ...person(v), line: v.years ? `${v.headline} · ${v.years} yrs` : v.headline, level: level(v.weight) },
      weight: v.weight,
      createdAt: v.created_at.toISOString(),
    })),
    myVouch: !!vouches.find((v) => v.id === u.id),
  };
}

/* ---------- Vouch (FN-06-I02) ---------- */

/** Open question R-13: who counts as an experienced user isn't defined, so any signed-in person can vouch. */
export async function vouch(slug: string, on: boolean): Promise<{ ok: true } | { code: number; error: string }> {
  const u = await viewer();
  if (!u) return { code: 401, error: 'Sign up or sign in to vouch.' };
  if (u.account !== 'person') return { code: 403, error: 'Vouches come from people, so company accounts can’t vouch.' };
  const w = await one<{ id: number; status: string }>('SELECT id, status FROM works WHERE slug = $1', [slug]);
  if (!w) return { code: 404, error: 'No proof of work with that link.' };
  if (on) {
    if (w.status !== 'published') return { code: 409, error: 'Vouching opens once this work is verified.' };
    if (await one('SELECT 1 FROM work_members WHERE work_id = $1 AND user_id = $2', [w.id, u.id])) {
      return { code: 403, error: 'You can’t vouch for work you made.' };
    }
    // The weight is fixed when you vouch, from your profile as it is now (open question R-06).
    await one(
      'INSERT INTO vouches (work_id, voucher_id, weight, professional) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      [w.id, u.id, u.vouch_weight, u.vouch_weight >= 7],
    );
  } else {
    await one('DELETE FROM vouches WHERE work_id = $1 AND voucher_id = $2', [w.id, u.id]);
  }
  return { ok: true };
}

/* ---------- Club review (FN-05-I02, FN-05-I03, FN-05-I04) ---------- */

/** The Core Team reviews and verifies its club's work (PDF §4); the Proof of Work & Quality team leads it. */
async function reviewerOrError(reply: FastifyReply) {
  const u = await viewer();
  if (!u) return void reply.code(401).send({ error: 'Sign up or sign in to review work.' });
  const seat = await coreSeat(u);
  if (!seat || !u.club_id) return void reply.code(403).send({ error: 'Reviewing is for your club’s Core Team.' });
  return { u, clubId: u.club_id, seat };
}

export async function getQueue(clubId: number, userId: number) {
  const club = await one<{ name: string; short_name: string | null }>('SELECT name, short_name FROM clubs WHERE id = $1', [clubId]);
  const list = await rows<{ id: number; slug: string; title: string; status: 'in_review' | 'changes'; ai_checked: string | null; feedback: string | null;
    files: number; summary: string[]; images: number; submitted_at: Date | null; item_id: number | null; item_kind: 'project' | 'task' | null; item_title: string | null;
    brief_slug: string | null; brief_title: string | null }>(
    `SELECT w.id, w.slug, w.title, w.status, w.ai_checked, w.feedback, w.files, w.summary, cardinality(w.images) AS images, w.submitted_at,
       t.id AS item_id, t.kind AS item_kind, t.title AS item_title, b.slug AS brief_slug, b.title AS brief_title
     FROM works w LEFT JOIN training_items t ON t.id = w.training_item_id LEFT JOIN briefs b ON b.id = w.brief_id
     WHERE w.club_id = $1 AND w.status IN ('in_review', 'changes') ORDER BY w.submitted_at NULLS LAST, w.id`,
    [clubId],
  );
  const items = [];
  for (const w of list) {
    const team = await rows<UserRow & { role: string }>(
      'SELECT u.*, m.role FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = $1 ORDER BY m.position', [w.id],
    );
    const signals = aiSignals(w, team);
    items.push({
      slug: w.slug,
      title: w.title,
      status: w.status,
      team: team.map((m) => ({ ...person(m), role: m.role })),
      item: w.item_id ? { id: w.item_id, kind: w.item_kind!, title: w.item_title! } : null,
      brief: w.brief_slug ? { slug: w.brief_slug, title: w.brief_title! } : null,
      ai: { date: w.ai_checked, flags: signals.filter((s) => !s.ok).length, signals },
      feedback: w.feedback,
      submittedAt: w.submitted_at?.toISOString() ?? null,
      onTeam: team.some((m) => m.id === userId),
    });
  }
  return { club: { name: club?.short_name ?? club?.name ?? '' }, items };
}

/** Each club member against each club project and task: verified, posted (waiting or sent back) or not yet. */
export async function getCompletion(clubId: number) {
  const club = await one<{ name: string; short_name: string | null }>('SELECT name, short_name FROM clubs WHERE id = $1', [clubId]);
  const items = await rows<{ id: number; kind: 'project' | 'task'; title: string }>(
    "SELECT id, kind, title FROM training_items WHERE club_id = $1 AND kind IN ('project', 'task') ORDER BY position", [clubId],
  );
  const members = await rows<UserRow>("SELECT * FROM users WHERE club_id = $1 AND account = 'person' ORDER BY name", [clubId]);
  const links = await rows<{ slug: string; status: string; item_id: number; user_id: number }>(
    `SELECT w.slug, w.status, w.training_item_id AS item_id, m.user_id FROM works w
     JOIN work_members m ON m.work_id = w.id JOIN training_items t ON t.id = w.training_item_id
     WHERE t.club_id = $1 ORDER BY w.submitted_at DESC NULLS LAST`,
    [clubId],
  );
  return {
    club: { name: club?.short_name ?? club?.name ?? '' },
    items,
    members: members.map((m) => ({
      ...person(m),
      cells: items.map((i) => {
        const mine = links.filter((l) => l.user_id === m.id && l.item_id === i.id);
        const done = mine.find((l) => l.status === 'published');
        const posted = done ?? mine[0];
        return { itemId: i.id, state: done ? 'verified' : posted ? 'posted' : 'not_yet', slug: posted?.slug ?? null };
      }),
    })),
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

export async function routes(app: FastifyInstance) {
  // Images and file names for posted work. Seeded work predates areas, so it gets its area once here.
  await db.exec(`
    ALTER TABLE works
      ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS file_list jsonb;
  `);
  for (const [slug, area] of Object.entries(SEEDED_AREAS)) await one('UPDATE works SET area = $2 WHERE slug = $1 AND area IS NULL', [slug, area]);
  await one(`UPDATE works SET area = CASE category WHEN 'Design' THEN 'Design' WHEN 'Data' THEN 'Data analysis' WHEN 'Research' THEN 'Research'
    ELSE 'Business problems' END WHERE area IS NULL`);

  const notFound = (reply: FastifyReply) => reply.code(404).send({ error: 'No proof of work with that link.' });

  app.get('/api/home', async () => getHome());

  app.get<{ Querystring: { q?: string; area?: string } }>('/api/explore', async (req) => getExplore(req.query.q ?? '', req.query.area ?? ''));

  app.get<{ Querystring: { brief?: string } }>('/api/works/new', async (req) => getPostOptions(req.query.brief ?? ''));

  app.get<{ Params: { slug: string } }>('/api/works/:slug', async (req, reply) => (await getWork(req.params.slug)) ?? notFound(reply));

  app.get<{ Params: { slug: string; n: string } }>('/api/works/:slug/images/:n', async (req, reply) => {
    const n = Number.parseInt(req.params.n, 10);
    const r = Number.isInteger(n) && n >= 0 ? await one<{ img: string | null }>('SELECT images[$2] AS img FROM works WHERE slug = $1', [req.params.slug, n + 1]) : undefined;
    const m = r?.img ? /^data:(image\/[a-z]+);base64,(.+)$/.exec(r.img) : null;
    if (!m) return reply.code(404).send({ error: 'No image at that link.' });
    return reply.header('content-type', m[1]).header('cache-control', 'public, max-age=31536000, immutable').send(Buffer.from(m[2], 'base64'));
  });

  for (const [method, on] of [['post', true], ['delete', false]] as const) {
    app[method]<{ Params: { slug: string } }>('/api/works/:slug/vouch', async (req, reply) => {
      const result = await vouch(req.params.slug, on);
      return 'error' in result ? reply.code(result.code).send({ error: result.error }) : getWork(req.params.slug);
    });
  }

  app.post<{ Body: NewWork }>(
    '/api/works',
    {
      bodyLimit: 16 * 1024 * 1024,
      schema: {
        body: {
          type: 'object',
          required: ['title', 'description', 'kind', 'area', 'files', 'images', 'team', 'trainingItemId', 'format', 'coverTone'],
          properties: {
            title: { type: 'string', minLength: 4, maxLength: 120 },
            description: { type: 'string', minLength: 20, maxLength: 4000 },
            kind: { enum: [...KINDS] },
            area: { enum: [...AREAS] },
            files: {
              type: 'array', minItems: 1, maxItems: 20,
              items: { type: 'object', required: ['name', 'size'], properties: { name: { type: 'string', minLength: 1, maxLength: 200 }, size: { type: 'integer', minimum: 0 } } },
            },
            images: { type: 'array', maxItems: 4, items: { type: 'string', maxLength: 3_000_000 } },
            team: {
              type: 'array', minItems: 1, maxItems: 8,
              items: { type: 'object', required: ['handle', 'role'], properties: { handle: { type: 'string' }, role: { type: 'string', maxLength: 120 } } },
            },
            trainingItemId: { type: ['integer', 'null'] },
            briefSlug: { type: ['string', 'null'], maxLength: 120 },
            format: { enum: [...FORMATS] },
            coverTone: { enum: [...COVER_TONES] },
          },
        },
      },
    },
    async (req, reply) => {
      const result = await createWork(req.body);
      return 'error' in result ? reply.code(result.code).send({ error: result.error }) : reply.code(201).send(result);
    },
  );

  app.post<{ Body: { kind: 'work' | 'brief'; slug: string } }>(
    '/api/saves',
    { schema: { body: { type: 'object', required: ['kind', 'slug'], properties: { kind: { enum: ['work', 'brief'] }, slug: { type: 'string' } } } } },
    async (req, reply) => {
      const result = await toggleSave(req.body.kind, req.body.slug);
      return result ?? reply.code(404).send({ error: 'Nothing to save at that link.' });
    },
  );

  /* Club review: the queue, one piece of work, feedback and verifying, and completion. */

  app.get('/api/review', async (_req, reply) => {
    const r = await reviewerOrError(reply);
    return r ? getQueue(r.clubId, r.u.id) : reply;
  });

  app.get('/api/completion', async (_req, reply) => {
    const r = await reviewerOrError(reply);
    return r ? getCompletion(r.clubId) : reply;
  });

  /** The work, if it is club work of the reviewer's club. */
  const clubWork = async (slug: string, clubId: number) =>
    one<{ id: number; status: string }>('SELECT id, status FROM works WHERE slug = $1 AND club_id = $2', [slug, clubId]);

  app.get<{ Params: { slug: string } }>('/api/review/:slug', async (req, reply) => {
    const r = await reviewerOrError(reply);
    if (!r) return reply;
    if (!(await clubWork(req.params.slug, r.clubId))) return reply.code(404).send({ error: 'There’s no club work to review at that link.' });
    return getWork(req.params.slug);
  });

  for (const action of ['feedback', 'verify'] as const) {
    app.post<{ Params: { slug: string }; Body: { feedback?: string } }>(
      `/api/review/:slug/${action}`,
      action === 'feedback'
        ? { schema: { body: { type: 'object', required: ['feedback'], properties: { feedback: { type: 'string', minLength: 10, maxLength: 2000 } } } } }
        : {},
      async (req, reply) => {
        const r = await reviewerOrError(reply);
        if (!r) return reply;
        const w = await clubWork(req.params.slug, r.clubId);
        if (!w) return reply.code(404).send({ error: 'There’s no club work to review at that link.' });
        if (w.status === 'published') return reply.code(409).send({ error: 'This work is already verified.' });
        // Open question R-10: who reviews the Core Team's own work isn't covered, so nobody reviews work they're on.
        if (await one('SELECT 1 FROM work_members WHERE work_id = $1 AND user_id = $2', [w.id, r.u.id])) {
          return reply.code(403).send({ error: 'You’re on this work’s team, so another Core Team member reviews it.' });
        }
        if (action === 'feedback') {
          await one("UPDATE works SET status = 'changes', feedback = $2 WHERE id = $1", [w.id, req.body.feedback!.trim()]);
        } else {
          await one("UPDATE works SET status = 'published', club_reviewed = $2, feedback = NULL WHERE id = $1", [w.id, today()]);
        }
        return getWork(req.params.slug);
      },
    );
  }
}
