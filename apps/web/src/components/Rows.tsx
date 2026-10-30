import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Person } from '../api';
import { Avatar } from './Bits';
import { CheckBadge, Icon, type IconName } from './Icon';

/** One number that matters, with what it counts. Figma: Stat (Size Large | Small). */
export function Stat({ value, label, size = 'sm' }: { value: ReactNode; label: string; size?: 'sm' | 'lg' }) {
  return (
    <div className={`stat stat-${size}`}>
      <b className="stat-value display">{value}</b>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/** Gold progress on a cream track. Always pair it with visible text; the bar alone fails contrast. Figma: Progress bar. */
export function ProgressBar({ value, max = 100, label, size = 'md' }: { value: number; max?: number; label: string; size?: 'sm' | 'md' }) {
  const pct = Math.round((Math.min(value, max) / max) * 100);
  return (
    <span className={`progress-bar progress-bar-${size}`} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Up to four faces plus a count. Figma: Avatar stack. */
export function AvatarStack({ people, total, label }: { people: Person[]; total: number; label: string }) {
  const shown = people.slice(0, 4);
  const more = total - shown.length;
  return (
    <span className="face-stack" role="img" aria-label={label}>
      <span className="face-stack-faces">
        {shown.map((p) => <Avatar key={p.handle} person={p} size={32} decorative />)}
      </span>
      {more > 0 && <span className="face-stack-more" aria-hidden="true">+{more}</span>}
    </span>
  );
}

/** One person in a list: Core Team, reviewers, shortlists. Figma: Person row (Trailing None | Pill | Button | Chevron). */
export function PersonRow({ person, line, to, trailing }: { person: Person; line: string; to?: string; trailing?: ReactNode }) {
  const body = (
    <>
      <Avatar person={person} size={44} decorative />
      <span className="grow">
        <b className="block">{person.name}</b>
        <span className="small soft">{line}</span>
      </span>
      {to && !trailing ? <Icon name="chevronRight" /> : trailing}
    </>
  );
  return to && !trailing ? <Link to={to} className="person-row">{body}</Link> : <div className="person-row">{body}</div>;
}

/** A fact or event with an icon tile. Figma: Info row. */
export function InfoRow({ icon, tone = 'gold', title, subtitle, trailing }: { icon: IconName; tone?: 'gold' | 'blue' | 'lav'; title: string; subtitle: string; trailing?: ReactNode }) {
  return (
    <div className="info-row">
      <span className={`tile tile-sm tile-flat tile-${tone}`} aria-hidden="true"><Icon name={icon} /></span>
      <span className="grow">
        <b className="block">{title}</b>
        <span className="small soft">{subtitle}</span>
      </span>
      {trailing}
    </div>
  );
}

export type CheckStatus = 'passed' | 'pending' | 'missing';

/** One trust check on a piece of work. Figma: Verification row (Status Passed | Pending | Missing). */
export function CheckRow({ icon, tone, title, body, status, statusText }: { icon: IconName; tone: string; title: string; body: string; status: CheckStatus; statusText?: string }) {
  return (
    <div className={`verify-card${status === 'missing' ? ' is-missing' : ''}${status === 'pending' ? ' is-pending' : ''}`}>
      <span className={`tile tile-sm tile-${tone} tile-flat`}><Icon name={icon} size={20} /></span>
      <span className="grow">
        <b className="block">{title}</b>
        <span className="small soft">{body}</span>
      </span>
      <span className="verify-status">
        {status === 'passed' && <><CheckBadge size={16} />{statusText && <span className="desktop-only">{statusText}</span>}</>}
        {status === 'pending' && <><Icon name="clock" size={18} /><span className="visually-hidden">{statusText ?? 'Pending'}</span></>}
        {status === 'missing' && statusText && <span className="muted small desktop-only">{statusText}</span>}
      </span>
    </div>
  );
}
