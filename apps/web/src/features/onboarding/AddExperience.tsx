import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ApiError, useMe } from '../../api';
import { OptionCards, TextField, UploadField, type Option, type PickedFile } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { Gate, Page } from '../../components/Page';
import { StepScreen } from '../../components/StepScreen';
import { useAddExperience, type NewExperience, type SentExperience } from './api';
import { EmailField } from './fields';
import './onboarding.css';

type Path = NewExperience['path'];

// Both paths are always offered (FN-03-I01).
const PATHS: Option<Path>[] = [
  { value: 'manager', title: 'Ask my manager', description: 'We email them to confirm', icon: 'user' },
  { value: 'offer_letter', title: 'Upload my offer letter', description: 'Private: never shown on your profile', icon: 'lock' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FN-03-I01 Add experience: the role, then one of two ways to verify it. The manager confirms from an emailed link
 * (FN-03-I02), or the person uploads their offer letter, which stays private, for people job-hunting quietly.
 * Open question R-08: who checks offer letters, and what happens if a manager doesn't confirm. Both stay pending.
 */
export function AddExperience() {
  return (
    <Gate allow={(me) => me.account === 'person'} who="people with a personal Vinden account">
      <AddExperienceForm />
    </Gate>
  );
}

function AddExperienceForm() {
  const [params] = useSearchParams();
  const fromSteps = params.get('from') === 'complete';
  const add = useAddExperience();
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [path, setPath] = useState<Path | null>(null);
  const [managerEmail, setManagerEmail] = useState('');
  const [letter, setLetter] = useState<PickedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentExperience | null>(null);

  if (sent) {
    return (
      <Sent
        sent={sent}
        fromSteps={fromSteps}
        onAnother={() => {
          setSent(null);
          setRole('');
          setCompany('');
          setPath(null);
          setManagerEmail('');
          setLetter([]);
        }}
      />
    );
  }

  const clear = (key: string) => setErrors((e) => ({ ...e, [key]: undefined }));
  const submit = () => {
    setServerError(null);
    const next = {
      role: role.trim().length < 2 ? 'Add your role, e.g. Marketing Intern.' : undefined,
      company: company.trim().length < 2 ? 'Add the organisation you worked at.' : undefined,
      path: path ? undefined : 'Choose how to verify this role.',
      managerEmail: path === 'manager' && !EMAIL.test(managerEmail.trim()) ? 'Enter your manager’s email, like name@company.com.' : undefined,
      letter: path === 'offer_letter' && !letter.length ? 'Add your offer letter.' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean) || !path) return;
    add.mutate(
      { role, company, path, managerEmail: path === 'manager' ? managerEmail.trim() : undefined, letter: path === 'offer_letter' ? letter[0] : null },
      {
        onSuccess: setSent,
        // A 422 says what to fix (e.g. the manager's email is your own); anything else is a failure to send.
        onError: (e) => setServerError(e instanceof ApiError && e.status === 422 ? e.message : `We couldn’t send it: ${e.message}`),
      },
    );
  };

  return (
    <StepScreen
      eyebrow="Experience"
      title="Add experience"
      sub="Add a role, then choose how to verify it. Verified roles show on your profile."
      back={fromSteps ? '/profile/complete/skills' : undefined}
      primary={{ label: 'Send for verification', busyLabel: 'Sending…', busy: add.isPending, accent: true }}
      error={serverError}
      onSubmit={submit}
    >
      <TextField label="Role" value={role} onChange={(v) => { setRole(v); clear('role'); }} placeholder="e.g. Marketing Intern" maxLength={80} error={errors.role} />
      <TextField label="Organisation" value={company} onChange={(v) => { setCompany(v); clear('company'); }} placeholder="e.g. Brewbox" maxLength={80} error={errors.company} />
      <OptionCards legend="How should we verify it?" name="verify" options={PATHS} value={path} onChange={(v) => { setPath(v); clear('path'); }} error={errors.path} />
      {path === 'manager' && (
        <EmailField
          label="Manager’s email"
          value={managerEmail}
          onChange={(v) => { setManagerEmail(v); clear('managerEmail'); }}
          autoComplete="off"
          placeholder="name@company.com"
          helper="We email them a link to confirm the role. They don’t need an account."
          error={errors.managerEmail}
        />
      )}
      {path === 'offer_letter' && (
        <>
          <UploadField
            label="Offer letter"
            files={letter}
            onAdd={(files) => { setLetter(files.slice(-1)); clear('letter'); }}
            onRemove={() => setLetter([])}
            error={errors.letter}
          />
          <p className="visibility-note">
            <span className="pill pill-lav"><Icon name="lock" size={14} strokeWidth={2} />Private</span>
            <span className="small soft">Only used to verify the role. Your profile never shows the letter, only that the role is verified.</span>
          </p>
        </>
      )}
    </StepScreen>
  );
}

function Sent({ sent, fromSteps, onAnother }: { sent: SentExperience; fromSteps: boolean; onAnother: () => void }) {
  const me = useMe();
  const manager = sent.verification === 'manager';
  return (
    <Page title="Sent for verification" eyebrow="Experience" width="narrow" back={fromSteps ? '/profile/complete/skills' : undefined}>
      <div className="sent-card" role="status">
        <span className="tile tile-blue" aria-hidden="true"><Icon name="shield" size={24} /></span>
        {manager ? (
          <p>
            We’ve emailed <b>{sent.managerEmail}</b> to confirm you worked as <b>{sent.role}</b> at <b>{sent.company}</b>.
            Until they do, your profile shows the role as waiting for your manager to confirm.
          </p>
        ) : (
          <p>
            Your offer letter for <b>{sent.role}</b> at <b>{sent.company}</b> is kept private.
            Until it’s checked, your profile shows the role as waiting for verification.
          </p>
        )}
        {sent.token && (
          <p className="demo-note">
            <span className="demo-tag">Demo</span>
            No email is sent in the demo. Open the link your manager would get:
            <Link to={`/confirm/${sent.token}`}>/confirm/{sent.token}</Link>
          </p>
        )}
        <div className="button-row">
          {fromSteps ? (
            <Link to="/profile/complete/skills" className="btn btn-primary">Back to your profile steps</Link>
          ) : (
            me.data && <Link to={`/people/${me.data.handle}`} className="btn btn-primary">View your profile</Link>
          )}
          <button type="button" className="btn btn-outline" onClick={onAnother}>Add another role</button>
        </div>
      </div>
    </Page>
  );
}
