/* Work feature data: Explore, the Post form's options, club review and completion (register FN-04, FN-05, FN-07). */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request, send, type AiSignal, type Person, type Work, type WorkCard, type WorkKind } from '../../api';

/** Kinds of work and areas, as the register lists them (FN-04-I01). The API holds the same lists. */
export const WORK_KINDS: WorkKind[] = ['Project', 'Task', 'Case study', 'Real-world assignment'];
export const AREAS = [
  'Business problems', 'Market research', 'Product analysis', 'Case studies', 'Data analysis', 'Design', 'Technical', 'Entrepreneurship', 'Research',
] as const;

export type ClubItem = { id: number; kind: 'project' | 'task'; title: string };

/* ---------- Explore (FN-07-I02) ---------- */

export interface ExploreData {
  areas: { area: string; count: number }[];
  works: WorkCard[];
}

export const useExplore = (q: string, area: string) =>
  useQuery({
    queryKey: ['explore', q, area],
    queryFn: () => request<ExploreData>(`/api/explore?${new URLSearchParams({ q, area })}`),
    placeholderData: keepPreviousData,
  });

/* ---------- Post (FN-04-I01) ---------- */

export interface PostOptions {
  club: { name: string } | null;
  items: (ClubItem & { skill: string | null })[];
  people: (Person & { line: string })[];
  /** The problem statement named in ?brief=, if the person is on its team or in its club. */
  brief: { slug: string; title: string; company: string } | null;
}

export const usePostOptions = (brief: string) =>
  useQuery({ queryKey: ['post-options', brief], queryFn: () => request<PostOptions>(`/api/works/new?${new URLSearchParams({ brief })}`) });

/* ---------- Club review (FN-05-I02, I03, I04) ---------- */

export interface QueueItem {
  slug: string;
  title: string;
  status: 'in_review' | 'changes';
  team: (Person & { role: string })[];
  item: ClubItem | null;
  brief: { slug: string; title: string } | null;
  ai: { date: string | null; flags: number; signals: AiSignal[] };
  feedback: string | null;
  submittedAt: string | null;
  /** The reviewer is on this work's team (open question R-10). */
  onTeam: boolean;
}

export const useReviewQueue = () =>
  useQuery({ queryKey: ['review'], queryFn: () => request<{ club: { name: string }; items: QueueItem[] }>('/api/review') });

export const useReview = (slug: string) => useQuery({ queryKey: ['review', slug], queryFn: () => request<Work>(`/api/review/${slug}`) });

/** Send feedback (status 'changes') or verify (status 'published'). */
export function useReviewAction(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: { action: 'feedback'; feedback: string } | { action: 'verify' }) =>
      send<Work>('POST', `/api/review/${slug}/${a.action}`, a.action === 'feedback' ? { feedback: a.feedback } : {}),
    onSuccess: (work) => {
      qc.setQueryData(['review', slug], work);
      void qc.invalidateQueries({ queryKey: ['review'], exact: true });
      void qc.invalidateQueries({ queryKey: ['work', slug] });
      void qc.invalidateQueries({ queryKey: ['completion'] });
      void qc.invalidateQueries({ queryKey: ['home'] });
      void qc.invalidateQueries({ queryKey: ['explore'] });
    },
  });
}

export type CompletionState = 'verified' | 'posted' | 'not_yet';

export interface CompletionData {
  club: { name: string };
  items: ClubItem[];
  members: (Person & { cells: { itemId: number; state: CompletionState; slug: string | null }[] })[];
}

export const useCompletion = () => useQuery({ queryKey: ['completion'], queryFn: () => request<CompletionData>('/api/completion') });
