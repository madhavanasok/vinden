import { Link } from 'react-router';
import { rupees, useJoinCommunity, useToggleSave, type Brief, type ClubTask, type Community, type WorkCard as WorkCardData } from '../api';
import { Logo, Score } from './Bits';
import { Cover, filesLabel, spreadTones, type CoverTone, type Format } from './Cover';
import { CheckBadge, Icon, type IconName } from './Icon';
import { AvatarStack, ProgressBar } from './Rows';

export function SaveButton({ kind, slug, saved, label }: { kind: 'work' | 'brief'; slug: string; saved: boolean; label: string }) {
  const toggle = useToggleSave();
  return (
    <button
      type="button"
      className="save-btn"
      aria-pressed={saved}
      aria-label={`Save ${label}`}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ kind, slug })}
    >
      <Icon name="bookmark" filled={saved} />
    </button>
  );
}

export function BriefCard({ brief }: { brief: Brief }) {
  // Fee, team size and weeks are unknown for newly submitted problems (pricing is an open question).
  const teamLine = [brief.teamSize && `Team of ${brief.teamSize}`, brief.weeks && `${brief.weeks} weeks`].filter(Boolean).join(' · ');
  return (
    <article className="card-item">
      <div className="card-body">
        <Cover variant={brief.cover}>
          <span className="company-chip">
            <span className="company-logo" style={{ background: brief.company.color }}>{brief.company.initial}</span>
            {brief.company.name}
          </span>
        </Cover>
        <h3 className="card-title">{brief.title}</h3>
        <p className="card-meta">{brief.company.name} · {brief.company.sector}</p>
        {teamLine && <p className="card-meta">{teamLine}</p>}
      </div>
      <div className="card-foot">
        {brief.fee !== null && (
          <span className="fee">
            <b>{rupees(brief.fee)}</b>
            <span>to your club</span>
          </span>
        )}
        <button type="button" className="btn btn-accent btn-sm">View brief</button>
      </div>
      <SaveButton kind="brief" slug={brief.slug} saved={brief.saved} label={brief.title} />
    </article>
  );
}

const checksLine = (c: WorkCardData['checks']) => [c.ai && 'AI checked', c.club && 'Club verified'].filter(Boolean).join(' · ');

/** This week's club task. Posting Proof of Work is how it gets marked done. Figma: Task card. */
export function TaskCard({ task }: { task: ClubTask }) {
  return (
    <article className="task-card">
      <p className="task-card-top">
        <span className="badge">Club task</span>
        <span className="small muted">Due {task.due} · {task.effort.toLowerCase()}</span>
      </p>
      <h3 className="card-title">{task.title}</h3>
      {task.brief && <p className="small soft">{task.brief}</p>}
      <div className="task-card-progress">
        <ProgressBar value={task.done} max={task.total} label="Members who have posted this task" />
        <span className="small soft">{task.done} of {task.total} members posted</span>
      </div>
      <div className="task-card-foot">
        <AvatarStack people={task.people} total={task.done} label={`${task.done} members posted, including ${task.people.map((p) => p.name.split(' ')[0]).join(', ')}`} />
        <Link to="/post?task=this-week" className="btn btn-primary btn-sm">
          <Icon name="plus" size={18} strokeWidth={2} />
          Post your work
        </Link>
      </div>
    </article>
  );
}

/** A card for work that hasn't been posted yet: no link, no score. Without images, its generated cover is what will be posted. */
export function WorkCardPreview({ title, format, files, tone, byline, image }: { title: string; format: Format; files: number; tone: CoverTone; byline: string; image?: string | null }) {
  return (
    <article className="card-item card-preview" aria-label="Preview of your card">
      <div className="card-body">
        <Cover image={image} title={title} kind={format} meta={files ? filesLabel(files) : undefined} tone={tone} />
        <h3 className="card-title">{title}</h3>
        <p className="small muted">New · no vouches yet</p>
        <p className="card-meta">{byline}</p>
      </div>
    </article>
  );
}

/**
 * Verified work. The card body opens the work; the maker's name opens their profile (register FN-07-I02).
 * `owner` cards sit on someone's profile, so they describe the kind of work rather than who made it.
 * Open question R-25: saving, shortlisting and contacting aren't in the sources, so work cards have no Save.
 */
