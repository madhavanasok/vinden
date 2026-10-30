import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError, useMe, useProfile, type Profile } from '../api';
import { Avatar } from '../components/Bits';
import { WorkCard } from '../components/Cards';
import { CheckBadge, Icon, type IconName } from '../components/Icon';
import { isVisitor } from '../components/Page';
import { RoleStatus } from '../features/onboarding/RoleStatus';
import '../features/onboarding/onboarding.css';
import { ErrorState, Loading, NotFound } from './Placeholder';

const DESCRIBES: Record<NonNullable<Profile['describes']>, string> = {
  student: 'Student',
  professional: 'Early-career professional',
  founder: 'Founder',
  freelancer: 'Freelancer',
};

/** College and year for students, else their latest verified role; whichever exists if the other doesn't. */
function identityOf(p: Profile): { icon: IconName; text: string } | null {
  const study = p.college ? { icon: 'graduation' as const, text: [p.college, p.studyYear].filter(Boolean).join(' · ') } : null;
  const role = p.experiences.find((e) => e.status === 'verified');
  const work = role ? { icon: 'briefcase' as const, text: `${role.role} at ${role.company}` } : null;
  return p.describes === 'student' ? study ?? work : work ?? study;
}

type WorkFilter = 'all' | 'solo' | 'team';

const JOURNEY: Record<Profile['journey'][number]['kind'], { label: string; icon: IconName; tone: string }> = {
  project: { label: 'Project', icon: 'file', tone: 'tile-blue' },
  skill: { label: 'Skill', icon: 'sparkle', tone: 'tile-neutral' },
  milestone: { label: 'Milestone', icon: 'trophy', tone: 'tile-gold' },
};
const JOURNEY_SHOWN = 8;

/**
 * FN-02-I01 Profile: the person level of showcasing. Name; college and year, or experience; skills; verified work,
 * solo and team, with their part in team work; experience, verified or not; and the journey.
 * Open question R-07: what people can see without signing in. Profiles are public links, as before.
 */
