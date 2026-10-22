import { Link, useSearchParams } from 'react-router';
import { useHome, type Home as HomeData } from '../api';
import { Avatar, Logo } from '../components/Bits';
import { BriefCard, WorkCard } from '../components/Cards';
import { Icon, type IconName } from '../components/Icon';
import { MobileBar } from '../components/Layout';
import { ErrorState, Loading } from './Placeholder';

const VIEWS: { key: string | null; label: string; icon?: IconName }[] = [
  { key: null, label: 'Discover', icon: 'compass' },
  { key: 'saved', label: 'Saved', icon: 'bookmark' },
  { key: 'briefs', label: 'Problem statements' },
  { key: 'work', label: 'Verified work' },
];

export function Home() {
  const home = useHome();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const view = params.get('view');
  const category = params.get('category');

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };

  if (home.isPending) return <Loading />;
  if (home.isError) return <ErrorState error={home.error} onRetry={() => void home.refetch()} />;
  const data = home.data;

  const needle = q.trim().toLowerCase();
  const filtering = Boolean(needle || view || category);
  const matches = (text: string) => !needle || text.toLowerCase().includes(needle);
  const briefs = data.briefs.filter(
    (b) => (!category || b.category === category) && (view !== 'saved' || b.saved) && matches(`${b.title} ${b.company.name} ${b.company.sector}`),
  );
  const works = data.works
    .filter((w) => (!category || w.category === category) && (view !== 'saved' || w.saved) && matches(`${w.title} ${w.byline} ${w.category}`))
    .slice(0, filtering ? undefined : 4);

  return (
    <div className="home">
      <MobileBar />
      <div className="container">
        <section className="hero" aria-labelledby="hero-title">
          <p className="hero-greeting">Good morning, {data.me.firstName}</p>
          <h1 id="hero-title" className="hero-title display">What's next?</h1>
          <form role="search" className="search hero-search" onSubmit={(e) => e.preventDefault()}>
            <Icon name="search" size={24} />
            <input
              type="search"
              aria-label="Search Vinden"
              placeholder="Search work, skills, people, clubs"
              value={q}
              onChange={(e) => update({ q: e.target.value || null })}
            />
            <button type="submit" className="btn btn-primary hero-search-btn">Search</button>
          </form>
          <div className="chip-row hero-chips" role="group" aria-label="Show">
            {VIEWS.map((v) => {
              const active = v.key === null ? !view && !category : view === v.key;
              return (
                <button key={v.label} type="button" className="chip" aria-pressed={active} onClick={() => update({ view: v.key, category: null })}>
                  {v.icon && <Icon name={v.icon} size={18} />}
                  {v.label}
                </button>
              );
            })}
          </div>
        </section>

        {!filtering && (
          <div className="home-duo">
            {data.club && data.task && <ClubCard club={data.club} task={data.task} />}
            <JourneyCard journey={data.journey} handle={data.me.handle} />
          </div>
        )}

        {filtering && (
          <p className="results-note" role="status">
            {[needle && `Results for “${q.trim()}”`, category, view === 'saved' && 'Saved'].filter(Boolean).join(' · ') || 'Filtered'}
            {' · '}
            <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>Clear</button>
          </p>
        )}

        {view !== 'work' && (
          <section className="section" aria-labelledby="briefs-title">
            <div className="section-head">
              <div>
                <h2 id="briefs-title" className="section-title">Live problem statements</h2>
                <p className="section-sub">Real briefs from companies, paid to your club</p>
              </div>
              {!filtering && <Link to="/?view=briefs" className="see-all">See all</Link>}
            </div>
            {briefs.length ? (
              <div className={`rail${filtering ? ' rail-wrap' : ''}`}>
                {briefs.map((b) => <BriefCard key={b.slug} brief={b} />)}
              </div>
            ) : (
              <p className="empty">No problem statements match.</p>
            )}
          </section>
        )}

        {view !== 'briefs' && (
          <section className="section" aria-labelledby="works-title">
            <div className="section-head">
              <div>
                <h2 id="works-title" className="section-title">Verified work for you</h2>
                <p className="section-sub desktop-only">Checked by AI, reviewed by clubs, vouched for by people who know the field</p>
              </div>
              {!filtering && <Link to="/?view=work" className="see-all">See all</Link>}
            </div>
            {works.length ? (
              <div className={`rail rail-narrow${filtering ? ' rail-wrap' : ''}`}>
                {works.map((w) => <WorkCard key={w.slug} work={w} />)}
              </div>
            ) : (
              <p className="empty">No verified work matches.</p>
            )}
          </section>
        )}

        {!filtering && (
          <>
            <section className="section" aria-labelledby="guide-title">
              <h2 className="section-title mobile-only">From the Vinden team</h2>
              <div className="editorial">
                <span className="ed-sun" aria-hidden="true" />
                <span className="ed-horizon" aria-hidden="true" />
                <span className="ed-reflection" aria-hidden="true" />
                <div className="editorial-body">
                  <p className="eyebrow eyebrow-gold">GUIDE</p>
                  <h3 id="guide-title" className="editorial-title display">Make your part of a team project impossible to miss</h3>
                  <p className="editorial-sub">How to write up who did what, so recruiters can see your share of the work.</p>
                  <a href="#" className="btn btn-white btn-lg">Read the guide</a>
                </div>
              </div>
            </section>

            <section className="section company-band" aria-labelledby="companies-title">
              <div className="grow">
                <p className="eyebrow eyebrow-gold-dark">FOR COMPANIES</p>
                <h2 id="companies-title" className="company-title display">Have a real problem? Put a student team on it.</h2>
                <p className="soft">Submit a problem statement. A Vinden Club team takes it on, and the project fee goes to the club.</p>
              </div>
              <div className="button-row">
                <a href="#" className="btn btn-primary btn-lg">Submit a problem</a>
                <a href="#" className="btn btn-outline btn-lg">How it works</a>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ClubCard({ club, task }: { club: NonNullable<HomeData['club']>; task: NonNullable<HomeData['task']> }) {
  return (
    <section className="club-card" aria-labelledby="club-title">
      <div className="club-head">
        <Logo size={48} />
        <div className="grow">
          <h2 id="club-title" className="club-name">{club.name}</h2>
          <p className="muted small">{club.members} members · Core Team of {club.coreTeam}</p>
        </div>
        <Link to="/club" className="link">Open club</Link>
      </div>
      <div>
        <p className="eyebrow eyebrow-lav">THIS WEEK'S TASK</p>
        <h3 className="task-title display">{task.title}</h3>
        <p className="meta-row">
          <span><Icon name="calendar" size={16} />Due {task.due}</span>
          <span><Icon name="clock" size={16} />{task.effort}</span>
          <span className="desktop-only"><Icon name="file" size={16} />Ends in a Proof of Work</span>
        </p>
      </div>
      <div className="task-foot">
        <div className="task-progress">
          <span className="avatar-stack" aria-hidden="true">
            {task.people.map((p) => <Avatar key={p.handle} person={p} size={32} decorative />)}
          </span>
          <span className="soft small">{task.done} of {task.total} members done</span>
        </div>
        <Link to="/post" className="btn btn-primary">Start task</Link>
      </div>
      {club.nextSession && (
        <p className="next-session">
          <span className="session-icon"><Icon name="graduation" size={18} /></span>
          <span><b>Up next:</b> {club.nextSession}</span>
        </p>
      )}
    </section>
  );
}

function JourneyCard({ journey, handle }: { journey: HomeData['journey']; handle: string }) {
  const requests = journey.vouchRequests;
  return (
    <section className="journey-card" aria-labelledby="journey-title">
      <div className="journey-head">
        <Logo size={26} />
        <h2 id="journey-title">Your journey</h2>
      </div>
      <Link to={`/people/${handle}`} className="journey-row">
        <span className="tile tile-gold"><Icon name="trendingUp" size={22} /></span>
        <span className="grow">
          <span className="row-between">
            <b>Profile strength</b>
            <b className="text-blue">{journey.profileStrength}%</b>
          </span>
          <span className="progress" role="progressbar" aria-label="Profile strength" aria-valuenow={journey.profileStrength} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${journey.profileStrength}%` }} />
          </span>
          <span className="small soft">{journey.nextStep}</span>
        </span>
        <Icon name="chevronRight" />
      </Link>
      {requests.length > 0 && (
        <>
          <div className="divider" />
          <a href="#" className="journey-row">
            <span className="tile tile-blue"><Icon name="thumbsUp" size={22} /></span>
            <span className="grow">
              <b>{requests.length} vouch {requests.length === 1 ? 'request' : 'requests'}</b>
              <span className="small soft block">{requests.join(' and ')} {requests.length === 1 ? 'wants' : 'want'} your vouch</span>
            </span>
            <Icon name="chevronRight" />
          </a>
        </>
      )}
      <div className="divider desktop-only" />
      <a href="#" className="journey-row desktop-only">
        <span className="tile tile-lav"><Icon name="trophy" size={22} /></span>
        <span className="grow">
          <b>Next milestone</b>
          <span className="small soft block">{journey.nextMilestone}</span>
        </span>
        <Icon name="chevronRight" />
      </a>
    </section>
  );
}
