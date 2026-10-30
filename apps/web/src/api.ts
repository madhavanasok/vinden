import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { CoverTone, Format } from './components/Cover';

export type Tone = 'blue' | 'orange' | 'lav' | 'gold';

export interface Person {
  handle: string;
  name: string;
  initials: string;
  tone: Tone;
}

export type CompletionKey = 'describe' | 'college' | 'communities' | 'skills' | 'experience';

/** The signed-in person, a company account, or a visitor (not signed in: HR, managers, founders browsing). */
export interface Me extends Person {
  account: 'person' | 'company' | 'visitor';
  firstName: string;
  vouchWeight: number;
  vouchLevel: string;
  company: { slug: string; name: string; initial: string; color: string } | null;
  /** coreRole is the person's Core Team seat (e.g. 'Proof of Work & Quality'), or null for a member. */
  club: { slug: string; name: string; college: string; coreRole: string | null } | null;
  describes: 'student' | 'professional' | 'founder' | 'freelancer' | null;
  /** Profile completion for the bar on Home; null for companies and visitors. */
  completion: { percent: number; steps: { key: CompletionKey; label: string; done: boolean; skipped: boolean }[] } | null;
}

export interface Persona {
  as: string;
  name: string;
  label: string;
}

export interface Company {
  name: string;
  initial: string;
  color: string;
}

/**
 * A problem statement as a card. A company's new submission has no team size, timeline or fee yet (pricing and payment
 * are open, R-19), so those are null until the club and company agree them; `cover` is '' for a generated cover.
 */
export interface Brief {
  slug: string;
  title: string;
  category: string;
  teamSize: number | null;
  weeks: number | null;
  fee: number | null;
  cover: string;
  company: Company & { sector: string };
  saved: boolean;
}

/** `cover` names a drawing; '' means a generated cover from the format, title and tone (null: picked from the slug). */
interface CoverFields {
  cover: string;
  coverTone: CoverTone | null;
  format: Format | null;
  files: number;
}

export interface WorkCard extends CoverFields {
  slug: string;
  title: string;
  category: string;
  score: number;
  vouchCount: number;
  byline: string;
  kindLine: string;
  checks: { ai: boolean; club: boolean; company: boolean };
  saved: boolean;
  /** Explore and Home cards only: the area, the first image (a URL) and who made it, so the name can open their profile. */
  area?: string | null;
  image?: string | null;
  maker?: { handle: string; name: string } | null;
}

/** Home (FN-07-I01): the completion bar comes from `me`; the rest is verified work. */
export interface Home {
  me: Me;
  works: WorkCard[];
}

/** A vouch and its weight. Open question R-38: notes and skills aren't part of a vouch. */
export interface Vouch {
  id: number;
  voucher: Person & { line: string; level: string };
  weight: number;
  createdAt: string;
}

export type WorkStatus = 'published' | 'in_review' | 'changes';

/** One trust signal from the AI check. */
export interface AiSignal {
  label: string;
  detail: string;
  ok: boolean;
}

export interface Work extends CoverFields {
  slug: string;
  title: string;
  cardTitle: string;
  kind: string;
  area: string | null;
  category: string;
  month: string;
  summary: string[];
  /** File names when they were posted through the app; older work only has a count (`files`). */
  fileList: { name: string; size: number }[] | null;
  /** Image URLs; empty means the work shows its generated card. */
  images: string[];
  company: Company | null;
  club: { name: string; college: string } | null;
  /** The club project or task this work completes. */
  item: { id: number; kind: 'project' | 'task'; title: string } | null;
  /** The problem statement this work answers. */
  brief: { slug: string; title: string; company: string | null } | null;
  /** 'in_review' until the club verifies club work; 'changes' when a reviewer sent feedback. */
  status: WorkStatus;
  /** The date each check passed, or null if it hasn't happened. */
  checks: { ai: string | null; club: string | null; company: string | null };
  ai: { signals: AiSignal[] };
  /** Reviewer feedback; only the team and the club's Core Team see it. */
  feedback: string | null;
  submittedAt: string | null;
  team: (Person & { role: string })[];
  score: number;
  vouchCount: number;
  vouches: Vouch[];
  myVouch: boolean;
}

export interface ClubTask {
  title: string;
  brief: string | null;
  due: string;
  effort: string;
  done: number;
  total: number;
  people: Person[];
}

export interface Club {
  slug: string;
  name: string;
  college: string;
  city: string | null;
  started: string | null;
  members: number;
  coreTeamSize: number;
  stats: { earned: number; verified: number; liveBriefs: number; sessions: number };
  task: ClubTask | undefined;
  briefs: Brief[];
  works: WorkCard[];
  coreTeam: (Person & { role: string })[];
  session: { title: string; detail: string } | null;
  /** Everyone in the club, for picking teammates. */
  people: (Person & { line: string })[];
}

export type WorkKind = 'Project' | 'Task' | 'Case study' | 'Real-world assignment';

export interface NewWork {
  title: string;
  description: string;
  kind: WorkKind;
  area: string;
  files: { name: string; size: number }[];
  /** Optional images as data URLs, scaled down before sending. */
  images: string[];
  /** Solo work is just you, with an empty role. */
  team: { handle: string; role: string }[];
  /** The club project or task this completes (club members only). */
  trainingItemId: number | null;
  /** The problem statement this answers, from /post?brief=<slug>. */
  briefSlug: string | null;
  format: Format;
  coverTone: CoverTone;
}

