import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useClub, useMe, usePostWork, type Club, type Me, type Person, type WorkKind } from '../api';
import { WorkCardPreview } from '../components/Cards';
import { Checkbox, OptionCards, Steps, TeammateRow, TextField, UploadField, type Option, type PickedFile } from '../components/Forms';
import { Icon } from '../components/Icon';
import { ActionBar, PageBar } from '../components/Layout';
import { CheckRow, InfoRow, ProgressBar } from '../components/Rows';
import { ErrorState, Loading } from './Placeholder';

const STEPS = ['What you made', 'Who did what', 'Skills and visibility', 'Review and send'];

const KINDS: Option<WorkKind>[] = [
  { value: 'club-task', title: 'Club task', description: 'This week’s task from your club', icon: 'users' },
  { value: 'paid-brief', title: 'Paid brief', description: 'Work for a company, through your club', icon: 'briefcase' },
  { value: 'internship', title: 'Internship', description: 'Work you did for an employer', icon: 'building' },
  { value: 'independent', title: 'Independent project', description: 'Something you made on your own', icon: 'sparkle' },
];

const CATEGORIES = ['Business', 'Design', 'Data', 'Research'];
const COVER_FOR: Record<string, string> = { Business: 'cac', Design: 'library-phones', Data: 'canteen-bars', Research: 'tam-circles' };
const SPLIT = ['var(--color-split-1)', 'var(--color-split-2)', 'var(--color-split-3)', 'var(--color-split-4)'];
const DRAFT_KEY = 'vinden.post-draft';

interface Mate {
  person: Person;
  line: string;
  role: string;
  share: string;
}

interface Draft {
  title: string;
  kind: WorkKind | null;
  description: string;
  files: PickedFile[];
  team: Mate[];
  category: string | null;
  skills: string[];
}

function loadDraft(): Partial<Draft> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Partial<Draft>;
  } catch {
    return {};
  }
}

/** Shares split evenly, with any remainder on the first person, so a new team starts at 100%. */
const evenShares = (team: Mate[]) => team.map((m, i) => ({ ...m, share: String(Math.floor(100 / team.length) + (i === 0 ? 100 % team.length : 0)) }));

export function PostPage() {
  const me = useMe();
  const club = useClub();
  if (me.isPending || club.isPending) return <Loading />;
  if (me.error) return <ErrorState error={me.error} onRetry={() => void me.refetch()} />;
  return <PostForm me={me.data} club={club.data ?? null} />;
}

