import { Link, useNavigate, useParams } from 'react-router';
import { ApiError, useMe } from '../../api';
import { Logo } from '../../components/Bits';
import { WorkCard } from '../../components/Cards';
import { CommunityCardLink } from '../../components/CommunityCardLink';
import { Icon, type IconName } from '../../components/Icon';
import { MobileBar, PageBar } from '../../components/Layout';
import { EmptyState } from '../../components/Page';
import { PersonRow, Stat } from '../../components/Rows';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { STEP_LABEL, useClubPage, type ClubPageData } from './api';
import './community.css';

/**
 * FN-09-I01 Club page: name and college, the Core Team by role, members, the portfolio and the club's community.
 * It offers the community (Join), not membership: members join through recruitment (FN-10).
 * Open question R-16: who can see a club page is open, so visitors see it. Open question R-31: one club per college.
 */
export function ClubPage() {
  const { slug = '' } = useParams();
  const club = useClubPage(slug);
  if (club.isPending) return <Loading />;
  if (club.error) {
    return club.error instanceof ApiError && club.error.status === 404
      ? <NotFound message={club.error.message} />
      : <ErrorState error={club.error} onRetry={() => void club.refetch()} />;
  }
  return <ClubView club={club.data} />;
}

const SECTIONS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Members', href: '#members' },
  { label: 'Core Team', href: '#core-team' },
  { label: 'Community', href: '#community' },
];

/** Training pages for members, built by the training program (FN-11). */
const MEMBER_LINKS: { to: string; icon: IconName; title: string; line: string }[] = [
  { to: '/club/training', icon: 'graduation', title: 'Training plan', line: 'Projects, tasks and learning paths' },
  { to: '/club/sessions', icon: 'calendar', title: 'Sessions', line: 'Alumni and industry sessions' },
];

/** What the Core Team runs (PDF §1): selection, training, verifying work and problem statements. */
const CORE_LINKS: { to: string; icon: IconName; title: string; line: string }[] = [
  { to: '/club/applications', icon: 'users', title: 'Applications', line: 'Select this year’s members' },
  { to: '/club/review', icon: 'shield', title: 'Review queue', line: 'Verify members’ Proof of Work' },
  { to: '/club/completion', icon: 'check', title: 'Task completion', line: 'Who has done each task' },
  { to: '/club/training', icon: 'graduation', title: 'Training program', line: 'Plan projects, tasks and sessions' },
  { to: '/club/problems', icon: 'briefcase', title: 'Problem statements', line: 'Companies’ problems for the club' },
];

