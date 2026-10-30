import type { ReactNode } from 'react';
import type { AiSignal, Work } from '../api';
import { CheckBadge, Icon, type IconName } from './Icon';

/*
 * Verification status (register FN-05): where a piece of work is in its checks, as pills and a list of checks.
 * Styles live in features/work/work.css.
 */

export type StatusKey = 'published' | 'in_review' | 'changes' | 'verified' | 'posted' | 'not_yet';

const STATUS: Record<StatusKey, { label: string; cls: string; icon: IconName | null }> = {
  published: { label: 'Verified', cls: 'pill-blue', icon: 'check' },
  verified: { label: 'Verified', cls: 'pill-blue', icon: 'check' },
  in_review: { label: 'In review', cls: 'pill-muted', icon: 'clock' },
  posted: { label: 'Posted', cls: 'pill-muted', icon: 'clock' },
  changes: { label: 'Changes asked', cls: 'pill-lav', icon: 'info' },
  not_yet: { label: 'Not yet', cls: 'pill-none', icon: null },
};

/** A piece of work's status in words, with an icon so colour is never the only cue. Figma: Pill. */
export function StatusPill({ status, label }: { status: StatusKey; label?: string }) {
  const s = STATUS[status];
  return (
    <span className={`pill status-pill ${s.cls}`}>
      {s.icon && <Icon name={s.icon} size={14} strokeWidth={2.2} />}
      {label ?? s.label}
    </span>
  );
}

/** One check in a Status list: icon tile, what it is, what happened, and its status in words. Figma: Verification row. */
export function StatusRow({ icon, tone, title, body, status }: { icon: IconName; tone: 'blue' | 'lav'; title: string; body: ReactNode; status?: ReactNode }) {
  return (
    <li className="status-row">
      <span className={`tile tile-sm tile-flat tile-${tone}`} aria-hidden="true"><Icon name={icon} size={20} /></span>
      <span className="grow">
        <b className="block">{title}</b>
        <span className="small soft">{body}</span>
      </span>
      {status && <span className="status-row-end">{status}</span>}
    </li>
  );
}

const passed = (text: string) => <span className="status-passed"><CheckBadge size={16} />{text}</span>;

/**
 * The checks on a piece of work, as a list: the AI check, then the club review for club work.
 * Open question R-09: the order of the checks isn't decided, so this is a list, not a timeline.
 */
export function VerificationList({ work }: { work: Pick<Work, 'status' | 'checks' | 'club' | 'item' | 'ai'> }) {
  const flags = work.ai.signals.filter((s) => !s.ok);
  const waiting = !work.checks.club && work.status !== 'published';
  const clubWork = !!work.checks.club || (waiting && (!!work.item || !!work.club));
  return (
    <ul className="status-list">
      <StatusRow
        icon="sparkle"
        tone="blue"
        title="AI check"
        body={work.checks.ai
          ? flags.length ? `Checked. Reviewers should look at: ${flags.map((f) => f.label.toLowerCase()).join(', ')}.` : 'Files, description, team and originality checked'
          : 'Runs as soon as the work is sent'}
        status={work.checks.ai ? passed(`Passed · ${work.checks.ai}`) : <StatusPill status="in_review" label="Waiting" />}
      />
      {clubWork ? (
        <StatusRow
          icon="shield"
          tone="lav"
          title="Club review"
          body={work.checks.club
            ? `Verified by the Core Team${work.club ? ` of ${work.club.name}` : ''}`
            : work.status === 'changes' ? 'The Core Team sent feedback' : 'Waiting for the club’s Core Team'}
          status={work.checks.club ? passed(`Verified · ${work.checks.club}`) : <StatusPill status={work.status === 'changes' ? 'changes' : 'in_review'} />}
        />
      ) : work.item || work.club ? (
        // Club work published before club review existed (seeded demo work).
        <StatusRow icon="shield" tone="lav" title="Club review" body="Published before the club reviewed it" status={<span className="small muted">Not reviewed</span>} />
      ) : (
        // Open question R-09: what work outside a club gets beyond the AI check isn't decided.
        <StatusRow icon="shield" tone="lav" title="Club review" body="Only for club projects and tasks" status={<span className="small muted">Not club work</span>} />
      )}
    </ul>
  );
}

/** What the AI check reported: one row per trust signal. */
export function AiResult({ signals }: { signals: AiSignal[] }) {
  return (
    <ul className="ai-result">
      {signals.map((s) => (
        <li key={s.label} className={s.ok ? undefined : 'is-flag'}>
          {s.ok ? <CheckBadge size={18} /> : <span className="ai-flag" aria-hidden="true"><Icon name="info" size={18} /></span>}
          <span className="grow">
            <b className="block">{s.label}<span className="visually-hidden">{s.ok ? ': passed' : ': to look at'}</span></b>
            <span className="small soft">{s.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Feedback a reviewer sent to the team, shown to the team on their work. */
export function FeedbackNote({ feedback, from = 'your club’s Core Team' }: { feedback: string; from?: string }) {
  return (
    <section className="feedback-note" aria-label="Reviewer feedback">
      <p className="feedback-note-head"><Icon name="info" size={18} />Feedback from {from}</p>
      <p className="feedback-note-body">{feedback}</p>
    </section>
  );
}
