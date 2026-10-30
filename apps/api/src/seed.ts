import { one, rows } from './db.js';
import { weightSumFor } from './score.js';

/** The demo is signed in as this user. */
export const ME = 'ishaan';

type Tone = 'blue' | 'orange' | 'lav' | 'gold';

interface UserSeed {
  handle: string;
  name: string;
  initials: string;
  tone: Tone;
  headline: string;
  bio?: string;
  location?: string;
  website?: string;
  joined?: number;
  years?: number;
  inClub?: boolean;
  clubRole?: string;
  weight: number;
  strength?: number;
}

const USERS: UserSeed[] = [
  { handle: 'ishaan', name: 'Ishaan Sethi', initials: 'IS', tone: 'blue', headline: 'Second-year BBA student', joined: 2026, inClub: true, clubRole: 'Member', weight: 3.1, strength: 72 },
  {
    handle: 'ananya', name: 'Ananya Rao', initials: 'AR', tone: 'blue', headline: 'Final-year B.Com student',
    bio: 'I turn messy data into decisions. Growth and research work for early-stage startups.',
    location: 'Pune, India', website: 'ananyarao.work', joined: 2025, inClub: true, clubRole: 'Core Team · Vinden Club Meridian', weight: 5.2,
  },
  { handle: 'kabir', name: 'Kabir Shah', initials: 'KS', tone: 'orange', headline: 'Third-year B.Tech student', joined: 2025, inClub: true, clubRole: 'Member', weight: 3.6 },
  { handle: 'meera', name: 'Meera Iyer', initials: 'MI', tone: 'lav', headline: 'Final-year BBA student', joined: 2025, inClub: true, clubRole: 'Member', weight: 4.0 },
  { handle: 'rohan', name: 'Rohan Das', initials: 'RD', tone: 'gold', headline: 'Second-year B.Des student', joined: 2026, inClub: true, clubRole: 'Member', weight: 2.8 },
  { handle: 'priya', name: 'Priya Nair', initials: 'PN', tone: 'orange', headline: 'Growth Lead, Northwind Labs', years: 9, weight: 9.4 },
  { handle: 'rahul', name: 'Rahul Menon', initials: 'RM', tone: 'lav', headline: 'Final year, Meridian College', inClub: true, clubRole: 'Member', weight: 3.4 },
];

const COMPANIES = [
  { slug: 'snackly', name: 'Snackly', initial: 'S', color: '#07142F', sector: 'Food delivery' },
  { slug: 'pebble', name: 'Pebble Pay', initial: 'P', color: '#07142F', sector: 'Fintech' },
  { slug: 'kiro', name: 'Kiro Health', initial: 'K', color: '#5B43AE', sector: 'Healthtech' },
  { slug: 'northwind', name: 'Northwind Labs', initial: 'N', color: '#1565D8', sector: 'Hardware' },
  { slug: 'brewbox', name: 'Brewbox', initial: 'B', color: '#A84B06', sector: 'D2C coffee' },
];

const BRIEFS = [
  { slug: 'pebble-kyc', company: 'pebble', title: 'Why do half of student sign-ups drop at KYC?', category: 'Business', team: 4, weeks: 3, fee: 35000, cover: 'kyc-funnel' },
  { slug: 'kiro-checkin', company: 'kiro', title: 'Design a mental-health check-in students will use', category: 'Design', team: 5, weeks: 4, fee: 50000, cover: 'checkin-phone' },
  { slug: 'northwind-laptops', company: 'northwind', title: 'Size the market for refurbished laptops on campus', category: 'Research', team: 3, weeks: 3, fee: 30000, cover: 'tam-circles' },
  { slug: 'brewbox-retention', company: 'brewbox', title: 'Why do repeat orders drop after week three?', category: 'Data', team: 3, weeks: 2, fee: 25000, cover: 'retention-curve' },
];

interface VouchSeed { by: string; headline: string; body: string; skills: string; helpful: number; daysAgo: number }

interface WorkSeed {
  slug: string;
  title: string;
  cardTitle?: string;
  kind: 'Paid brief' | 'Club task' | 'Internship' | 'Independent project';
  category: string;
  subcategory: string;
  tags: string[];
  skills: string[];
  month: string;
  weeks: number;
  summary: string[];
  files: number;
  /** A drawing in the web app's Cover.tsx, or '' for a generated cover named after `format`. */
  cover: string;
  format?: string;
  company?: string;
  inClub?: boolean;
  checks: { ai?: string; club?: string; company?: string };
  members: [handle: string, role: string, share: number][];
  /** Target vouch score and number of vouches; background vouches are sized to hit them. */
  score: number;
  vouches: number;
  named?: VouchSeed[];
}

