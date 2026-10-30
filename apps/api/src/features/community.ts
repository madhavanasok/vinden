/**
 * Feature: Communities, Vinden Club, Club recruitment (register FN-08, FN-09, FN-10).
 * Owns /api/communities*, /api/club, /api/clubs/* and /api/applications*.
 */
import type { FastifyInstance, FastifyReply } from 'fastify';
import { one, rows } from '../db.js';
import { coreSeat, currentUser, freeSlug, liveBriefs, person, toWorkCard, viewer, WORK_CARDS, type UserRow, type WorkCardRow } from '../core.js';

/* ---------- Club ---------- */

interface ClubRow {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  college: string;
  city: string | null;
  started: string | null;
  members: number;
  core_team: number;
  earned: number;
  sessions: number;
  session_title: string | null;
  session_detail: string | null;
  recruiting: boolean;
}

/**
 * The seven Core Team roles and their seats (PDF, OM Team). `role` is what core_team.role stores.
 * Open question R-21: Learning & Development is 3 or 4 seats; the PDF says both.
 */
const CORE_ROLES = [
  { role: 'President', title: 'Club President / Chapter Lead', seats: 1 },
  { role: 'Learning & Development', title: 'Learning & Development', seats: 4 },
  { role: 'Industry & Outreach', title: 'Industry & Outreach', seats: 2 },
  { role: 'Proof of Work & Quality', title: 'Proof of Work & Quality', seats: 2 },
  { role: 'Community & Events', title: 'Community & Events', seats: 2 },
  { role: 'Partnerships & Strategy', title: 'Partnerships & Strategy', seats: 1 },
  { role: 'Social Media & Communications', title: 'Social Media & Communications', seats: 1 },
];

/** About 30 students are selected (PDF §2). */
const TARGET_MEMBERS = 30;

const clubName = (c: ClubRow) => c.short_name ?? c.name;
const findClub = (slug: string) => one<ClubRow>('SELECT * FROM clubs WHERE slug = $1', [slug]);

/** The signed-in member's club: identity, stats, this week's task, briefs, verified club work and the Core Team. */
export async function getClub() {
  const u = await currentUser();
  const c = await one<ClubRow>('SELECT * FROM clubs WHERE id = $1', [u.club_id]);
  if (!c) return undefined;

  const verified = (await one<{ n: number }>(
    "SELECT count(*)::int AS n FROM works WHERE club_id = $1 AND club_reviewed IS NOT NULL AND status = 'published'", [c.id],
  ))!.n;
  const task = await one<{ title: string; brief: string | null; due: string; effort: string; done: number; total: number }>(
    'SELECT * FROM tasks WHERE club_id = $1 ORDER BY id LIMIT 1', [c.id],
  );
  const posted = await rows<UserRow>("SELECT * FROM users WHERE handle IN ('kabir', 'ananya', 'meera', 'rohan') ORDER BY id DESC");
  const briefs = await liveBriefs(u.id);
  const works = await rows<WorkCardRow>(
    `${WORK_CARDS} WHERE w.club_id = $2 AND w.club_reviewed IS NOT NULL AND w.status = 'published' ORDER BY w.position LIMIT 6`,
    [u.id, c.id],
  );
  const coreTeam = await rows<UserRow & { seat: string }>(
    'SELECT u.*, t.role AS seat FROM core_team t JOIN users u ON u.id = t.user_id WHERE t.club_id = $1 ORDER BY t.position', [c.id],
  );
  const members = await rows<UserRow>('SELECT * FROM users WHERE club_id = $1 ORDER BY name', [c.id]);

  return {
    slug: c.slug,
    name: clubName(c),
    college: c.college,
    city: c.city,
    started: c.started,
    members: c.members,
    coreTeamSize: c.core_team,
    stats: { earned: c.earned, verified, liveBriefs: briefs.length, sessions: c.sessions },
    task: task && {
      title: task.title, brief: task.brief, due: task.due, effort: task.effort, done: task.done, total: task.total,
      people: posted.map(person),
    },
    briefs,
    works: works.map(toWorkCard),
    coreTeam: coreTeam.map((m) => ({ ...person(m), role: m.seat })),
    session: c.session_title ? { title: c.session_title, detail: c.session_detail ?? '' } : null,
    people: members.map((m) => ({ ...person(m), line: m.headline })),
  };
}

