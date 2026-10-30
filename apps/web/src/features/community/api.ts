/* Community feature data hooks and types: communities, Vinden Club pages and club recruitment (register FN-08 to FN-10). */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request, send, type Community, type Person, type WorkCard } from '../../api';
import type { AppStep } from '../../components/ApplicantSteps';

/* ---------- Clubs ---------- */

export type Member = Person & { line: string };

/** Every club, for people who aren't in one yet. */
export interface ClubSummary {
  slug: string;
  name: string;
  college: string;
  city: string | null;
  members: number;
  recruiting: boolean;
}

/** A club's public page. Open question R-16: who can see it is open, so visitors see it too. */
export interface ClubPageData {
  slug: string;
  name: string;
  college: string;
  city: string | null;
  started: string | null;
  members: number;
  coreTeamSize: number;
  recruiting: boolean;
  sessions: number;
  /** The seven Core Team roles, each with its seats and the people in them. */
  coreTeam: { role: string; seats: number; people: Member[] }[];
  /** Members outside the Core Team. */
  people: Member[];
  portfolio: { count: number; works: WorkCard[] };
  community: Community | null;
  viewer: { member: boolean; coreRole: string | null; application: { id: number; step: AppStep } | null; canApply: boolean };
}

export interface ClubProject extends WorkCard {
  team: (Person & { role: string })[];
}

export interface Portfolio {
  club: { slug: string; name: string; college: string };
  projects: ClubProject[];
}

export const useClubs = () => useQuery({ queryKey: ['clubs'], queryFn: () => request<ClubSummary[]>('/api/clubs') });
export const useClubPage = (slug: string) => useQuery({ queryKey: ['clubs', slug], queryFn: () => request<ClubPageData>(`/api/clubs/${slug}`) });
export const usePortfolio = (slug: string) =>
  useQuery({ queryKey: ['clubs', slug, 'portfolio'], queryFn: () => request<Portfolio>(`/api/clubs/${slug}/portfolio`) });

/* ---------- Club recruitment ---------- */

export { SELECTION_STEPS, STEP_LABEL, type AppStep, type SelectionStep } from '../../components/ApplicantSteps';

export interface ApplyInfo {
  club: { slug: string; name: string; college: string; recruiting: boolean };
  questions: string[];
  member: boolean;
  otherClub: { slug: string; name: string } | null;
  application: { id: number; step: AppStep; answers: { q: string; a: string }[] } | null;
}

export const useApplyInfo = (slug: string) =>
  useQuery({ queryKey: ['clubs', slug, 'apply'], queryFn: () => request<ApplyInfo>(`/api/clubs/${slug}/apply`) });

export function useApply(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: string[]) => send<ApplyInfo>('POST', `/api/clubs/${slug}/apply`, { answers }),
    onSuccess: (info) => {
      qc.setQueryData(['clubs', slug, 'apply'], info);
      void qc.invalidateQueries({ queryKey: ['clubs', slug], exact: true });
      void qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export interface ApplicationCard extends Member {
  id: number;
  step: AppStep;
  createdAt: string;
}

export interface Applications {
  club: { slug: string; name: string; college: string; recruiting: boolean };
  /** About 30 students are selected. */
  target: number;
  selected: number;
  applications: ApplicationCard[];
}

export interface Application {
  id: number;
  step: AppStep;
  person: Person & { headline: string; college: string | null; year: string | null };
  club: { slug: string; name: string };
  answers: { q: string; a: string }[];
  /** The eight evaluation factors, each with a free-text note. */
  factors: { name: string; note: string }[];
  createdAt: string;
  target: number;
  selected: number;
}

export const useApplications = () => useQuery({ queryKey: ['applications'], queryFn: () => request<Applications>('/api/applications') });
export const useApplication = (id: string) =>
  useQuery({ queryKey: ['applications', id], queryFn: () => request<Application>(`/api/applications/${id}`) });

/** 'notes' saves the evaluation; 'next' saves it and moves on (past final selection, they join the club); 'end' ends it. */
export function useUpdateApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, evaluation }: { action: 'notes' | 'next' | 'end'; evaluation: Record<string, string> }) =>
      action === 'notes'
        ? send<Application>('PATCH', `/api/applications/${id}`, { evaluation })
        : send<Application>('POST', `/api/applications/${id}/${action}`, { evaluation }),
    onSuccess: (application, { action }) => {
      qc.setQueryData(['applications', id], application);
      void qc.invalidateQueries({ queryKey: ['applications'], exact: true });
      if (application.step === 'selected' || action !== 'notes') {
        void qc.invalidateQueries({ queryKey: ['clubs'] });
        void qc.invalidateQueries({ queryKey: ['club'] });
      }
    },
  });
}

/* ---------- Communities ---------- */

export interface CommunityPost {
  id: number;
  kind: 'update' | 'event';
  title: string;
  body: string | null;
  when: string | null;
  place: string | null;
  createdAt: string;
  author: Person | null;
}

export interface CommunityDetail extends Community {
  admin: Person | null;
  /** For a club's community: the club behind it. Following the community isn't membership. */
  club: { slug: string; name: string; college: string; recruiting: boolean; member: boolean } | null;
  /** null when the viewer can't read it (a closed community they haven't joined). */
  posts: CommunityPost[] | null;
  /** Join requests waiting, for the admin. */
  requests: number;
}

export interface NewCommunity {
  name: string;
  domain: string;
  access: 'open' | 'closed';
  description: string;
}

export interface NewPost {
  kind: 'update' | 'event';
  title: string;
  body: string;
  when: string;
  place: string;
}

export interface JoinRequests {
  community: Community;
  requests: Member[];
}

export const useCommunity = (slug: string) =>
  useQuery({ queryKey: ['community', slug], queryFn: () => request<CommunityDetail>(`/api/communities/${slug}`) });

export function useCreateCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: NewCommunity) => send<CommunityDetail>('POST', '/api/communities', c),
    onSuccess: (c) => {
      qc.setQueryData(['community', c.slug], c);
      void qc.invalidateQueries({ queryKey: ['communities'] });
      void qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useAddPost(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: NewPost) => send<CommunityDetail>('POST', `/api/communities/${slug}/posts`, post),
    onSuccess: (c) => qc.setQueryData(['community', slug], c),
  });
}

export const useJoinRequests = (slug: string) =>
  useQuery({ queryKey: ['community', slug, 'requests'], queryFn: () => request<JoinRequests>(`/api/communities/${slug}/requests`) });

export function useAnswerRequest(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ handle, approve }: { handle: string; approve: boolean }) =>
      send<JoinRequests>('POST', `/api/communities/${slug}/requests/${handle}`, { approve }),
    onSuccess: (data) => {
      qc.setQueryData(['community', slug, 'requests'], data);
      void qc.invalidateQueries({ queryKey: ['community', slug], exact: true });
      void qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

/** Domains offered when creating a community. People can make communities on any domain; this list is a starting set. */
export const DOMAINS = ['Business', 'Product and growth', 'Design', 'Data', 'Research', 'AI', 'Technology', 'Marketing', 'Careers'];
