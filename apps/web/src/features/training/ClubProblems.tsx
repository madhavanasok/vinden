import { useRef, useState, type RefObject } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMe, type Me, type Person } from '../../api';
import { Avatar } from '../../components/Bits';
import { Board, Gate, Page, isCore } from '../../components/Page';
import { Checkbox, TextField } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { ProblemStages } from '../../components/ProblemStages';
import { STAGES, useProblemBoard, useUpdateProblem, type Problem, type ProblemChange } from './api';
import { DockBar, names, ProblemHead, QueryState, scrollToPanel, WorkStatusPill } from './shared';
import './training.css';

/**
 * FN-12-I03 Problem statements: each company problem by stage (problem, student team, solution, Proof of Work), with
 * the company, its requirements and the outcome follow-up. The Core Team manages projects; Industry & Outreach
 * coordinates requirements and follows up on outcomes. Open question R-26: per-seat permissions, so any Core Team seat
 * can edit. Open question R-22: how the club relates to hiring, so nothing here is about hiring.
 */
export function ClubProblems() {
  return (
    <Gate allow={(me) => isCore(me)} who="the club’s Core Team">
      <ProblemsBoard />
    </Gate>
  );
}

function ProblemsBoard() {
  const q = useProblemBoard();
  const me = useMe().data;
  const [params] = useSearchParams();
  const panel = useRef<HTMLElement>(null);
  if (!q.data) return <QueryState query={q} />;
  const { club, members, problems } = q.data;
  const inOrder = STAGES.flatMap((s) => problems.filter((p) => p.stage === s.key));
  const selected = problems.find((p) => p.slug === params.get('p')) ?? inOrder[0];

  const columns = STAGES.map((s) => ({
    key: s.key,
    title: s.label,
    items: problems.filter((p) => p.stage === s.key).map((p) => ({
      key: p.slug,
      content: (
        <Link
          to={`?p=${p.slug}`}
          replace
          preventScrollReset
          className="board-card tr-pcard"
          aria-current={p.slug === selected?.slug ? 'true' : undefined}
          onClick={() => scrollToPanel(panel.current)}
        >
          <b>{p.company.name}</b>
          <span>{p.title}</span>
          <span className="tr-pcard-foot">
            {!p.club
              ? <span className="pill pill-muted">Not with a club yet</span>
              : p.team.length ? `Team: ${p.team.map((t) => t.name.split(' ')[0]).join(', ')}` : 'No team yet'}
          </span>
        </Link>
      ),
    })),
  }));

  return (
    <Page
      title="Problem statements"
      eyebrow={club.name}
      back="/club"
      sub="Company problems by stage. The Core Team manages each project; Industry & Outreach coordinates requirements and follows up on outcomes."
    >
      <div className="tr-board-layout">
        <Board label="Problem statements by stage" columns={columns} />
        {selected ? (
          <ProblemPanel key={selected.slug} panelRef={panel} problem={selected} members={members} me={me} />
        ) : (
          <p className="soft tr-board-empty">No problem statements yet. When a company submits one, it appears in Problem.</p>
        )}
      </div>
    </Page>
  );
}