/** Every club on Vinden, for people without one. */
export async function getClubs() {
  const clubs = await rows<ClubRow>('SELECT * FROM clubs ORDER BY id');
  return clubs.map((c) => ({ slug: c.slug, name: clubName(c), college: c.college, city: c.city, members: c.members, recruiting: c.recruiting }));
}

/** Published club work, newest position first. `$1` is the viewer (saved flags), `$2` the club. */
const clubWorks = (viewerId: number, clubId: number, limit?: number) =>
  rows<WorkCardRow>(
    `${WORK_CARDS} WHERE w.club_id = $2 AND w.status = 'published' ORDER BY w.position${limit ? ` LIMIT ${limit}` : ''}`,
    [viewerId, clubId],
  );

/**
 * A club's public page. Open question R-16: who can see a club page is open, so it is public (visitors included),
 * and shows only what the register lists: name, college, Core Team, members, portfolio and the club's community.
 */
export async function getClubPage(slug: string) {
  const u = await currentUser();
  const c = await findClub(slug);
  if (!c) return undefined;

  const seats = await rows<UserRow & { seat: string }>(
    'SELECT u.*, t.role AS seat FROM core_team t JOIN users u ON u.id = t.user_id WHERE t.club_id = $1 ORDER BY t.position', [c.id],
  );
  const members = await rows<UserRow>(
    'SELECT * FROM users u WHERE u.club_id = $1 AND NOT EXISTS (SELECT 1 FROM core_team t WHERE t.user_id = u.id AND t.club_id = $1) ORDER BY u.name',
    [c.id],
  );
  const works = await clubWorks(u.id, c.id);
  const community = await one<CommunityRow>(`${COMMUNITIES} WHERE c.club_id = $2 ORDER BY c.position LIMIT 1`, [u.id, c.id]);
  const application = u.id === -1
    ? undefined
    : await one<{ id: number; step: string }>('SELECT id, step FROM applications WHERE club_id = $1 AND user_id = $2', [c.id, u.id]);
  const member = u.club_id === c.id;

  return {
    slug: c.slug,
    name: clubName(c),
    college: c.college,
    city: c.city,
    started: c.started,
    members: c.members,
    coreTeamSize: c.core_team,
    recruiting: c.recruiting,
    sessions: c.sessions,
    coreTeam: CORE_ROLES.map((r) => ({
      role: r.title,
      seats: r.seats,
      people: seats.filter((s) => s.seat === r.role || s.seat === r.title).map((s) => ({ ...person(s), line: s.headline })),
    })),
    people: members.map((m) => ({ ...person(m), line: m.headline })),
    portfolio: { count: works.length, works: works.slice(0, 3).map(toWorkCard) },
    community: community ? toCommunity(community, u.id) : null,
    viewer: {
      member,
      coreRole: member ? await coreSeat(u) : null,
      application: application ?? null,
      canApply: u.account === 'person' && !u.club_id && !application,
    },
  };
}

/** Every published project the club has done, each with its team. Open question R-12: private company work isn't hidden yet. */
export async function getPortfolio(slug: string) {
  const u = await currentUser();
  const c = await findClub(slug);
  if (!c) return undefined;
  const works = await clubWorks(u.id, c.id);
  const team = await rows<UserRow & { work_id: number; role: string }>(
    'SELECT u.*, m.work_id, m.role FROM work_members m JOIN users u ON u.id = m.user_id WHERE m.work_id = ANY($1) ORDER BY m.position',
    [works.map((w) => w.id)],
  );
  return {
    club: { slug: c.slug, name: clubName(c), college: c.college },
    projects: works.map((w) => ({
      ...toWorkCard(w),
      team: team.filter((m) => m.work_id === w.id).map((m) => ({ ...person(m), role: m.role })),
    })),
  };
}

