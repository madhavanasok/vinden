import { useId, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError, timeAgo, useJoinCommunity, useMe, type Me } from '../../api';
import { Avatar, Logo } from '../../components/Bits';
import type { CoverTone } from '../../components/Cover';
import { TextField } from '../../components/Forms';
import { Icon, type IconName } from '../../components/Icon';
import { EmptyState, Page, TabRow } from '../../components/Page';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { useAddPost, useCommunity, type CommunityDetail, type CommunityPost, type NewPost } from './api';
import './community.css';

/**
 * FN-08-I02 Community page: name, open or closed, kind and members, the Join action, and its Updates and Events.
 * A club's community carries the club's public news ahead of recruitment; following it isn't membership.
 * The admin posts updates and events, and (for a closed community) answers join requests.
 */
export function CommunityPage() {
  const { slug = '' } = useParams();
  const community = useCommunity(slug);
  const me = useMe();
  if (community.isPending) return <Loading />;
  if (community.error) {
    return community.error instanceof ApiError && community.error.status === 404
      ? <NotFound message={community.error.message} />
      : <ErrorState error={community.error} onRetry={() => void community.refetch()} />;
  }
  return <CommunityView c={community.data} me={me.data} />;
}

type Tab = 'updates' | 'events';

function CommunityView({ c, me }: { c: CommunityDetail; me?: Me }) {
  const [tab, setTab] = useState<Tab>('updates');
  const [composing, setComposing] = useState(false);
  const updates = c.posts?.filter((p) => p.kind === 'update') ?? [];
  const events = c.posts?.filter((p) => p.kind === 'event') ?? [];
  const closed = c.access === 'closed';
  const kind = c.kind === 'club' ? 'Club community' : c.platform ? 'Vinden community' : 'Community';

  const actions = (
    <>
      <JoinButton c={c} me={me} />
      {c.isAdmin && closed && (
        <Link to={`/communities/${c.slug}/requests`} className="btn btn-outline">
          Join requests{c.requests > 0 && <span className="tab-count">{c.requests}</span>}
        </Link>
      )}
    </>
  );

  return (
    <Page title={c.name} eyebrow={kind} sub={c.description} actions={actions} back="/communities">
      <div className="community-facts">
        <span className="community-facts-tile" style={{ background: `var(--cover-${c.tone as CoverTone}-bg)`, color: `var(--cover-${c.tone as CoverTone}-ink)` }} aria-hidden="true">
          {c.kind === 'club' ? <Logo size={36} /> : <Icon name={(c.icon ?? 'users') as IconName} size={22} />}
        </span>
        <span className="pill pill-muted">
          {closed && <Icon name="lock" size={14} strokeWidth={2} />}
          {closed ? 'Closed' : 'Open'}
        </span>
        <span className="soft">{c.members.toLocaleString('en-IN')} members</span>
        {c.domain && <span className="soft">· {c.domain}</span>}
        {c.admin && <span className="soft">· Run by <Link to={`/people/${c.admin.handle}`}>{c.isAdmin ? 'you' : c.admin.name}</Link></span>}
      </div>

      <div className="community-layout">
        <div className="community-main">
          {c.isAdmin && (composing
            ? <Composer slug={c.slug} kind={tab === 'events' ? 'event' : 'update'} onDone={(k) => { setComposing(false); if (k) setTab(k === 'event' ? 'events' : 'updates'); }} />
            : (
              <div className="community-admin-bar">
                <span className="small soft">You run this community.</span>
                {/* Open question R-14: who can post isn't settled, so only the admin can. */}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setComposing(true)}>
                  <Icon name="plus" size={16} strokeWidth={2} />
                  Post an update or event
                </button>
              </div>
            ))}

          {c.posts === null ? (
            <EmptyState
              icon="lock"
              title="Posts are for members"
              body={c.status === 'requested' ? 'You’ve asked to join. Once the admin approves, you’ll see its updates and events here.' : 'This community is closed. Request to join to see its updates and events.'}
            />
          ) : (
            <>
              <TabRow<Tab>
                label="Community posts"
                tabs={[{ key: 'updates', label: 'Updates', count: updates.length }, { key: 'events', label: 'Events', count: events.length }]}
                value={tab}
                onChange={setTab}
              />
              {tab === 'updates' ? (
                updates.length
                  ? <ul className="community-posts" aria-label="Updates">{updates.map((p) => <li key={p.id}><UpdatePost post={p} /></li>)}</ul>
                  : <EmptyState icon="file" title="No updates yet" body={c.isAdmin ? 'Post the first update for your members.' : 'Updates from the community will show here.'} />
              ) : events.length
                ? <ul className="community-posts" aria-label="Events">{events.map((p) => <li key={p.id}><EventPost post={p} /></li>)}</ul>
                : <EmptyState icon="calendar" title="No events yet" body={c.isAdmin ? 'Post an event to let members know.' : 'Events from the community will show here.'} />}
            </>
          )}
        </div>

        <aside className="community-side">
          {c.club && <ClubPanel club={c.club} me={me} />}
          <section className="side-card" aria-labelledby="about-title">
            <h2 id="about-title" className="side-card-title">About</h2>
            <dl className="community-about">
              <div><dt>Who can join</dt><dd>{closed ? 'Anyone can ask; the admin approves' : 'Anyone, straight away'}</dd></div>
              <div><dt>Members</dt><dd>{c.members.toLocaleString('en-IN')}</dd></div>
              {c.domain && <div><dt>Domain</dt><dd>{c.domain}</dd></div>}
              {c.admin && (
                <div>
                  <dt>Admin</dt>
                  <dd><Link to={`/people/${c.admin.handle}`} className="community-admin"><Avatar person={c.admin} size={24} decorative />{c.admin.name}</Link></dd>
                </div>
              )}
              {c.platform && <div><dt>Run by</dt><dd>Vinden</dd></div>}
            </dl>
          </section>
        </aside>
      </div>
    </Page>
  );
}

