import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError, timeAgo, useMe, type Work } from '../../api';
import { Avatar } from '../../components/Bits';
import { Cover, filesLabel } from '../../components/Cover';
import { TextField } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { Gate, isCore, Page } from '../../components/Page';
import { InfoRow } from '../../components/Rows';
import { AiResult, StatusPill } from '../../components/Status';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { useReview, useReviewAction } from './api';
import './work.css';

/**
 * FN-05-I03 Review a piece of work: the work and its club task, the AI result, who did what, feedback, Send feedback
 * and Verify. Core Team only, for their own club's work.
 */
export function ReviewWork() {
  return (
    <Gate allow={(me) => isCore(me)} who="a club’s Core Team, who review and verify members’ work">
      <Review />
    </Gate>
  );
}

function Review() {
  const { slug = '' } = useParams();
  const review = useReview(slug);
  if (review.isPending) return <Loading />;
  if (review.isError) {
    if (review.error instanceof ApiError && review.error.status === 404) return <NotFound message={review.error.message} />;
    return <ErrorState error={review.error} onRetry={() => void review.refetch()} />;
  }
  return <ReviewView w={review.data} />;
}

function ReviewView({ w }: { w: Work }) {
  const me = useMe();
  const act = useReviewAction(w.slug);
  const [feedback, setFeedback] = useState('');
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  // Open question R-10: who reviews the Core Team's own work isn't covered, so nobody reviews work they're on.
  const onTeam = w.team.some((m) => m.handle === me.data?.handle);
  const published = w.status === 'published';
  const locked = onTeam || published;
  const short = feedback.trim().length < 10;

  const sendFeedback = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (short) return;
    act.mutate({ action: 'feedback', feedback: feedback.trim() }, {
      onSuccess: () => {
        setDone('Feedback sent. The team sees it on their work, and it stays in your queue under Sent back.');
        setFeedback('');
        setTried(false);
      },
    });
  };
  const verify = () => act.mutate({ action: 'verify' }, { onSuccess: () => setDone('Verified. The work is published, so it shows on Explore and people can vouch for it.') });

  return (
    <Page
      title={w.title}
      eyebrow="Club review"
      sub={[w.kind, w.area, w.submittedAt ? `sent ${timeAgo(w.submittedAt)}` : null].filter(Boolean).join(' · ')}
      back="/club/review"
      actions={<StatusPill status={w.status} />}
    >
      {onTeam && !published && (
        <p className="notice notice-club" role="status">
          <Icon name="info" size={18} />
          You’re on this work’s team, so another Core Team member reviews it.
        </p>
      )}
      {done && <p className="notice notice-success" role="status"><Icon name="check" size={18} />{done}</p>}
      {published && !done && <p className="notice" role="status"><Icon name="check" size={18} />Verified{w.checks.club ? ` on ${w.checks.club}` : ''}. Nothing left to review.</p>}

      <div className="review-layout">
        <div className="review-main">
          <section className="review-card" aria-labelledby="work-title">
            <Cover
              variant={w.cover}
              image={w.images[0]}
              alt={w.images.length ? `${w.title}, image 1 of ${w.images.length}` : ''}
              title={w.title}
              kind={w.format ?? undefined}
              meta={filesLabel(w.files)}
              tone={w.coverTone}
              seed={w.slug}
            />
            <div className="review-card-body">
              <h2 id="work-title" className="sub-title">The work</h2>
              {w.brief && <InfoRow icon="briefcase" tone="gold" title={w.brief.title} subtitle={`Problem statement it answers${w.brief.company ? `, from ${w.brief.company}` : ''}`} />}
              {w.item ? (
                <InfoRow icon="users" tone="lav" title={w.item.title} subtitle={`Club ${w.item.kind} it completes`} />
              ) : w.brief ? null : (
                <InfoRow icon="users" tone="lav" title="Not linked to a club project or task" subtitle="Club work without a linked project or task" />
              )}
              {w.summary.map((p) => <p key={p} className="review-text">{p}</p>)}
              <h3 className="work-files-title">Files</h3>
              {w.fileList?.length ? (
                <ul className="file-list">
                  {w.fileList.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="file-row">
                      <span className="tile tile-xs tile-flat tile-blue" aria-hidden="true"><Icon name="file" size={18} /></span>
                      <b className="grow file-name">{f.name}</b>
                    </li>
                  ))}
                </ul>
              ) : <p className="small soft">{filesLabel(w.files)}{w.format ? ` · ${w.format}` : ''}</p>}
              <Link to={`/work/${w.slug}`} className="link small">Open the work page</Link>
            </div>
          </section>

          <section className="review-section" aria-labelledby="team-title">
            <h2 id="team-title" className="sub-title">Who did what</h2>
            <ul className="team-grid">
              {w.team.map((m) => (
                <li key={m.handle}>
                  <Link to={`/people/${m.handle}`} className="member">
                    <Avatar person={m} size={40} decorative />
                    <span className="grow">
                      <b className="block">{m.name}{m.handle === me.data?.handle && ' (you)'}</b>
                      <span className="small soft">{m.role || (w.team.length === 1 ? 'Solo work' : 'Part not written down')}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="review-side">
          <section className="side-card" aria-labelledby="ai-title">
            <h2 id="ai-title" className="side-card-title">AI result</h2>
            <p className="small soft">{w.checks.ai ? `Passed on ${w.checks.ai}.` : 'The AI check hasn’t run on this work.'} Trust signals from the files and the post:</p>
            <AiResult signals={w.ai.signals} />
          </section>

          <form className="side-card review-form" onSubmit={sendFeedback} noValidate aria-labelledby="feedback-title">
            <h2 id="feedback-title" className="side-card-title">Feedback</h2>
            {w.status === 'changes' && w.feedback && (
              <div className="review-sent">
                <span className="small muted">Already sent</span>
                <p className="small">{w.feedback}</p>
              </div>
            )}
            <TextField
              label={w.status === 'changes' ? 'More feedback for the team' : 'Feedback for the team'}
              multiline
              value={feedback}
              onChange={setFeedback}
              placeholder="What should they add or change?"
              helper="The team sees this on their work page."
              error={tried && short ? 'Write at least a sentence so the team knows what to change.' : undefined}
              maxLength={2000}
            />
            {act.error && <p className="field-help field-error" role="alert">{act.error.message}</p>}
            <div className="review-actions">
              <button type="submit" className="btn btn-outline btn-lg" disabled={locked || act.isPending}>Send feedback</button>
              <button type="button" className="btn btn-accent btn-lg desktop-only" disabled={locked || act.isPending} onClick={verify}>
                <Icon name="check" size={18} strokeWidth={2.2} />
                Verify
              </button>
            </div>
            {!locked && <p className="small muted">Verifying publishes the work on Explore and opens it to vouches.</p>}
          </form>
        </aside>
      </div>

      {!locked && (
        <div className="work-dock review-dock mobile-only">
          <a href="#feedback-title" className="btn btn-outline btn-lg">Feedback</a>
          <button type="button" className="btn btn-accent btn-lg grow" disabled={act.isPending} onClick={verify}>
            <Icon name="check" size={18} strokeWidth={2.2} />
            Verify
          </button>
        </div>
      )}
    </Page>
  );
}
