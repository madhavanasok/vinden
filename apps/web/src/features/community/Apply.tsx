import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api';
import { ApplicantSteps } from '../../components/ApplicantSteps';
import { TextField } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { ActionBar } from '../../components/Layout';
import { Gate, Page } from '../../components/Page';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { SELECTION_STEPS, STEP_LABEL, useApply, useApplyInfo, type ApplyInfo } from './api';
import './community.css';

/**
 * FN-10-I01 Apply to a Vinden Club: recruitment is open, the motivation form, no fee. Submitting starts an application
 * at the motivation form step. Not part of sign-up. Visitors sign up first; company accounts can't apply.
 * Open questions R-27 and R-31: no year or college check. R-17: who writes the questions and how applicants hear back.
 */
export function Apply() {
  const { slug = '' } = useParams();
  return (
    <Gate allow={(me) => me.account === 'person'} who="students with a Vinden account. Sign up, then apply">
      <ApplyPage slug={slug} />
    </Gate>
  );
}

function ApplyPage({ slug }: { slug: string }) {
  const info = useApplyInfo(slug);
  if (info.isPending) return <Loading />;
  if (info.error) {
    return info.error instanceof ApiError && info.error.status === 404
      ? <NotFound message={info.error.message} />
      : <ErrorState error={info.error} onRetry={() => void info.refetch()} />;
  }
  const { club, member, otherClub, application } = info.data;
  const frame = (sub: string, children: ReactNode) => (
    <Page title={`Apply to ${club.name}`} eyebrow={club.college} sub={sub} back={`/clubs/${club.slug}`} width="narrow">
      {children}
    </Page>
  );

  if (member) {
    return frame('You’re already a member of this club.', (
      <div className="apply-done">
        <span className="pill pill-lav"><Icon name="check" size={14} strokeWidth={2.2} />You’re a member</span>
        <Link to={`/clubs/${club.slug}`} className="btn btn-primary">Go to your club</Link>
      </div>
    ));
  }
  if (otherClub) {
    return frame(`You’re already in ${otherClub.name}.`, (
      <div className="apply-done"><Link to={`/clubs/${otherClub.slug}`} className="btn btn-primary">Go to your club</Link></div>
    ));
  }
  if (application) return frame('Thanks for applying. Here’s where your application is.', <Applied info={info.data} />);
  if (!club.recruiting) {
    return frame('Recruitment isn’t open right now.', (
      <div className="apply-done">
        <p className="soft">Follow the club’s community to hear when it opens.</p>
        <Link to={`/clubs/${club.slug}#community`} className="btn btn-primary">See the club and its community</Link>
      </div>
    ));
  }
  return frame('Tell the Core Team why you want to join. It takes a few minutes.', <ApplyForm info={info.data} />);
}

const FACTS = [
  { icon: 'users' as const, text: 'Open to the whole college' },
  { icon: 'check' as const, text: 'No fee' },
  { icon: 'graduation' as const, text: 'About 30 students are selected' },
  { icon: 'sparkle' as const, text: 'Not on academic performance alone' },
];

function ApplyForm({ info }: { info: ApplyInfo }) {
  const apply = useApply(info.club.slug);
  const formId = useId();
  const [answers, setAnswers] = useState(() => info.questions.map(() => ''));
  const [tried, setTried] = useState(false);
  const missing = answers.map((a) => !a.trim());
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (missing.some(Boolean)) return;
    apply.mutate(answers.map((a) => a.trim()));
  };

  return (
    <>
      <p className="notice apply-open"><Icon name="check" size={18} strokeWidth={2.2} />Recruitment is open</p>
      <ul className="apply-facts">
        {FACTS.map((f) => <li key={f.text}><Icon name={f.icon} size={18} />{f.text}</li>)}
      </ul>

      <section className="page-section" aria-labelledby="steps-title">
        <h2 id="steps-title" className="section-title">How selection works</h2>
        <p className="section-sub">Selection can include these five steps. The Core Team runs them.</p>
        <ol className="apply-steps">
          {SELECTION_STEPS.map((s, i) => <li key={s}><span className="step-marker" aria-hidden="true">{i + 1}</span>{STEP_LABEL[s]}</li>)}
        </ol>
      </section>

      <form id={formId} className="page-section apply-form" onSubmit={submit} aria-labelledby="form-title" noValidate>
        <div>
          <h2 id="form-title" className="section-title">Motivation form</h2>
          <p className="section-sub">The first step. Answer in your own words; there are no right answers.</p>
        </div>
        {info.questions.map((q, i) => (
          <TextField
            key={q}
            label={q}
            multiline
            value={answers[i]}
            onChange={(v) => setAnswers((list) => list.map((a, j) => (j === i ? v : a)))}
            maxLength={2000}
            error={tried && missing[i] ? 'Answer this question to apply.' : undefined}
          />
        ))}
        <p className="small soft"><b>No fee.</b> Applying and membership are free.</p>
        {apply.error && <p className="field-error" role="alert">{apply.error.message}</p>}
        <div className="community-form-actions desktop-only">
          <Link to={`/clubs/${info.club.slug}`} className="btn btn-quiet">Cancel</Link>
          <button type="submit" className="btn btn-accent" disabled={apply.isPending}>Submit application</button>
        </div>
      </form>

      <ActionBar>
        <Link to={`/clubs/${info.club.slug}`} className="btn btn-quiet">Cancel</Link>
        <button type="submit" form={formId} className="btn btn-accent grow" disabled={apply.isPending}>Submit application</button>
      </ActionBar>
    </>
  );
}

function Applied({ info }: { info: ApplyInfo }) {
  const a = info.application!;
  return (
    <>
      <section className="page-section" aria-labelledby="status-title">
        <h2 id="status-title" className="section-title">
          {a.step === 'ended' ? 'Your application has ended' : a.step === 'selected' ? 'You’ve been selected' : `Current step: ${STEP_LABEL[a.step]}`}
        </h2>
        {/* Open question R-17: how applicants hear back at each step isn't settled; this page shows where they are. */}
        <p className="section-sub">The Core Team moves applications through each step. Check back here to see where yours is.</p>
        <ApplicantSteps step={a.step} label="Your application’s steps" />
      </section>
      <section className="page-section" aria-labelledby="answers-title">
        <h2 id="answers-title" className="section-title">Your motivation form</h2>
        <dl className="apply-answers">
          {a.answers.map((x) => <div key={x.q}><dt>{x.q}</dt><dd>{x.a}</dd></div>)}
        </dl>
      </section>
      <div className="apply-done">
        <Link to={`/clubs/${info.club.slug}`} className="btn btn-outline">Back to the club</Link>
      </div>
    </>
  );
}
