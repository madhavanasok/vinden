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
  `);
}