function PostForm({ me, club }: { me: Me; club: Club | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const task = params.get('task') === 'this-week' ? club?.task : undefined;
  const saved = useRef(loadDraft()).current;

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(saved.title ?? '');
  const [kind, setKind] = useState<WorkKind | null>(task ? 'club-task' : saved.kind ?? null);
  const [description, setDescription] = useState(saved.description ?? '');
  const [files, setFiles] = useState<PickedFile[]>(saved.files ?? []);
  const [team, setTeam] = useState<Mate[]>(saved.team?.length ? saved.team : [{ person: me, line: club ? 'Club member' : 'You', role: '', share: '100' }]);
  const [category, setCategory] = useState<string | null>(saved.category ?? null);
  const [skills, setSkills] = useState<string[]>(saved.skills ?? []);
  const [skillDraft, setSkillDraft] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [checked, setChecked] = useState([false, false, false, false]);
  const post = usePostWork();
  const addId = useId();
  const skillId = useId();
  const categoryId = useId();

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, kind, description, files, team, category, skills } satisfies Draft));
    } catch {
      // Private browsing or storage turned off: the form still works, it just won't remember the draft.
    }
  }, [title, kind, description, files, team, category, skills]);

  const total = team.reduce((sum, m) => sum + (Number(m.share) || 0), 0);
  const errors: Record<string, string | undefined>[] = [
    {
      title: title.trim().length < 4 ? 'Add a title of at least 4 characters so people know what this is.' : undefined,
      kind: kind ? undefined : 'Pick the kind of work this is.',
      description: description.trim().length < 20 ? 'Say what the problem was, what you did and what changed.' : undefined,
      files: files.length ? undefined : 'Add at least one file that shows the work.',
    },
    {
      team: total !== 100 ? `Shares add up to ${total}%. Change them so they add up to 100%.` : team.some((m) => m.role.trim().length < 2) ? 'Give everyone a role, even a short one.' : undefined,
    },
    {
      category: category ? undefined : 'Pick the area this work is in.',
      skills: skills.length ? undefined : 'Add at least one skill this work shows.',
    },
    { confirmed: confirmed ? undefined : 'Confirm the work is yours and the shares are right.' },
  ];
  const ok = errors.map((e) => Object.values(e).every((v) => !v));
  const err = (i: number, key: string) => (checked[i] ? errors[i][key] : undefined);
  const firstOpen = ok.findIndex((v) => !v);

  const reveal = (indexes: number[]) => setChecked((c) => c.map((v, i) => v || indexes.includes(i)));
  const focusFirstError = () => requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('.post-page [aria-invalid="true"], .post-page .field-error');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (el?.matches('input, textarea')) el.focus({ preventScroll: true });
  });
  const goTo = (i: number) => {
    setStep(i);
    document.getElementById(`post-step-${i}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  const next = () => {
    if (!ok[step]) { reveal([step]); focusFirstError(); return; }
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  };
  const back = () => (step === 0 ? navigate(-1) : (setStep(step - 1), window.scrollTo({ top: 0 })));

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (firstOpen !== -1) {
      reveal([0, 1, 2, 3]);
      setStep(firstOpen);
      focusFirstError();
      return;
    }
    post.mutate(
      {
        title: title.trim(),
        kind: kind!,
        category: category!,
        description: description.trim(),
        files: files.map((f) => ({ name: f.name, size: f.size })),
        team: team.map((m) => ({ handle: m.person.handle, role: m.role.trim(), share: Number(m.share) })),
        skills,
      },
      {
        onSuccess: ({ slug }) => {
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* nothing to clear */ }
          navigate(`/work/${slug}`, { state: { posted: true } });
        },
      },
    );
  };

  const available = (club?.people ?? []).filter((p) => !team.some((m) => m.person.handle === p.handle));
  const addMate = (handle: string) => {
    const p = available.find((x) => x.handle === handle);
    if (p && team.length < 8) setTeam(evenShares([...team, { person: p, line: p.line, role: '', share: '0' }]));
  };
  const updateMate = (i: number, patch: Partial<Mate>) => setTeam(team.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const removeMate = (i: number) => setTeam(evenShares(team.filter((_, j) => j !== i)));
  const addSkill = () => {
    const s = skillDraft.trim();
    if (s.length >= 2 && skills.length < 8 && !skills.some((x) => x.toLowerCase() === s.toLowerCase())) setSkills([...skills, s]);
    setSkillDraft('');
  };

  const others = team.length - 1;
  const byline = `${me.name}${others > 0 ? ` + ${others}` : ''}${club ? ` · ${club.college}` : ''}`;
  const clubWork = kind === 'club-task' || kind === 'paid-brief';
  const teammates = team.slice(1).map((m) => m.person.name.split(' ')[0]);

  return (
    <>
      <PageBar title="Post your work" note={`Step ${step + 1} of ${STEPS.length}`} onBack={back} />
      <form className="container post-page" onSubmit={send} noValidate>
        <div className="mobile-only post-progress">
          <ProgressBar value={step + 1} max={STEPS.length} size="sm" label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`} />
        </div>
        <header className="post-head">
          <h1 className="post-title display">Post your work</h1>
          <p className="lede soft desktop-only">Show what you made and who made it with you, then send it for checks. It takes about 10 minutes, and your draft saves as you go.</p>
          <Steps steps={STEPS} current={firstOpen === -1 ? 3 : firstOpen} done={ok} onSelect={goTo} />
        </header>

        <div className="post-layout">
          <div className="post-main">
            <section id="post-step-0" className={`post-step${step === 0 ? ' is-current' : ''}${firstOpen === 0 ? ' is-active' : ''}`} aria-labelledby="post-s0">
              <p className="eyebrow">Step 1</p>
              <h2 id="post-s0" className="post-step-title">What you made</h2>
              {task && <InfoRow icon="users" tone="lav" title={task.title} subtitle={`This week’s club task · due ${task.due}`} />}
              <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Campus food-delivery market in Pune" maxLength={120} error={err(0, 'title')} />
              <OptionCards legend="What kind of work is this?" name="kind" options={KINDS} value={kind} onChange={setKind} error={err(0, 'kind')} />
              <TextField
                label="What did you do?"
                multiline
                value={description}
                onChange={setDescription}
                placeholder="What was the problem, what did you do, and what changed?"
                helper="Say what the problem was, what you did and what changed."
                error={err(0, 'description')}
                maxLength={4000}
              />
              <UploadField label="Files and links" files={files} onAdd={(f) => setFiles([...files, ...f])} onRemove={(i) => setFiles(files.filter((_, j) => j !== i))} error={err(0, 'files')} />
            </section>

            <section id="post-step-1" className={`post-step${step === 1 ? ' is-current' : ''}${firstOpen === 1 ? ' is-active' : ''}`} aria-labelledby="post-s1">
              <p className="eyebrow">Step 2</p>
              <h2 id="post-s1" className="post-step-title">Who did what</h2>
              <p className="soft post-step-sub">Add everyone who worked on this, with their role and share. Shares must add up to 100%, and each teammate confirms theirs.</p>
              <div className="split" role="img" aria-label={`Contribution split: ${team.map((m) => `${m.person.name.split(' ')[0]} ${Number(m.share) || 0}%`).join(', ')}`}>
                {team.map((m, i) => <span key={m.person.handle} style={{ width: `${Math.min(100, Number(m.share) || 0)}%`, background: SPLIT[i % 4] }} />)}
              </div>
              <ul className="teammates">
                {team.map((m, i) => (
                  <TeammateRow
                    key={m.person.handle}
                    person={m.person}
                    line={m.line}
                    role={m.role}
                    share={m.share}
                    color={SPLIT[i % 4]}
                    you={i === 0}
                    onRole={(role) => updateMate(i, { role })}
                    onShare={(share) => updateMate(i, { share })}
                    onRemove={() => removeMate(i)}
                  />
                ))}
              </ul>
              <div className="teammates-foot">
                {available.length > 0 && team.length < 8 && (
                  <span className="add-teammate">
                    <label htmlFor={addId} className="visually-hidden">Add a teammate</label>
                    <Icon name="plus" size={18} strokeWidth={2} />
                    <span aria-hidden="true">Add teammate</span>
                    <select id={addId} value="" onChange={(e) => addMate(e.target.value)}>
                      <option value="">Add teammate</option>
                      {available.map((p) => <option key={p.handle} value={p.handle}>{p.name}</option>)}
                    </select>
                  </span>
                )}
                <p className={`split-total${total === 100 ? ' is-ok' : ''}${err(1, 'team') ? ' field-error' : ''}`} aria-live="polite">
                  {total === 100 && !err(1, 'team') ? <><Icon name="check" size={18} strokeWidth={2.2} />Shares add up to 100%</> : err(1, 'team') ?? `Shares add up to ${total}%`}
                </p>
              </div>
            </section>

            <section id="post-step-2" className={`post-step${step === 2 ? ' is-current' : ''}${firstOpen === 2 ? ' is-active' : ''}`} aria-labelledby="post-s2">
              <p className="eyebrow">Step 3</p>
              <h2 id="post-s2" className="post-step-title">Skills and visibility</h2>
              <div className="field">
                <span className="field-label" id={categoryId}>Which area is it in?</span>
                <div className="chip-row" role="group" aria-labelledby={categoryId}>
                  {CATEGORIES.map((c) => <button key={c} type="button" className="chip chip-sm" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
                </div>
                {err(2, 'category') && <p className="field-help field-error">{err(2, 'category')}</p>}
              </div>
              <div className="field">
                <label htmlFor={skillId} className="field-label">Skills this work shows</label>
                <p className="small soft">Up to 8. People vouch for these skills.</p>
                <div className="skill-input">
                  <input
                    id={skillId}
                    className="field-input"
                    value={skillDraft}
                    placeholder="e.g. Market sizing"
                    maxLength={40}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  />
                  <button type="button" className="btn btn-outline" onClick={addSkill} disabled={skills.length >= 8}><Icon name="plus" size={18} strokeWidth={2} />Add skill</button>
                </div>
                {skills.length > 0 && (
                  <ul className="tag-row">
                    {skills.map((s) => (
                      <li key={s} className="tag tag-removable">
                        {s}
                        <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))}><Icon name="close" size={14} strokeWidth={2} /></button>
                      </li>
                    ))}
                  </ul>
                )}
                {err(2, 'skills') && <p className="field-help field-error">{err(2, 'skills')}</p>}
              </div>
              <p className="visibility-note">
                <span className="pill pill-blue"><Icon name="link" size={14} strokeWidth={2} />{kind === 'paid-brief' ? 'Company decides' : 'Public once verified'}</span>
                <span className="small soft">
                  {kind === 'paid-brief'
                    ? 'For paid briefs, the company chooses public or private when it signs off.'
                    : 'Once it passes its checks, anyone with the link can see it.'}
                </span>
              </p>
            </section>
          </div>

          <aside id="post-step-3" className={`post-side post-step${step === 3 ? ' is-current' : ''}`} aria-labelledby="post-s3">
            <h2 id="post-s3" className="post-step-title mobile-only">Review and send</h2>
            <div className="side-card post-preview">
              <p className="small soft">How your card will look</p>
              <WorkCardPreview title={title.trim() || 'Your title'} cover={COVER_FOR[category ?? ''] ?? 'cac'} byline={byline} />
            </div>
            <div className="side-card">
              <h3 className="side-card-title">What happens next</h3>
              <CheckRow icon="sparkle" tone="blue" title="AI check" body="Starts as soon as you send. Takes a few minutes." status="pending" />
              {clubWork
                ? <CheckRow icon="shield" tone="lav" title="Club review" body="Proof of Work & Quality team, usually within 3 days." status="pending" />
                : <CheckRow icon="shield" tone="lav" title="Club review" body="Only for club tasks and paid briefs." status="missing" />}
              {kind === 'paid-brief'
                ? <CheckRow icon="building" tone="gold" title="Company sign-off" body="The company signs off, then pays your club." status="pending" />
                : <CheckRow icon="building" tone="gold" title="Company sign-off" body="Only for paid briefs, so not needed here." status="missing" />}
              <Checkbox checked={confirmed} onChange={setConfirmed}>I made this work, and my teammates' shares are right</Checkbox>
              {err(3, 'confirmed') && <p className="field-help field-error">{err(3, 'confirmed')}</p>}
              {post.error && <p className="field-help field-error" role="alert">{post.error.message}</p>}
              <button type="submit" className="btn btn-accent btn-lg btn-block desktop-only" disabled={post.isPending}>
                {post.isPending ? 'Sending…' : 'Send for verification'}
              </button>
              {teammates.length > 0 && <p className="small soft">{teammates.join(' and ')} will be asked to confirm their shares.</p>}
            </div>
          </aside>
        </div>

        <ActionBar>
          <button type="button" className="btn btn-outline btn-lg" onClick={back}>Back</button>
          {step < STEPS.length - 1
            ? <button key="next" type="button" className="btn btn-primary btn-lg grow" onClick={next}>Continue</button>
            : <button key="send" type="submit" className="btn btn-accent btn-lg grow" disabled={post.isPending}>{post.isPending ? 'Sending…' : 'Send for verification'}</button>}
        </ActionBar>
      </form>
    </>
  );
}