/* ---------- Communities ---------- */

interface CommunityRow {
  id: number;
  slug: string;
  name: string;
  kind: 'club' | 'topic';
  access: 'open' | 'closed';
  members: number;
  description: string;
  tone: string;
  icon: string | null;
  platform: boolean;
  domain: string | null;
  admin_id: number | null;
  club_id: number | null;
  status: 'joined' | 'requested' | null;
}

const toCommunity = (c: CommunityRow, viewerId: number) => ({
  slug: c.slug,
  name: c.name,
  kind: c.kind,
  access: c.access,
  members: c.members,
  description: c.description,
  tone: c.tone,
  icon: c.icon,
  status: c.status ?? 'none',
  platform: c.platform,
  domain: c.domain,
  isAdmin: c.admin_id !== null && c.admin_id === viewerId,
});

/** `$1` is the viewer, for their status. */
const COMMUNITIES = `
  SELECT c.*, m.status FROM communities c
  LEFT JOIN community_members m ON m.community_id = c.id AND m.user_id = $1`;

export async function getCommunities() {
  const u = await currentUser();
  return (await rows<CommunityRow>(`${COMMUNITIES} ORDER BY c.position`, [u.id])).map((c) => toCommunity(c, u.id));
}

/** Joining an open community is instant; a closed one records a request for its admins. Leaving cancels either. */
export async function joinCommunity(slug: string, on: boolean) {
  const u = await currentUser();
  const c = await one<CommunityRow>(`${COMMUNITIES} WHERE c.slug = $2`, [u.id, slug]);
  if (!c) return undefined;
  if (on && !c.status) {
    const status = c.access === 'open' || c.admin_id === u.id ? 'joined' : 'requested';
    await one('INSERT INTO community_members (community_id, user_id, status) VALUES ($1, $2, $3)', [c.id, u.id, status]);
    if (status === 'joined') await one('UPDATE communities SET members = members + 1 WHERE id = $1', [c.id]);
  } else if (!on && c.status) {
    await one('DELETE FROM community_members WHERE community_id = $1 AND user_id = $2', [c.id, u.id]);
    if (c.status === 'joined') await one('UPDATE communities SET members = GREATEST(members - 1, 0) WHERE id = $1', [c.id]);
  }
  return toCommunity((await one<CommunityRow>(`${COMMUNITIES} WHERE c.id = $2`, [u.id, c.id]))!, u.id);
}

interface PostRow {
  id: number;
  kind: 'update' | 'event';
  title: string;
  body: string | null;
  when_text: string | null;
  place: string | null;
  created_at: Date | string;
  author_handle: string | null;
  author_name: string | null;
  author_initials: string | null;
  author_tone: UserRow['tone'] | null;
}

const toPost = (p: PostRow) => ({
  id: p.id,
  kind: p.kind,
  title: p.title,
  body: p.body,
  when: p.when_text,
  place: p.place,
  createdAt: new Date(p.created_at).toISOString(),
  author: p.author_handle ? { handle: p.author_handle, name: p.author_name!, initials: p.author_initials!, tone: p.author_tone! } : null,
});

/**
 * A community's page: who runs it, its club (for a club's community), and its updates and events.
 * Open question R-14: a closed community's posts are shown only to its members and admin until that's settled.
 */
