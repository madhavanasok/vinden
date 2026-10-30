import { useId, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { OptionCards, TextField } from '../../components/Forms';
import { ActionBar } from '../../components/Layout';
import { Gate, Page } from '../../components/Page';
import { DOMAINS, useCreateCommunity, type NewCommunity } from './api';
import './community.css';

/**
 * FN-08-I04 Create a community: name, domain, open or closed. The creator becomes its admin and first member.
 * Vinden creates the platform communities, so these are always people's own.
 * Open question R-14: who can create one isn't settled; any personal account can.
 */
export function CreateCommunity() {
  return (
    <Gate allow={(me) => me.account === 'person'} who="people with a personal Vinden account">
      <CreateForm />
    </Gate>
  );
}

function CreateForm() {
  const create = useCreateCommunity();
  const navigate = useNavigate();
  const formId = useId();
  const [c, setC] = useState<{ name: string; domain: string; access: NewCommunity['access'] | null; description: string }>({
    name: '', domain: '', access: null, description: '',
  });
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<typeof c>) => setC((v) => ({ ...v, ...patch }));
  const name = c.name.trim();
  const errors = {
    name: name.length < 3 ? 'Give it a name of at least 3 characters.' : undefined,
    domain: c.domain ? undefined : 'Choose a domain.',
    access: c.access ? undefined : 'Choose who can join.',
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.name || errors.domain || !c.access) return;
    create.mutate(
      { name, domain: c.domain, access: c.access, description: c.description.trim() },
      { onSuccess: (made) => navigate(`/communities/${made.slug}`) },
    );
  };
  const show = (error?: string) => (tried ? error : undefined);

  return (
    <Page
      title="Create a community"
      sub="People find it on Communities. You’ll run it: you post its updates and events, and approve requests if it’s closed."
      width="narrow"
      back="/communities"
    >
      <form id={formId} className="community-form" onSubmit={submit} noValidate>
        <TextField label="Name" value={c.name} onChange={(v) => set({ name: v })} placeholder="For example, Pune Data Club" maxLength={60} error={show(errors.name)} />

        <DomainField value={c.domain} onChange={(domain) => set({ domain })} error={show(errors.domain)} />

        <OptionCards<NewCommunity['access']>
          legend="Who can join"
          name="access"
          value={c.access}
          onChange={(access) => set({ access })}
          error={show(errors.access)}
          options={[
            { value: 'open', title: 'Open', description: 'Anyone can join straight away.', icon: 'users' },
            { value: 'closed', title: 'Closed', description: 'People ask to join, and you approve them.', icon: 'lock' },
          ]}
        />

        <TextField
          label="Description (optional)"
          multiline
          value={c.description}
          onChange={(v) => set({ description: v })}
          maxLength={200}
          helper={`Shown on its card. ${200 - c.description.length} characters left.`}
        />

        {create.error && <p className="field-error" role="alert">{create.error.message}</p>}

        <div className="community-form-actions desktop-only">
          <Link to="/communities" className="btn btn-quiet">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={create.isPending}>Create community</button>
        </div>
      </form>

      <ActionBar>
        <Link to="/communities" className="btn btn-quiet">Cancel</Link>
        <button type="submit" form={formId} className="btn btn-primary grow" disabled={create.isPending}>Create community</button>
      </ActionBar>
    </Page>
  );
}

/** A labelled select in the Text field's style. People can make communities on any domain; this is a starting list. */
function DomainField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const id = useId();
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">Domain</label>
      <select
        id={id}
        className="field-input community-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-help` : undefined}
      >
        <option value="" disabled>Choose a domain</option>
        {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      {error && <p id={`${id}-help`} className="field-help">{error}</p>}
    </div>
  );
}
