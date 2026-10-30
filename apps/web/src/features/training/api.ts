/* Training program and problem statements (register FN-11, FN-12): data hooks and types. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request, send, type Person } from '../../api';
import type { ProblemStage } from '../../components/ProblemStages';

/* ---------- Training program ---------- */

export type TrainingKind = 'project' | 'task' | 'session' | 'path';
export type SessionType = 'alumni' | 'industry';

/** The resource types a learning path can hold (PDF §3E), in the order a path lists them. */
export const RESOURCE_TYPES = ['Course', 'Article', 'Book', 'Video', 'Case study', 'Industry report', 'Tool', 'Template'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface Resource {
  type: string;
  title: string;
  link?: string;
}

export interface TrainingItem {
  id: number;
  kind: TrainingKind;
  title: string;
  body: string | null;
  skill: string | null;
  when: string | null;
  sessionType: SessionType | null;
  resources: Resource[];
  /** Members who have posted Proof of Work for it. */
  posted: number;
}

export interface ClubRef {
  slug: string;
  name: string;
  college: string;
}

/** Club work moves from 'in_review' to 'published' once verified; 'changes' means a reviewer asked for changes. */
export type WorkStatus = 'in_review' | 'changes' | 'published';

export interface TrainingPlan {
  club: ClubRef;
  /** Core Team seats can add to the plan (who designs the training is open, R-28). */
  canEdit: boolean;
  items: TrainingItem[];
}

export interface TrainingDetail {
  club: ClubRef;
  canEdit: boolean;
  item: TrainingItem;
  myWork: { slug: string; title: string; status: WorkStatus; feedback: string | null } | null;
  /** Other items for the same skill: its learning path, and projects and tasks to practise it. */
  related: TrainingItem[];
}

export interface NewTrainingItem {
  kind: TrainingKind;
  title: string;
  body: string;
  skill: string;
  when: string;
  sessionType: SessionType | null;
}

export const useTraining = () => useQuery({ queryKey: ['training'], queryFn: () => request<TrainingPlan>('/api/training'), retry: false });

export const useTrainingItem = (id: string) =>
  useQuery({ queryKey: ['training', id], queryFn: () => request<TrainingDetail>(`/api/training/${encodeURIComponent(id)}`), retry: false });

export function useAddTrainingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: NewTrainingItem) => send<TrainingItem>('POST', '/api/training', item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training'] }),
  });
}

export function useAddResource(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: Resource) => send<{ resources: Resource[] }>('POST', `/api/training/${id}/resources`, r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training'] }),
  });
}

export function useRemoveResource(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (index: number) => send<{ resources: Resource[] }>('DELETE', `/api/training/${id}/resources/${index}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training'] }),
  });
}

/* ---------- Problem statements ---------- */

export type Stage = ProblemStage;
export { PROBLEM_STAGES as STAGES, problemStageLabel as stageLabel } from '../../components/ProblemStages';

/** What a company can ask for back (register FN-12-I02). */
export const NEEDS = ['Research', 'Analysis', 'Recommendations', 'A report', 'A build'] as const;

export interface ProblemCompany {
  name: string;
  initial: string;
  color: string;
  sector: string;
}

export interface Problem {
  slug: string;
  title: string;
  description: string | null;
  needs: string | null;
  stage: Stage;
  requirements: string | null;
  followUp: string | null;
  createdAt: string;
  company: ProblemCompany;
  /** null until a club takes it on (how a problem reaches a club is open, R-24). */
  club: ClubRef | null;
  team: Person[];
  /** The Proof of Work that delivered it, once the team has posted it. */
  work: { slug: string; title: string; status: WorkStatus } | null;
}

export interface ProblemBoard {
  club: ClubRef;
  seat: string;
  members: (Person & { line: string })[];
  problems: Problem[];
}

export const useMyProblems = () =>
  useQuery({ queryKey: ['problems', 'mine'], queryFn: () => request<{ company: ProblemCompany; problems: Problem[] }>('/api/problems/mine'), retry: false });

export const useProblemBoard = () => useQuery({ queryKey: ['problems', 'board'], queryFn: () => request<ProblemBoard>('/api/problems/board'), retry: false });

export function useSubmitProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { problem: string; needs: string[] }) => send<{ slug: string }>('POST', '/api/problems', p),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export interface ProblemChange {
  stage?: Stage;
  requirements?: string;
  followUp?: string;
  team?: string[];
}

/** Write the change, then put the updated problem into the board. */
export function useUpdateProblem() {
  const qc = useQueryClient();
  const put = (p: Problem) => {
    qc.setQueryData<ProblemBoard>(['problems', 'board'], (b) => b && { ...b, problems: b.problems.map((x) => (x.slug === p.slug ? p : x)) });
    void qc.invalidateQueries({ queryKey: ['problems', 'mine'] });
    void qc.invalidateQueries({ queryKey: ['home'] });
    void qc.invalidateQueries({ queryKey: ['club'] });
  };
  const update = useMutation({
    mutationFn: ({ slug, change }: { slug: string; change: ProblemChange }) => send<Problem>('PATCH', `/api/problems/${slug}`, change),
    onSuccess: put,
  });
  const take = useMutation({ mutationFn: (slug: string) => send<Problem>('POST', `/api/problems/${slug}/take`), onSuccess: put });
  return { update, take };
}

/* ---------- Register your company ---------- */

export const useRegisterCompany = () =>
  useMutation({ mutationFn: (c: { company: string; name: string; email: string }) => send<{ handle: string }>('POST', '/api/companies/register', c) });
