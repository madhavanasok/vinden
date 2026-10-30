import { useState } from 'react';
import { Link } from 'react-router';
import { ApiError, useMe, useSwitchPersona } from '../../api';
import { Avatar } from '../../components/Bits';
import { Page, isVisitor } from '../../components/Page';
import { StepScreen } from '../../components/StepScreen';
import { Loading } from '../../pages/Placeholder';
import { useSignUp } from './api';
import { EmailField } from './fields';
import './onboarding.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FN-01-I01 Sign up: an email address, then straight to Home. No other questions, and never an offer to join a club;
 * the completion bar on Home asks the rest (FN-02-I02).
 * Open question R-01: how people confirm their email and sign in again. The demo signs the new person in at once.
 */
export function SignUp() {
  const me = useMe();
  const switchTo = useSwitchPersona();
  const signUp = useSignUp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [serverError, setServerError] = useState<string | null>(null);

  if (me.isPending) return <Loading />;

  if (me.data && !isVisitor(me.data)) {
    const m = me.data;
    const who = m.account === 'company' && m.company ? `${m.name}, for ${m.company.name}` : m.name;
    return (
      <Page title="You’re already signed in" width="narrow">
        <div className="signed-in">
          <Avatar person={m} size={48} decorative />
          <p className="grow">You’re signed in as <b>{who}</b>.</p>
          <Link to="/" className="btn btn-primary">Go to Home</Link>
        </div>
        <p className="demo-note">
          <span className="demo-tag">Demo</span>
          To try sign-up, choose “Not signed in” in the demo bar at the top.
        </p>
      </Page>
    );
  }

  const submit = () => {
    setServerError(null);
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError(value ? 'Enter an email address like name@example.com.' : 'Enter your email address.');
      return;
    }
    setError(undefined);
    signUp.mutate(value, {
      onSuccess: ({ handle }) => switchTo(handle, '/'),
      onError: (e) => {
        if (e instanceof ApiError && e.status === 422) setError(e.message);
        else setServerError(`We couldn’t sign you up: ${e.message}. Try again.`);
      },
    });
  };

  return (
    <StepScreen
      title="Sign up"
      sub="Just your email address to start. You can add the rest later, from Home."
      primary={{ label: 'Continue', busyLabel: 'Signing you up…', busy: signUp.isPending }}
      error={serverError}
      onSubmit={submit}
    >
      <EmailField label="Email address" value={email} onChange={(v) => { setEmail(v); setError(undefined); }} error={error} autoFocus />
      <p className="signup-alt">
        Signing up a company? <Link to="/companies/register" className="link">Register your company</Link>
      </p>
    </StepScreen>
  );
}
