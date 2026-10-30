import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CoverTone, Format } from './components/Cover';

export type Tone = 'blue' | 'orange' | 'lav' | 'gold';

export interface Person {
  handle: string;
  name: string;
  initials: string;
  tone: Tone;
}

export interface Me extends Person {
  firstName: string;
  vouchWeight: number;
  vouchLevel: string;
}

export interface Company {
  name: string;
  initial: string;
  color: string;
}

export interface Brief {
  slug: string;
  title: string;
  category: string;
  teamSize: number;
  weeks: number;
  fee: number;
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
}

export interface Home {
  me: Me;
  journey: { profileStrength: number; nextStep: string; vouchRequests: string[]; nextMilestone: string };
  club?: { slug: string; name: string; members: number; coreTeam: number; nextSession: string | null };
  task?: { title: string; due: string; effort: string; done: number; total: number; people: Person[] };
  briefs: Brief[];
  works: WorkCard[];
}

export interface Vouch {
  id: number;
  voucher: Person & { line: string; level: string };
  weight: number;
  headline: string;
  body: string;
  skills: string;
  helpful: number;
  createdAt: string;
}

export interface Work extends CoverFields {
  slug: string;
  title: string;
  cardTitle: string;
  kind: string;
  category: string;
  subcategory: string;
  tags: string[];
  skills: string[];
  month: string;
  weeks: number;
  summary: string[];
  company: Company | null;
  club: { name: string; college: string } | null;
  /** 'in_review' until the checks have run. */
  status: 'published' | 'in_review';
  /** The date each check passed, or null if it hasn't happened. */
  checks: { ai: string | null; club: string | null; company: string | null };
  splitConfirmed: boolean;
  team: (Person & { role: string; share: number })[];
  score: number;
  vouchCount: number;
  professionalCount: number;
  vouches: Vouch[];
  myVouch: boolean;
  saved: boolean;
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

export type WorkKind = 'club-task' | 'paid-brief' | 'internship' | 'independent';

export interface NewWork {
  title: string;
  kind: WorkKind;
  category: string;
  description: string;
  files: { name: string; size: number }[];
  team: { handle: string; role: string; share: number }[];
  skills: string[];
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
}

export interface Profile extends Person {
  headline: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  joined: number | null;
  clubRole: string | null;
  stats: { works: number; vouches: number; rolesVerified: number };
  milestones: { title: string; sub: string; icon: string; tone: Tone }[];
  works: WorkCard[];
  experiences: { role: string; company: string; initial: string; color: string; period: string; verification: 'manager' | 'offer_letter' }[];
  journey: { month: string; title: string; sub: string }[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: () => request<Me>('/api/me') });

export const useHome = () => useQuery({ queryKey: ['home'], queryFn: () => request<Home>('/api/home') });

export const useWork = (slug: string) => useQuery({ queryKey: ['work', slug], queryFn: () => request<Work>(`/api/works/${slug}`) });

export const useClub = () => useQuery({ queryKey: ['club'], queryFn: () => request<Club>('/api/club') });

export function usePostWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (work: NewWork) =>
      request<{ slug: string }>('/api/works', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(work) }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export const useProfile = (handle: string) => useQuery({ queryKey: ['profile', handle], queryFn: () => request<Profile>(`/api/people/${handle}`) });

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { kind: 'work' | 'brief'; slug: string }) =>
      request<{ saved: boolean }>('/api/saves', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useVouch(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (on: boolean) => request<Work>(`/api/works/${slug}/vouch`, { method: on ? 'POST' : 'DELETE' }),
    onSuccess: (work) => {
      qc.setQueryData(['work', slug], work);
      void qc.invalidateQueries({ queryKey: ['home'] });
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
    onSuccess: (community) => qc.setQueryData<Community[]>(['communities'], (list) => list?.map((c) => (c.slug === community.slug ? community : c))),
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
