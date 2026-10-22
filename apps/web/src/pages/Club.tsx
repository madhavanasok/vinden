import { ApiError, rupees, useClub, type Club } from '../api';
import { Logo } from '../components/Bits';
import { BriefCard, TaskCard, WorkCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { MobileBar } from '../components/Layout';
import { InfoRow, PersonRow, Stat } from '../components/Rows';
import { ErrorState, Loading, NotFound } from './Placeholder';

export function ClubPage() {
  const club = useClub();
  if (club.isPending) return <Loading />;
  if (club.error) {
    return club.error instanceof ApiError && club.error.status === 404
      ? <NotFound message={club.error.message} />
      : <ErrorState error={club.error} onRetry={() => void club.refetch()} />;
  }
  return <ClubView club={club.data} />;
}

/** In-page sections; Overview is the page itself. */
const SECTIONS = [
  { label: 'Overview', href: '#overview' },
  { label: 'This week', href: '#this-week' },
  { label: 'Problem statements', href: '#briefs' },
  { label: 'Verified work', href: '#verified' },
  { label: 'Core Team', href: '#core-team' },
];

/** The demo's next session as a calendar file: Thu 30 Oct 2026, 6 to 7:30 pm IST. */
function calendarLink(title: string, detail: string) {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vinden//Club//EN', 'BEGIN:VEVENT',
    'UID:meridian-session-20261030@vinden', 'DTSTAMP:20261022T000000Z', 'DTSTART:20261030T123000Z', 'DTEND:20261030T140000Z',
    `SUMMARY:${title}`, `DESCRIPTION:${detail}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function ClubView({ club }: { club: Club }) {
  const others = club.coreTeamSize - club.coreTeam.length;
  return (
    <>
      <MobileBar />
      <div className="container club-page">
        <header className="club-header" id="overview">
          <div className="club-identity">
            <Logo size={72} />
            <div className="grow">
              <p className="eyebrow eyebrow-lav">{club.college}{club.city && `, ${club.city}`}</p>
              <h1 className="club-title display">{club.name}</h1>
              <p className="club-meta">
                <span className="soft">{club.members} members · Core Team of {club.coreTeamSize}{club.started && <span className="desktop-only"> · Started {club.started}</span>}</span>
                <span className="pill pill-lav"><Icon name="check" size={14} strokeWidth={2.2} />You're a member</span>
              </p>
            </div>
            <a href="#" className="btn btn-outline desktop-only"><Icon name="file" size={18} />Club handbook</a>
          </div>
          <div className="club-stats">
            <Stat value={rupees(club.stats.earned)} label="earned by the club, all of it kept" />
            <Stat value={club.stats.verified} label="Proof of Work verified" />
            <Stat value={club.stats.liveBriefs} label="live problem statements" />
            <Stat value={club.stats.sessions} label="sessions this year" />
          </div>
        </header>

        <nav className="page-tabs" aria-label="Club sections">
          {SECTIONS.map((s, i) => <a key={s.href} href={s.href} className={i === 0 ? 'active' : undefined}>{s.label}</a>)}
        </nav>

        <div className="club-layout">
          <div className="club-main">
            {club.task && (
              <section id="this-week" aria-labelledby="this-week-title">
                <div className="section-head">
                  <div>
                    <h2 id="this-week-title" className="section-title">This week</h2>
                    <p className="section-sub">Posting your work is how the task gets marked done</p>
                  </div>
                </div>
                <TaskCard task={club.task} />
              </section>
            )}

            <section id="briefs" aria-labelledby="briefs-title">
              <div className="section-head">
                <div>
                  <h2 id="briefs-title" className="section-title">Live problem statements</h2>
                  <p className="section-sub">Paid briefs from companies. Every rupee goes to the club.</p>
                </div>
                <a href="/?view=briefs" className="see-all">See all</a>
              </div>
              <div className="rail">
                {club.briefs.slice(0, 3).map((b) => <BriefCard key={b.slug} brief={b} />)}
              </div>
            </section>

            {club.works.length > 0 && (
              <section id="verified" aria-labelledby="verified-title">
                <div className="section-head">
                  <div>
                    <h2 id="verified-title" className="section-title">Recently verified</h2>
                    <p className="section-sub">Club work that passed every check</p>
                  </div>
                </div>
                <div className="rail">
                  {club.works.slice(0, 3).map((w) => <WorkCard key={w.slug} work={w} />)}
                </div>
              </section>
            )}
          </div>

          <aside className="club-side">
            <section id="core-team" className="side-card" aria-labelledby="core-team-title">
              <h2 id="core-team-title" className="side-card-title">Core Team</h2>
              <p className="small soft">{club.coreTeamSize} students across 7 roles run the club</p>
              <div className="person-list">
                {club.coreTeam.map((m) => <PersonRow key={m.handle} person={m} line={m.role} to={`/people/${m.handle}`} />)}
              </div>
              {others > 0 && <p className="small muted">and {others} more</p>}
            </section>

            {club.session && (
              <section id="sessions" className="side-card" aria-labelledby="session-title">
                <h2 id="session-title" className="side-card-title">Next session</h2>
                <InfoRow icon="calendar" title={club.session.title} subtitle={club.session.detail} />
                <a href={calendarLink(club.session.title, club.session.detail)} download="vinden-session.ics" className="btn btn-outline btn-block">
                  <Icon name="calendar" size={18} />
                  Add to calendar
                </a>
              </section>
            )}

            <section className="money-note" aria-labelledby="money-title">
              <h2 id="money-title" className="money-title">All of it stays with the club</h2>
              <p className="small">Companies pay the club when they sign off the work. Vinden takes nothing. The Core Team spends it on sessions, events and travel.</p>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
