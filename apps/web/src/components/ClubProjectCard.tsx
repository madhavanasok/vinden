import { Link } from 'react-router';
import type { Person, WorkCard as WorkCardData } from '../api';
import { Avatar } from './Bits';
import { WorkCard } from './Cards';
import '../features/community/community.css';

/**
 * A club project in its portfolio: the Work card (it opens the work page) with the team underneath, each person
 * linking to their profile. The club level of showcasing; the person level is the profile.
 */
export function ClubProjectCard({ work, team, max = 3 }: { work: WorkCardData; team: (Person & { role: string })[]; max?: number }) {
  const shown = team.slice(0, max);
  const more = team.length - shown.length;
  return (
    <div className="club-project">
      <WorkCard work={work} />
      <div className="club-project-team">
        <p className="club-project-label">{team.length > 1 ? `Team of ${team.length}` : 'Solo'}</p>
        <ul aria-label={`Team for ${work.title}`}>
          {shown.map((p) => (
            <li key={p.handle}>
              <Link to={`/people/${p.handle}`} className="club-project-person">
                <Avatar person={p} size={28} decorative />
                <span className="grow">
                  <b>{p.name}</b>
                  <span className="small soft">{p.role}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {more > 0 && <Link to={`/work/${work.slug}`} className="small soft club-project-more">and {more} more on the work page</Link>}
      </div>
    </div>
  );
}
