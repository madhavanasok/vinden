import { one } from './db.js';
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
  cover: string;
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
    skills: ['Survey design', 'Pricing'], month: 'Aug 2025', weeks: 2, files: 2, cover: 'cafe-prices', inClub: true,
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
    skills: ['Pitching', 'Financial modelling'], month: 'Apr 2026', weeks: 2, files: 2, cover: 'laundry-deck',
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
      `INSERT INTO works (slug, title, card_title, kind, category, subcategory, tags, skills, month, weeks, summary, files, cover,
         company_id, club_id, ai_checked, club_reviewed, company_signed, split_confirmed, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [w.slug, w.title, w.cardTitle ?? w.title, w.kind, w.category, w.subcategory, w.tags, w.skills, w.month, w.weeks, w.summary, w.files,
        w.cover, w.company ? companies.get(w.company) : null, w.inClub ? clubId : null, w.checks.ai ?? null, w.checks.club ?? null,
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
