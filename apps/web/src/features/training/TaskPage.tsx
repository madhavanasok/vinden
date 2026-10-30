import { Link, Navigate, useParams } from 'react-router';
import { Page } from '../../components/Page';
import { Icon } from '../../components/Icon';
import { InfoRow } from '../../components/Rows';
import { NotFound } from '../../pages/Placeholder';
import { ApiError } from '../../api';
import { useTrainingItem, type TrainingDetail } from './api';
import { ClubGate, DockBar, itemHref, plural, QueryState, WorkStatusPill } from './shared';
import './training.css';

/**
 * FN-11-I03 Project or task: what it asks, the skill it builds, and Post your Proof of Work, which is how club work gets
 * done. If you've already posted work for it, its verification status instead.
 * Open question R-40: whether club tasks have due dates, so none is shown. R-18: which parts of training run in the app.
 */
export function TaskPage() {
  return (
    <ClubGate>
      <Task />
    </ClubGate>
  );
}

function Task() {
  const { id = '' } = useParams();
  const q = useTrainingItem(id);
  if (q.error instanceof ApiError && q.error.status === 404) return <NotFound message="There’s nothing in your club’s training plan at this link." />;
  if (!q.data) return <QueryState query={q} />;
  const { item } = q.data;
  if (item.kind === 'path') return <Navigate to={`/club/learning/${item.id}`} replace />;
  if (item.kind === 'session') return <Navigate to={itemHref(item)} replace />;
  return <TaskView data={q.data} />;
}

function TaskView({ data }: { data: TrainingDetail }) {
  const { item, myWork, related, club } = data;
  const noun = item.kind === 'project' ? 'project' : 'task';
  const path = related.find((r) => r.kind === 'path');
  const practice = related.filter((r) => r.kind === 'project' || r.kind === 'task');
  const postHref = `/post?task=${item.id}`;

  const action = myWork ? (
    <Link to={`/work/${myWork.slug}`} className="btn btn-primary btn-lg btn-block">View your Proof of Work</Link>
  ) : (
    <Link to={postHref} className="btn btn-accent btn-lg btn-block">
      <Icon name="plus" size={18} strokeWidth={2} />
      Post your Proof of Work
    </Link>
  );

  return (
    <Page title={item.title} eyebrow={`Club ${noun} · ${club.name}`} back={`/club/training?tab=${item.kind}`}>
      <div className="tr-detail">
        <div className="tr-detail-main">
          <p className="tr-tags">
            <span className="badge">Club {noun}</span>
            {item.skill && <span className="tr-skill">{item.skill}</span>}
          </p>

          <section className="tr-block" aria-labelledby="asks">
            <h2 id="asks" className="tr-block-title">What it asks</h2>
            <p className="tr-prose">{item.body}</p>
          </section>

          <section className="tr-block" aria-labelledby="done">
            <h2 id="done" className="tr-block-title">How it gets done</h2>
            <ol className="tr-steps">
              <li><b>Do the work</b><span>On your own, or with teammates from your club.</span></li>
              <li><b>Post your Proof of Work</b><span>What you made, who did what, and your files. Posting is how this {noun} gets done.</span></li>
              <li><b>Get it verified</b><span>Your club reviews it before it shows as verified on your profile.</span></li>
            </ol>
          </section>

          {(path || practice.length > 0) && (
            <section className="tr-block" aria-labelledby="skill">
              <h2 id="skill" className="tr-block-title">More for {item.skill}</h2>
              <div className="tr-links">
                {path && (
                  <Link to={itemHref(path)} className="aside-card tr-link-card">
                    <span className="tile tile-sm tile-flat tile-lav" aria-hidden="true"><Icon name="graduation" /></span>
                    <span className="grow">
                      <b className="block">{path.title} learning path</b>
                      <span className="small soft">{plural(path.resources.length, 'curated resource')}</span>
                    </span>
                    <Icon name="chevronRight" />
                  </Link>
                )}
                {practice.map((r) => (
                  <Link key={r.id} to={itemHref(r)} className="aside-card tr-link-card">
                    <span className="tile tile-sm tile-flat tile-blue" aria-hidden="true"><Icon name={r.kind === 'project' ? 'briefcase' : 'file'} /></span>
                    <span className="grow">
                      <b className="block">{r.title}</b>
                      <span className="small soft">Club {r.kind}</span>
                    </span>
                    <Icon name="chevronRight" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="tr-detail-side" aria-label="Your Proof of Work">
          <div className="side-card tr-side-card">
            {myWork ? (
              <>
                <h2 className="side-card-title">Your Proof of Work</h2>
                <WorkStatusPill status={myWork.status} />
                <Link to={`/work/${myWork.slug}`} className="tr-work-link">{myWork.title}</Link>
                {myWork.status === 'changes' && myWork.feedback && (
                  <div className="tr-feedback">
                    <b className="block">Feedback from your club</b>
                    <p>{myWork.feedback}</p>
                  </div>
                )}
                <p className="small soft">
                  {myWork.status === 'in_review' && 'Your club is reviewing it.'}
                  {myWork.status === 'changes' && 'Make the changes on your work, then it goes back for review.'}
                  {myWork.status === 'published' && `This ${noun} is done.`}
                </p>
              </>
            ) : (
              <>
                <h2 className="side-card-title">Post your Proof of Work</h2>
                <p className="small soft">When you’ve done the work, post it. Posting is how this {noun} gets done, and it goes for verification.</p>
              </>
            )}
            <div className="desktop-only tr-side-action">{action}</div>
            <InfoRow
              icon="users"
              tone="lav"
              title={item.posted ? `${plural(item.posted, 'member')} posted` : 'Nobody has posted yet'}
              subtitle={item.posted ? `Work for this ${noun} so far` : `Be the first in ${club.name}`}
            />
          </div>
        </aside>
      </div>

      <DockBar>{action}</DockBar>
    </Page>
  );
}