export async function getCommunity(slug: string) {
  const u = await currentUser();
  const c = await one<CommunityRow>(`${COMMUNITIES} WHERE c.slug = $2`, [u.id, slug]);
  if (!c) return undefined;
  const community = toCommunity(c, u.id);
  const admin = c.admin_id ? await one<UserRow>('SELECT * FROM users WHERE id = $1', [c.admin_id]) : undefined;
  const club = c.club_id ? await one<ClubRow>('SELECT * FROM clubs WHERE id = $1', [c.club_id]) : undefined;
  const canRead = c.access === 'open' || c.status === 'joined' || community.isAdmin;
  const posts = canRead
    ? await rows<PostRow>(
      `SELECT p.*, u.handle AS author_handle, u.name AS author_name, u.initials AS author_initials, u.tone AS author_tone
       FROM community_posts p LEFT JOIN users u ON u.id = p.author_id WHERE p.community_id = $1 ORDER BY p.created_at DESC, p.id DESC`,
      [c.id],
    )
    : null;
  const requests = community.isAdmin
    ? (await one<{ n: number }>("SELECT count(*)::int AS n FROM community_members WHERE community_id = $1 AND status = 'requested'", [c.id]))!.n
    : 0;
  return {
    ...community,
    admin: admin ? person(admin) : null,
    club: club
      ? { slug: club.slug, name: clubName(club), college: club.college, recruiting: club.recruiting, member: u.club_id === club.id }
      : null,
    posts: posts?.map(toPost) ?? null,
    requests,
  };
}

const TOPIC_TONES = ['blue', 'teal', 'mint', 'gold', 'peach', 'rose', 'stone'];
const DOMAIN_ICONS: Record<string, string> = {
  Business: 'briefcase', Design: 'sparkle', Data: 'trendingUp', Research: 'search', 'Product and growth': 'trendingUp',
  AI: 'sliders', Technology: 'link', Marketing: 'share', Careers: 'graduation',
};

/**
 * Anyone with a personal account can create a community; they become its admin and its first member.
 * Open question R-14: who can create communities isn't settled. Vinden makes the platform ones, so these never are.
 */
export async function createCommunity(input: { name?: unknown; domain?: unknown; access?: unknown; description?: unknown }) {
  const u = await viewer();
  if (!u || u.account !== 'person') return { status: 403, error: 'Only personal accounts can create a community.' } as const;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const domain = typeof input.domain === 'string' ? input.domain.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = 'Give it a name of at least 3 characters.';
  else if (name.length > 60) errors.name = 'Keep the name under 60 characters.';
  else if (await one('SELECT 1 FROM communities WHERE lower(name) = lower($1)', [name])) errors.name = 'A community with this name already exists. Try another name.';
  if (!domain || domain.length > 40) errors.domain = 'Choose a domain.';
  if (input.access !== 'open' && input.access !== 'closed') errors.access = 'Choose who can join.';
  if (description.length > 200) errors.description = 'Keep the description under 200 characters.';
  if (Object.keys(errors).length) return { status: 400, error: 'Check the highlighted fields.', errors } as const;

  const count = (await one<{ n: number; p: number }>('SELECT count(*)::int AS n, COALESCE(max(position), 0) + 1 AS p FROM communities'))!;
  const slug = await freeSlug('communities', name);
  const id = (await one<{ id: number }>(
    `INSERT INTO communities (slug, name, kind, access, members, description, tone, icon, position, platform, domain, admin_id)
     VALUES ($1, $2, 'topic', $3, 1, $4, $5, $6, $7, false, $8, $9) RETURNING id`,
    [slug, name, input.access, description || `A community for ${domain.toLowerCase()}.`, TOPIC_TONES[count.n % TOPIC_TONES.length],
      DOMAIN_ICONS[domain] ?? 'users', count.p, domain, u.id],
  ))!.id;
  await one("INSERT INTO community_members (community_id, user_id, status) VALUES ($1, $2, 'joined')", [id, u.id]);
  return { status: 201, community: await getCommunity(slug) } as const;
}

