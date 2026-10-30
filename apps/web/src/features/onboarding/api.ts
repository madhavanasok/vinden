/* onboarding feature data hooks and types: sign up (FN-01), profile completion (FN-02), experience verification (FN-03). */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request, send, type CompletionKey, type Me, type Person, type Profile } from '../../api';

export type Describes = NonNullable<Me['describes']>;
export type Experience = Profile['experiences'][number];

/** The step screens: experience is asked on the skills screen (FN-02-I06). */
export type StepScreenKey = 'describe' | 'college' | 'communities' | 'skills';
export const SCREEN_FOR: Record<CompletionKey, StepScreenKey> = {
  describe: 'describe',
  college: 'college',
  communities: 'communities',
  skills: 'skills',
  experience: 'skills',
};
export const stepPath = (key: CompletionKey) => `/profile/complete/${SCREEN_FOR[key]}`;

/** What the completion steps edit, prefilled, plus the choices they offer. */
export interface MyProfile {
  describes: Me['describes'];
  college: string | null;
  studyYear: string | null;
  skills: string[];
  interests: string[];
  studyYears: string[];
  colleges: string[];
  /** The slug of the community of the Vinden Club at their college, if there is one. */
  clubCommunity: string | null;
  experiences: Experience[];
}

export interface ProfilePatch {
  describes?: Describes;
  college?: string;
  studyYear?: string;
  skills?: string[];
  interests?: string[];
  skip?: CompletionKey | CompletionKey[];
}

export interface NewExperience {
  role: string;
  company: string;
  path: 'manager' | 'offer_letter';
  managerEmail?: string;
  letter?: { name: string; size: number } | null;
}

export interface SentExperience {
  id: number;
  role: string;
  company: string;
  verification: 'manager' | 'offer_letter';
  status: 'pending';
  managerEmail: string | null;
  /** Demo only: the link the manager would get by email. */
  token: string | null;
}

export interface Confirmation {
  person: Person;
  role: string;
  company: string;
  period: string;
  status: 'pending' | 'verified';
}

export function useSignUp() {
  return useMutation({ mutationFn: (email: string) => send<{ handle: string }>('POST', '/api/signup', { email }) });
}

export const useMyProfile = (enabled = true) =>
  useQuery({ queryKey: ['me', 'profile'], queryFn: () => request<MyProfile>('/api/me/profile'), enabled });

/** Saves a step (or skips it) and hands back the new /api/me, so the bar on Home updates at once. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => send<Me>('PATCH', '/api/me/profile', patch),
    onSuccess: (me) => {
      qc.setQueryData(['me'], me);
      void qc.invalidateQueries({ queryKey: ['me'] });
      void qc.invalidateQueries({ queryKey: ['home'] });
      void qc.invalidateQueries({ queryKey: ['profile', me.handle] });
    },
  });
}

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (e: NewExperience) => send<SentExperience>('POST', '/api/me/experiences', e),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
      void qc.invalidateQueries({ queryKey: ['home'] });
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export const useConfirmation = (token: string) =>
  useQuery({ queryKey: ['confirm', token], queryFn: () => request<Confirmation>(`/api/confirm/${encodeURIComponent(token)}`), retry: false });

export function useConfirmRole(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => send<Confirmation>('POST', `/api/confirm/${encodeURIComponent(token)}`),
    onSuccess: (c) => {
      qc.setQueryData(['confirm', token], c);
      void qc.invalidateQueries({ queryKey: ['profile', c.person.handle] });
    },
  });
}

/**
 * Where to go after a step is saved or skipped: the next step after this one that is neither done nor skipped,
 * else Home. Open question R-02: the order of the questions; this follows the order /api/me lists them.
 */
export function nextStepPath(me: Me, current: StepScreenKey) {
  const steps = me.completion?.steps ?? [];
  const at = steps.findIndex((s) => SCREEN_FOR[s.key] === current);
  const next = steps.slice(at + 1).find((s) => !s.done && !s.skipped && SCREEN_FOR[s.key] !== current);
  return next ? stepPath(next.key) : '/';
}