const WORKS: WorkSeed[] = [
  {
    slug: 'cac-teardown',
    title: 'Why CAC doubled for college users: a campus growth teardown',
    cardTitle: 'Campus CAC teardown for Snackly',
    kind: 'Paid brief', category: 'Business', subcategory: 'Growth strategy', tags: ['Growth strategy', 'Market research'],
    skills: ['Funnel analysis', 'SQL', 'Survey design', 'Cohort analysis', 'Pitching'],
    month: 'Oct 2026', weeks: 6, files: 6, cover: 'cac', company: 'snackly', inClub: true,
    summary: [
      "Snackly's cost to acquire a college user rose from ₹180 to ₹380 in nine months. We surveyed 412 students and ran cohort analysis on 18 months of sign-ups.",
      "Two causes stood out: referral fraud through duplicate student accounts, and a campus-ambassador payout that rewarded sign-ups rather than active users. We recommended three fixes and modelled their effect on next quarter's CAC.",
    ],
    checks: { ai: '10 Oct', club: '12 Oct', company: '14 Oct' },
    members: [
      ['ananya', 'Lead · Survey design, final analysis', 40],
      ['kabir', 'SQL and cohort analysis', 25],
      ['meera', '32 student interviews', 20],
      ['rohan', 'Deck and recommendations', 15],
    ],
    score: 8.6, vouches: 14,
    named: [
      { by: 'priya', headline: 'Decision-ready, not just descriptive', body: 'The referral-fraud finding alone would have saved us a quarter. Clean SQL, honest about its limits, and recommendations a growth team could ship next sprint.', skills: 'Funnel analysis · SQL', helpful: 6, daysAgo: 2 },
      { by: 'rahul', headline: 'Rigorous from day one', body: "I sat in on two of the interview sessions. The team's research process was careful and well documented.", skills: 'Survey design', helpful: 2, daysAgo: 5 },
    ],
  },
  {
    slug: 'library-booking', title: 'Library seat booking, redesigned',
    kind: 'Club task', category: 'Design', subcategory: 'Product design', tags: ['Product design', 'UX research'],
    skills: ['UX research', 'Prototyping', 'Figma'], month: 'Sep 2026', weeks: 3, files: 4, cover: 'library-phones', inClub: true,
    summary: ['Students were queueing for seats the library app showed as free. Kabir interviewed 20 regulars, mapped where the booking flow broke, and prototyped a check-in that releases no-show seats after 15 minutes.'],
    checks: { ai: '18 Sep' },
    members: [['kabir', 'Research, design and prototype', 100]],
    score: 7.9, vouches: 9,
    named: [{ by: 'rahul', headline: 'Fixes a problem we all have', body: 'I tested the prototype twice. Releasing no-show seats would end the morning rush for seats.', skills: 'Prototyping', helpful: 3, daysAgo: 12 }],
  },
  {
    slug: 'canteen-rush', title: 'Predicting canteen rush hours',
    kind: 'Club task', category: 'Data', subcategory: 'Analytics', tags: ['Analytics', 'Forecasting'],
    skills: ['Python', 'Forecasting', 'Data visualisation'], month: 'Sep 2026', weeks: 2, files: 3, cover: 'canteen-bars', inClub: true,
    summary: ['Using three months of canteen billing data, Meera built a simple forecast of hourly orders so the canteen could staff its two rush windows. The forecast was within 10% on most days of the test week.'],
    checks: { ai: '20 Sep', club: '22 Sep' },
    members: [['meera', 'Data cleaning, forecast and dashboard', 100]],
    score: 8.2, vouches: 11,
    named: [{ by: 'priya', headline: 'Simple model, used well', body: 'Picked the right level of complexity for the problem and was clear about where the forecast breaks down.', skills: 'Forecasting', helpful: 4, daysAgo: 20 }],
  },
  {
    slug: 'cafe-pricing', title: 'Campus café pricing study',
    kind: 'Club task', category: 'Business', subcategory: 'Pricing', tags: ['Pricing', 'Market research'],
    skills: ['Survey design', 'Pricing'], month: 'Aug 2025', weeks: 2, files: 2, cover: '', format: 'Report', inClub: true,
    summary: ["Ananya's first proof of work: a price-sensitivity survey of 180 students that helped the campus café set a three-tier menu."],
    checks: { ai: '22 Aug', club: '25 Aug' },
    members: [['ananya', 'Survey, analysis and recommendation', 100]],
    score: 7.4, vouches: 6,
  },
  {
    slug: 'onboarding-audit', title: 'Onboarding funnel audit',
    kind: 'Internship', category: 'Business', subcategory: 'Product analytics', tags: ['Product analytics', 'Growth'],
    skills: ['Funnel analysis', 'SQL', 'Amplitude'], month: 'Jul 2026', weeks: 10, files: 3, cover: 'activation-line', company: 'northwind',
    summary: ['During her internship at Northwind Labs, Ananya traced where new users dropped out of onboarding and proposed two changes the team shipped before she left.'],
    checks: { ai: '28 Jul', company: '30 Jul' },
    members: [['ananya', 'Analysis and recommendations', 100]],
    score: 8.1, vouches: 5,
    named: [{ by: 'priya', headline: 'She found the drop-off we had missed', body: 'Ananya spotted that our activation email went out before people had finished setup. Fixing it was the biggest onboarding win of our quarter.', skills: 'Funnel analysis', helpful: 5, daysAgo: 80 }],
  },
  {
    slug: 'hostel-survey', title: 'Hostel food survey',
    kind: 'Club task', category: 'Research', subcategory: 'Survey research', tags: ['Survey research'],
    skills: ['Survey design', 'Data visualisation'], month: 'Feb 2026', weeks: 3, files: 3, cover: 'hostel-donut', inClub: true,
    summary: ['A survey of 600 hostel residents on meal quality and timings, presented to the hostel committee with three changes to trial.'],
    checks: { ai: '18 Feb', club: '20 Feb' },
    members: [['ananya', 'Survey design and analysis', 45], ['meera', 'Fieldwork', 30], ['rohan', 'Report design', 25]],
    score: 7.0, vouches: 6,
  },
  {
    slug: 'laundry-deck', title: 'Pitch deck for a campus laundry startup',
    kind: 'Independent project', category: 'Business', subcategory: 'Entrepreneurship', tags: ['Entrepreneurship'],
    skills: ['Pitching', 'Financial modelling'], month: 'Apr 2026', weeks: 2, files: 2, cover: '', format: 'Deck',
    summary: ['A pitch deck and simple unit-economics model for a student-run laundry pickup service, built for a college pitch competition.'],
    checks: { ai: '12 Apr' },
    members: [['ananya', 'Deck and model', 100]],
    score: 7.6, vouches: 4,
  },
  {
    slug: 'banking-compare', title: 'Student banking apps compared',
    kind: 'Club task', category: 'Research', subcategory: 'Competitive analysis', tags: ['Competitive analysis'],
    skills: ['Competitive analysis', 'Research'], month: 'May 2026', weeks: 1, files: 1, cover: 'banking-table', inClub: true,
    summary: ['A side-by-side review of five student banking apps on fees, onboarding and features, written up as a short report.'],
    checks: { ai: '5 May', club: '8 May' },
    members: [['ananya', 'Research and report', 100]],
    score: 6.9, vouches: 3,
  },
];