/** Open communities anyone can join; closed ones take a request. A club's community is not club membership. */
export interface Community {
  slug: string;
  name: string;
  kind: 'club' | 'topic';
  access: 'open' | 'closed';
  members: number;
  description: string;
  tone: CoverTone;
  icon: string | null;
  status: 'none' | 'joined' | 'requested';
  /** Vinden runs platform communities; people create the rest. */
  platform: boolean;
  domain: string | null;
  /** The viewer runs this community: they post to it and answer join requests. */
  isAdmin: boolean;
}

/** A person's public profile (register FN-02-I01). Offer letters are never included, only whether a role is verified. */
export interface Profile extends Person {
  headline: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  joined: number | null;
  clubRole: string | null;
  account: 'person' | 'company';
  describes: Me['describes'];
  college: string | null;
  studyYear: string | null;
  /** Skills they listed, then ones only their work shows. `verified`: a verified work shows the skill. */
  skills: { name: string; verified: boolean }[];
  interests: string[];
  stats: { works: number; vouches: number; rolesVerified: number };
  milestones: { title: string; sub: string; icon: string; tone: Tone }[];
  /** Verified work only. `part` is this person's role and share in team work. */
  works: (WorkCard & { team: boolean; part: { role: string; share: number } | null })[];
  /** Their own work still waiting for its checks; 0 unless it's your profile. */
  inReview: number;
  /** `waitingOn` is the manager's email for a pending role, shown only to the person themselves. */
  experiences: {
    id: number;
    role: string;
    company: string;
    initial: string;
    color: string;
    period: string;
    verification: 'manager' | 'offer_letter';
    status: 'verified' | 'pending';
    waitingOn: string | null;
  }[];
  /** Projects, skills and milestones, newest first. */
  journey: { month: string; kind: 'project' | 'skill' | 'milestone'; title: string; sub: string; slug: string | null }[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ---------- Demo persona ---------- */

/**
 * The demo has no passwords. It acts as one persona at a time (a user's handle, or 'visitor' for someone not signed in)
 * and tells the API in the x-vinden-as header. The choice is kept per browser.
 */
const PERSONA_KEY = 'vinden.as';
export const VISITOR = 'visitor';

export function getPersona(): string {
  try {
    return localStorage.getItem(PERSONA_KEY) || 'ishaan';
  } catch {
    return 'ishaan';
  }
}

function storePersona(as: string) {
  try {
    localStorage.setItem(PERSONA_KEY, as);
  } catch {
    // Storage blocked: the choice lasts until the page reloads.
  }
}

/** Switch persona: forget everything cached for the last one, then go to Home (or `to`). */
export function useSwitchPersona() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return (as: string, to = '/') => {
    storePersona(as);
    qc.clear();
    navigate(to);
  };
}

export const usePersonas = () => useQuery({ queryKey: ['personas'], queryFn: () => request<Persona[]>('/api/personas') });

/* ---------- Requests ---------- */

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('x-vinden-as', getPersona());
  const res = await fetch(path, { ...init, headers });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`);
  return body as T;
}

/** A JSON write. */
export const send = <T>(method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: unknown) =>
  request<T>(path, { method, headers: body === undefined ? undefined : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => request<Me>('/api/me') });

export const useHome = () => useQuery({ queryKey: ['home'], queryFn: () => request<Home>('/api/home') });

export const useWork = (slug: string) => useQuery({ queryKey: ['work', slug], queryFn: () => request<Work>(`/api/works/${slug}`) });

export const useClub = () => useQuery({ queryKey: ['club'], queryFn: () => request<Club>('/api/club') });

export function usePostWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (work: NewWork) => send<{ slug: string }>('POST', '/api/works', work),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export const useProfile = (handle: string) =>
  useQuery({ queryKey: ['profile', handle], queryFn: () => request<Profile>(`/api/people/${encodeURIComponent(handle)}`), enabled: !!handle });

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { kind: 'work' | 'brief'; slug: string }) =>
      request<{ saved: boolean }>('/api/saves', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

/** Vouch (`true`) or take the vouch back (`false`). The UI only vouches: undoing is open question R-38. */
export function useVouch(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (on: boolean) => send<Work>(on ? 'POST' : 'DELETE', `/api/works/${slug}/vouch`),
    onSuccess: (work) => {
      qc.setQueryData(['work', slug], work);
      void qc.invalidateQueries({ queryKey: ['home'] });
      void qc.invalidateQueries({ queryKey: ['explore'] });
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export const useCommunities = () => useQuery({ queryKey: ['communities'], queryFn: () => request<Community[]>('/api/communities') });

/** Join (or request to join) when `on`; leave or cancel the request otherwise. */
export function useJoinCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, on }: { slug: string; on: boolean }) => request<Community>(`/api/communities/${slug}/join`, { method: on ? 'POST' : 'DELETE' }),
    onSuccess: (community) => {
      qc.setQueryData<Community[]>(['communities'], (list) => list?.map((c) => (c.slug === community.slug ? community : c)));
      // The community's page, the club page that shows it, and the completion bar's "Join communities" step.
      void qc.invalidateQueries({ queryKey: ['community', community.slug] });
      void qc.invalidateQueries({ queryKey: ['clubs'] });
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function timeAgo(iso: string) {
  const days = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}