/** Join and Joined (open), Request to join and Requested (closed); pressing again leaves or cancels. Visitors sign up. */
function JoinButton({ c, me }: { c: CommunityDetail; me?: Me }) {
  const join = useJoinCommunity();
  if (me?.account === 'visitor') return <Link to="/signup" className="btn btn-primary">Sign up to join</Link>;
  const on = c.status !== 'none';
  const label = c.status === 'joined' ? 'Joined' : c.status === 'requested' ? 'Requested' : c.access === 'closed' && !c.isAdmin ? 'Request to join' : 'Join';
  const icon: IconName = c.status === 'joined' ? 'check' : c.status === 'requested' ? 'clock' : c.access === 'closed' && !c.isAdmin ? 'lock' : 'plus';
  return (
    <>
      <button
        type="button"
        className={`btn ${on ? 'btn-quiet' : 'btn-primary'}`}
        aria-pressed={on}
        title={c.status === 'joined' ? 'Leave this community' : c.status === 'requested' ? 'Cancel your request' : undefined}
        disabled={join.isPending}
        onClick={() => join.mutate({ slug: c.slug, on: !on })}
      >
        <Icon name={icon} size={18} strokeWidth={2} />
        {label}
      </button>
      {join.error && <p className="field-error small" role="alert">{join.error.message}</p>}
    </>
  );
}

function ClubPanel({ club, me }: { club: NonNullable<CommunityDetail['club']>; me?: Me }) {
  const canApply = club.recruiting && !club.member && me?.account !== 'company';
  return (
    <section className="side-card community-club" aria-labelledby="club-title">
      <p className="eyebrow eyebrow-lav">{club.college}</p>
      <h2 id="club-title" className="side-card-title">{club.name}</h2>
      <p className="small soft">
        This is the club’s open community, for its news and events. Following it doesn’t make you a member: the club selects about 30 members through recruitment.
      </p>
      {club.member && <span className="pill pill-lav"><Icon name="check" size={14} strokeWidth={2.2} />You’re a member</span>}
      {club.recruiting && !club.member && <span className="pill pill-lav">Recruitment is open</span>}
      <div className="community-club-actions">
        <Link to={`/clubs/${club.slug}`} className="btn btn-outline btn-sm">Open the club page</Link>
        {canApply && <Link to={`/clubs/${club.slug}/apply`} className="btn btn-outline btn-sm">Apply to the club</Link>}
      </div>
    </section>
  );
}

