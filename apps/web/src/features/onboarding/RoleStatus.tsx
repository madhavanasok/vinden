import { Icon } from '../../components/Icon';
import type { Experience } from './api';

/**
 * Whether a role is verified, as a Pill: Trust (blue) for manager confirmed, Club (lavender) for a private offer letter,
 * Neutral while it waits. The offer letter itself is never shown, only that the role is verified. Skill: vinden-atom-pill.
 */
export function RoleStatus({ experience: e }: { experience: Pick<Experience, 'status' | 'verification'> }) {
  if (e.status === 'pending') {
    return (
      <span className="pill pill-muted">
        <Icon name="clock" size={14} strokeWidth={2.2} />
        {e.verification === 'manager' ? 'Waiting for manager to confirm' : 'Waiting for verification'}
      </span>
    );
  }
  return e.verification === 'manager' ? (
    <span className="pill pill-blue">
      <Icon name="check" size={14} strokeWidth={2.2} />
      Manager confirmed
    </span>
  ) : (
    <span className="pill pill-lav">
      <Icon name="lock" size={14} strokeWidth={2.2} />
      Offer letter verified · private
    </span>
  );
}
