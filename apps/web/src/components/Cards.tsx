import { Link } from 'react-router';
import { rupees, useToggleSave, type Brief, type ClubTask, type WorkCard as WorkCardData } from '../api';
import { Score } from './Bits';
import { Cover } from './Cover';
import { CheckBadge, Icon } from './Icon';
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
        <p className="card-meta">Team of {brief.teamSize} · {brief.weeks} weeks</p>
      </div>
      <div className="card-foot">
        <span className="fee">
          <b>{rupees(brief.fee)}</b>
          <span>to your club</span>
        </span>
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

/** A card for work that hasn't been posted yet: no link, no save, no score. */
export function WorkCardPreview({ title, cover, byline }: { title: string; cover: string; byline: string }) {
  return (
    <article className="card-item card-preview" aria-label="Preview of your card">
      <div className="card-body">
        <Cover variant={cover} />
        <h3 className="card-title">{title}</h3>
        <p className="small muted">New · no vouches yet</p>
        <p className="card-meta">{byline}</p>
      </div>
    </article>
  );
}

/** `owner` cards sit on someone's profile, so they describe the kind of work rather than who made it. */
export function WorkCard({ work, owner = false }: { work: WorkCardData; owner?: boolean }) {
  return (
    <article className={`card-item${owner ? ' card-item-compact' : ''}`}>
      <Link to={`/work/${work.slug}`} className="card-body">
        <Cover variant={work.cover} />
        <h3 className="card-title">{work.title}</h3>
        <Score score={work.score} count={work.vouchCount} size={owner ? 'sm' : undefined} />
        <p className="card-meta">{owner ? work.kindLine : work.byline}</p>
        {!owner && checksLine(work.checks) && (
          <p className="checks">
            <CheckBadge />
            {checksLine(work.checks)}
          </p>
        )}
      </Link>
      {!owner && <SaveButton kind="work" slug={work.slug} saved={work.saved} label={work.title} />}
    </article>
  );
}
