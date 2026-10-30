import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useMe, useSwitchPersona } from '../../api';
import { Page, isVisitor } from '../../components/Page';
import { ActionBar } from '../../components/Layout';
import { TextField } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { InfoRow } from '../../components/Rows';
import { Loading } from '../../pages/Placeholder';
import { useRegisterCompany } from './api';
import './training.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FN-12-I01 Register your company: company and contact, one account for the website and the app (PDF §6).
 * Open question R-37: whether a company account needs separate roles, such as admin and recruiter; this makes one account.
 */
export function RegisterCompany() {
  const me = useMe();
  if (me.isPending) return <Loading />;
  return (
    <Page
      title="Register your company"
      eyebrow="For companies"
      back="/"
      width="narrow"
      sub="Bring a real problem to a Vinden Club. A student team works on it, and the solution becomes their Proof of Work."
    >
      {isVisitor(me.data) ? <RegisterForm /> : <SignedIn />}
      <HowItWorks />
    </Page>
  );
}

/** Signed in already: a company account goes to its problems; a person's account is separate from a company's. */
function SignedIn() {
  const me = useMe().data!;
  if (me.account === 'company') {
    return (
      <div className="tr-form tr-signed-in">
        <InfoRow icon="building" tone="blue" title={`You’re signed in as ${me.company?.name ?? me.name}`} subtitle="Your company already has an account." />
        <div className="button-row">
          <Link to="/problems" className="btn btn-primary">See your problem statements</Link>
          <Link to="/problems/new" className="btn btn-outline">Submit a problem</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="tr-form tr-signed-in">
      <InfoRow icon="building" tone="blue" title="This is for companies" subtitle={`You’re signed in as ${me.name}. Company accounts are separate from personal ones: a company registers here, then submits problem statements.`} />
      <div className="button-row">
        <Link to="/" className="btn btn-outline">Back to Explore</Link>
      </div>
    </div>
  );
}

function RegisterForm() {
  const register = useRegisterCompany();
  const switchTo = useSwitchPersona();
  const emailId = useId();
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!company.trim()) next.company = 'Add your company’s name.';
    if (!name.trim()) next.name = 'Add your name.';
    if (!EMAIL.test(email.trim())) next.email = 'Add an email address, like name@company.com.';
    setErrors(next);
    if (Object.keys(next).length) return;
    // The demo has no passwords: once the account exists, the demo acts as it.
    register.mutate({ company: company.trim(), name: name.trim(), email: email.trim() }, { onSuccess: ({ handle }) => switchTo(handle, '/problems') });
  };

  return (
    <form id="register-company" className="tr-form" onSubmit={submit} noValidate aria-label="Register your company">
      <TextField label="Company name" value={company} onChange={setCompany} placeholder="e.g. Pebble Pay" maxLength={80} error={errors.company} />
      <TextField label="Your name" value={name} onChange={setName} maxLength={80} error={errors.name} helper={errors.name ? undefined : 'You’ll be the contact for your company’s problem statements.'} />
      <div className={`field${errors.email ? ' has-error' : ''}`}>
        <label htmlFor={emailId} className="field-label">Work email</label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          className="field-input"
          placeholder="name@company.com"
          maxLength={160}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-help` : undefined}
        />
        {errors.email && <p id={`${emailId}-help`} className="field-help">{errors.email}</p>}
      </div>
      <InfoRow icon="link" tone="blue" title="Works in the app too" subtitle="One account for the Vinden website and the app. Register once." />
      {register.error && <p className="field-help field-error" role="alert">{register.error.message}</p>}
      <div className="desktop-only">
        <button type="submit" className="btn btn-primary btn-lg" disabled={register.isPending}>{register.isPending ? 'Creating account…' : 'Create account'}</button>
      </div>
      <ActionBar>
        <button type="submit" form="register-company" className="btn btn-primary btn-lg grow" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </ActionBar>
    </form>
  );
}

/** The cycle from the operating model (PDF §5–§9), so a company knows what it's signing up for. */
function HowItWorks() {
  const steps: [string, string][] = [
    ['Submit a problem', 'A real question your company needs answered, and what you need back.'],
    ['A club takes it on', 'Its Industry & Outreach team coordinates requirements with you, and its Core Team manages the project.'],
    ['A student team solves it', 'Club members work on it and deliver the solution to you.'],
    ['It becomes Proof of Work', 'The team’s solution is posted and verified. You pay the club; Vinden takes no share.'],
  ];
  return (
    <section className="page-section" aria-labelledby="how">
      <h2 id="how" className="tr-block-title">How it works</h2>
      <ol className="tr-steps">
        {steps.map(([t, s]) => <li key={t}><b>{t}</b><span>{s}</span></li>)}
      </ol>
      <p className="tr-footnote">
        <Icon name="users" size={18} />
        <span>Looking for students’ work instead? <Link to="/explore" className="link">Explore verified work</Link> without signing in.</span>
      </p>
    </section>
  );
}
