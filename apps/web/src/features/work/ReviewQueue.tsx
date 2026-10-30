import { Link } from 'react-router';
import { timeAgo } from '../../api';
import { Avatar } from '../../components/Bits';
import { CheckBadge, Icon } from '../../components/Icon';
import { EmptyState, Gate, isCore, Page } from '../../components/Page';
import { StatusPill } from '../../components/Status';
import { ErrorState, Loading } from '../../pages/Placeholder';
import { useReviewQueue, type QueueItem } from './api';
import './work.css';

/**
 * FN-05-I02 Review queue: club work waiting for review, with its AI result. A row opens the review.
 * The Core Team reviews and verifies (PDF §4); the Proof of Work & Quality team leads it. Each club reviews its own members.
 */
export function ReviewQueue() {
  return (
    <Gate allow={(me) => isCore(me)} who="a club’s Core Team, who review and verify members’ work">
      <Queue />
    </Gate>
  );
}

function Queue() {
  const queue = useReviewQueue();
  if (queue.isPending) return <Loading />;
  if (queue.isError) return <ErrorState error={queue.error} onRetry={() => void queue.refetch()} />;
  const { club, items } = queue.data;
  const waiting = items.filter((i) => i.status === 'in_review');
  const sentBack = items.filter((i) => i.status === 'changes');

  return (
    <Page
      title="Review queue"
      eyebrow={club.name}
      sub="Club work waiting for the Core Team. Each piece has been through the AI check; open one to review it."
      back="/club"
      actions={<Link to="/club/completion" className="btn btn-outline">See completion</Link>}
    >
      <section className="page-section" aria-labelledby="waiting-title">
        <div className="section-head">
          <h2 id="waiting-title" className="section-title">Waiting for review <span className="tab-count">{waiting.length}</span></h2>
        </div>
        {waiting.length ? <QueueList items={waiting} /> : (
          <EmptyState icon="check" title="Nothing waiting for review" body="Club work shows up here after its AI check, once a member links it to a club project or task." />
        )}
      </section>

      {sentBack.length > 0 && (
        <section className="page-section" aria-labelledby="sent-back-title">
          <div className="section-head">
            <div>
              <h2 id="sent-back-title" className="section-title">Sent back with feedback <span className="tab-count">{sentBack.length}</span></h2>
              <p className="section-sub">Waiting for the team. You can still open and verify them.</p>
            </div>
          </div>
          <QueueList items={sentBack} />
        </section>
      )}
    </Page>
  );
}

function QueueList({ items }: { items: QueueItem[] }) {
  return (
    <div className="review-table">
      <div className="review-head" aria-hidden="true">
        <span>Work</span>
        <span>Member</span>
        <span>Club task</span>
        <span>AI result</span>
      </div>
      <ul className="review-list">
        {items.map((w) => (
          <li key={w.slug}>
            <Link to={`/club/review/${w.slug}`} className="review-row">
              <span className="review-cell review-work">
                <b className="block review-title">{w.title}</b>
                <span className="small muted">
                  {w.submittedAt ? `Sent ${timeAgo(w.submittedAt)}` : 'Sent earlier'}
                  {w.onTeam && ' · You’re on this team'}
                </span>
                {w.feedback && <span className="small soft block review-feedback">Feedback: {w.feedback}</span>}
              </span>
              <span className="review-cell">
                <span className="review-label">Member</span>
                <span className="review-people">
                  {w.team.slice(0, 3).map((m) => <Avatar key={m.handle} person={m} size={28} decorative />)}
                  <span className="small">{w.team.map((m) => m.name.split(' ')[0]).join(', ')}</span>
                </span>
              </span>
              <span className="review-cell">
                <span className="review-label">Club task</span>
                <span className="small">
                  {w.item && <span className="block"><span className="muted">{w.item.kind === 'project' ? 'Project · ' : 'Task · '}</span>{w.item.title}</span>}
                  {w.brief && <span className="block"><span className="muted">Problem · </span>{w.brief.title}</span>}
                  {!w.item && !w.brief && <span className="muted">Not linked</span>}
                </span>
              </span>
              <span className="review-cell">
                <span className="review-label">AI result</span>
                {w.ai.date ? (
                  <span className="small review-ai">
                    <CheckBadge size={16} />
                    <span>
                      Passed · {w.ai.date}
                      {w.ai.flags > 0 && <span className="block muted">{w.ai.flags} {w.ai.flags === 1 ? 'thing' : 'things'} to look at</span>}
                    </span>
                  </span>
                ) : <StatusPill status="in_review" label="Not run" />}
              </span>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
