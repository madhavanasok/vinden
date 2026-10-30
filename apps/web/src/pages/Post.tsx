import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useMe, usePostWork, type Me, type Person, type WorkKind } from '../api';
import { Avatar } from '../components/Bits';
import { WorkCardPreview } from '../components/Cards';
import { formatFor, toneFor, type CoverTone } from '../components/Cover';
import { OptionCards, Steps, TextField, UploadField, type Option, type PickedFile } from '../components/Forms';
import { Icon } from '../components/Icon';
import { ActionBar, PageBar } from '../components/Layout';
import { Gate } from '../components/Page';
import { InfoRow, ProgressBar } from '../components/Rows';
import { StatusRow } from '../components/Status';
import { AREAS, usePostOptions, WORK_KINDS, type PostOptions } from '../features/work/api';
import { ErrorState, Loading } from './Placeholder';
import '../features/work/work.css';

/** FN-04-I01 Post Proof of Work. Desktop shows every step with a side summary; phones show one step per screen. */

const STEPS = ['What you made', 'The work', 'Who did it', 'Review and send'];
const DRAFT_KEY = 'vinden.post-draft.v2';
const MAX_IMAGES = 4;

type Mode = 'solo' | 'team';

const MODES: Option<Mode>[] = [
  { value: 'solo', title: 'Solo', description: 'You did all of it', icon: 'user' },
  { value: 'team', title: 'Team', description: 'You worked with others', icon: 'users' },
];

interface Mate {
  person: Person;
  line: string;
  role: string;
}

interface Draft {
  title: string;
  description: string;
  kind: WorkKind | '';
  area: string;
  files: PickedFile[];
  mode: Mode;
  team: Mate[];
  itemId: number | null;
  /** Picked once per draft, so the preview's cover colour doesn't change as you type, and posting keeps it. */
  coverTone: CoverTone;
}

function loadDraft(): Partial<Draft> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Partial<Draft>;
  } catch {
    return {};
  }
}