/** The admin posts an update or an event. Open question R-14: who can post isn't settled, so only the admin can. */
export async function addPost(slug: string, input: { kind?: unknown; title?: unknown; body?: unknown; when?: unknown; place?: unknown }) {
  const u = await viewer();
  const c = await one<CommunityRow>(`${COMMUNITIES} WHERE c.slug = $2`, [u?.id ?? -1, slug]);
  if (!c) return { status: 404, error: 'No community at that link.' } as const;
  if (!u || c.admin_id !== u.id) return { status: 403, error: 'Only the community’s admin can post here.' } as const;
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const kind = input.kind === 'event' ? 'event' : 'update';
  const title = text(input.title, 120);
  const body = text(input.body, 1000);
  const when = text(input.when, 60);
  const place = text(input.place, 80);
  const errors: Record<string, string> = {};
  if (!title) errors.title = kind === 'event' ? 'Name the event.' : 'Give the update a title.';
  if (kind === 'event' && !when) errors.when = 'Say when it is, for example Thu 6 Nov, 6 pm.';
  if (Object.keys(errors).length) return { status: 400, error: 'Check the highlighted fields.', errors } as const;
  await one(
    'INSERT INTO community_posts (community_id, kind, title, body, when_text, place, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [c.id, kind, title, body || null, kind === 'event' ? when : null, kind === 'event' ? place || null : null, u.id],
  );
  return { status: 201, community: await getCommunity(slug) } as const;
}

/** Who asked to join a closed community. Only its admin sees them. */
export async function getRequests(slug: string) {
  const u = await viewer();
  const c = await one<CommunityRow>(`${COMMUNITIES} WHERE c.slug = $2`, [u?.id ?? -1, slug]);
  if (!c) return { status: 404, error: 'No community at that link.' } as const;
  if (!u || c.admin_id !== u.id) return { status: 403, error: 'Only the community’s admin can see join requests.' } as const;
  const people = await rows<UserRow>(
    "SELECT u.* FROM community_members m JOIN users u ON u.id = m.user_id WHERE m.community_id = $1 AND m.status = 'requested' ORDER BY u.name",
    [c.id],
  );
  return {
    status: 200,
    body: {
      community: toCommunity(c, u.id),
      requests: people.map((p) => ({ ...person(p), line: p.headline })),
    },
  } as const;
}

/** Approve (they join, members + 1) or decline (the request is removed). */
export async function answerRequest(slug: string, handle: string, approve: boolean) {
  const res = await getRequests(slug);
  if (res.status !== 200) return res;
  const c = (await one<{ id: number }>('SELECT id FROM communities WHERE slug = $1', [slug]))!;
  const target = await one<{ id: number }>(
    "SELECT u.id FROM community_members m JOIN users u ON u.id = m.user_id WHERE m.community_id = $1 AND m.status = 'requested' AND u.handle = $2",
    [c.id, handle],
  );
  if (!target) return { status: 404, error: 'That request has already been answered.' } as const;
  if (approve) {
    await one("UPDATE community_members SET status = 'joined' WHERE community_id = $1 AND user_id = $2", [c.id, target.id]);
    await one('UPDATE communities SET members = members + 1 WHERE id = $1', [c.id]);
  } else {
    await one('DELETE FROM community_members WHERE community_id = $1 AND user_id = $2', [c.id, target.id]);
  }
  return getRequests(slug);
}

/* ---------- Club recruitment ---------- */

/** Selection can include five steps (PDF §2), then selected or ended. */
const STEPS = ['motivation', 'screening', 'interview', 'task', 'final'] as const;
type Step = (typeof STEPS)[number] | 'selected' | 'ended';

/** The eight evaluation factors (PDF §2), by their exact names. */
const FACTORS = [
  'Motivation and ambition',
  'Problem-solving ability',
  'Communication',
  'Curiosity and willingness to learn',
  'Leadership and ownership',
  'Existing skills and interests',
  'Ability to work in a team',
  'Commitment to the Vinden Club',
];

/** Open question R-17: who writes the motivation form's questions isn't settled, so every club asks this one. */
const QUESTIONS = ['Why do you want to join the Vinden Club?'];