function ClubView({ club }: { club: ClubPageData }) {
  const me = useMe();
  const navigate = useNavigate();
  const { member, coreRole, application } = club.viewer;
  const company = me.data?.account === 'company';
  const showApply = club.recruiting && !member && !application && !company && !me.data?.club;

  return (
    <>
      {member ? <MobileBar /> : <PageBar title={club.name} onBack={() => navigate(-1)} />}
      <div className="container club-page">
        <header className="club-header" id="overview">
          <div className="club-identity">
            <Logo size={72} />
            <div className="grow">
              <p className="eyebrow eyebrow-lav">{club.college}{club.city && `, ${club.city}`}</p>
              <h1 className="club-title display">{club.name}</h1>
              <p className="club-meta">
                <span className="soft">
                  {club.members} members · Core Team of {club.coreTeamSize}
                  {club.started && <span className="desktop-only"> · Started {club.started}</span>}
                </span>
                {coreRole
                  ? <span className="pill pill-lav"><Icon name="check" size={14} strokeWidth={2.2} />Core Team · {coreRole}</span>
                  : member
                    ? <span className="pill pill-lav"><Icon name="check" size={14} strokeWidth={2.2} />You’re a member</span>
                    : application
                      ? <span className="pill pill-muted">Your application: {STEP_LABEL[application.step]}</span>
                      : club.recruiting && <span className="pill pill-lav">Recruitment is open</span>}
              </p>
            </div>
            {(showApply || application) && (
              <div className="club-actions">
                {showApply
                  ? <Link to={`/clubs/${club.slug}/apply`} className="btn btn-accent">Apply to join</Link>
                  : <Link to={`/clubs/${club.slug}/apply`} className="btn btn-outline">See your application</Link>}
              </div>
            )}
          </div>
          <div className="club-stats">
            <Stat value={club.members} label="members, selected from the college" />
            <Stat value={club.coreTeamSize} label="Core Team, across 7 roles" />
            <Stat value={club.portfolio.count} label="projects in the portfolio" />
            <Stat value={club.sessions} label="sessions this year" />
          </div>
        </header>

        <nav className="page-tabs" aria-label="Club sections">
          {SECTIONS.map((s, i) => <a key={s.href} href={s.href} className={i === 0 ? 'active' : undefined}>{s.label}</a>)}
        </nav>

        <div className="club-layout">
          <div className="club-main">
            {coreRole && <LinkPanel id="core-tools" title="Core Team" sub={`You hold the ${coreRole} seat`} links={CORE_LINKS} />}
            {member && <LinkPanel id="training" title="Training program" sub="What the club is working on and learning" links={MEMBER_LINKS} />}

            {club.recruiting && !member && (
              <section className="club-recruiting" aria-labelledby="recruiting-title">
                <h2 id="recruiting-title" className="side-card-title">Recruitment is open</h2>
                <p className="small soft">
                  About 30 students are selected. Selection can include a motivation form, screening, an interview, a practical task and final selection.
                  It looks at motivation, curiosity and ownership, not academic performance alone.
                </p>
                <ul className="club-recruiting-facts">
                  <li><Icon name="users" size={18} />Open to the whole college</li>
                  <li><Icon name="check" size={18} />No fee</li>
                </ul>
                {application && <p className="small"><b>You’ve applied.</b> Your application is at {STEP_LABEL[application.step].toLowerCase()}.</p>}
                {company && <p className="small muted">Company accounts can’t apply.</p>}
              </section>
            )}

            <section id="portfolio" aria-labelledby="portfolio-title">
              <div className="section-head">
                <div>
                  <h2 id="portfolio-title" className="section-title">Portfolio</h2>
                  <p className="section-sub">Every project the club has published</p>
                </div>
                {club.portfolio.count > 0 && <Link to={`/clubs/${club.slug}/portfolio`} className="see-all">See all {club.portfolio.count}</Link>}
              </div>
              {club.portfolio.works.length ? (
                <div className="rail">
                  {club.portfolio.works.map((w) => <WorkCard key={w.slug} work={w} />)}
                </div>
              ) : (
                <EmptyState icon="file" title="No projects yet" body="Club projects show here once they’re published." />
              )}
            </section>

            <section id="members" aria-labelledby="members-title">
              <div className="section-head">
                <div>
                  <h2 id="members-title" className="section-title">Members</h2>
                  <p className="section-sub">{club.members} members, selected from across {club.college}</p>
                </div>
              </div>
              {club.people.length ? (
                <ul className="club-members">
                  {club.people.map((p) => <li key={p.handle}><PersonRow person={p} line={p.line} to={`/people/${p.handle}`} /></li>)}
                </ul>
              ) : (
                <EmptyState icon="users" title="No members listed yet" body="Members show here once they’re selected." />
              )}
              {club.members > club.people.length && club.people.length > 0 && (
                <p className="small muted club-members-more">Members with a Vinden profile are listed. The Core Team is listed by role.</p>
              )}
            </section>
          </div>

          <aside className="club-side">
            <section id="core-team" className="side-card" aria-labelledby="core-team-title">
              <h2 id="core-team-title" className="side-card-title">Core Team</h2>
              {/* Open question R-21: Learning & Development is 3 or 4 seats, so the seats can add up to more than the team's size. */}
              <p className="small soft">About {club.coreTeamSize} students across 7 roles run the club.</p>
              <ul className="core-roles">
                {club.coreTeam.map((r) => {
                  const open = Math.max(r.seats - r.people.length, 0);
                  return (
                    <li key={r.role} className="core-role">
                      <p className="core-role-head">
                        <b>{r.role}</b>
                        <span className="small muted">{r.people.length} of {r.seats}</span>
                      </p>
                      {r.people.map((p) => <PersonRow key={p.handle} person={p} line={p.line} to={`/people/${p.handle}`} />)}
                      {open > 0 && <p className="core-role-open small muted">{open === 1 ? '1 open seat' : `${open} open seats`}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>

            {club.community && (
              <section id="community" className="side-card" aria-labelledby="community-title">
                <h2 id="community-title" className="side-card-title">Club community</h2>
                <p className="small soft">Anyone can follow the club’s news and events. Following isn’t membership.</p>
                <CommunityCardLink community={club.community} />
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

function LinkPanel({ id, title, sub, links }: { id: string; title: string; sub: string; links: typeof MEMBER_LINKS }) {
  return (
    <section className="club-links-panel" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <div>
          <h2 id={`${id}-title`} className="section-title">{title}</h2>
          <p className="section-sub">{sub}</p>
        </div>
      </div>
      <ul className="club-links">
        {links.map((l) => (
          <li key={l.to + l.title}>
            <Link to={l.to} className="club-link">
              <span className="tile tile-sm tile-flat tile-lav" aria-hidden="true"><Icon name={l.icon} /></span>
              <span className="grow">
                <b className="block">{l.title}</b>
                <span className="small soft">{l.line}</span>
              </span>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
