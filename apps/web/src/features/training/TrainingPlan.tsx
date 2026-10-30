import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { EmptyState, Page, TabRow } from '../../components/Page';
import { OptionCards, TextField, type Option } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { sessionTitle } from '../../components/SessionCard';
import { useAddTrainingItem, useTraining, type SessionType, type TrainingItem, type TrainingKind } from './api';
import { ClubGate, DockBar, itemHref, KIND_LABEL, plural, QueryState } from './shared';
import './training.css';

const TABS: TrainingKind[] = ['project', 'task', 'session', 'path'];

/**
 * FN-11-I01 Training plan: what the Core Team has planned (projects, tasks, sessions, learning paths), by skill.
 * Open question R-18: which parts of the training run in the app. R-29: an interest survey or cohorts aren't in the
 * operating model, so the plan is one list for the whole club.
 */
export function TrainingPlan() {
  return (
    <ClubGate>
      <Plan />
    </ClubGate>
  );
}

function Plan() {
  const plan = useTraining();
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t === params.get('tab')) ?? 'project';
  const [skill, setSkill] = useState<string | null>(null);
  const [adding, setAdding] = useState(params.get('add') === '1');
  const [added, setAdded] = useState<TrainingItem | null>(null);

  if (!plan.data) return <QueryState query={plan} />;
  const { club, canEdit, items } = plan.data;

  const showTab = (next: TrainingKind) => {
    setSkill(null);
    setParams((p) => {
      p.set('tab', next);
      p.delete('add');
      return p;
    }, { replace: true });
  };

  const inTab = items.filter((i) => i.kind === tab);
  const skills = [...new Set(inTab.map((i) => i.skill).filter((s): s is string => !!s))].sort((a, b) => a.localeCompare(b));
  const shown = inTab
    .filter((i) => !skill || i.skill === skill)
    // By skill, so members can see what's planned for each; sessions keep their planned order.
    .sort((a, b) => (tab === 'session' ? 0 : (a.skill ?? '').localeCompare(b.skill ?? '')));

  return (
    <Page
      title="Training plan"
      eyebrow={club.name}
      back="/club"
      sub="Projects, tasks, sessions and learning paths, run by your club’s Core Team."
      actions={canEdit && !adding && (
        <button type="button" className="btn btn-primary desktop-only" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} strokeWidth={2} />
          Add to the plan
        </button>
      )}
    >
      {added && !adding && (
        <p className="notice" role="status">
          <Icon name="check" size={20} strokeWidth={2.2} />
          <span>Added “{added.title}” to {KIND_LABEL[added.kind].many.toLowerCase()}.</span>
        </p>
      )}
      {canEdit && adding && (
        <AddForm
          initialKind={tab}
          skills={[...new Set(items.map((i) => i.skill).filter((s): s is string => !!s))]}
          onCancel={() => setAdding(false)}
          onAdded={(item) => {
            setAdding(false);
            setAdded(item);
            showTab(item.kind);
          }}
        />
      )}

      <TabRow
        label="What’s planned"
        value={tab}
        onChange={showTab}
        tabs={TABS.map((k) => ({ key: k, label: KIND_LABEL[k].many, count: items.filter((i) => i.kind === k).length }))}
      />

      {skills.length > 1 && (
        <div className="chip-row tr-skill-filter" role="group" aria-label="Filter by skill">
          <button type="button" className="chip chip-sm chip-soft" aria-pressed={!skill} onClick={() => setSkill(null)}>All skills</button>
          {skills.map((s) => (
            <button key={s} type="button" className="chip chip-sm chip-soft" aria-pressed={skill === s} onClick={() => setSkill(skill === s ? null : s)}>{s}</button>
          ))}
        </div>
      )}

      {shown.length ? <PlanList kind={tab} items={shown} /> : (
        <EmptyState
          icon={tab === 'session' ? 'calendar' : tab === 'path' ? 'graduation' : 'briefcase'}
          title={`No ${KIND_LABEL[tab].many.toLowerCase()} planned yet`}
          body={canEdit ? 'Add the first one, with the skill it builds.' : 'Your club’s Core Team adds them here.'}
          action={canEdit && !adding ? <button type="button" className="btn btn-outline" onClick={() => setAdding(true)}>Add to the plan</button> : undefined}
        />
      )}

      <p className="tr-footnote">
        <Icon name="shield" size={18} />
        <span>Meaningful work ends in Proof of Work: posting it is how a project or task gets done. <Link to="/club/sessions" className="link">See sessions</Link></span>
      </p>

      {canEdit && !adding && (
        <DockBar>
          <button type="button" className="btn btn-primary btn-lg grow" onClick={() => setAdding(true)}>
            <Icon name="plus" size={18} strokeWidth={2} />
            Add to the plan
          </button>
        </DockBar>
      )}
    </Page>
  );
}

