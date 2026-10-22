import type { Person, Tone } from '../api';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: '#DCE8FB', fg: '#0F4FAE' },
  orange: { bg: '#FDE3C8', fg: '#A84B06' },
  lav: { bg: '#EFEAFD', fg: '#5B43AE' },
  gold: { bg: '#FFF3CC', fg: '#7A5B00' },
};

export const toneColors = (tone: Tone) => TONES[tone];

/** Initials in a coloured circle. `ring` adds the sunrise ring used for a profile's owner. */
export function Avatar({ person, size = 44, ring = false, decorative = false }: { person: Pick<Person, 'name' | 'initials' | 'tone'>; size?: number; ring?: boolean; decorative?: boolean }) {
  const { bg, fg } = TONES[person.tone];
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': person.name };
  const face = (
    <span className="avatar" style={{ width: ring ? '100%' : size, height: ring ? '100%' : size, background: bg, color: fg, fontSize: Math.max(11, Math.round(size * 0.32)) }} {...(ring ? {} : a11y)}>
      {person.initials}
    </span>
  );
  if (!ring) return face;
  return (
    <span className="avatar-ring" style={{ width: size, height: size }} {...a11y}>
      {face}
    </span>
  );
}

/** Vouch weight as five dots, Tripadvisor-bubble style: 0–10 maps to 0–5 dots in halves. */
export function Dots({ score, size }: { score: number; size?: 'sm' | 'lg' }) {
  const v = score / 2;
  let full = Math.floor(v);
  const frac = v - full;
  let half = false;
  if (frac >= 0.75) full += 1;
  else if (frac >= 0.25) half = true;
  return (
    <span className={`dots${size ? ` dots-${size}` : ''}`} role="img" aria-label={`Vouch weight ${score.toFixed(1)} out of 10`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`dot${i < full ? ' full' : i === full && half ? ' half' : ''}`} />
      ))}
    </span>
  );
}

export function Score({ score, count, label, size }: { score: number; count?: number; label?: string; size?: 'sm' | 'lg' }) {
  return (
    <span className={`score${size ? ` score-${size}` : ''}`}>
      <b>{score.toFixed(1)}</b>
      <Dots score={score} size={size} />
      {count !== undefined && <span className="muted">({label ? `${count} ${label}` : count})</span>}
    </span>
  );
}

export function Logo({ size = 38 }: { size?: number }) {
  return <img src="/vinden-logo-sunrise.png" alt="" width={size} height={size} className="logo" style={{ borderRadius: size * 0.26 }} />;
}