interface ApplicationRow {
  id: number;
  club_id: number;
  user_id: number;
  step: Step;
  answers: { q: string; a: string }[];
  evaluation: Record<string, string>;
  created_at: Date | string;
}

/**
 * What a student sees on the Apply page: whether recruitment is open, the questions, and their application if any.
 * Open question R-27 and R-31: no year or college check; anyone with a personal account outside a club can apply.
 */
export async function getApply(slug: string) {
  const u = await currentUser();
  const c = await findClub(slug);
  if (!c) return undefined;
  const application = u.id === -1
    ? undefined
    : await one<ApplicationRow>('SELECT * FROM applications WHERE club_id = $1 AND user_id = $2', [c.id, u.id]);
  const otherClub = u.club_id && u.club_id !== c.id ? await one<ClubRow>('SELECT * FROM clubs WHERE id = $1', [u.club_id]) : undefined;
  return {
    club: { slug: c.slug, name: clubName(c), college: c.college, recruiting: c.recruiting },
    questions: QUESTIONS,
    member: u.club_id === c.id,
    otherClub: otherClub ? { slug: otherClub.slug, name: clubName(otherClub) } : null,
    application: application ? { id: application.id, step: application.step, answers: application.answers } : null,
  };
}

export async function apply(slug: string, input: { answers?: unknown }) {
  const u = await viewer();
  const c = await findClub(slug);
  if (!c) return { status: 404, error: 'No club at that link.' } as const;
  if (!u || u.account !== 'person') return { status: 403, error: 'Company accounts can’t apply to a club.' } as const;
  if (!c.recruiting) return { status: 409, error: 'Recruitment isn’t open right now.' } as const;
  if (u.club_id) return { status: 409, error: 'You’re already in a Vinden Club.' } as const;
  if (await one('SELECT 1 FROM applications WHERE club_id = $1 AND user_id = $2', [c.id, u.id])) {
    return { status: 409, error: 'You’ve already applied to this club.' } as const;
  }
  const answers = Array.isArray(input.answers) ? input.answers.map((a) => (typeof a === 'string' ? a.trim().slice(0, 2000) : '')) : [];
  const missing = QUESTIONS.map((_, i) => (answers[i] ? null : i)).filter((i) => i !== null);
  if (missing.length) return { status: 400, error: 'Answer every question to apply.', missing } as const;
  await one("INSERT INTO applications (club_id, user_id, step, answers) VALUES ($1, $2, 'motivation', $3)", [
    c.id, u.id, JSON.stringify(QUESTIONS.map((q, i) => ({ q, a: answers[i] }))),
  ]);
  return { status: 201, body: await getApply(slug) } as const;
}

/** The viewer's club, if they hold a Core Team seat in it. The Core Team recruits and selects members (PDF §1). */
async function coreClub(): Promise<{ user: UserRow; club: ClubRow } | { status: number; error: string }> {
  const u = await viewer();
  const seat = u ? await coreSeat(u) : null;
  if (!u || !seat) return { status: 403, error: 'Applications are for the club’s Core Team.' };
  return { user: u, club: (await one<ClubRow>('SELECT * FROM clubs WHERE id = $1', [u.club_id]))! };
}

const selectedCount = async (clubId: number) =>
  (await one<{ n: number }>("SELECT count(*)::int AS n FROM applications WHERE club_id = $1 AND step = 'selected'", [clubId]))!.n;

/** Every application to the Core Team member's club, with the count selected so far. */
export async function getApplications() {
  const core = await coreClub();
  if ('status' in core) return core;
  const apps = await rows<ApplicationRow & UserRow & { app_id: number }>(
    `SELECT u.*, a.id AS app_id, a.step, a.created_at FROM applications a JOIN users u ON u.id = a.user_id
     WHERE a.club_id = $1 ORDER BY a.created_at, a.id`,
    [core.club.id],
  );
  return {
    status: 200,
    body: {
      club: { slug: core.club.slug, name: clubName(core.club), college: core.club.college, recruiting: core.club.recruiting },
      target: TARGET_MEMBERS,
      selected: await selectedCount(core.club.id),
      applications: apps.map((a) => ({
        id: a.app_id,
        ...person(a),
        line: [a.study_year, a.college].filter(Boolean).join(' · ') || a.headline,
        step: a.step,
        createdAt: new Date(a.created_at).toISOString(),
      })),
    },
  } as const;
}

