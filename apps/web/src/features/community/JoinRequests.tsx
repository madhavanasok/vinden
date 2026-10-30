import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api';
import { Icon } from '../../components/Icon';
import { EmptyState, Gate, Page, isVisitor } from '../../components/Page';
import { PersonRow } from '../../components/Rows';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { useAnswerRequest, useJoinRequests, type JoinRequests as Data } from './api';
import './community.css';

/**
 * FN-08-I03 Join requests: who asked to join a closed community, for its admin only. Approve (they join, members + 1)
 * or Decline. Open question R-14: who approves isn't settled, so it is the community's admin.
 */
export function JoinRequests() {
  const { slug = '' } = useParams();
  return (
    <Gate allow={(me) => !isVisitor(me)} who="the community’s admin">
      <RequestsPage slug={slug} />
    </Gate>
  );
}

function RequestsPage({ slug }: { slug: string }) {
  const data = useJoinRequests(slug);
  if (data.isPending) return <Loading />;
  if (data.error) {
    if (data.error instanceof ApiError && data.error.status === 404) return <NotFound message={data.error.message} />;
    if (data.error instanceof ApiError && data.error.status === 403) {
      return (
        <div className="state" role="status">
          <span className="tile tile-lav" aria-hidden="true"><Icon name="lock" /></span>
          <h1 className="state-title display">Only the admin sees join requests</h1>
          <p className="soft">This community’s admin approves who joins.</p>
          <Link to={`/communities/${slug}`} className="btn btn-outline">Back to the community</Link>
        </div>
      );
    }
    return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  }
  return <RequestsView slug={slug} data={data.data} />;
}

function RequestsView({ slug, data }: { slug: string; data: Data }) {
  const answer = useAnswerRequest(slug);
  const [done, setDone] = useState('');
  const { community: c, requests } = data;
  const act = (handle: string, name: string, approve: boolean) =>
    answer.mutate({ handle, approve }, {
      onSuccess: (next) => setDone(approve
        ? `${name} joined. ${c.name} now has ${next.community.members.toLocaleString('en-IN')} members.`
        : `You declined ${name}’s request.`),
    });

  return (
    <Page
      title="Join requests"
      eyebrow={c.name}
      sub={`People who asked to join ${c.name}. Approve them to let them in, or decline.`}
      back={`/communities/${slug}`}
      width="narrow"
      actions={<Link to={`/communities/${slug}`} className="btn btn-outline">Back to the community</Link>}
    >
      <p className="visually-hidden" role="status">{done}</p>
      {done && <p className="notice" aria-hidden="true"><Icon name="check" size={18} strokeWidth={2.2} />{done}</p>}
      {answer.error && <p className="field-error request-error" role="alert">{answer.error.message}</p>}

      <section className="page-section" aria-labelledby="requests-title">
        <div className="section-head">
          <h2 id="requests-title" className="section-title">Waiting <span className="tab-count">{requests.length}</span></h2>
        </div>
        {requests.length ? (
          <ul className="request-list">
            {requests.map((p) => (
              <li key={p.handle}>
                <PersonRow
                  person={p}
                  line={p.line}
                  trailing={
                    <span className="request-actions">
                      <Link to={`/people/${p.handle}`} className="btn btn-quiet btn-sm" aria-label={`View ${p.name}’s profile`}>Profile</Link>
                      <button type="button" className="btn btn-outline btn-sm" aria-label={`Decline ${p.name}`} disabled={answer.isPending} onClick={() => act(p.handle, p.name, false)}>
                        Decline
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" aria-label={`Approve ${p.name}`} disabled={answer.isPending} onClick={() => act(p.handle, p.name, true)}>
                        Approve
                      </button>
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="users" title="No requests waiting" body="When someone asks to join, they show up here." />
        )}
      </section>
    </Page>
  );
}
