import { Link } from 'react-router';
import { Avatar } from '../../components/Bits';
import { EmptyState, Gate, isCore, Page } from '../../components/Page';
import { StatusPill } from '../../components/Status';
import { ErrorState, Loading } from '../../pages/Placeholder';
import { useCompletion, type CompletionData } from './api';
import './work.css';

/**
 * FN-05-I04 Completion tracking: each club member against each club project and task, as posted, verified or not yet.
 * Posted work is linked to its project or task when it's posted (FN-04-I01).
 */
export function Completion() {
  return (
    <Gate allow={(me) => isCore(me)} who="a club’s Core Team, who track who has completed their work">
      <CompletionView />
    </Gate>
  );
}

function CompletionView() {
  const data = useCompletion();
  if (data.isPending) return <Loading />;
  if (data.isError) return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  const { club, items, members } = data.data;

  return (
    <Page
      title="Completion"
      eyebrow={club.name}
      sub="Each member against each club project and task: verified, posted and waiting for review, or not yet."
      back="/club"
      actions={<Link to="/club/review" className="btn btn-outline">Open the review queue</Link>}
    >
      {items.length === 0 || members.length === 0 ? (
        <EmptyState title="Nothing to track yet" body="Once the club has projects or tasks, each member’s progress on them shows here." action={<Link to="/club/training" className="btn btn-outline btn-sm">Open the training plan</Link>} />
      ) : (
        <>
          <Totals items={items} members={members} />
          <div className="completion-scroll" role="region" aria-label="Completion by member and task" tabIndex={0}>
            <table className="completion-table">
              <caption className="visually-hidden">Each club member’s status on each club project and task</caption>
              <thead>
                <tr>
                  <th scope="col" className="completion-member">Member</th>
                  {items.map((i) => (
                    <th key={i.id} scope="col">
                      <span className="completion-kind">{i.kind === 'project' ? 'Project' : 'Task'}</span>
                      <span className="completion-item" title={i.title}>{i.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.handle}>
                    <th scope="row" className="completion-member">
                      <Link to={`/people/${m.handle}`} className="completion-person">
                        <Avatar person={m} size={32} decorative />
                        <span>{m.name}</span>
                      </Link>
                    </th>
                    {m.cells.map((c) => {
                      const pill = <StatusPill status={c.state} />;
                      return (
                        <td key={c.itemId}>
                          {c.slug
                            ? <Link to={c.state === 'verified' ? `/work/${c.slug}` : `/club/review/${c.slug}`} className="completion-link">{pill}</Link>
                            : pill}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Page>
  );
}

/** How many members have verified work for each project and task. */
function Totals({ items, members }: Pick<CompletionData, 'items' | 'members'>) {
  const verified = (id: number) => members.filter((m) => m.cells.some((c) => c.itemId === id && c.state === 'verified')).length;
  const posted = (id: number) => members.filter((m) => m.cells.some((c) => c.itemId === id && c.state !== 'not_yet')).length;
  const all = members.length * items.length;
  const done = items.reduce((sum, i) => sum + verified(i.id), 0);
  const waiting = items.reduce((sum, i) => sum + posted(i.id), 0) - done;
  return (
    <p className="completion-totals" role="status">
      <b>{done}</b> of {all} verified · <b>{waiting}</b> posted and waiting · {members.length} members, {items.length} projects and tasks
    </p>
  );
}
