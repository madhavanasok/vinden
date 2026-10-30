/* Pieces shared by the training and problem statement screens. */
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useMe } from '../../api';
import { Gate, isCompany, isMember, isVisitor } from '../../components/Page';
import { ActionBar } from '../../components/Layout';
import { CheckBadge, Icon } from '../../components/Icon';
import { ErrorState, Loading } from '../../pages/Placeholder';
import type { Problem, TrainingKind, WorkStatus } from './api';
import './training.css';

/** Training screens are for the club's members (the Core Team included). */
export function ClubGate({ children }: { children: ReactNode }) {
  return <Gate allow={isMember} who="Vinden Club members">{children}</Gate>;
}

/** Company screens. A visitor is pointed to registering, since companies register once and use the same account everywhere. */
export function CompanyGate({ children }: { children: ReactNode }) {
  const me = useMe();
  if (!me.isPending && isVisitor(me.data)) {
    return (
      <div className="state" role="status">
        <span className="tile tile-gold" aria-hidden="true"><Icon name="building" /></span>
        <h1 className="state-title display">Register your company</h1>
        <p className="soft">Problem statements come from company accounts. Register once and the same account works on the website and in the app.</p>
        <Link to="/companies/register" className="btn btn-primary">Register your company</Link>
      </div>
    );
  }
  return <Gate allow={isCompany} who="company accounts">{children}</Gate>;
}

/** Loading and error for a query, so each screen only renders data. */
export function QueryState({ query }: { query: { isPending: boolean; error: Error | null; refetch: () => unknown } }) {
  if (query.isPending) return <Loading />;
  return <ErrorState error={query.error ?? new Error('Something went wrong')} onRetry={() => void query.refetch()} />;
}

/**
 * The phone's action bar on screens that keep the tab bar: it floats just above it, and a spacer keeps the end of the
 * page clear of both. Desktop and tablet show the same action in the page.
 */
export function DockBar({ children }: { children: ReactNode }) {
  return (
    <div className="tr-dock">
      <div className="tr-dock-space mobile-only" aria-hidden="true" />
      <ActionBar>{children}</ActionBar>
    </div>
  );
}

export const KIND_LABEL: Record<TrainingKind, { one: string; many: string }> = {
  project: { one: 'Project', many: 'Projects' },
  task: { one: 'Task', many: 'Tasks' },
  session: { one: 'Session', many: 'Sessions' },
  path: { one: 'Learning path', many: 'Learning paths' },
};

/** Where a training item opens: projects and tasks have a page, paths list their resources, sessions share one page. */
export const itemHref = (item: { id: number; kind: TrainingKind }) =>
  item.kind === 'path' ? `/club/learning/${item.id}` : item.kind === 'session' ? `/club/sessions#session-${item.id}` : `/club/tasks/${item.id}`;

const STATUS: Record<WorkStatus, string> = { in_review: 'In review', changes: 'Changes requested', published: 'Verified' };

/** Where a piece of club work is in verification: in review, changes requested, or verified. */
export function WorkStatusPill({ status }: { status: WorkStatus }) {
  if (status === 'published') {
    return (
      <span className="pill pill-blue">
        <CheckBadge size={14} />
        {STATUS[status]}
      </span>
    );
  }
  return (
    <span className={`pill ${status === 'changes' ? 'tr-pill-warm' : 'pill-lav'}`}>
      <Icon name={status === 'changes' ? 'info' : 'clock'} size={14} strokeWidth={2} />
      {STATUS[status] ?? status}
    </span>
  );
}

/** "1 member", "3 members". */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The top of a problem statement's panel: the company, the problem and what it needs back. */
export function ProblemHead({ problem, headingId }: { problem: Problem; headingId: string }) {
  const { company } = problem;
  return (
    <div className="tr-problem-head">
      <div className="tr-company">
        <span className="company-square tr-company-square" style={{ background: company.color }} aria-hidden="true">{company.initial}</span>
        <span className="grow">
          <b className="block">{company.name}</b>
          {company.sector && <span className="small soft">{company.sector}</span>}
        </span>
      </div>
      <h2 id={headingId} className="tr-problem-title">{problem.title}</h2>
      {problem.description && <p className="tr-prose">{problem.description}</p>}
      {problem.needs && (
        <p className="small soft"><b className="tr-label-inline">Needs back:</b> {problem.needs}</p>
      )}
    </div>
  );
}

/** Names as a sentence: "Kabir Shah and Rohan Iyer". */
export const names = (people: { name: string }[]) =>
  people.length <= 1 ? people[0]?.name ?? '' : `${people.slice(0, -1).map((p) => p.name).join(', ')} and ${people[people.length - 1]!.name}`;

/** On tablet and phone the panel sits below the list: bring it into view when a row is picked. */
export function scrollToPanel(el: HTMLElement | null) {
  if (!el || !window.matchMedia('(max-width: 1099px)').matches) return;
  requestAnimationFrame(() => el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
}