async function findApplication(id: number) {
  const core = await coreClub();
  if ('status' in core) return core;
  const a = Number.isInteger(id)
    ? await one<ApplicationRow>('SELECT * FROM applications WHERE id = $1 AND club_id = $2', [id, core.club.id])
    : undefined;
  if (!a) return { status: 404, error: 'No application at that link.' };
  return { ...core, application: a };
}

export async function getApplication(id: number) {
  const found = await findApplication(id);
  if ('status' in found) return found;
  const { club, application: a } = found;
  const u = (await one<UserRow>('SELECT * FROM users WHERE id = $1', [a.user_id]))!;
  return {
    status: 200,
    body: {
      id: a.id,
      step: a.step,
      person: { ...person(u), headline: u.headline, college: u.college, year: u.study_year },
      club: { slug: club.slug, name: clubName(club) },
      answers: a.answers,
      factors: FACTORS.map((name) => ({ name, note: a.evaluation[name] ?? '' })),
      createdAt: new Date(a.created_at).toISOString(),
      target: TARGET_MEMBERS,
      selected: await selectedCount(club.id),
    },
  } as const;
}

/** Keeps a free-text note per factor. Open question R-17: how factors are scored isn't settled, so there is no score. */
function cleanEvaluation(input: unknown, current: Record<string, string>) {
  const next = { ...current };
  if (input && typeof input === 'object') {
    for (const name of FACTORS) {
      const v = (input as Record<string, unknown>)[name];
      if (typeof v === 'string') {
        if (v.trim()) next[name] = v.trim().slice(0, 1000);
        else delete next[name];
      }
    }
  }
  return next;
}

/**
 * 'notes' saves the evaluation; 'next' saves it and moves to the next step (past final selection, they're selected and
 * join the club); 'end' ends the application. Open question R-17: how applicants hear back isn't settled.
 */
export async function updateApplication(id: number, action: 'notes' | 'next' | 'end', evaluation?: unknown) {
  const found = await findApplication(id);
  if ('status' in found) return found;
  const { club, application: a } = found;
  if (a.step === 'selected' || a.step === 'ended') return { status: 409, error: 'This application has already been decided.' } as const;
  const notes = cleanEvaluation(evaluation, a.evaluation);
  let step: Step = a.step;
  if (action === 'end') step = 'ended';
  if (action === 'next') {
    const i = STEPS.indexOf(a.step as (typeof STEPS)[number]);
    step = i === STEPS.length - 1 ? 'selected' : STEPS[i + 1];
  }
  if (step === 'selected') {
    const applicant = (await one<UserRow>('SELECT * FROM users WHERE id = $1', [a.user_id]))!;
    if (applicant.club_id && applicant.club_id !== club.id) return { status: 409, error: 'They’ve joined another club since applying.' } as const;
    if (!applicant.club_id) {
      await one("UPDATE users SET club_id = $1, club_role = 'Member' WHERE id = $2", [club.id, applicant.id]);
      await one('UPDATE clubs SET members = members + 1 WHERE id = $1', [club.id]);
    }
  }
  await one('UPDATE applications SET step = $2, evaluation = $3 WHERE id = $1', [a.id, step, JSON.stringify(notes)]);
  return getApplication(a.id);
}

/* ---------- Routes ---------- */

type Result = { status: number; error: string; [key: string]: unknown } | { status: number; body?: unknown; community?: unknown };
const respond = (reply: FastifyReply, r: Result) => {
  if ('error' in r) {
    const { status, ...rest } = r;
    return reply.code(status).send(rest);
  }
  return reply.code(r.status).send('body' in r ? r.body : r.community);
};