/** Images are scaled down in the browser (longest side 1600 px, JPEG), so posting stays quick on a phone. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function PostPage() {
  return (
    <Gate allow={(me) => me.account === 'person'} who="people posting their own work. Company accounts submit problem statements instead">
      <PostLoader />
    </Gate>
  );
}

function PostLoader() {
  const me = useMe();
  // ?brief=<slug> comes from the problem-statement board; the API drops it unless the person can post for that brief.
  const [params] = useSearchParams();
  const options = usePostOptions(params.get('brief') ?? '');
  if (me.isPending || options.isPending) return <Loading />;
  if (me.isError) return <ErrorState error={me.error} onRetry={() => void me.refetch()} />;
  if (options.isError) return <ErrorState error={options.error} onRetry={() => void options.refetch()} />;
  return <PostForm me={me.data} options={options.data} />;
}

function PostForm({ me, options }: { me: Me; options: PostOptions }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const saved = useRef(loadDraft()).current;
  // ?task=<id> comes from a club project or task page: preselect it.
  const linked = options.items.find((i) => String(i.id) === params.get('task'));
  const savedItem = options.items.find((i) => i.id === saved.itemId);
  const you: Mate = { person: me, line: 'You', role: '' };

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(saved.title ?? '');
  const [description, setDescription] = useState(saved.description ?? '');
  const [kind, setKind] = useState<WorkKind | ''>(
    linked ? (linked.kind === 'project' ? 'Project' : 'Task')
      : options.brief ? 'Real-world assignment'
        : saved.kind && WORK_KINDS.includes(saved.kind) ? saved.kind : '',
  );
  const [area, setArea] = useState(saved.area && (AREAS as readonly string[]).includes(saved.area) ? saved.area : '');
  const [files, setFiles] = useState<PickedFile[]>(saved.files ?? []);
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [mode, setMode] = useState<Mode>(saved.mode ?? 'solo');
  const [team, setTeam] = useState<Mate[]>(saved.team?.length && saved.team[0].person.handle === me.handle ? saved.team : [you]);
  const [itemId, setItemId] = useState<number | null>(linked?.id ?? savedItem?.id ?? null);
  const [brief, setBrief] = useState(options.brief);
  const [coverTone] = useState<CoverTone>(() => saved.coverTone ?? toneFor(`${me.handle}-${Date.now()}`));
  const [checked, setChecked] = useState([false, false, false, false]);
  const [imageError, setImageError] = useState<string | null>(null);
  const post = usePostWork();
  const addId = useId();

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, description, kind, area, files, mode, team, itemId, coverTone } satisfies Draft));
    } catch {
      // Private browsing or storage turned off: the form still works, it just won't remember the draft.
    }
  }, [title, description, kind, area, files, mode, team, itemId, coverTone]);

  const mates = mode === 'team' ? team : [team[0]];
  const errors: Record<string, string | undefined>[] = [
    {
      title: title.trim().length < 4 ? 'Add a title of at least 4 characters so people know what this is.' : undefined,
      description: description.trim().length < 20 ? 'Say what the problem was, what you did and what changed.' : undefined,
      kind: kind ? undefined : 'Pick the kind of work.',
      area: area ? undefined : 'Pick the area it’s in.',
    },
    { files: files.length ? undefined : 'Attach at least one file that shows the work.' },
    {
      team: mode === 'solo' ? undefined
        : team.length < 2 ? 'Add the people you worked with, or choose Solo.'
          : team.some((m) => m.role.trim().length < 2) ? 'Write what each person did, even briefly.' : undefined,
    },
    {},
  ];
  const ok = errors.map((e) => Object.values(e).every((v) => !v));
  const err = (i: number, key: string) => (checked[i] ? errors[i][key] : undefined);
  const firstOpen = ok.findIndex((v) => !v);

  const reveal = (indexes: number[]) => setChecked((c) => c.map((v, i) => v || indexes.includes(i)));
  const focusFirstError = () => requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('.post-page [aria-invalid="true"], .post-page .field-error');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (el?.matches('input, textarea, select')) el.focus({ preventScroll: true });
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

  const format = formatFor(files.map((f) => f.name), area || null);
  const item = options.items.find((i) => i.id === itemId) ?? null;

  const submit = (e: FormEvent) => {
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
        description: description.trim(),
        kind: kind as WorkKind,
        area,
        files: files.map((f) => ({ name: f.name, size: f.size })),
        images: images.map((i) => i.url),
        team: mates.map((m) => ({ handle: m.person.handle, role: mode === 'solo' ? '' : m.role.trim() })),
        trainingItemId: itemId,
        briefSlug: brief?.slug ?? null,
        format,
        coverTone,
      },
      {
        onSuccess: ({ slug }) => {
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* nothing to clear */ }
          navigate(`/work/${slug}`, { state: { posted: true } });
        },
      },
    );
  };

  const addImages = async (list: FileList | null) => {
    if (!list) return;
    setImageError(null);
    const picked = [...list].filter((f) => f.type.startsWith('image/')).slice(0, MAX_IMAGES - images.length);
    if (picked.length < list.length) setImageError(`Images only, up to ${MAX_IMAGES}.`);
    try {
      const added = await Promise.all(picked.map(async (f) => ({ name: f.name, url: await shrink(f) })));
      setImages((current) => [...current, ...added].slice(0, MAX_IMAGES));
    } catch {
      setImageError('One of those images couldn’t be read. Try a PNG or JPEG.');
    }
  };

  const available = options.people.filter((p) => !team.some((m) => m.person.handle === p.handle));
  const addMate = (handle: string) => {
    const p = available.find((x) => x.handle === handle);
    if (p && team.length < 8) setTeam([...team, { person: p, line: p.line, role: '' }]);
  };
  const updateMate = (i: number, role: string) => setTeam(team.map((m, j) => (j === i ? { ...m, role } : m)));
  const removeMate = (i: number) => setTeam(team.filter((_, j) => j !== i));

  const others = mates.length - 1;
  const byline = `${me.name}${others > 0 ? ` + ${others}` : ''}${me.club ? ` · ${me.club.college}` : ''}`;
  const send = post.isPending ? 'Sending…' : 'Send for verification';

  return (
    <>
      <PageBar title="Post your work" note={`Step ${step + 1} of ${STEPS.length}`} onBack={back} />
      <form className="container post-page" onSubmit={submit} noValidate>
        <div className="mobile-only post-progress">
          <ProgressBar value={step + 1} max={STEPS.length} size="sm" label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`} />
        </div>
        <header className="post-head">
          <h1 className="post-title display">Post your work</h1>
          <p className="lede soft desktop-only">Show what you made and who made it with you, then send it for verification. Your draft saves as you go.</p>
          <Steps steps={STEPS} current={firstOpen === -1 ? 3 : firstOpen} done={ok.map((v, i) => v && i < 3)} onSelect={goTo} />
        </header>

        <div className="post-layout">
          <div className="post-main">
            <Section index={0} step={step} active={firstOpen === 0} title="What you made">
              {brief && (
                <InfoRow
                  icon="briefcase"
                  tone="gold"
                  title={`Answers: ${brief.title}`}
                  subtitle={`Problem statement from ${brief.company}. Your club’s Core Team reviews it.`}
                  trailing={<button type="button" className="icon-btn bare" aria-label="Don’t link this problem statement" onClick={() => setBrief(null)}><Icon name="close" /></button>}
                />
              )}
              <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Campus food-delivery market in Pune" maxLength={120} error={err(0, 'title')} />
              <TextField
                label="What you did"
                multiline
                value={description}
                onChange={setDescription}
                placeholder="What was the problem, what did you do, and what changed?"
                helper="Say what the problem was, what you did and what changed."
                error={err(0, 'description')}
                maxLength={4000}
              />
              <div className="post-pair">
                <SelectField label="Kind of work" value={kind} onChange={(v) => setKind(v as WorkKind)} error={err(0, 'kind')}>
                  <option value="">Choose a kind</option>
                  {WORK_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </SelectField>
                <SelectField label="Area" value={area} onChange={setArea} error={err(0, 'area')}>
                  <option value="">Choose an area</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </SelectField>
              </div>
            </Section>

            <Section index={1} step={step} active={firstOpen === 1} title="The work">
              <UploadField label="Attach your work" files={files} onAdd={(f) => setFiles([...files, ...f].slice(0, 20))} onRemove={(i) => setFiles(files.filter((_, j) => j !== i))} error={err(1, 'files')} />
              <ImageField images={images} onAdd={(l) => void addImages(l)} onRemove={(i) => setImages(images.filter((_, j) => j !== i))} error={imageError} />
            </Section>

            <Section index={2} step={step} active={firstOpen === 2} title="Who did it">
              <OptionCards legend="Solo or team" name="mode" options={MODES} value={mode} onChange={setMode} />
              {mode === 'team' && (
                <div className="field">
                  <span className="field-label">Teammates and what each did</span>
                  {/* Open question R-11: whether teammates confirm their part isn't covered, so nobody is asked to. */}
                  <ul className="teammates">
                    {team.map((m, i) => (
                      <li key={m.person.handle} className="teammate teammate-role-only">
                        <span className="teammate-who">
                          <Avatar person={m.person} size={32} decorative />
                          <span className="grow">
                            <b className="block">{m.person.name}{i === 0 && ' (you)'}</b>
                            <span className="small muted">{m.line}</span>
                          </span>
                        </span>
                        <input
                          className="field-input teammate-role"
                          aria-label={i === 0 ? 'What you did' : `What ${m.person.name} did`}
                          aria-invalid={err(2, 'team') && m.role.trim().length < 2 ? true : undefined}
                          placeholder={i === 0 ? 'What you did, e.g. Survey and analysis' : 'What they did, e.g. Charts and write-up'}
                          maxLength={120}
                          value={m.role}
                          onChange={(e) => updateMate(i, e.target.value)}
                        />
                        {i === 0 ? <span className="teammate-remove" /> : (
                          <button type="button" className="icon-btn bare teammate-remove" aria-label={`Remove ${m.person.name}`} onClick={() => removeMate(i)}><Icon name="close" /></button>
                        )}
                      </li>
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
                  </div>
                  {err(2, 'team') && <p className="field-help field-error">{err(2, 'team')}</p>}
                </div>
              )}
              {me.club && (
                <SelectField
                  label="Club project or task"
                  value={itemId === null ? '' : String(itemId)}
                  onChange={(v) => setItemId(v ? Number(v) : null)}
                  helper={`Linking one sends this work to ${options.club?.name ?? 'your club'}’s Core Team for review, and marks it done for you.`}
                >
                  <option value="">None: this isn’t club work</option>
                  {(['project', 'task'] as const).map((k) => {
                    const list = options.items.filter((i) => i.kind === k);
                    return list.length ? (
                      <optgroup key={k} label={k === 'project' ? 'Projects' : 'Tasks'}>
                        {list.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                      </optgroup>
                    ) : null;
                  })}
                </SelectField>
              )}
            </Section>
          </div>

          <aside id="post-step-3" className={`post-side post-step${step === 3 ? ' is-current' : ''}`} aria-labelledby="post-s3">
            <h2 id="post-s3" className="post-step-title mobile-only">Review and send</h2>
            <div className="side-card post-preview">
              <p className="small soft">{images.length ? 'Your card, with your first image' : 'Your card. Without images, your work gets this generated card.'}</p>
              <WorkCardPreview title={title.trim() || 'Your title'} format={format} files={files.length} tone={coverTone} byline={byline} image={images[0]?.url} />
            </div>
            <div className="side-card">
              <h3 className="side-card-title">What happens next</h3>
              {/* Open question R-09: the order of the checks isn't decided, so they're a list, not steps. */}
              <ul className="status-list status-list-flat">
                <StatusRow icon="sparkle" tone="blue" title="AI check" body="Runs as soon as you send it. It checks the files, the description and who did what." />
                {item || brief
                  ? <StatusRow icon="shield" tone="lav" title="Club review" body={`Your club’s Core Team reviews it against “${item?.title ?? brief!.title}”`} />
                  : <StatusRow icon="shield" tone="lav" title="Club review" body={me.club ? 'Only for club projects and tasks. Without one, it’s published once the AI check passes.' : 'Only for club work. Your work is published once the AI check passes.'} />}
              </ul>
              {post.error && <p className="field-help field-error" role="alert">{post.error.message}</p>}
              <button type="submit" className="btn btn-accent btn-lg btn-block desktop-only" disabled={post.isPending}>{send}</button>
            </div>
          </aside>
        </div>

        <ActionBar>
          <button type="button" className="btn btn-outline btn-lg" onClick={back}>Back</button>
          {step < STEPS.length - 1
            ? <button key="next" type="button" className="btn btn-primary btn-lg grow" onClick={next}>Continue</button>
            : <button key="send" type="submit" className="btn btn-accent btn-lg grow" disabled={post.isPending}>{send}</button>}
        </ActionBar>
      </form>
    </>
  );
}

/** One step of the form: a card on desktop, a screen of its own on phones. */
function Section({ index, step, active, title, children }: { index: number; step: number; active: boolean; title: string; children: ReactNode }) {
  return (
    <section id={`post-step-${index}`} className={`post-step${step === index ? ' is-current' : ''}${active ? ' is-active' : ''}`} aria-labelledby={`post-s${index}`}>
      <p className="eyebrow">Step {index + 1}</p>
      <h2 id={`post-s${index}`} className="post-step-title">{title}</h2>
      {children}
    </section>
  );
}

/** A labelled native select, styled like a text field (17 px, so phones don't zoom). */
function SelectField({ label, value, onChange, helper, error, children }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  const help = error ?? helper;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      <span className="select-wrap">
        <select
          id={id}
          className="field-input field-select"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={help ? `${id}-help` : undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <Icon name="chevronDown" />
      </span>
      {help && <p id={`${id}-help`} className="field-help">{help}</p>}
    </div>
  );
}

/** Optional images of the work. The first becomes the card's cover; without any, the card is generated. */
function ImageField({ images, onAdd, onRemove, error }: { images: { name: string; url: string }[]; onAdd: (list: FileList | null) => void; onRemove: (i: number) => void; error: string | null }) {
  const id = useId();
  const full = images.length >= MAX_IMAGES;
  return (
    <div className="field">
      <span className="field-label" id={`${id}-label`}>Images <span className="muted">· optional</span></span>
      {!full && (
        <label htmlFor={id} className="upload-zone upload-zone-sm">
          <input id={id} type="file" accept="image/*" multiple className="visually-hidden" aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} onChange={(e) => { onAdd(e.target.files); e.target.value = ''; }} />
          <span className="tile tile-sm tile-flat tile-blue" aria-hidden="true"><Icon name="plus" /></span>
          <b>Add images</b>
          <span id={`${id}-hint`} className="small muted">Screens, charts or slides, up to {MAX_IMAGES}. Without images, your work gets a generated card.</span>
        </label>
      )}
      {images.length > 0 && (
        <ul className="image-list">
          {images.map((img, i) => (
            <li key={`${img.name}-${i}`} className="image-thumb">
              <img src={img.url} alt={`${img.name}${i === 0 ? ', the card cover' : ''}`} />
              <button type="button" className="icon-btn image-remove" aria-label={`Remove ${img.name}`} onClick={() => onRemove(i)}><Icon name="close" size={18} /></button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-help field-error" role="alert">{error}</p>}
    </div>
  );
}
