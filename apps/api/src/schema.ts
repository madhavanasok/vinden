import { db } from './db.js';

export async function migrate() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      college text NOT NULL,
      members int NOT NULL,
      core_team int NOT NULL,
      next_session text
    );

    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      handle text UNIQUE NOT NULL,
      name text NOT NULL,
      initials text NOT NULL,
      tone text NOT NULL,
      headline text NOT NULL,
      bio text,
      location text,
      website text,
      joined int,
      years int,
      club_id int REFERENCES clubs (id),
      club_role text,
      vouch_weight double precision NOT NULL,
      profile_strength int
    );

    CREATE TABLE IF NOT EXISTS companies (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      initial text NOT NULL,
      color text NOT NULL,
      sector text NOT NULL
    );

    -- Problem statements companies have submitted to clubs.
    CREATE TABLE IF NOT EXISTS briefs (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      company_id int NOT NULL REFERENCES companies (id),
      title text NOT NULL,
      category text NOT NULL,
      team_size int NOT NULL,
      weeks int NOT NULL,
      fee int NOT NULL,
      cover text NOT NULL,
      position int NOT NULL
    );

    -- Proof of Work.
    CREATE TABLE IF NOT EXISTS works (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      card_title text NOT NULL,
      kind text NOT NULL,
      category text NOT NULL,
      subcategory text NOT NULL,
      tags text[] NOT NULL,
      skills text[] NOT NULL,
      month text NOT NULL,
      weeks int NOT NULL,
      summary text[] NOT NULL,
      files int NOT NULL,
      cover text NOT NULL,
      company_id int REFERENCES companies (id),
      club_id int REFERENCES clubs (id),
      ai_checked text,
      club_reviewed text,
      company_signed text,
      split_confirmed boolean NOT NULL DEFAULT false,
      position int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS work_members (
      work_id int NOT NULL REFERENCES works (id),
      user_id int NOT NULL REFERENCES users (id),
      role text NOT NULL,
      share int NOT NULL,
      position int NOT NULL,
      PRIMARY KEY (work_id, user_id)
    );

    -- A vouch's weight comes from the voucher's profile. Vouches without a voucher are
    -- background sample data that only count toward a work's score.
    CREATE TABLE IF NOT EXISTS vouches (
      id serial PRIMARY KEY,
      work_id int NOT NULL REFERENCES works (id),
      voucher_id int REFERENCES users (id),
      weight double precision NOT NULL,
      professional boolean NOT NULL,
      headline text,
      body text,
      skills text,
      helpful int NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS vouches_one_per_person ON vouches (work_id, voucher_id) WHERE voucher_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS experiences (
      user_id int NOT NULL REFERENCES users (id),
      role text NOT NULL,
      company text NOT NULL,
      initial text NOT NULL,
      color text NOT NULL,
      period text NOT NULL,
      verification text NOT NULL CHECK (verification IN ('manager', 'offer_letter')),
      position int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS milestones (
      user_id int NOT NULL REFERENCES users (id),
      title text NOT NULL,
      sub text NOT NULL,
      icon text NOT NULL,
      tone text NOT NULL,
      position int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journey (
      user_id int NOT NULL REFERENCES users (id),
      month text NOT NULL,
      title text NOT NULL,
      sub text NOT NULL,
      position int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id serial PRIMARY KEY,
      club_id int NOT NULL REFERENCES clubs (id),
      title text NOT NULL,
      due text NOT NULL,
      effort text NOT NULL,
      done int NOT NULL,
      total int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vouch_requests (
      from_user int NOT NULL REFERENCES users (id),
      to_user int NOT NULL REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS saves (
      user_id int NOT NULL REFERENCES users (id),
      kind text NOT NULL CHECK (kind IN ('work', 'brief')),
      ref_id int NOT NULL,
      PRIMARY KEY (user_id, kind, ref_id)
    );

    -- Added for the Club page. ADD COLUMN IF NOT EXISTS keeps databases seeded before it working.
    ALTER TABLE clubs
      ADD COLUMN IF NOT EXISTS short_name text,
      ADD COLUMN IF NOT EXISTS city text,
      ADD COLUMN IF NOT EXISTS started text,
      ADD COLUMN IF NOT EXISTS earned int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sessions int NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS session_title text,
      ADD COLUMN IF NOT EXISTS session_detail text;
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS brief text;

    -- Who holds which Core Team seat in a club.
    CREATE TABLE IF NOT EXISTS core_team (
      club_id int NOT NULL REFERENCES clubs (id),
      user_id int NOT NULL REFERENCES users (id),
      role text NOT NULL,
      position int NOT NULL,
      PRIMARY KEY (club_id, user_id)
    );

    -- Posted work stays 'in_review' until its checks run; only 'published' work shows in feeds.
    ALTER TABLE works
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
      ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

    -- Work without a preview image gets a generated cover: its format and title on a tone. An empty cover means
    -- generated; cover_tone fixes the tone a poster saw in the preview (else the slug picks one).
    ALTER TABLE works
      ADD COLUMN IF NOT EXISTS format text,
      ADD COLUMN IF NOT EXISTS cover_tone text;

    -- Communities. Open ones anyone can join; closed ones need an admin's approval. Every Vinden Club has an open
    -- community for its announcements and events: following it is not club membership.
    CREATE TABLE IF NOT EXISTS communities (
      id serial PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      kind text NOT NULL CHECK (kind IN ('club', 'topic')),
      access text NOT NULL CHECK (access IN ('open', 'closed')),
      members int NOT NULL,
      description text NOT NULL,
      tone text NOT NULL,
      icon text,
      club_id int REFERENCES clubs (id),
      position int NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_members (
      community_id int NOT NULL REFERENCES communities (id),
      user_id int NOT NULL REFERENCES users (id),
      status text NOT NULL CHECK (status IN ('joined', 'requested')),
      PRIMARY KEY (community_id, user_id)
    );

    /* ---------- The feature register build (vinden-design) ---------- */

    -- Sign-up asks only for an email; everything else is collected later through the completion bar on Home.
    -- 'company' accounts belong to a company and submit problem statements. skipped lists completion steps passed over.
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS account text NOT NULL DEFAULT 'person',
      ADD COLUMN IF NOT EXISTS company_id int REFERENCES companies (id),
      ADD COLUMN IF NOT EXISTS describes text,
      ADD COLUMN IF NOT EXISTS college text,
      ADD COLUMN IF NOT EXISTS study_year text,
      ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS skipped text[] NOT NULL DEFAULT '{}';

    -- A role is 'pending' until its manager confirms from the emailed link (token), or Vinden checks the offer letter.
    ALTER TABLE experiences
      ADD COLUMN IF NOT EXISTS id serial,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'verified',
      ADD COLUMN IF NOT EXISTS manager_email text,
      ADD COLUMN IF NOT EXISTS token text;

    -- Verification: the AI check and the club review each leave a date; reviewers can send feedback instead of verifying.
    -- training_item_id links club work to the task or project it completes; brief_id links paid project work.
    ALTER TABLE works
      ADD COLUMN IF NOT EXISTS area text,
      ADD COLUMN IF NOT EXISTS feedback text,
      ADD COLUMN IF NOT EXISTS training_item_id int,
      ADD COLUMN IF NOT EXISTS brief_id int;

    -- Platform communities are created by Vinden. A closed community's admin approves requests to join.
    ALTER TABLE communities
      ADD COLUMN IF NOT EXISTS platform boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS domain text,
      ADD COLUMN IF NOT EXISTS admin_id int REFERENCES users (id);

    CREATE TABLE IF NOT EXISTS community_posts (
      id serial PRIMARY KEY,
      community_id int NOT NULL REFERENCES communities (id),
      kind text NOT NULL CHECK (kind IN ('update', 'event')),
      title text NOT NULL,
      body text,
      when_text text,
      place text,
      author_id int REFERENCES users (id),
      created_at timestamptz NOT NULL DEFAULT now()
    );

    -- Club selection (PDF §2): motivation form, screening, interview, practical task, final selection.
    ALTER TABLE clubs ADD COLUMN IF NOT EXISTS recruiting boolean NOT NULL DEFAULT false;
    CREATE TABLE IF NOT EXISTS applications (
      id serial PRIMARY KEY,
      club_id int NOT NULL REFERENCES clubs (id),
      user_id int NOT NULL REFERENCES users (id),
      step text NOT NULL CHECK (step IN ('motivation', 'screening', 'interview', 'task', 'final', 'selected', 'ended')),
      answers jsonb NOT NULL DEFAULT '[]',
      evaluation jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (club_id, user_id)
    );

    -- The training program (PDF §3): projects, tasks, alumni and industry sessions, curated learning paths.
    CREATE TABLE IF NOT EXISTS training_items (
      id serial PRIMARY KEY,
      club_id int NOT NULL REFERENCES clubs (id),
      kind text NOT NULL CHECK (kind IN ('project', 'task', 'session', 'path')),
      title text NOT NULL,
      body text,
      skill text,
      when_text text,
      resources jsonb NOT NULL DEFAULT '[]',
      position int NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    -- Problem statements (PDF §5–§8) reuse briefs: company → problem → student team → solution → Proof of Work.
    -- Fee, team size, weeks and cover are unknown for new submissions (pricing is an open question), so they may be null.
    ALTER TABLE briefs
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS needs text,
      ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'problem',
      ADD COLUMN IF NOT EXISTS club_id int REFERENCES clubs (id),
      ADD COLUMN IF NOT EXISTS requirements text,
      ADD COLUMN IF NOT EXISTS follow_up text,
      ADD COLUMN IF NOT EXISTS submitted_by int REFERENCES users (id),
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
    ALTER TABLE briefs ALTER COLUMN team_size DROP NOT NULL, ALTER COLUMN weeks DROP NOT NULL, ALTER COLUMN fee DROP NOT NULL, ALTER COLUMN cover DROP NOT NULL;
    CREATE TABLE IF NOT EXISTS brief_team (
      brief_id int NOT NULL REFERENCES briefs (id),
      user_id int NOT NULL REFERENCES users (id),
      PRIMARY KEY (brief_id, user_id)
    );

    -- One-off seed steps that have run, so new demo data is added to databases seeded earlier, once.
    CREATE TABLE IF NOT EXISTS seed_marks (name text PRIMARY KEY);
  `);
}