export function ProfilePage() {
  const { handle = '' } = useParams();
  const profile = useProfile(handle);
  const me = useMe();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<WorkFilter>('all');
  const [allJourney, setAllJourney] = useState(false);
  const [shared, setShared] = useState(false);

  if (profile.isPending) return <Loading />;
  if (profile.isError) {
    if (profile.error instanceof ApiError && profile.error.status === 404) return <NotFound message={profile.error.message} />;
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  }
  const p = profile.data;
  const own = !isVisitor(me.data) && me.data?.handle === p.handle;
  const identity = identityOf(p);
  const headline = p.headline || (p.describes ? DESCRIBES[p.describes] : '');
  const solo = p.works.filter((w) => !w.team).length;
  const team = p.works.length - solo;
  const works = p.works.filter((w) => filter === 'all' || (filter === 'team') === w.team);
  const journey = allJourney ? p.journey : p.journey.slice(0, JOURNEY_SHOWN);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${p.name} on Vinden`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
      }
    } catch {
      // Cancelled, or the clipboard is blocked: nothing to undo.
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-topbar mobile-only">
        <button type="button" className="icon-btn bare" aria-label="Back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          <Icon name="chevronLeft" size={22} strokeWidth={2} />
        </button>
        <span className="topbar-title">{own ? 'Your profile' : 'Profile'}</span>
        <button type="button" className="icon-btn bare" aria-label={shared ? 'Profile link copied' : 'Share profile'} onClick={() => void share()}>
          <Icon name={shared ? 'check' : 'share'} />
        </button>
      </div>

      <div className="container profile-layout">
        <aside className="profile-side">
          <section className="profile-card" aria-labelledby="profile-name">
            <div className="profile-id">
              <Avatar person={p} size={112} ring />
              <div className="profile-names">
                <h1 id="profile-name" className="profile-name display">{p.name}</h1>
                {headline && <p className="soft">{headline}</p>}
                <p className="small muted">{p.joined ? `Joined ${p.joined} · ` : ''}{p.stats.works} verified {p.stats.works === 1 ? 'work' : 'works'}</p>
              </div>
            </div>
            {p.bio && <p className="profile-bio">{p.bio}</p>}
            <div className="info-rows">
              {identity && <span><Icon name={identity.icon} />{identity.text}</span>}
              {p.location && <span><Icon name="pin" />{p.location}</span>}
              {p.clubRole && <span><Icon name="users" />{p.clubRole}</span>}
              {p.website && <span><Icon name="link" />{p.website}</span>}
            </div>
            {/* Open question R-25: what someone can do after finding a person (save, shortlist, contact), so others see no actions yet. */}
            {own && (
              <div className="button-row profile-actions">
                <Link to="/post" className="btn btn-primary">Post work</Link>
                <Link to="/profile/complete/describe" className="btn btn-outline">Edit profile</Link>
              </div>
            )}
            <dl className="stats">
              <div><dt>Verified works</dt><dd className="display">{p.stats.works}</dd></div>
              <div><dt>Vouches</dt><dd className="display">{p.stats.vouches}</dd></div>
              <div><dt>Roles verified</dt><dd className="display">{p.stats.rolesVerified}</dd></div>
            </dl>
            <div className="profile-skills">
              <h2 className="card-heading display">Skills</h2>
              {p.skills.length ? (
                <>
                  <ul className="tag-row">
                    {p.skills.map((s) => (
                      <li key={s.name} className="tag">
                        {s.verified && <CheckBadge size={14} />}
                        {s.name}
                        {s.verified && <span className="visually-hidden">, shown in verified work</span>}
                      </li>
                    ))}
                  </ul>
                  {p.skills.some((s) => s.verified) && (
                    <p className="small muted skills-key" aria-hidden="true"><CheckBadge size={14} />Shown in verified work</p>
                  )}
                </>
              ) : own ? (
                <p className="small soft">No skills yet. <Link to="/profile/complete/skills" className="link">Add your skills</Link></p>
              ) : (
                <p className="small soft">No skills listed yet.</p>
              )}
              {p.interests.length > 0 && <p className="small soft">Interested in {p.interests.join(', ')}</p>}
            </div>
          </section>

          {p.milestones.length > 0 && (
            <section className="milestones" aria-labelledby="milestones-title">
              <h2 id="milestones-title" className="card-heading display">Recent milestones</h2>
              <ul>
                {p.milestones.map((m) => (
                  <li key={m.title}>
                    <span className={`badge-circle tile-${m.tone}`} aria-hidden="true"><Icon name={m.icon as IconName} size={22} /></span>
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
            <a href="#work">Work ({p.stats.works})</a>
            <a href="#experience">Experience</a>
            <a href="#journey">Journey</a>
          </nav>

          <section id="work" className="profile-section" aria-labelledby="work-title">
            <div className="row-between wrap">
              <h2 id="work-title" className="sub-title">Verified work</h2>
              {p.works.length > 1 && <span className="small muted">Sorted by vouch weight</span>}
            </div>
            {solo > 0 && team > 0 && (
              <div className="chip-row work-filter" role="group" aria-label="Show work">
                {([['all', `All ${p.works.length}`], ['solo', `Solo ${solo}`], ['team', `Team ${team}`]] as [WorkFilter, string][]).map(([key, label]) => (
                  <button key={key} type="button" className="chip chip-sm" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
                ))}
              </div>
            )}
            {own && p.inReview > 0 && (
              <p className="notice">
                <Icon name="clock" />
                <span>{p.inReview === 1 ? '1 of your works is' : `${p.inReview} of your works are`} waiting for checks. Work shows here once it’s verified.</span>
              </p>
            )}
            {works.length ? (
              <div className="grid-works">
                {works.map((w) => (
                  <div key={w.slug} className="profile-work">
                    <WorkCard work={w} owner />
                    {w.part && (
                      <p className="work-part">
                        {own ? 'Your part' : `${p.name.split(' ')[0]}’s part`}: <b>{w.part.role}</b> · {w.part.share}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                text={own ? 'No verified work yet. Post a project and send it for verification to start your portfolio.' : 'No verified work yet.'}
                action={own ? { to: '/post', label: 'Post your first work' } : undefined}
              />
            )}
          </section>

          <section id="experience" className="profile-section" aria-labelledby="experience-title">
            <div className="row-between wrap">
              <h2 id="experience-title" className="sub-title">Experience</h2>
              {own && p.experiences.length > 0 && (
                <Link to="/profile/experience/new" className="btn btn-outline btn-sm">
                  <Icon name="plus" size={18} strokeWidth={2} />
                  Add a role
                </Link>
              )}
            </div>
            {p.experiences.length ? (
              <div className="experience-grid">
                {p.experiences.map((e) => <Experience key={e.id} e={e} own={own} />)}
              </div>
            ) : (
              <Empty
                text={own ? 'Add a role and confirm it with your manager, or privately with your offer letter.' : 'No roles added yet.'}
                action={own ? { to: '/profile/experience/new', label: 'Add a role' } : undefined}
              />
            )}
          </section>

          <section id="journey" className="profile-section" aria-labelledby="journey-title">
            <h2 id="journey-title" className="sub-title">Journey</h2>
            <p className="serif-line">Not a profile. A journey.</p>
            {journey.length ? (
              <>
                <ol className="journey-list">
                  {journey.map((j, i) => {
                    const kind = JOURNEY[j.kind];
                    const text = (
                      <>
                        <span className="journey-kind">{j.month} · {kind.label}</span>
                        <b>{j.title}</b>
                        <span className="small soft">{j.sub}</span>
                      </>
                    );
                    return (
                      <li key={`${j.kind}-${j.title}-${i}`} className="journey-item">
                        <span className={`tile tile-xs tile-flat ${kind.tone}`} aria-hidden="true"><Icon name={kind.icon} size={18} /></span>
                        {j.slug && j.kind === 'project' ? <Link to={`/work/${j.slug}`} className="grow">{text}</Link> : <span className="grow">{text}</span>}
                      </li>
                    );
                  })}
                </ol>
                {p.journey.length > JOURNEY_SHOWN && (
                  <button type="button" className="btn btn-outline btn-sm journey-more" aria-expanded={allJourney} onClick={() => setAllJourney(!allJourney)}>
                    {allJourney ? 'Show less' : `Show all ${p.journey.length}`}
                  </button>
                )}
              </>
            ) : (
              <Empty text={own ? 'Your journey starts with your first verified work.' : 'The journey starts with the first verified work.'} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Experience({ e, own }: { e: Profile['experiences'][number]; own: boolean }) {
  return (
    <div className="experience">
      <span className="company-square" style={{ background: e.color }} aria-hidden="true">{e.initial}</span>
      <span className="grow">
        <b className="block display">{e.role}</b>
        <span className="block soft">{e.company}</span>
        {e.period && <span className="block small muted">{e.period}</span>}
        <RoleStatus experience={e} />
        {own && e.status === 'pending' && (
          <span className="block small muted experience-note">
            {e.waitingOn ? `We asked ${e.waitingOn} to confirm.` : 'Your offer letter stays private while it’s checked.'}
          </span>
        )}
      </span>
    </div>
  );
}

function Empty({ text, action }: { text: string; action?: { to: string; label: string } }) {
  return (
    <div className="empty-card">
      <p className="soft">{text}</p>
      {action && <Link to={action.to} className="btn btn-outline btn-sm">{action.label}</Link>}
    </div>
  );
}
