import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { EmptyState, Page } from '../../components/Page';
import { Icon } from '../../components/Icon';
import { SessionCard } from '../../components/SessionCard';
import { useTraining, type TrainingItem } from './api';
import { ClubGate, QueryState } from './shared';
import './training.css';

/**
 * FN-11-I04 Sessions: alumni sessions and industry sessions, organised by the Core Team (PDF §3C, §3D).
 * Open question R-18: which parts of the training run in the app; sessions are listed here, held in person or online.
 */
export function Sessions() {
  return (
    <ClubGate>
      <SessionList />
    </ClubGate>
  );
}

function SessionList() {
  const plan = useTraining();
  const { hash } = useLocation();

  // The plan links to one session (#session-7): bring it into view once the list is there.
  useEffect(() => {
    if (plan.data && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [plan.data, hash]);

  if (!plan.data) return <QueryState query={plan} />;
  const { club, canEdit, items } = plan.data;
  const sessions = items.filter((i) => i.kind === 'session');
  const alumni = sessions.filter((s) => s.sessionType === 'alumni');
  const industry = sessions.filter((s) => s.sessionType === 'industry');
  const other = sessions.filter((s) => !s.sessionType);

  return (
    <Page
      title="Sessions"
      eyebrow={club.name}
      back="/club"
      sub="Alumni and industry sessions, organised by your club’s Core Team."
      actions={canEdit && (
        <Link to="/club/training?tab=session&add=1" className="btn btn-outline">
          <Icon name="plus" size={18} strokeWidth={2} />
          Add a session
        </Link>
      )}
    >
      <Group
        id="alumni"
        title="Alumni sessions"
        sub="Career journeys, the skills that matter and building a portfolio."
        sessions={alumni}
        empty="No alumni sessions planned yet."
      />
      <Group
        id="industry"
        title="Industry sessions"
        sub="A professional brings a real problem and guides you through solving it."
        sessions={industry}
        empty="No industry sessions planned yet."
      />
      {other.length > 0 && <Group id="other" title="Other sessions" sessions={other} empty="" />}
    </Page>
  );
}

function Group({ id, title, sub, sessions, empty }: { id: string; title: string; sub?: string; sessions: TrainingItem[]; empty: string }) {
  return (
    <section className="page-section" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <div>
          <h2 id={`${id}-title`} className="section-title">{title}</h2>
          {sub && <p className="section-sub">{sub}</p>}
        </div>
      </div>
      {sessions.length ? (
        <div className="tr-sessions">
          {sessions.map((s) => <SessionCard key={s.id} id={`session-${s.id}`} kind={s.sessionType} title={s.title} when={s.when} body={s.body} />)}
        </div>
      ) : (
        <EmptyState icon="calendar" title={empty} body="Your club’s Core Team announces sessions here." />
      )}
    </section>
  );
}
