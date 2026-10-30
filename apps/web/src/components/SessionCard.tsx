import { Icon } from './Icon';
import '../features/training/training.css';

export type SessionKind = 'alumni' | 'industry';

const KIND_LABEL: Record<SessionKind, string> = { alumni: 'Alumni session', industry: 'Industry session' };

/** Seeded titles start with their kind ("Alumni session: …"); under a kind's heading that prefix only repeats it. */
export const sessionTitle = (title: string) => {
  const rest = title.replace(/^(alumni|industry) session:\s*/i, '');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};

/**
 * A training session the Core Team organises (PDF §3C, §3D): an alumni session (career journeys, the skills that matter,
 * building a portfolio) or an industry session (a professional brings a real problem and guides members through it).
 * Figma: Session card.
 */
export function SessionCard({ id, kind, title, when, body }: { id?: string; kind: SessionKind | null; title: string; when: string | null; body: string | null }) {
  return (
    <article className="tr-session" id={id}>
      <span className="tile tile-sm tile-flat tile-gold" aria-hidden="true"><Icon name="calendar" /></span>
      <div className="grow">
        <p className="tr-overline">{kind ? KIND_LABEL[kind] : 'Session'}</p>
        <h3 className="tr-session-title">{sessionTitle(title)}</h3>
        {when && (
          <p className="tr-session-when">
            <Icon name="clock" size={16} />
            {when}
          </p>
        )}
        {body && <p className="tr-session-body">{body}</p>}
      </div>
    </article>
  );
}
