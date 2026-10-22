import { Link, useNavigate, useParams } from 'react-router';
import { ApiError, useMe, useProfile, type Profile } from '../api';
import { Avatar } from '../components/Bits';
import { WorkCard } from '../components/Cards';
import { Icon, type IconName } from '../components/Icon';
import { ErrorState, Loading, NotFound } from './Placeholder';

export function ProfilePage() {
  const { handle = '' } = useParams();
  const profile = useProfile(handle);
  const me = useMe();
  const navigate = useNavigate();

  if (profile.isPending) return <Loading />;
  if (profile.isError) {
    if (profile.error instanceof ApiError && profile.error.status === 404) return <NotFound message={profile.error.message} />;
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  }
  const p = profile.data;
  const own = me.data?.handle === p.handle;

  return (
    <div className="profile-page">
      <div className="profile-topbar mobile-only">
        <button type="button" className="icon-btn bare" aria-label="Back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          <Icon name="chevronLeft" size={22} strokeWidth={2} />
        </button>
        <span className="topbar-title">{own ? 'Your profile' : 'Profile'}</span>
        <button type="button" className="icon-btn bare" aria-label="Share profile">
          <Icon name="share" />
        </button>
      </div>

      <div className="container profile-layout">
        <aside className="profile-side">
          <section className="profile-card" aria-labelledby="profile-name">
            <div className="profile-id">
              <Avatar person={p} size={112} ring />
              <div className="profile-names">
                <div className="name-row">
                  <h1 id="profile-name" className="profile-name display">{p.name}</h1>
                  <svg width="22" height="22" viewBox="0 0 24 24" role="img" aria-label="Identity verified" className="icon">
                    <circle cx="12" cy="12" r="10" fill="#1565D8" />
                    <path d="m7.5 12.2 3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="soft">{p.headline}</p>
                <p className="small muted">{p.joined ? `Joined ${p.joined} · ` : ''}{p.stats.works} verified {p.stats.works === 1 ? 'work' : 'works'}</p>
              </div>
            </div>
            {p.bio && <p className="profile-bio">{p.bio}</p>}
            <div className="info-rows">
              {p.location && <span><Icon name="pin" />{p.location}</span>}
              {p.clubRole && <span><Icon name="users" />{p.clubRole}</span>}
              {p.website && <span><Icon name="link" /><a href="#" className="link">{p.website}</a></span>}
            </div>
            <div className="button-row profile-actions">
              {own ? (
                <>
                  <Link to="/post" className="btn btn-primary">Post work</Link>
                  <button type="button" className="btn btn-outline">Edit profile</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary">Follow</button>
                  <button type="button" className="btn btn-outline">Message</button>
                </>
              )}
            </div>
            <dl className="stats">
              <div><dt>Verified works</dt><dd className="display">{p.stats.works}</dd></div>
              <div><dt>Vouches</dt><dd className="display">{p.stats.vouches}</dd></div>
              <div><dt>Roles verified</dt><dd className="display">{p.stats.rolesVerified}</dd></div>
            </dl>
          </section>

          {p.milestones.length > 0 && (
            <section className="milestones" aria-labelledby="milestones-title">
              <div className="row-between">
                <h2 id="milestones-title" className="card-heading display">Recent milestones</h2>
                <a href="#" className="link small">View all</a>
              </div>
              <ul>
                {p.milestones.map((m) => (
                  <li key={m.title}>
                    <span className={`badge-circle tile-${m.tone}`}><Icon name={m.icon as IconName} size={22} /></span>
                    <span>
                      <b className="block">{m.title}</b>
                      <span className="small muted">{m.sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <div className="profile-main">
          <nav aria-label="Profile sections" className="tabs tabs-flush desktop-only">
            <a href="#work" className="active">Work ({p.stats.works})</a>
            <a href="#experience">Experience</a>
            <a href="#journey">Journey</a>
          </nav>

          <section id="work" className="profile-section" aria-labelledby="work-title">
            <div className="row-between wrap">
              <h2 id="work-title" className="sub-title">Verified work</h2>
              {p.works.length > 1 && <span className="small muted">Sorted by vouch weight</span>}
            </div>
            {p.works.length ? (
              <div className="grid-works">
                {p.works.map((w) => <WorkCard key={w.slug} work={w} owner />)}
              </div>
            ) : (
              <Empty
                text={own ? 'No verified work yet. Post a project and send it for verification to start your portfolio.' : 'No verified work yet.'}
                action={own ? { to: '/post', label: 'Post your first work' } : undefined}
              />
            )}
          </section>

          <section id="experience" className="profile-section" aria-labelledby="experience-title">
            <h2 id="experience-title" className="sub-title">Experience</h2>
            {p.experiences.length ? (
              <div className="experience-grid">
                {p.experiences.map((e) => <Experience key={e.role + e.company} e={e} />)}
              </div>
            ) : (
              <Empty text={own ? 'Add a role and confirm it with your manager, or privately with your offer letter.' : 'No roles added yet.'} />
            )}
          </section>

          <section id="journey" className="profile-section" aria-labelledby="journey-title">
            <h2 id="journey-title" className="sub-title">Journey</h2>
            <p className="serif-line">Not a profile. A journey.</p>
            {p.journey.length ? (
              <ol className="timeline">
                {p.journey.map((j, i) => (
                  <li key={j.month + j.title}>
                    <span className={`tl-dot${i === 0 ? ' tl-dot-sun' : ''}`} aria-hidden="true" />
                    <span className="small muted">{j.month}</span>
                    <b>{j.title}</b>
                    <span className="small soft">{j.sub}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty text="The journey starts with the first proof of work." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Experience({ e }: { e: Profile['experiences'][number] }) {
  const manager = e.verification === 'manager';
  return (
    <div className="experience">
      <span className="company-square" style={{ background: e.color }}>{e.initial}</span>
      <span className="grow">
        <b className="block display">{e.role}</b>
        <span className="block soft">{e.company}</span>
        <span className="block small muted">{e.period}</span>
        <span className={`pill ${manager ? 'pill-blue' : 'pill-lav'}`}>
          <Icon name={manager ? 'check' : 'lock'} size={14} strokeWidth={2.2} />
          {manager ? 'Manager confirmed' : 'Offer letter verified · private'}
        </span>
      </span>
    </div>
  );
}

function Empty({ text, action }: { text: string; action?: { to: string; label: string } }) {
  return (
    <div className="empty-card">
      <p className="soft">{text}</p>
      {action && <Link to={action.to} className="btn btn-primary btn-sm">{action.label}</Link>}
    </div>
  );
}
