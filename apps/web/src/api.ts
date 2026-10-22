import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export interface WorkCard {
  slug: string;
  title: string;
  cover: string;
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

export interface Work {
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
  files: number;
  cover: string;
  company: Company | null;
  club: { name: string; college: string } | null;
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

export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function timeAgo(iso: string) {
  const days = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}