function Byline({ post }: { post: CommunityPost }) {
  return (
    <p className="community-post-by small muted">
      {post.author ? <Link to={`/people/${post.author.handle}`}>{post.author.name}</Link> : 'Vinden'}
      {' · '}
      <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
    </p>
  );
}

function UpdatePost({ post }: { post: CommunityPost }) {
  return (
    <article className="community-post">
      <h3 className="community-post-title">{post.title}</h3>
      {post.body && <p className="community-post-body">{post.body}</p>}
      <Byline post={post} />
    </article>
  );
}

function EventPost({ post }: { post: CommunityPost }) {
  return (
    <article className="community-post community-event">
      <span className="tile tile-sm tile-flat tile-gold" aria-hidden="true"><Icon name="calendar" /></span>
      <div className="grow">
        <h3 className="community-post-title">{post.title}</h3>
        <p className="community-event-when">
          {post.when}
          {post.place && <> · <Icon name="pin" size={14} strokeWidth={2} />{post.place}</>}
        </p>
        {post.body && <p className="community-post-body">{post.body}</p>}
        <Byline post={post} />
      </div>
    </article>
  );
}

/** The admin's form for an update or an event. Events need a time; the place is optional. */
function Composer({ slug, kind: initial, onDone }: { slug: string; kind: NewPost['kind']; onDone: (posted?: NewPost['kind']) => void }) {
  const add = useAddPost(slug);
  const id = useId();
  const [post, setPost] = useState<NewPost>({ kind: initial, title: '', body: '', when: '', place: '' });
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<NewPost>) => setPost((p) => ({ ...p, ...patch }));
  const event = post.kind === 'event';
  const errors = {
    title: post.title.trim() ? undefined : event ? 'Name the event.' : 'Give the update a title.',
    when: !event || post.when.trim() ? undefined : 'Say when it is, for example Thu 6 Nov, 6 pm.',
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (errors.title || errors.when) return;
    add.mutate(post, { onSuccess: () => onDone(post.kind) });
  };
  return (
    <form className="community-composer" onSubmit={submit} aria-labelledby={`${id}-title`} noValidate>
      <h2 id={`${id}-title`} className="side-card-title">{event ? 'Post an event' : 'Post an update'}</h2>
      <fieldset className="community-kind">
        <legend className="visually-hidden">What you’re posting</legend>
        {(['update', 'event'] as const).map((k) => (
          <label key={k} className={`chip chip-sm${post.kind === k ? ' is-on' : ''}`}>
            <input type="radio" name={`${id}-kind`} className="visually-hidden" checked={post.kind === k} onChange={() => set({ kind: k })} />
            <Icon name={k === 'event' ? 'calendar' : 'file'} size={16} />
            {k === 'event' ? 'Event' : 'Update'}
          </label>
        ))}
      </fieldset>
      <TextField label={event ? 'Event name' : 'Title'} value={post.title} onChange={(title) => set({ title })} maxLength={120} error={tried ? errors.title : undefined} />
      {event && (
        <div className="community-composer-row">
          <TextField label="When" placeholder="Thu 6 Nov, 6 pm" value={post.when} onChange={(when) => set({ when })} maxLength={60} error={tried ? errors.when : undefined} />
          <TextField label="Where (optional)" placeholder="Seminar Hall 2, or Online" value={post.place} onChange={(place) => set({ place })} maxLength={80} />
        </div>
      )}
      <TextField label={event ? 'Details (optional)' : 'What’s new'} multiline value={post.body} onChange={(body) => set({ body })} maxLength={1000} />
      {add.error && <p className="field-error" role="alert">{add.error.message}</p>}
      <div className="community-composer-actions">
        <button type="button" className="btn btn-quiet" onClick={() => onDone()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={add.isPending}>{event ? 'Post event' : 'Post update'}</button>
      </div>
    </form>
  );
}
