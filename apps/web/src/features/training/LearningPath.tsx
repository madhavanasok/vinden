import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { EmptyState, Page } from '../../components/Page';
import { TextField } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { ResourceRow } from '../../components/ResourceRow';
import { NotFound } from '../../pages/Placeholder';
import { ApiError } from '../../api';
import { RESOURCE_TYPES, useAddResource, useRemoveResource, useTrainingItem, type Resource, type ResourceType, type TrainingDetail } from './api';
import { ClubGate, itemHref, plural, QueryState } from './shared';
import './training.css';

const GROUP_LABEL: Record<ResourceType, string> = {
  Course: 'Courses', Article: 'Articles', Book: 'Books', Video: 'Videos', 'Case study': 'Case studies',
  'Industry report': 'Industry reports', Tool: 'Tools', Template: 'Templates',
};

/**
 * FN-11-I02 Learning path: the resources for one skill, by type, and kept short (PDF §3E: curated learning paths, not a
 * huge collection). The Core Team curates it. Open question R-30: whether a central library clubs pick from exists, so
 * each club curates its own.
 */
export function LearningPath() {
  return (
    <ClubGate>
      <PathPage />
    </ClubGate>
  );
}

function PathPage() {
  const { id = '' } = useParams();
  const q = useTrainingItem(id);
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFound message="There’s no learning path at this link." />;
  if (!q.data) return <QueryState query={q} />;
  if (q.data.item.kind !== 'path') return <Navigate to={itemHref(q.data.item)} replace />;
  return <PathView data={q.data} />;
}

function PathView({ data }: { data: TrainingDetail }) {
  const { item, canEdit, related, club } = data;
  const remove = useRemoveResource(item.id);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const skill = item.skill ?? item.title;

  // Keep each resource's position on the path, which removing uses.
  const indexed = item.resources.map((r, index) => ({ ...r, index }));
  const known = RESOURCE_TYPES as readonly string[];
  const groups = [
    ...RESOURCE_TYPES.map((t) => ({ type: t, label: GROUP_LABEL[t], list: indexed.filter((r) => r.type === t) })),
    { type: 'Other', label: 'Other', list: indexed.filter((r) => !known.includes(r.type)) },
  ].filter((g) => g.list.length);
  const practice = related.filter((r) => r.kind === 'project' || r.kind === 'task');

  const removeOne = (r: Resource & { index: number }) => {
    if (window.confirm(`Take “${r.title}” off this path?`)) remove.mutate(r.index);
  };

  return (
    <Page
      title={`${skill} learning path`}
      eyebrow={`Learning path · ${club.name}`}
      back="/club/training?tab=path"
      sub={item.body ?? undefined}
      actions={canEdit && !adding && (
        <button type="button" className="btn btn-outline" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} strokeWidth={2} />
          Add a resource
        </button>
      )}
    >
      <p className="tr-curated">
        <Icon name="sparkle" size={18} />
        <span>A short, curated list from your club’s Core Team, not a huge collection · {plural(item.resources.length, 'resource')}</span>
      </p>

      {added && !adding && <p className="notice" role="status"><Icon name="check" size={20} strokeWidth={2.2} /><span>Added “{added}” to this path.</span></p>}
      {canEdit && adding && (
        <AddResource
          id={item.id}
          count={item.resources.length}
          onCancel={() => setAdding(false)}
          onAdded={(title) => {
            setAdded(title);
            setAdding(false);
          }}
        />
      )}
      {remove.error && <p className="field-help field-error" role="alert">{remove.error.message}</p>}

      <div className="tr-detail">
        <div className="tr-detail-main">
          {groups.length ? groups.map((g) => (
            <section key={g.type} className="tr-group" aria-labelledby={`group-${g.type}`}>
              <h2 id={`group-${g.type}`} className="tr-group-title">{g.label} <span className="tab-count">{g.list.length}</span></h2>
              <ul className="tr-resources">
                {g.list.map((r) => (
                  <ResourceRow key={`${r.index}-${r.title}`} type={r.type} title={r.title} link={r.link} onRemove={canEdit ? () => removeOne(r) : undefined} removing={remove.isPending} />
                ))}
              </ul>
            </section>
          )) : (
            <EmptyState
              icon="graduation"
              title="No resources on this path yet"
              body={canEdit ? 'Add the few courses, articles, videos or templates that matter most for this skill.' : 'Your club’s Core Team adds a few courses, articles, videos and templates here.'}
              action={canEdit && !adding ? <button type="button" className="btn btn-outline" onClick={() => setAdding(true)}>Add a resource</button> : undefined}
            />
          )}
        </div>

        <aside className="tr-detail-side" aria-labelledby="practice">
          <div className="side-card">
            <h2 id="practice" className="side-card-title">Put it into practice</h2>
            {practice.length ? (
              <ul className="tr-practice">
                {practice.map((r) => (
                  <li key={r.id}>
                    <Link to={itemHref(r)} className="person-row">
                      <span className="tile tile-xs tile-flat tile-blue" aria-hidden="true"><Icon name={r.kind === 'project' ? 'briefcase' : 'file'} size={18} /></span>
                      <span className="grow">
                        <b className="block">{r.title}</b>
                        <span className="small soft">Club {r.kind} · ends in Proof of Work</span>
                      </span>
                      <Icon name="chevronRight" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small soft">No projects or tasks for {skill} in the plan yet.</p>
            )}
            <Link to="/club/training" className="link small">See the whole training plan</Link>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function AddResource({ id, count, onCancel, onAdded }: { id: number; count: number; onCancel: () => void; onAdded: (title: string) => void }) {
  const add = useAddResource(id);
  const [type, setType] = useState<ResourceType | ''>('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    ref.current?.querySelector<HTMLSelectElement>('select')?.focus({ preventScroll: true });
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!type) next.type = 'Choose what kind of resource it is.';
    if (!title.trim()) next.title = 'Add the resource’s title.';
    if (link.trim() && !/^https?:\/\/\S+\.\S+/.test(link.trim())) next.link = 'Links start with http:// or https://.';
    setErrors(next);
    if (Object.keys(next).length || !type) return;
    add.mutate({ type, title: title.trim(), link: link.trim() || undefined }, { onSuccess: () => onAdded(title.trim()) });
  };

  return (
    <form ref={ref} className="tr-form" onSubmit={submit} noValidate aria-labelledby="add-resource">
      <h2 id="add-resource" className="tr-form-title">Add a resource</h2>
      <p className="small soft">Keep the path short: add what matters most for the skill. It has {plural(count, 'resource')} now.</p>
      <div className={`field${errors.type ? ' has-error' : ''}`}>
        <label htmlFor="resource-type" className="field-label">Kind</label>
        <select
          id="resource-type"
          className="field-input"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          aria-invalid={errors.type ? true : undefined}
          aria-describedby={errors.type ? 'resource-type-help' : undefined}
        >
          <option value="" disabled>Choose a kind</option>
          {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.type && <p id="resource-type-help" className="field-help">{errors.type}</p>}
      </div>
      <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Market sizing basics" maxLength={140} error={errors.title} />
      <TextField label="Link (optional)" value={link} onChange={setLink} placeholder="https://" maxLength={400} error={errors.link} />
      {add.error && <p className="field-help field-error" role="alert">{add.error.message}</p>}
      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={add.isPending}>{add.isPending ? 'Adding…' : 'Add to the path'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