function ProblemPanel({ problem, members, me, panelRef }: {
  problem: Problem;
  members: (Person & { line: string })[];
  me?: Me;
  /** The page scrolls here when a card is picked on tablet and phone. */
  panelRef: RefObject<HTMLElement | null>;
}) {
  const { update, take } = useUpdateProblem();
  const [done, setDone] = useState('');
  const at = STAGES.findIndex((s) => s.key === problem.stage);
  const next = STAGES[at + 1];
  const prev = STAGES[at - 1];
  const onTeam = problem.team.some((t) => t.handle === me?.handle);
  const busy = update.isPending || take.isPending;
  const error = update.error ?? take.error;

  const change = (c: ProblemChange, message: string, after?: () => void) =>
    update.mutate({ slug: problem.slug, change: c }, { onSuccess: () => { setDone(message); after?.(); } });
  const takeOn = () => take.mutate(problem.slug, { onSuccess: () => setDone('Taken on by your club. It’s in Problem until you form a team.') });
  const moveNext = () => next && change({ stage: next.key }, `Moved to ${next.label}.`);

  return (
    <aside ref={panelRef} className="side-card tr-panel" aria-labelledby="problem-title">
      <ProblemHead problem={problem} headingId="problem-title" />
      <p className="tr-status" role="status">{done}</p>
      {error && <p className="field-help field-error" role="alert">{error.message}</p>}

      {!problem.club ? (
        // Open question R-24: how a problem reaches a club isn't described; any club's Core Team can take it on.
        <div className="tr-panel-block">
          <span className="pill pill-muted">Not with a club yet</span>
          <p className="small soft">{problem.company.name} submitted this and no club has taken it on. Take it on to manage it here.</p>
          <button type="button" className="btn btn-primary desktop-only" onClick={takeOn} disabled={busy}>Take it on</button>
          <DockBar><button type="button" className="btn btn-primary btn-lg grow" onClick={takeOn} disabled={busy}>Take it on</button></DockBar>
        </div>
      ) : (
        <>
          <div className="tr-panel-block">
            <h3 className="tr-panel-label">Stage</h3>
            <ProblemStages stage={problem.stage} label={`Stage of ${problem.title}`} />
            <div className="tr-stage-actions">
              {next && <button type="button" className="btn btn-primary btn-sm desktop-only" onClick={moveNext} disabled={busy}>Move to {next.label}</button>}
              {prev && (
                <button type="button" className="link-btn tr-quiet-btn" onClick={() => change({ stage: prev.key }, `Moved back to ${prev.label}.`)} disabled={busy}>
                  Move back to {prev.label}
                </button>
              )}
            </div>
          </div>

          {/* Open question R-19: who picks the student team. Any Core Team seat can set it from the club's members. */}
          <TeamBlock problem={problem} members={members} busy={busy} onSave={(team, after) => change({ team }, team.length ? 'Student team saved.' : 'Student team cleared.', after)} />

          <EditableText
            label="Requirements"
            hint="Industry & Outreach coordinates these with the company."
            empty="Not agreed yet."
            value={problem.requirements}
            busy={busy}
            onSave={(requirements, after) => change({ requirements }, 'Requirements saved.', after)}
          />
          <EditableText
            label="Outcome follow-up"
            hint="Industry & Outreach follows up with the company on the outcome."
            empty="No follow-up yet."
            value={problem.followUp}
            busy={busy}
            onSave={(followUp, after) => change({ followUp }, 'Follow-up saved.', after)}
          />

          {(problem.work || problem.stage === 'solution' || problem.stage === 'pow') && (
            <div className="tr-panel-block">
              <h3 className="tr-panel-label">Proof of Work</h3>
              {problem.work ? (
                <>
                  <WorkStatusPill status={problem.work.status} />
                  <Link to={`/work/${problem.work.slug}`} className="tr-work-link">{problem.work.title}</Link>
                </>
              ) : (
                <>
                  <p className="small soft">Not posted yet. The student team posts the solution as Proof of Work, linked to this problem.</p>
                  {onTeam && <Link to={`/post?brief=${problem.slug}`} className="btn btn-outline btn-sm">Post the Proof of Work</Link>}
                </>
              )}
            </div>
          )}

          {next && (
            <DockBar><button type="button" className="btn btn-primary btn-lg grow" onClick={moveNext} disabled={busy}>Move to {next.label}</button></DockBar>
          )}
        </>
      )}
    </aside>
  );
}

function TeamBlock({ problem, members, busy, onSave }: {
  problem: Problem;
  members: (Person & { line: string })[];
  busy: boolean;
  onSave: (team: string[], after: () => void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<string[]>(problem.team.map((t) => t.handle));
  const start = () => {
    setPicked(problem.team.map((t) => t.handle));
    setEditing(true);
  };

  if (!editing) {
    return (
      <div className="tr-panel-block">
        <div className="row-between">
          <h3 className="tr-panel-label">Student team</h3>
          <button type="button" className="link-btn tr-quiet-btn" onClick={start}>{problem.team.length ? 'Change' : 'Choose'}<span className="visually-hidden"> the student team</span></button>
        </div>
        {problem.team.length ? (
          <ul className="tr-team">
            {problem.team.map((t) => (
              <li key={t.handle}><Avatar person={t} size={28} decorative />{t.name}</li>
            ))}
          </ul>
        ) : (
          <p className="small soft">No team yet. Choose club members to work on it.</p>
        )}
      </div>
    );
  }

  return (
    <fieldset className="tr-panel-block tr-fieldset">
      <legend className="tr-panel-label">Student team</legend>
      <p className="small soft">Choose from your club’s members.</p>
      <ul className="tr-pick">
        {members.map((m) => (
          <li key={m.handle}>
            <Checkbox checked={picked.includes(m.handle)} onChange={(on) => setPicked((list) => (on ? [...list, m.handle] : list.filter((h) => h !== m.handle)))}>
              <span className="tr-pick-person">
                <Avatar person={m} size={32} decorative />
                <span>
                  <b className="block">{m.name}</b>
                  <span className="small soft">{m.line}</span>
                </span>
              </span>
            </Checkbox>
          </li>
        ))}
      </ul>
      <p className="small soft">{picked.length ? `${names(members.filter((m) => picked.includes(m.handle)))}` : 'Nobody chosen'}</p>
      <div className="button-row">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => onSave(picked, () => setEditing(false))}>Save team</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </fieldset>
  );
}

function EditableText({ label, hint, empty, value, busy, onSave }: {
  label: string;
  hint: string;
  empty: string;
  value: string | null;
  busy: boolean;
  onSave: (text: string, after: () => void) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  if (!editing) {
    return (
      <div className="tr-panel-block">
        <div className="row-between">
          <h3 className="tr-panel-label">{label}</h3>
          <button type="button" className="link-btn tr-quiet-btn" onClick={() => { setDraft(value ?? ''); setEditing(true); }}>
            Edit<span className="visually-hidden"> {label.toLowerCase()}</span>
          </button>
        </div>
        <p className={value ? 'tr-prose' : 'small soft'}>{value ?? empty}</p>
        <p className="small muted">{hint}</p>
      </div>
    );
  }
  return (
    <div className="tr-panel-block">
      <TextField label={label} value={draft} onChange={setDraft} multiline maxLength={2000} helper={hint} />
      <div className="button-row">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => onSave(draft, () => setEditing(false))}>Save</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}
