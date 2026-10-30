import { Link } from 'react-router';
import { useMe, type CompletionKey } from '../../api';
import { Icon, type IconName } from '../../components/Icon';
import { ProgressBar } from '../../components/Rows';
import { stepPath } from './api';
import './onboarding.css';

const STEP: Record<CompletionKey, { icon: IconName; sub: string }> = {
  describe: { icon: 'user', sub: 'Student, professional, founder or freelancer' },
  college: { icon: 'graduation', sub: 'Finds your college’s club community' },
  communities: { icon: 'users', sub: 'Your club’s community and topics you like' },
  skills: { icon: 'sparkle', sub: 'What you can do and want to learn' },
  experience: { icon: 'briefcase', sub: 'Add a role and get it verified' },
};

/**
 * FN-02-I02 Complete your profile: the panel on Home. Sign-up asks nothing, so this asks the rest, one step per screen.
 * Shows the progress and every step not done yet; skipped ones stay, marked, so people can come back to them.
 * Nothing for visitors, companies, or a complete profile.
 * Open question R-02: the order of the steps (this follows /api/me). R-06: whether completion is also profile strength.
 */
export function CompleteProfilePanel() {
  const me = useMe();
  const m = me.data;
  if (!m || m.account !== 'person' || !m.completion || m.completion.percent >= 100) return null;
  const { percent, steps } = m.completion;
  const missing = steps.filter((s) => !s.done);
  return (
    <section className="complete-panel" aria-labelledby="complete-profile-title">
      <div className="complete-head">
        <div>
          <h2 id="complete-profile-title" className="complete-title display">Complete your profile</h2>
          <p className="small soft">A few questions sign-up skipped. Each takes a minute, and you can skip any of them.</p>
        </div>
        <p className="complete-percent" aria-hidden="true"><b className="display">{percent}%</b>complete</p>
      </div>
      <ProgressBar value={percent} label={`Profile ${percent}% complete`} />
      <ul className="complete-steps" aria-label="Still to do">
        {missing.map((s) => (
          <li key={s.key}>
            <Link to={stepPath(s.key)} className="complete-step">
              <span className="tile tile-sm tile-flat tile-gold" aria-hidden="true"><Icon name={STEP[s.key].icon} /></span>
              <span className="grow">
                <span className="complete-step-title">
                  <b>{s.label}</b>
                  {s.skipped && <span className="pill pill-muted">Skipped</span>}
                </span>
                <span className="small soft">{STEP[s.key].sub}</span>
              </span>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