export async function routes(app: FastifyInstance) {
  app.get('/api/club', async (_req, reply) => (await getClub()) ?? reply.code(404).send({ error: 'You’re not in a club yet.' }));

  /* Clubs */
  app.get('/api/clubs', async () => getClubs());
  app.get<{ Params: { slug: string } }>('/api/clubs/:slug', async (req, reply) =>
    (await getClubPage(req.params.slug)) ?? reply.code(404).send({ error: 'No club at that link.' }));
  app.get<{ Params: { slug: string } }>('/api/clubs/:slug/portfolio', async (req, reply) =>
    (await getPortfolio(req.params.slug)) ?? reply.code(404).send({ error: 'No club at that link.' }));
  app.get<{ Params: { slug: string } }>('/api/clubs/:slug/apply', async (req, reply) =>
    (await getApply(req.params.slug)) ?? reply.code(404).send({ error: 'No club at that link.' }));
  app.post<{ Params: { slug: string }; Body: { answers?: unknown } }>('/api/clubs/:slug/apply', async (req, reply) =>
    respond(reply, await apply(req.params.slug, req.body ?? {})));

  /* Applications (Core Team) */
  app.get('/api/applications', async (_req, reply) => respond(reply, await getApplications()));
  app.get<{ Params: { id: string } }>('/api/applications/:id', async (req, reply) => respond(reply, await getApplication(Number(req.params.id))));
  app.patch<{ Params: { id: string }; Body: { evaluation?: unknown } }>('/api/applications/:id', async (req, reply) =>
    respond(reply, await updateApplication(Number(req.params.id), 'notes', req.body?.evaluation)));
  app.post<{ Params: { id: string }; Body: { evaluation?: unknown } }>('/api/applications/:id/next', async (req, reply) =>
    respond(reply, await updateApplication(Number(req.params.id), 'next', req.body?.evaluation)));
  app.post<{ Params: { id: string }; Body: { evaluation?: unknown } }>('/api/applications/:id/end', async (req, reply) =>
    respond(reply, await updateApplication(Number(req.params.id), 'end', req.body?.evaluation)));

  /* Communities */
  app.get('/api/communities', async () => getCommunities());
  app.post<{ Body: { name?: unknown; domain?: unknown; access?: unknown; description?: unknown } }>('/api/communities', async (req, reply) =>
    respond(reply, await createCommunity(req.body ?? {})));

  app.get<{ Params: { slug: string } }>('/api/communities/:slug', async (req, reply) =>
    (await getCommunity(req.params.slug)) ?? reply.code(404).send({ error: 'No community at that link.' }));

  app.post<{ Params: { slug: string } }>('/api/communities/:slug/join', async (req, reply) => {
    const community = await joinCommunity(req.params.slug, true);
    return community ?? reply.code(404).send({ error: 'No community at that link.' });
  });

  app.delete<{ Params: { slug: string } }>('/api/communities/:slug/join', async (req, reply) => {
    const community = await joinCommunity(req.params.slug, false);
    return community ?? reply.code(404).send({ error: 'No community at that link.' });
  });

  app.post<{ Params: { slug: string }; Body: { kind?: unknown; title?: unknown; body?: unknown; when?: unknown; place?: unknown } }>(
    '/api/communities/:slug/posts',
    async (req, reply) => respond(reply, await addPost(req.params.slug, req.body ?? {})),
  );

  app.get<{ Params: { slug: string } }>('/api/communities/:slug/requests', async (req, reply) => respond(reply, await getRequests(req.params.slug)));
  app.post<{ Params: { slug: string; handle: string }; Body: { approve?: unknown } }>(
    '/api/communities/:slug/requests/:handle',
    async (req, reply) => respond(reply, await answerRequest(req.params.slug, req.params.handle, req.body?.approve === true)),
  );
}
