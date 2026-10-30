import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api';
import { ApplicantSteps } from '../../components/ApplicantSteps';
import { Avatar } from '../../components/Bits';
import { Icon } from '../../components/Icon';
import { Gate, Page, isCore } from '../../components/Page';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { SELECTION_STEPS, STEP_LABEL, useApplication, useUpdateApplication, type Application, type SelectionStep } from './api';
import './community.css';

/**
 * FN-10-I03 Evaluate an applicant: who they are, their motivation form, a note on each of the eight evaluation
 * factors (PDF §2), then Next step or End application. Past final selection they're selected and join the club.
 * Open question R-17: how factors are scored isn't settled, so each gets a free-text note and no score.
 * Open question R-39: whether the practical task counts as their first Proof of Work isn't settled; it doesn't here.
 */
export function Evaluate() {
  const { id = '' } = useParams();
  return (
    <Gate allow={(me) => isCore(me)} who="the club’s Core Team">
      <EvaluatePage id={id} />
    </Gate>
  );
}

function EvaluatePage({ id }: { id: string }) {
  const app = useApplication(id);
  if (app.isPending) return <Loading />;
  if (app.error) {
    return app.error instanceof ApiError && app.error.status === 404
      ? <NotFound message={app.error.message} />
      : <ErrorState error={app.error} onRetry={() => void app.refetch()} />;
  }
  return <EvaluateView key={app.data.id} app={app.data} />;
}

const notesOf = (app: Application) => Object.fromEntries(app.factors.map((f) => [f.name, f.note]));

function EvaluateView({ app }: { app: Application }) {
  const update = useUpdateApplication(String(app.id));
  const [notes, setNotes] = useState<Record<string, string>>(() => notesOf(app));
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [message, setMessage] = useState('');
  const baseId = useId();
  const decided = app.step === 'selected' || app.step === 'ended';
  const saved = notesOf(app);
  const dirty = app.factors.some((f) => (notes[f.name] ?? '').trim() !== (saved[f.name] ?? '').trim());
  const first = app.person.name.split(' ')[0];
  const index = SELECTION_STEPS.indexOf(app.step as SelectionStep);
  const nextLabel = app.step === 'final' ? `Select ${first}` : index >= 0 ? `Move to ${STEP_LABEL[SELECTION_STEPS[index + 1]].toLowerCase()}` : '';

  const run = (action: 'notes' | 'next' | 'end') =>
    update.mutate({ action, evaluation: notes }, {
      onSuccess: (next) => {
        setConfirmEnd(false);
        setMessage(
          action === 'notes' ? 'Notes saved.'
            : next.step === 'selected' ? `${first} is selected and is now a club member.`
              : next.step === 'ended' ? `${first}’s application has ended.`
                : `${first} moved to ${STEP_LABEL[next.step].toLowerCase()}.`,
        );
      },
    });

  return (
    <Page
      title={app.person.name}
      eyebrow={`Applicant · ${app.club.name}`}
      sub={`Step: ${STEP_LABEL[app.step]}`}
      back="/club/applications"
      actions={<Link to="/club/applications" className="btn btn-outline">All applications</Link>}
    >
      <div className="evaluate-layout">
        <div className="evaluate-main">
          <section className="side-card" aria-labelledby="who-title">
            <h2 id="who-title" className="side-card-title">Who they are</h2>
            <div className="evaluate-who">
              <Avatar person={app.person} size={56} decorative />
              <dl className="evaluate-facts">
                <div><dt>Name</dt><dd>{app.person.name}</dd></div>
                <div><dt>College</dt><dd>{app.person.college ?? 'Not given yet'}</dd></div>
                <div><dt>Year</dt><dd>{app.person.year ?? 'Not given yet'}</dd></div>
                <div><dt>About</dt><dd>{app.person.headline}</dd></div>
              </dl>
            </div>
            <Link to={`/people/${app.person.handle}`} className="small evaluate-profile">See {first}’s profile and work<Icon name="chevronRight" size={16} /></Link>
          </section>

          <section className="side-card" aria-labelledby="form-title">
            <h2 id="form-title" className="side-card-title">Motivation form</h2>
            <dl className="apply-answers">
              {app.answers.map((x) => <div key={x.q}><dt>{x.q}</dt><dd>{x.a}</dd></div>)}
            </dl>
          </section>

          <section className="side-card" aria-labelledby="factors-title">
            <h2 id="factors-title" className="side-card-title">Evaluation</h2>
            <p className="small soft">A note on each of the eight factors. Not on academic performance alone.</p>
            <ol className="factor-list">
              {app.factors.map((f, i) => (
                <li key={f.name} className="field factor">
                  {decided ? (
                    <>
                      <h3 className="field-label">{f.name}</h3>
                      <p className={notes[f.name] ? 'factor-note' : 'factor-note muted'}>{notes[f.name] || 'No note'}</p>
                    </>
                  ) : (
                    <>
                    <label htmlFor={`${baseId}-${i}`} className="field-label">{f.name}</label>
                    <textarea
                      id={`${baseId}-${i}`}
                      className="field-input factor-input"
                      rows={2}
                      maxLength={1000}
                      placeholder="What you saw, with an example"
                      value={notes[f.name] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [f.name]: e.target.value }))}
                    />
                    </>
                  )}
                </li>
              ))}
            </ol>
            {!decided && (
              <div className="factor-actions">
                <button type="button" className="btn btn-outline" disabled={!dirty || update.isPending} onClick={() => run('notes')}>Save notes</button>
                {dirty && <span className="small muted">Unsaved changes</span>}
              </div>
            )}
          </section>
        </div>

        <aside className="evaluate-side">
          <section className="side-card evaluate-decide" aria-labelledby="decide-title">
            <h2 id="decide-title" className="side-card-title">Selection</h2>
            <ApplicantSteps step={app.step} layout="column" label={`${first}’s selection steps`} />
            <p className="small soft">Selected so far: {app.selected} of about {app.target}</p>
            <p className="visually-hidden" role="status">{message}</p>
            {message && <p className="notice evaluate-message" aria-hidden="true"><Icon name="check" size={18} strokeWidth={2.2} />{message}</p>}
            {update.error && <p className="field-error" role="alert">{update.error.message}</p>}
            {decided ? (
              <p className="small soft">
                {app.step === 'selected' ? `${first} is a member of ${app.club.name}.` : 'This application has ended. The notes are kept.'}
              </p>
            ) : confirmEnd ? (
              <div className="evaluate-confirm" role="group" aria-label="Confirm ending the application">
                <p className="small"><b>End {first}’s application?</b> They won’t move to the next step.</p>
                <div className="evaluate-buttons">
                  <button type="button" className="btn btn-quiet" onClick={() => setConfirmEnd(false)}>Keep it</button>
                  <button type="button" className="btn btn-outline" disabled={update.isPending} onClick={() => run('end')}>End application</button>
                </div>
              </div>
            ) : (
              <div className="evaluate-buttons">
                <button type="button" className="btn btn-outline" disabled={update.isPending} onClick={() => setConfirmEnd(true)}>End application</button>
                <button type="button" className="btn btn-primary" disabled={update.isPending} onClick={() => run('next')}>{nextLabel}</button>
              </div>
            )}
            {!decided && app.step === 'final' && <p className="small muted">Selecting {first} makes them a club member.</p>}
          </section>
        </aside>
      </div>
    </Page>
  );
}
