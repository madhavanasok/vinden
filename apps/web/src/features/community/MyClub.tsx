import { Link, Navigate } from 'react-router';
import { useCommunities, useMe } from '../../api';
import { Logo } from '../../components/Bits';
import { CommunityCardLink } from '../../components/CommunityCardLink';
import { Icon } from '../../components/Icon';
import { Page } from '../../components/Page';
import { InfoRow } from '../../components/Rows';
import { Loading } from '../../pages/Placeholder';
import { useClubs } from './api';
import './community.css';

/**
 * FN-09-I01 from the Club tab: a member goes straight to their club's page. Without a club, this explains what a
 * Vinden Club is (PDF §1, §2, §10) and points to the clubs and their open communities.
 */
export function MyClub() {
  const me = useMe();
  if (me.isPending) return <Loading />;
  if (me.data?.club) return <Navigate to={`/clubs/${me.data.club.slug}`} replace />;
  return <NoClub />;
}

function NoClub() {
  const clubs = useClubs();
  const communities = useCommunities();
  const clubCommunities = communities.data?.filter((c) => c.kind === 'club') ?? [];
  return (
    <Page title="Vinden Club" sub="A student-run club at your college, where members learn by doing real work for real companies." top>
      <section className="page-section" aria-labelledby="how-title">
        <div className="section-head">
          <h2 id="how-title" className="section-title">How clubs work</h2>
        </div>
        <div className="club-facts">
          <InfoRow icon="building" title="One club per college" subtitle="Each college has its own Vinden Club." />
          <InfoRow icon="users" tone="lav" title="Run by a Core Team" subtitle="About 10–12 students in seven roles run the club." />
          <InfoRow icon="graduation" tone="blue" title="About 30 selected members" subtitle="Open to the whole college, with no fee." />
          <InfoRow icon="sparkle" title="Selected on motivation, not marks" subtitle="Curiosity and ownership count. Not academic performance alone." />
        </div>
      </section>

      <section className="page-section" aria-labelledby="clubs-title">
        <div className="section-head">
          <div>
            <h2 id="clubs-title" className="section-title">Clubs on Vinden</h2>
            <p className="section-sub">See who runs each club and what it has done. Apply when recruitment is open.</p>
          </div>
        </div>
        {clubs.isPending ? <Loading /> : (
          <ul className="club-list">
            {clubs.data?.map((c) => (
              <li key={c.slug}>
                <Link to={`/clubs/${c.slug}`} className="club-list-item">
                  <Logo size={48} />
                  <span className="grow">
                    <b className="block">{c.name}</b>
                    <span className="small soft">{c.college}{c.city && `, ${c.city}`} · {c.members} members</span>
                  </span>
                  {c.recruiting && <span className="pill pill-lav">Recruiting</span>}
                  <Icon name="chevronRight" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {clubCommunities.length > 0 && (
        <section className="page-section" aria-labelledby="follow-title">
          <div className="section-head">
            <div>
              <h2 id="follow-title" className="section-title">Follow a club</h2>
              <p className="section-sub">Each club’s community is open to everyone, for its news and events. Following isn’t membership.</p>
            </div>
            <Link to="/communities" className="see-all">All communities</Link>
          </div>
          <ul className="rail community-rail">
            {clubCommunities.map((c) => <li key={c.slug}><CommunityCardLink community={c} /></li>)}
          </ul>
        </section>
      )}
    </Page>
  );
}