export function WorkCard({ work, owner = false, tone }: { work: WorkCardData; owner?: boolean; tone?: CoverTone }) {
  const maker = !owner && work.maker && work.byline.startsWith(work.maker.name) ? work.maker : null;
  return (
    <article className={`card-item${owner ? ' card-item-compact' : ''}`}>
      <Link to={`/work/${work.slug}`} className="card-body">
        <Cover variant={work.cover} image={work.image} title={work.title} kind={work.format ?? undefined} meta={filesLabel(work.files)} tone={tone ?? work.coverTone} seed={work.slug} />
        <h3 className="card-title">{work.title}</h3>
        <Score score={work.score} count={work.vouchCount} size={owner ? 'sm' : undefined} />
        {!maker && <p className="card-meta">{owner ? work.kindLine : work.byline}</p>}
      </Link>
      {maker && (
        <p className="card-meta card-maker">
          <Link to={`/people/${maker.handle}`}>{maker.name}</Link>
          {work.byline.slice(maker.name.length)}
        </p>
      )}
      {!owner && checksLine(work.checks) && (
        <p className="checks">
          <CheckBadge />
          {checksLine(work.checks)}
        </p>
      )}
    </article>
  );
}

/** A grid of work cards whose generated covers never repeat the tone of the card before them. */
export function WorkGrid({ works, className = 'rail rail-wrap', label }: { works: WorkCardData[]; className?: string; label?: string }) {
  const tones = spreadTones(works);
  return (
    <ul className={`work-grid ${className}`} aria-label={label}>
      {works.map((w) => <li key={w.slug}><WorkCard work={w} tone={tones.get(w.slug)} /></li>)}
    </ul>
  );
}

const COMMUNITY_ACTION: Record<Community['status'], { label: string; icon: IconName; quiet: boolean }> = {
  none: { label: 'Join', icon: 'plus', quiet: false },
  joined: { label: 'Joined', icon: 'check', quiet: true },
  requested: { label: 'Requested', icon: 'clock', quiet: true },
};

/**
 * An open or closed community: a club's (anyone can follow its news; that isn't club membership) or a topic's.
 * Joined and Requested are toggles: pressing again leaves or cancels. Figma: Community card.
 */
export function CommunityCard({ community: c }: { community: Community }) {
  const join = useJoinCommunity();
  const closed = c.access === 'closed';
  const action = c.status === 'none' && closed ? { label: 'Request to join', icon: 'lock' as const, quiet: false } : COMMUNITY_ACTION[c.status];
  const on = c.status !== 'none';
  const tone = (part: string) => `var(--cover-${c.tone}-${part})`;
  return (
    <article className="community-card">
      <div className="community-banner" style={{ background: tone('bg') }} aria-hidden="true">
        <span style={{ background: tone('soft') }} />
        <span style={{ background: tone('soft') }} />
      </div>
      <span className="community-tile" style={{ color: tone('ink') }} aria-hidden="true">
        {c.kind === 'club' ? <Logo size={44} /> : <Icon name={(c.icon ?? 'users') as IconName} size={24} />}
      </span>
      <div className="community-body">
        <h3 className="community-name">{c.name}</h3>
        <p className="community-meta">
          {closed && <Icon name="lock" size={14} strokeWidth={2} />}
          {c.kind === 'club' && 'Club community · '}
          {closed ? 'Closed' : 'Open'} · {c.members.toLocaleString('en-IN')} members
        </p>
        <p className="community-desc">{c.description}</p>
        <button
          type="button"
          className={`btn btn-sm btn-block ${action.quiet ? 'btn-quiet' : 'btn-outline'}`}
          aria-pressed={on}
          aria-label={`${action.label} ${c.name}`}
          title={c.status === 'joined' ? 'Leave this community' : c.status === 'requested' ? 'Cancel your request' : undefined}
          disabled={join.isPending}
          onClick={() => join.mutate({ slug: c.slug, on: !on })}
        >
          <Icon name={action.icon} size={16} strokeWidth={2} />
          {action.label}
        </button>
      </div>
    </article>
  );
}
