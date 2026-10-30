import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useMe } from '../../api';
import { Page } from '../../components/Page';
import { ActionBar } from '../../components/Layout';
import { TextField } from '../../components/Forms';
import { InfoRow } from '../../components/Rows';
import { NEEDS, useSubmitProblem } from './api';
import { CompanyGate } from './shared';
import './training.css';

/**
 * FN-12-I02 Submit a problem statement: the problem and what the company needs back.
 * Open question R-24: how a problem reaches a club isn't described, so it starts with no club and a club's Core Team
 * takes it on. Open question R-19: pricing and payment are open, so there is no fee, team size or timeline here.
 */
export function SubmitProblem() {
  return (
    <CompanyGate>
      <SubmitForm />
    </CompanyGate>
  );
}

function SubmitForm() {
  const me = useMe().data;
  const submit = useSubmitProblem();
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (n: string) => setNeeds((list) => (list.includes(n) ? list.filter((x) => x !== n) : [...list, n]));

  const send = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (problem.trim().length < 10) next.problem = 'Describe the problem in a sentence or two.';
    if (!needs.length) next.needs = 'Choose what you need back.';
    setErrors(next);
    if (Object.keys(next).length) return;
    submit.mutate({ problem: problem.trim(), needs }, { onSuccess: ({ slug }) => navigate(`/problems?p=${slug}&submitted=1`) });
  };

  return (
    <Page
      title="Submit a problem statement"
      eyebrow={me?.company?.name ?? 'Your company'}
      back="/problems"
      width="narrow"
      sub="A real problem your company needs solved. A Vinden Club’s student team works on it, and the solution becomes their Proof of Work."
    >
      <form id="submit-problem" className="tr-form" onSubmit={send} noValidate aria-label="Submit a problem statement">
        <TextField
          label="The problem"
          value={problem}
          onChange={setProblem}
          multiline
          maxLength={2000}
          placeholder="Why has our customer acquisition cost risen among college users?"
          helper={errors.problem ? undefined : 'Start with the question you want answered, then add what you’ve seen so far.'}
          error={errors.problem}
        />
        <fieldset className="field">
          <legend className="field-label">What you need back</legend>
          {!errors.needs && <p className="field-help">Choose all that apply.</p>}
          <div className="chip-row">
            {NEEDS.map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={needs.includes(n)} onClick={() => toggle(n)}>{n}</button>
            ))}
          </div>
          {errors.needs && <p className="field-help field-error" role="alert">{errors.needs}</p>}
        </fieldset>

        <div className="tr-next">
          <h2 className="tr-block-title">What happens next</h2>
          <InfoRow icon="users" tone="lav" title="A club’s Industry & Outreach team picks it up" subtitle="They collect problem statements and coordinate requirements with you." />
          <InfoRow icon="briefcase" tone="lav" title="A student team works on it" subtitle="The club’s Core Team manages the project." />
          <InfoRow icon="trendingUp" tone="gold" title="Track it in your problem statements" subtitle="See its stage, then review the solution when it’s delivered." />
        </div>

        {submit.error && <p className="field-help field-error" role="alert">{submit.error.message}</p>}
        <div className="desktop-only">
          <button type="submit" className="btn btn-primary btn-lg" disabled={submit.isPending}>{submit.isPending ? 'Submitting…' : 'Submit'}</button>
        </div>
        <ActionBar>
          <button type="submit" form="submit-problem" className="btn btn-primary btn-lg grow" disabled={submit.isPending}>{submit.isPending ? 'Submitting…' : 'Submit'}</button>
        </ActionBar>
      </form>
    </Page>
  );
}