const insert = async (sql: string, params: unknown[]) => (await one<{ id: number }>(`${sql} RETURNING id`, params))!.id;

/** Fills an empty database with the demo data. Does nothing once data exists. */
const CORE_TEAM: [handle: string, role: string][] = [
  ['ananya', 'President'],
  ['kabir', 'Learning & Development'],
  ['meera', 'Proof of Work & Quality'],
  ['rahul', 'Industry & Outreach'],
  ['rohan', 'Community & Events'],
];

/** Club page data. Runs on every start and fills in databases seeded before the Club page existed. */
export async function seedClub() {
  if (await one('SELECT 1 FROM core_team LIMIT 1')) return;
  const club = await one<{ id: number }>("SELECT id FROM clubs WHERE slug = 'meridian'");
  if (!club) return;
  await one(
    `UPDATE clubs SET short_name = 'Vinden Club Meridian', city = 'Pune', started = 'Aug 2025', earned = 140000, sessions = 18,
       session_title = 'Landing your first growth role', session_detail = 'Alumni session with Priya Nair · Thu 30 Oct, 6 pm'
     WHERE id = $1`,
    [club.id],
  );
  await one('UPDATE tasks SET brief = $2 WHERE club_id = $1', [
    club.id, 'Estimate how many students order food online each week, and what they spend. Show your method.',
  ]);
  for (const [position, [handle, role]] of CORE_TEAM.entries()) {
    await one('INSERT INTO core_team (club_id, user_id, role, position) SELECT $1, id, $2, $3 FROM users WHERE handle = $4', [club.id, role, position, handle]);
    if (handle !== 'ananya') await one("UPDATE users SET club_role = 'Core Team · Vinden Club Meridian' WHERE handle = $1", [handle]);
  }
}

