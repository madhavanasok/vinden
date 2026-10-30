import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api';
import { Avatar } from '../../components/Bits';
import { Icon } from '../../components/Icon';
import { Brand } from '../../components/Layout';
import { ErrorState, Loading } from '../../pages/Placeholder';
import { useConfirmation, useConfirmRole, type Confirmation } from './api';
import './onboarding.css';

/**
 * FN-03-I02 Confirm a past role: a manager opens this from the email, without signing in, so it has no app chrome.
 * Shows who is asking and the role they claim; Confirm marks the role verified on their profile.
 * Open question R-08: what happens if a manager doesn't confirm. There's no "decline" until that's decided.
 */
export function ConfirmRole() {
  const { token = '' } = useParams();
  const confirmation = useConfirmation(token);
  const confirm = useConfirmRole(token);

  let body: ReactNode;
  if (confirmation.isPending) body = <Loading />;
  else if (confirmation.isError) {
    body = confirmation.error instanceof ApiError && confirmation.error.status === 404
      ? (
        <Card icon="link" title="This link doesn’t work">
          <p>It may be incomplete, or the role may have been removed. Ask the person who added the role to send it again.</p>
        </Card>
      )
      : <ErrorState error={confirmation.error} onRetry={() => void confirmation.refetch()} />;
  } else if (confirmation.data.status === 'verified') {
    body = <Done c={confirmation.data} justNow={confirm.isSuccess} />;
  } else {
    const c = confirmation.data;
    const first = c.person.name.split(' ')[0];
    body = (
      <article className="confirm-card" aria-labelledby="confirm-title">
        <div>
          <p className="eyebrow">Confirm a past role</p>
          <h1 id="confirm-title" className="confirm-title display">Did {first} work with you?</h1>
        </div>
        <div className="confirm-claim">
          <Avatar person={c.person} size={48} decorative />
          <p>
            <b>{c.person.name}</b> says they worked as <b>{c.role}</b> at <b>{c.company}</b>{c.period ? ` (${c.period})` : ''}, and gave your email as their manager’s.
          </p>
        </div>
        <p className="soft">If that’s right, confirm it. Their Vinden profile will show the role as confirmed by their manager. You don’t need an account.</p>
        {confirm.isError && (
          <p className="step-error" role="alert">
            <Icon name="info" />
            <span>{confirm.error.message}</span>
          </p>
        )}
        <div className="button-row">
          <button type="button" className="btn btn-accent btn-lg" disabled={confirm.isPending} onClick={() => confirm.mutate()}>
            {confirm.isPending ? 'Confirming…' : 'Confirm this role'}
          </button>
        </div>
        <p className="confirm-foot">If this isn’t right, you can close this page. Nothing changes unless you confirm.</p>
      </article>
    );
  }

  return (
    <div className="confirm-page">
      <header className="confirm-top">
        <div className="container"><Brand size={34} /></div>
      </header>
      <main id="main" className="container confirm-main">{body}</main>
    </div>
  );
}

function Done({ c, justNow }: { c: Confirmation; justNow: boolean }) {
  const first = c.person.name.split(' ')[0];
  return (
    <Card icon="check" title={justNow ? 'Thank you. The role is confirmed' : 'This role is already confirmed'}>
      <p>
        {first}’s profile shows <b>{c.role}</b> at <b>{c.company}</b> as confirmed by their manager.
        {!justNow && ' There’s nothing more to do.'}
      </p>
      <div className="button-row">
        <Link to={`/people/${c.person.handle}`} className="btn btn-outline">See {first}’s profile</Link>
      </div>
    </Card>
  );
}

function Card({ icon, title, children }: { icon: 'check' | 'link'; title: string; children: ReactNode }) {
  return (
    <article className="confirm-card" role="status" aria-labelledby="confirm-title">
      <span className={`tile ${icon === 'check' ? 'tile-blue' : 'tile-gold'}`} aria-hidden="true"><Icon name={icon} size={24} /></span>
      <h1 id="confirm-title" className="confirm-title display">{title}</h1>
      {children}
    </article>
  );
}