/** The plan as rows: title and skill first, then what tells you how it's going. */
function PlanList({ kind, items }: { kind: TrainingKind; items: TrainingItem[] }) {
  const heads: Record<TrainingKind, [string, string, string]> = {
    project: ['Project', 'Skill', 'Posted'],
    task: ['Task', 'Skill', 'Posted'],
    session: ['Session', 'Kind', 'When'],
    path: ['Learning path', 'Skill', 'Resources'],
  };
  const [first, second, third] = heads[kind];
  return (
    <div className="tr-plan">
      <div className="tr-plan-head" aria-hidden="true">
        <span>{first}</span>
        <span>{second}</span>
        <span>{third}</span>
      </div>
      <ul className="tr-plan-list" aria-label={KIND_LABEL[kind].many}>
        {items.map((i) => {
          const second = kind === 'session' ? (i.sessionType === 'industry' ? 'Industry session' : i.sessionType === 'alumni' ? 'Alumni session' : 'Session') : i.skill ?? '';
          const third = kind === 'session'
            ? i.when ?? ''
            : kind === 'path'
              ? plural(i.resources.length, 'resource')
              : i.posted ? `${plural(i.posted, 'member')} posted` : 'Nobody yet';
          return (
            <li key={i.id}>
              <Link to={itemHref(i)} className="tr-plan-row">
                <span className="tr-plan-title">
                  <b>{kind === 'session' ? sessionTitle(i.title) : kind === 'path' ? `${i.title} path` : i.title}</b>
                  {i.body && <span className="tr-plan-body">{i.body}</span>}
                </span>
                <span className="tr-plan-cell">{second && <span className="tr-skill">{second}</span>}</span>
                <span className="tr-plan-cell tr-plan-meta">{third}</span>
                <Icon name="chevronRight" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const KIND_OPTIONS: Option<TrainingKind>[] = [
  { value: 'project', title: 'Project', description: 'Longer work that ends in Proof of Work', icon: 'briefcase' },
  { value: 'task', title: 'Task or challenge', description: 'Short work, such as analysing a company', icon: 'file' },
  { value: 'session', title: 'Session', description: 'An alumni or industry session', icon: 'calendar' },
  { value: 'path', title: 'Learning path', description: 'A short, curated list of resources for one skill', icon: 'graduation' },
];

const SESSION_OPTIONS: Option<SessionType>[] = [
  { value: 'alumni', title: 'Alumni session', description: 'Career journeys, the skills that matter, building a portfolio', icon: 'users' },
  { value: 'industry', title: 'Industry session', description: 'A professional brings a real problem and guides members through it', icon: 'building' },
];

const BODY_LABEL: Record<TrainingKind, { label: string; helper: string }> = {
  project: { label: 'What it asks', helper: 'For example: solve a business case, size a market or build a prototype. Say what members hand in.' },
  task: { label: 'What it asks', helper: 'For example: analyse a company, prepare a pitch or build a prototype.' },
  session: { label: 'What happens', helper: 'Who is coming and what members will get from it.' },
  path: { label: 'What it covers', helper: 'One line on what members will be able to do. Resources are added on the path’s page.' },
};

const TITLE_PLACEHOLDER: Record<TrainingKind, string> = {
  project: 'e.g. Size the campus food-delivery market',
  task: 'e.g. Analyse a company: a food-delivery app’s student plan',
  session: 'e.g. Landing your first growth role',
  path: '',
};

/** Add a project, task, session or learning path. Open question R-28: who designs the training, so any Core Team seat can. */
function AddForm({ initialKind, skills, onCancel, onAdded }: { initialKind: TrainingKind; skills: string[]; onCancel: () => void; onAdded: (item: TrainingItem) => void }) {
  const add = useAddTrainingItem();
  const [kind, setKind] = useState<TrainingKind>(initialKind);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [skill, setSkill] = useState('');
  const [when, setWhen] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    ref.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (kind === 'session' && !sessionType) next.sessionType = 'Choose an alumni or industry session.';
    if (kind !== 'path' && !title.trim()) next.title = 'Add a title.';
    if (!body.trim()) next.body = kind === 'session' ? 'Say what happens in the session.' : kind === 'path' ? 'Say what the path covers.' : 'Say what it asks of members.';
    if (kind !== 'session' && !skill.trim()) next.skill = 'Add the skill it builds.';
    if (kind === 'session' && !when.trim()) next.when = 'Add when the session is.';
    setErrors(next);
    if (Object.keys(next).length) return;
    add.mutate({ kind, sessionType, title, body, skill, when }, { onSuccess: onAdded });
  };

  const bodyText = BODY_LABEL[kind];
  const suggestions = skills.filter((s) => s.toLowerCase() !== skill.trim().toLowerCase()).slice(0, 6);

  return (
    <form ref={ref} className="tr-form tr-add" onSubmit={submit} noValidate aria-labelledby="add-title">
      <h2 id="add-title" className="tr-form-title">Add to the plan</h2>
      <OptionCards legend="What are you adding?" name="kind" options={KIND_OPTIONS} value={kind} onChange={(k) => { setKind(k); setErrors({}); }} />
      {kind === 'session' && (
        <OptionCards legend="Kind of session" name="session-type" options={SESSION_OPTIONS} value={sessionType} onChange={setSessionType} error={errors.sessionType} />
      )}
      {kind !== 'path' && <TextField label="Title" value={title} onChange={setTitle} placeholder={TITLE_PLACEHOLDER[kind]} maxLength={140} error={errors.title} />}
      {kind !== 'session' && (
        <div className="tr-skill-field">
          <TextField
            label={kind === 'path' ? 'Skill this path builds' : 'Skill'}
            value={skill}
            onChange={setSkill}
            placeholder="e.g. Market research"
            maxLength={60}
            helper={errors.skill ? undefined : 'Members see the plan by skill.'}
            error={errors.skill}
          />
          {suggestions.length > 0 && (
            <div className="chip-row" role="group" aria-label="Skills already in the plan">
              {suggestions.map((s) => (
                <button key={s} type="button" className="chip chip-sm chip-soft" onClick={() => setSkill(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <TextField label={bodyText.label} value={body} onChange={setBody} multiline maxLength={1200} helper={errors.body ? undefined : bodyText.helper} error={errors.body} />
      {kind === 'session' && <TextField label="When" value={when} onChange={setWhen} placeholder="e.g. Thu 6 Nov, 6 pm" maxLength={60} error={errors.when} />}
      {add.error && <p className="field-help field-error" role="alert">{add.error.message}</p>}
      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={add.isPending}>{add.isPending ? 'Adding…' : 'Add to the plan'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