export async function seed() {
  if (await one('SELECT 1 FROM users LIMIT 1')) return;

  const clubId = await insert(
    'INSERT INTO clubs (slug, name, college, members, core_team, next_session) VALUES ($1, $2, $3, $4, $5, $6)',
    ['meridian', 'Vinden Club · Meridian College', 'Meridian College', 30, 12, 'Alumni session, “Landing your first growth role” · Thu, 6 pm'],
  );

  const users = new Map<string, { id: number; weight: number }>();
  for (const u of USERS) {
    const id = await insert(
      `INSERT INTO users (handle, name, initials, tone, headline, bio, location, website, joined, years, club_id, club_role, vouch_weight, profile_strength)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [u.handle, u.name, u.initials, u.tone, u.headline, u.bio ?? null, u.location ?? null, u.website ?? null, u.joined ?? null,
        u.years ?? null, u.inClub ? clubId : null, u.clubRole ?? null, u.weight, u.strength ?? null],
    );
    users.set(u.handle, { id, weight: u.weight });
  }
  const userId = (handle: string) => users.get(handle)!.id;

  const companies = new Map<string, number>();
  for (const c of COMPANIES) {
    companies.set(c.slug, await insert('INSERT INTO companies (slug, name, initial, color, sector) VALUES ($1, $2, $3, $4, $5)', [c.slug, c.name, c.initial, c.color, c.sector]));
  }

  for (const [i, b] of BRIEFS.entries()) {
    await insert(
      'INSERT INTO briefs (slug, company_id, title, category, team_size, weeks, fee, cover, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [b.slug, companies.get(b.company), b.title, b.category, b.team, b.weeks, b.fee, b.cover, i],
    );
  }

  for (const [i, w] of WORKS.entries()) {
    const workId = await insert(
      `INSERT INTO works (slug, title, card_title, kind, category, subcategory, tags, skills, month, weeks, summary, files, cover, format,
         company_id, club_id, ai_checked, club_reviewed, company_signed, split_confirmed, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [w.slug, w.title, w.cardTitle ?? w.title, w.kind, w.category, w.subcategory, w.tags, w.skills, w.month, w.weeks, w.summary, w.files,
        w.cover, w.format ?? null, w.company ? companies.get(w.company) : null, w.inClub ? clubId : null, w.checks.ai ?? null, w.checks.club ?? null,
        w.checks.company ?? null, w.members.length > 1, i],
    );
    for (const [pos, [handle, role, share]] of w.members.entries()) {
      await one('INSERT INTO work_members (work_id, user_id, role, share, position) VALUES ($1, $2, $3, $4, $5)', [workId, userId(handle), role, share, pos]);
    }

    const named = w.named ?? [];
    for (const v of named) {
      const voucher = users.get(v.by)!;
      await one(
        `INSERT INTO vouches (work_id, voucher_id, weight, professional, headline, body, skills, helpful, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() - make_interval(days => $9))`,
        [workId, voucher.id, voucher.weight, voucher.weight >= 7, v.headline, v.body, v.skills, v.helpful, v.daysAgo],
      );
    }

    // Background vouches, sized so the work lands on its target score and count.
    const fillers = w.vouches - named.length;
    const namedWeight = named.reduce((sum, v) => sum + users.get(v.by)!.weight, 0);
    const each = Math.min(9.9, Math.max(1, (weightSumFor(w.score) - namedWeight) / fillers));
    const pros = Math.max(0, Math.round(w.vouches * 0.45) - named.filter((v) => users.get(v.by)!.weight >= 7).length);
    for (let n = 0; n < fillers; n++) {
      await one(
        'INSERT INTO vouches (work_id, weight, professional, created_at) VALUES ($1, $2, $3, now() - make_interval(days => $4))',
        [workId, each, n < pros, 7 + n * 3],
      );
    }
  }

  const ananya = userId('ananya');
  for (const [pos, e] of [
    ['Growth Intern', 'Northwind Labs', 'N', '#07142F', 'May – Jul 2026 · 3 months', 'manager'],
    ['Research Assistant', 'Kiro Health', 'K', '#5B43AE', 'Jan – Apr 2026 · 4 months', 'offer_letter'],
  ].entries()) {
    await one('INSERT INTO experiences (user_id, role, company, initial, color, period, verification, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [ananya, ...e, pos]);
  }
  for (const [pos, m] of [
    ['First paid brief', "Led Snackly's CAC brief · Oct 2026", 'briefcase', 'gold'],
    ['30+ vouches', 'Across her verified work · Sep 2026', 'thumbsUp', 'blue'],
  ].entries()) {
    await one('INSERT INTO milestones (user_id, title, sub, icon, tone, position) VALUES ($1, $2, $3, $4, $5, $6)', [ananya, ...m, pos]);
  }
  for (const [pos, j] of [
    ['Oct 2026', "Led Snackly's CAC brief", 'Paid club project'],
    ['Jul 2026', 'Finished Northwind Labs internship', 'Manager confirmed'],
    ['Mar 2026', 'Joined the Vinden Club Core Team', 'Industry & Outreach'],
    ['Aug 2025', 'First proof of work', 'Campus café pricing study'],
  ].entries()) {
    await one('INSERT INTO journey (user_id, month, title, sub, position) VALUES ($1, $2, $3, $4, $5)', [ananya, ...j, pos]);
  }

  await one('INSERT INTO tasks (club_id, title, due, effort, done, total) VALUES ($1, $2, $3, $4, $5, $6)', [
    clubId, 'Size the campus food-delivery market in Pune', 'Fri, 24 Oct', 'About 4 hrs', 12, 30,
  ]);
  for (const from of ['meera', 'kabir']) {
    await one('INSERT INTO vouch_requests (from_user, to_user) VALUES ($1, $2)', [userId(from), userId(ME)]);
  }
}

/**
 * Generated covers. Runs on every start: the two seeded works without a preview image lose their drawings in
 * databases seeded before generated covers existed, and posted work (which has no preview yet) uses one too.
 */
export async function seedCovers() {
  await one("UPDATE works SET cover = '', format = 'Report' WHERE slug = 'cafe-pricing' AND cover <> ''");
  await one("UPDATE works SET cover = '', format = 'Deck' WHERE slug = 'laundry-deck' AND cover <> ''");
  await one("UPDATE works SET cover = '' WHERE submitted_at IS NOT NULL AND cover <> ''");
}

const COMMUNITIES = [
  {
    slug: 'meridian', name: 'Vinden Club Meridian', kind: 'club', access: 'open', members: 412, tone: 'lavender', icon: null,
    description: 'Sessions, events and recruitment news from the club. Anyone at Meridian can follow along.',
  },
  {
    slug: 'product-growth', name: 'Product & Growth', kind: 'topic', access: 'open', members: 1240, tone: 'teal', icon: 'trendingUp',
    description: 'Teardowns, growth experiments and product case studies from students and operators.',
  },
  {
    slug: 'design-circle', name: 'Design Circle', kind: 'topic', access: 'open', members: 860, tone: 'rose', icon: 'sparkle',
    description: 'Portfolio reviews, critiques and UX research methods. Post a draft, get feedback.',
  },
  {
    slug: 'ai-builders-pune', name: 'AI Builders Pune', kind: 'topic', access: 'closed', members: 86, tone: 'blue', icon: 'sliders',
    description: 'Students shipping AI projects in Pune. Admins approve new members to keep it small.',
  },
] as const;

/**
 * Communities for Home. Runs on every start: adds missing ones and keeps names, copy and tones in step with this list,
 * but never touches member counts or who has joined. The demo user follows their club's community.
 */
export async function seedCommunities() {
  const club = await one<{ id: number }>("SELECT id FROM clubs WHERE slug = 'meridian'");
  for (const [position, c] of COMMUNITIES.entries()) {
    const { id, inserted } = (await one<{ id: number; inserted: boolean }>(
      `INSERT INTO communities (slug, name, kind, access, members, description, tone, icon, club_id, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, tone = EXCLUDED.tone,
         icon = EXCLUDED.icon, position = EXCLUDED.position
       RETURNING id, (xmax = 0) AS inserted`,
      [c.slug, c.name, c.kind, c.access, c.members, c.description, c.tone, c.icon, c.kind === 'club' ? club?.id ?? null : null, position],
    ))!;
    if (inserted && c.kind === 'club') {
      await one("INSERT INTO community_members (community_id, user_id, status) SELECT $1, id, 'joined' FROM users WHERE handle = $2", [id, ME]);
    }
  }
}

/* ---------- The feature register build (vinden-design) ---------- */

const PROFILES: [handle: string, describes: string, college: string | null, year: string | null, skills: string[], interests: string[]][] = [
  ['ishaan', 'student', 'Meridian College', 'Second year', ['Market sizing', 'Excel', 'Survey design'], ['Growth', 'Research']],
  ['ananya', 'student', 'Meridian College', 'Final year', ['Survey design', 'SQL', 'Funnel analysis'], ['Growth', 'Research']],
  ['kabir', 'student', 'Meridian College', 'Third year', ['UX research', 'Prototyping', 'Figma'], ['Design', 'AI']],
  ['meera', 'student', 'Meridian College', 'Final year', ['Python', 'Forecasting'], ['Data']],
  ['rohan', 'student', 'Meridian College', 'Second year', ['Deck design', 'Pitching'], ['Design', 'Business']],
  ['rahul', 'student', 'Meridian College', 'Final year', ['Research', 'Outreach'], ['Business']],
  ['priya', 'professional', null, null, ['Growth', 'Analytics', 'SQL'], ['Product and growth']],
];

const NEW_PEOPLE: { handle: string; name: string; initials: string; tone: Tone; headline: string; describes?: string; year?: string; weight: number }[] = [
  { handle: 'tara', name: 'Tara Joshi', initials: 'TJ', tone: 'lav', headline: 'New to Vinden', weight: 1.5 },
  { handle: 'zoya', name: 'Zoya Khan', initials: 'ZK', tone: 'gold', headline: 'B.Sc student, Meridian College', describes: 'student', year: 'First year', weight: 1.8 },
  { handle: 'dev', name: 'Dev Kulkarni', initials: 'DK', tone: 'orange', headline: 'B.Com student, Meridian College', describes: 'student', year: 'Second year', weight: 2.1 },
  { handle: 'sana', name: 'Sana Qureshi', initials: 'SQ', tone: 'blue', headline: 'BBA student, Meridian College', describes: 'student', year: 'Second year', weight: 2.4 },
  { handle: 'neel', name: 'Neel Patil', initials: 'NP', tone: 'lav', headline: 'B.Tech student, Meridian College', describes: 'student', year: 'Third year', weight: 2.6 },
];

const MOTIVATION_Q = 'Why do you want to join the Vinden Club?';

const APPLICANTS: [handle: string, step: string, answer: string, evaluation: Record<string, string>][] = [
  ['zoya', 'motivation', 'I want to work on real problems, not just assignments, and learn how to show what I can do.', {}],
  ['dev', 'screening', 'I run the commerce society’s newsletter and want to learn research properly, with people who push me.', {}],
  ['sana', 'interview', 'I like figuring out why people do what they do. I want to turn that into work companies can use.', {
    'Motivation and ambition': 'Clear reasons; wants paid projects', 'Communication': 'Concise and confident',
  }],
  ['neel', 'task', 'I build small tools for my hostel and want to learn how to take them further.', {
    'Motivation and ambition': 'Strong', 'Problem-solving ability': 'Broke the brief down well', 'Ability to work in a team': 'Good, from the group round',
  }],
];

const TRAINING: { kind: 'project' | 'task' | 'session' | 'path'; title: string; body: string; skill?: string; when?: string; resources?: { type: string; title: string }[] }[] = [
  { kind: 'project', title: 'Size the campus food-delivery market in Pune', skill: 'Market research', body: 'Estimate how many students order food online each week, and what they spend. Show your method.' },
  { kind: 'project', title: 'Redesign the canteen pre-order flow', skill: 'Product design', body: 'Interview ten students who skip the canteen at lunch, then prototype a pre-order flow that saves them the queue.' },
  { kind: 'task', title: 'Analyse a company: a food-delivery app’s student plan', skill: 'Business analysis', body: 'Pick one food-delivery app. Explain who its student plan is for, how it makes money and one change you would test.' },
  { kind: 'task', title: 'Build a prototype: library seat check-in', skill: 'Prototyping', body: 'Prototype a check-in that releases seats nobody turned up for.' },
  { kind: 'task', title: 'Prepare a pitch: a campus laundry service', skill: 'Pitching', body: 'A five-slide pitch and simple unit economics for a student-run laundry pickup.' },
  { kind: 'session', title: 'Alumni session: Landing your first growth role', when: 'Thu 30 Oct, 6 pm', body: 'Career journeys and the skills that matter, with Priya Nair, Growth Lead at Northwind Labs.' },
  { kind: 'session', title: 'Industry session: a real marketing problem from Brewbox', when: 'Tue 4 Nov, 5 pm', body: 'Brewbox brings a live marketing problem and guides members through solving it.' },
  {
    kind: 'path', title: 'Market research', skill: 'Market research', body: 'A short, curated path for sizing markets and running surveys.',
    resources: [
      { type: 'Course', title: 'Market sizing basics' }, { type: 'Article', title: 'Top-down and bottom-up estimates' },
      { type: 'Case study', title: 'How a campus app sized its first city' }, { type: 'Industry report', title: 'Food delivery in India, 2026' },
      { type: 'Template', title: 'Market-sizing worksheet' },
    ],
  },
  {
    kind: 'path', title: 'Data analysis', skill: 'Data analysis', body: 'From messy spreadsheets to a clear chart.',
    resources: [
      { type: 'Course', title: 'Spreadsheet analysis for beginners' }, { type: 'Video', title: 'Cleaning messy survey data' },
      { type: 'Book', title: 'Storytelling with Data' }, { type: 'Tool', title: 'Pivot tables in Google Sheets' },
    ],
  },
];

/** Club work waiting for the Proof of Work & Quality team. 'changes' means a reviewer sent feedback. */
const IN_REVIEW: { slug: string; title: string; members: [string, string, number][]; item: number; status: string; feedback?: string; format: string; summary: string }[] = [
  {
    slug: 'food-app-student-plan', title: 'A food-delivery app’s student plan, analysed', members: [['rohan', 'Analysis and write-up', 100]], item: 3,
    status: 'in_review', format: 'Report', summary: 'Who the student plan is for, how it makes money, and one pricing change worth testing.',
  },
  {
    slug: 'pune-delivery-market', title: 'Campus food-delivery market in Pune', members: [['ishaan', 'Survey and estimate', 60], ['rohan', 'Charts and write-up', 40]], item: 1,
    status: 'in_review', format: 'Dataset', summary: 'A bottom-up estimate of weekly student orders across six Pune campuses, from a survey of 140 students.',
  },
  {
    slug: 'canteen-preorder', title: 'Canteen pre-order prototype', members: [['kabir', 'Interviews and prototype', 100]], item: 2,
    status: 'changes', feedback: 'Add your interview notes so we can check the findings behind the flow.', format: 'Design',
    summary: 'A pre-order flow for the canteen, tested with five students who usually skip lunch.',
  },
];

const PROBLEMS: Record<string, { description: string; needs: string; stage: string; requirements?: string; followUp?: string; team?: string[]; by?: string }> = {
  'pebble-kyc': {
    description: 'Half of the students who sign up stop at KYC. We want to know why, and what to change first.', needs: 'Research and recommendations',
    stage: 'problem', requirements: 'Interview students who dropped at KYC; review the funnel data we share.', by: 'arjun',
  },
  'kiro-checkin': {
    description: 'Students say they want a mental-health check-in, but few use the one we have.', needs: 'A built solution', stage: 'team',
    requirements: 'A clickable prototype tested with students.', team: ['kabir', 'rohan'],
  },
  'northwind-laptops': {
    description: 'We need to know how many students would buy a refurbished laptop, and at what price.', needs: 'A report', stage: 'solution',
    requirements: 'Market size for three campuses, with the method.', team: ['meera', 'ishaan'], followUp: 'Report delivered 27 Oct; Northwind reviewing.',
  },
  'brewbox-retention': {
    description: 'Repeat orders fall after the third week. We want to understand why.', needs: 'Data analysis', stage: 'problem',
  },
};

/** New demo data for the register's features. Runs once per database (marked in seed_marks). */
export async function seedBuild() {
  if (await one("SELECT 1 FROM seed_marks WHERE name = 'build-v1'")) return;
  const club = await one<{ id: number }>("SELECT id FROM clubs WHERE slug = 'meridian'");
  if (!club) return;
  const id = async (handle: string) => (await one<{ id: number }>('SELECT id FROM users WHERE handle = $1', [handle]))?.id;

  for (const [handle, describes, college, year, skills, interests] of PROFILES) {
    await one('UPDATE users SET describes = $2, college = $3, study_year = $4, skills = $5, interests = $6, email = $7 WHERE handle = $1 AND describes IS NULL',
      [handle, describes, college, year, skills, interests, `${handle}@example.com`]);
  }
  for (const p of NEW_PEOPLE) {
    if (await id(p.handle)) continue;
    await one(
      `INSERT INTO users (handle, name, initials, tone, headline, vouch_weight, email, describes, college, study_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [p.handle, p.name, p.initials, p.tone, p.headline, p.weight, `${p.handle}@example.com`, p.describes ?? null,
        p.describes ? 'Meridian College' : null, p.year ?? null],
    );
  }
  const pebble = await one<{ id: number }>("SELECT id FROM companies WHERE slug = 'pebble'");
  if (!(await id('arjun'))) {
    await one(
      `INSERT INTO users (handle, name, initials, tone, headline, vouch_weight, email, account, company_id)
       VALUES ('arjun', 'Arjun Mehta', 'AM', 'blue', 'Head of Growth, Pebble Pay', 5, 'arjun@pebblepay.example', 'company', $1)`,
      [pebble?.id ?? null],
    );
  }

  // A role waiting for its manager, so the confirmation link can be tried: /confirm/demo-brewbox-ishaan
  await one(
    `INSERT INTO experiences (user_id, role, company, initial, color, period, verification, position, status, manager_email, token)
     VALUES ($1, 'Marketing Intern', 'Brewbox', 'B', '#A84B06', 'May – Jun 2026 · 2 months', 'manager', 0, 'pending', 'neha@brewbox.example', 'demo-brewbox-ishaan')`,
    [await id('ishaan')],
  );
  await one(
    `INSERT INTO experiences (user_id, role, company, initial, color, period, verification, position)
     VALUES ($1, 'Growth Lead', 'Northwind Labs', 'N', '#1565D8', '2022 – now · 4 years', 'manager', 0)`,
    [await id('priya')],
  );

  // Communities: platform ones are Vinden's; a closed one has an admin; the club's community is run by Community & Events.
  await one("UPDATE communities SET platform = true, domain = 'Product and growth' WHERE slug = 'product-growth'");
  await one("UPDATE communities SET platform = true, domain = 'Design' WHERE slug = 'design-circle'");
  await one("UPDATE communities SET domain = 'AI', admin_id = $1 WHERE slug = 'ai-builders-pune'", [await id('priya')]);
  await one("UPDATE communities SET domain = 'Vinden Club', admin_id = $1 WHERE slug = 'meridian'", [await id('rohan')]);
  for (const handle of ['dev', 'zoya']) {
    await one(
      "INSERT INTO community_members (community_id, user_id, status) SELECT c.id, $1, 'requested' FROM communities c WHERE c.slug = 'ai-builders-pune' ON CONFLICT DO NOTHING",
      [await id(handle)],
    );
  }
  const posts: [community: string, kind: string, title: string, body: string, when: string | null, place: string | null, author: string | null][] = [
    ['meridian', 'event', 'Alumni session: Landing your first growth role', 'With Priya Nair, Growth Lead at Northwind Labs.', 'Thu 30 Oct, 6 pm', 'Seminar Hall 2', 'rohan'],
    ['meridian', 'update', 'Applications are open', 'Selection runs in five steps: motivation form, screening, interview, practical task and final selection. Open to the whole college. No fee.', null, null, 'rohan'],
    ['meridian', 'update', 'Snackly project delivered', 'Our team delivered the campus customer-acquisition teardown to Snackly. It is now verified Proof of Work.', null, null, 'rohan'],
    ['product-growth', 'update', 'Teardown thread: why campus referral programmes leak', 'Share one referral programme you have seen gamed, and how you would fix it.', null, null, null],
    ['product-growth', 'event', 'Growth office hours', 'Bring a funnel you are stuck on.', 'Sat 1 Nov, 11 am', 'Online', null],
    ['design-circle', 'update', 'Portfolio review this Friday', 'Post a draft case study by Thursday night to get feedback.', null, null, null],
  ];
  for (const [i, [slug, kind, title, body, when, place, author]] of posts.entries()) {
    await one(
      `INSERT INTO community_posts (community_id, kind, title, body, when_text, place, author_id, created_at)
       SELECT c.id, $2, $3, $4, $5, $6, $7, now() - make_interval(days => $8) FROM communities c WHERE c.slug = $1`,
      [slug, kind, title, body, when, place, author ? await id(author) : null, i],
    );
  }

  // Club selection: applicants at each step.
  await one('UPDATE clubs SET recruiting = true WHERE id = $1', [club.id]);
  for (const [handle, step, answer, evaluation] of APPLICANTS) {
    await one(
      'INSERT INTO applications (club_id, user_id, step, answers, evaluation) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [club.id, await id(handle), step, JSON.stringify([{ q: MOTIVATION_Q, a: answer }]), JSON.stringify(evaluation)],
    );
  }

  // The training program.
  const itemIds: number[] = [];
  for (const [position, t] of TRAINING.entries()) {
    itemIds.push((await one<{ id: number }>(
      `INSERT INTO training_items (club_id, kind, title, body, skill, when_text, resources, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [club.id, t.kind, t.title, t.body, t.skill ?? null, t.when ?? null, JSON.stringify(t.resources ?? []), position],
    ))!.id);
  }
  await one("UPDATE works SET training_item_id = $1 WHERE slug = 'library-booking'", [itemIds[3]]);

  // Club work waiting for review, and one sent back with feedback.
  for (const w of IN_REVIEW) {
    if (await one('SELECT 1 FROM works WHERE slug = $1', [w.slug])) continue;
    const position = (await one<{ p: number }>('SELECT COALESCE(max(position), 0) + 1 AS p FROM works'))!.p;
    const workId = (await one<{ id: number }>(
      `INSERT INTO works (slug, title, card_title, kind, category, subcategory, tags, skills, month, weeks, summary, files, cover, format,
         club_id, ai_checked, split_confirmed, position, status, submitted_at, training_item_id, feedback)
       VALUES ($1, $2, $2, 'Club task', 'Business', 'Club task', '{}', '{}', 'Oct 2026', 1, $3, 2, '', $4, $5, '29 Oct', $6, $7, $8, now() - interval '1 day', $9, $10)
       RETURNING id`,
      [w.slug, w.title, [w.summary], w.format, club.id, w.members.length > 1, position, w.status, itemIds[w.item - 1], w.feedback ?? null],
    ))!.id;
    for (const [pos, [handle, role, share]] of w.members.entries()) {
      await one('INSERT INTO work_members (work_id, user_id, role, share, position) VALUES ($1, $2, $3, $4, $5)', [workId, await id(handle), role, share, pos]);
    }
  }

  // Problem statements at each stage of the cycle, plus the delivered Snackly one.
  for (const [slug, p] of Object.entries(PROBLEMS)) {
    await one(
      `UPDATE briefs SET description = $2, needs = $3, stage = $4, club_id = $5, requirements = $6, follow_up = $7, submitted_by = $8 WHERE slug = $1`,
      [slug, p.description, p.needs, p.stage, club.id, p.requirements ?? null, p.followUp ?? null, p.by ? await id(p.by) : null],
    );
    for (const handle of p.team ?? []) {
      await one('INSERT INTO brief_team (brief_id, user_id) SELECT b.id, $2 FROM briefs b WHERE b.slug = $1 ON CONFLICT DO NOTHING', [slug, await id(handle)]);
    }
  }
  const snackly = await one<{ id: number }>("SELECT id FROM companies WHERE slug = 'snackly'");
  if (snackly && !(await one("SELECT 1 FROM briefs WHERE slug = 'snackly-cac'"))) {
    const briefId = (await one<{ id: number }>(
      `INSERT INTO briefs (slug, company_id, title, category, team_size, weeks, fee, cover, position, description, needs, stage, club_id, follow_up)
       VALUES ('snackly-cac', $1, 'Why has our customer acquisition cost increased among college users?', 'Business', 4, 6, 40000, 'cac', 99,
         'Our cost to acquire a college user doubled in nine months.', 'Research and recommendations', 'pow', $2, 'Delivered 14 Oct; Snackly shipped two of the three fixes.')
       RETURNING id`,
      [snackly.id, club.id],
    ))!.id;
    for (const handle of ['ananya', 'kabir', 'meera', 'rohan']) {
      await one('INSERT INTO brief_team (brief_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [briefId, await id(handle)]);
    }
    await one("UPDATE works SET brief_id = $1 WHERE slug = 'cac-teardown'", [briefId]);
  }

  await one("INSERT INTO seed_marks (name) VALUES ('build-v1')");
}

/** Community admins follow the community they run. Runs on every start; joining twice is a no-op. */
export async function seedAdminsJoined() {
  const added = await rows<{ community_id: number }>(
    `INSERT INTO community_members (community_id, user_id, status)
     SELECT id, admin_id, 'joined' FROM communities WHERE admin_id IS NOT NULL
     ON CONFLICT DO NOTHING RETURNING community_id`,
  );
  for (const a of added) await one('UPDATE communities SET members = members + 1 WHERE id = $1', [a.community_id]);
}
