import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/*
 * Card and hero art. There's no photography of student work yet, so each cover is a small
 * drawing of the work itself — a chart, a funnel, a deck — in one of the cover tones.
 * Work posted without a preview image gets a generated cover: its format, file count and title.
 */

export const COVER_TONES = ['blue', 'teal', 'mint', 'gold', 'peach', 'rose', 'lavender', 'stone'] as const;
export type CoverTone = (typeof COVER_TONES)[number];
/** Navy is kept for editorial art only; no work cover uses it. */
type Tone = CoverTone | 'navy';

const tone = (t: Tone, part: 'bg' | 'mark' | 'soft' | 'ink') => `var(--cover-${t}-${part})`;

/** Same work, same colour: an FNV-1a hash of the slug picks the tone, so neighbouring cards usually differ. */
export function toneFor(seed: string): CoverTone {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return COVER_TONES[h % COVER_TONES.length];
}

export const FORMATS = ['Report', 'Deck', 'Dataset', 'Design', 'Research', 'Document', 'Code'] as const;
export type Format = (typeof FORMATS)[number];

const FORMAT_ICON: Record<Format, IconName> = {
  Report: 'file',
  Deck: 'briefcase',
  Dataset: 'trendingUp',
  Design: 'sparkle',
  Research: 'search',
  Document: 'file',
  Code: 'link',
};

const FORMAT_FOR_EXT: Record<string, Format> = {
  pdf: 'Report', doc: 'Document', docx: 'Document', txt: 'Document', md: 'Document',
  ppt: 'Deck', pptx: 'Deck', key: 'Deck',
  xls: 'Dataset', xlsx: 'Dataset', csv: 'Dataset',
  fig: 'Design', sketch: 'Design', xd: 'Design', png: 'Design', jpg: 'Design', jpeg: 'Design',
  ipynb: 'Code', py: 'Code', js: 'Code', ts: 'Code', zip: 'Code',
};
const FORMAT_FOR_CATEGORY: Record<string, Format> = { Business: 'Report', Design: 'Design', Data: 'Dataset', Research: 'Research' };

/** What a new post's generated cover calls it: the first file's type, else the area of work. */
export function formatFor(fileNames: string[], category: string | null): Format {
  for (const name of fileNames) {
    const found = FORMAT_FOR_EXT[name.split('.').pop()?.toLowerCase() ?? ''];
    if (found) return found;
  }
  return FORMAT_FOR_CATEGORY[category ?? ''] ?? 'Report';
}

export const filesLabel = (n: number) => `${n} ${n === 1 ? 'file' : 'files'}`;

const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });
const bars = (heights: number[], color: (i: number) => string) =>
  heights.map((h, i) => <span key={i} style={{ flex: 1, height: `${h}%`, background: color(i), borderRadius: '4px 4px 0 0' }} />);
const pill = (w: number, h: number, bg: string, extra?: CSSProperties) => <span style={{ display: 'block', width: w, height: h, borderRadius: 999, background: bg, ...extra }} />;

const phone = (t: Tone): CSSProperties => ({ boxSizing: 'border-box', borderRadius: 14, background: '#fff', border: `1px solid ${tone(t, 'soft')}`, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 });

const ART: Record<string, { tone: Tone; art: ReactNode }> = {
  cac: {
    tone: 'blue',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 16, color: tone('blue', 'ink') })}>CAC PER STUDENT</span>
        <span className="cover-figure" style={abs({ left: 16, top: 32, color: tone('blue', 'ink') })}>2.1×</span>
        <span style={abs({ left: 16, right: 16, bottom: 16, height: '38%', display: 'flex', alignItems: 'flex-end', gap: 8 })}>
          {bars([31, 42, 53, 67, 83, 100], (i) => (i === 5 ? tone('blue', 'mark') : tone('blue', 'soft')))}
        </span>
      </>
    ),
  },
  'cac-report': {
    tone: 'blue',
    art: (
      <>
        <span style={abs({ left: '50%', top: '50%', width: 'min(400px, 78%)', height: 280, transform: 'translate(-46%, -54%)', borderRadius: 14, background: tone('blue', 'soft'), opacity: 0.6 })} />
        <span style={abs({ left: '50%', top: '50%', width: 'min(400px, 78%)', height: 'min(280px, 70%)', transform: 'translate(-50%, -50%)', boxSizing: 'border-box', borderRadius: 14, background: '#fff', padding: 'clamp(14px, 4%, 24px)', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(7, 20, 47, 0.14)' })}>
          <span className="cover-label" style={{ color: '#5C6680' }}>SNACKLY × VINDEN CLUB MERIDIAN</span>
          <span className="cover-report-title">Why CAC doubled on campus</span>
          <span style={{ marginTop: 'auto', height: '48%', display: 'flex', alignItems: 'flex-end', gap: 8, borderBottom: '1px solid #E4DFD3' }}>
            {bars([26, 33, 43, 51, 63, 81, 100], (i) => (i === 6 ? tone('blue', 'mark') : tone('blue', 'soft')))}
          </span>
          <span style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5C6680' }}>
            <span>Jan</span>
            <span>CAC per college user, 2026</span>
            <span>Sep</span>
          </span>
        </span>
      </>
    ),
  },
  'kyc-funnel': {
    tone: 'gold',
    art: (
      <span style={abs({ left: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 6 })}>
        {([[160, 'Sign-up'], [136, 'Phone'], [108, 'Profile'], [54, 'KYC']] as const).map(([w, label], i) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pill(w, 12, i === 3 ? tone('gold', 'mark') : '#07142F')}
            <span style={{ fontSize: 11, fontWeight: i === 3 ? 700 : 600, color: i === 3 ? tone('gold', 'ink') : '#3D4A63' }}>{label}</span>
          </span>
        ))}
      </span>
    ),
  },
  'checkin-phone': {
    tone: 'lavender',
    art: (
      <>
        <span className="cover-figure-sm" style={abs({ left: 16, bottom: 18, color: tone('lavender', 'ink') })}>Weekly<br />check-in</span>
        <span style={abs({ right: 22, bottom: -26, width: 104, height: 150, ...phone('lavender'), padding: '14px 12px', gap: 8, borderRadius: 18 })}>
          {pill(56, 8, tone('lavender', 'soft'))}
          {pill(72, 6, '#E4DFD3')}
          <span style={{ display: 'flex', gap: 5, marginTop: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ width: 12, height: 12, boxSizing: 'border-box', borderRadius: 999, background: i === 2 ? tone('lavender', 'mark') : tone('lavender', 'bg'), border: i === 2 ? 'none' : `1px solid ${tone('lavender', 'soft')}` }} />
            ))}
          </span>
          {pill(80, 6, '#E4DFD3')}
          {pill(60, 6, '#E4DFD3')}
        </span>
      </>
    ),
  },
  'tam-circles': {
    tone: 'teal',
    art: (
      <>
        <span style={abs({ left: 18, bottom: -34, width: 150, height: 150 })}>
          <span style={abs({ inset: 0, boxSizing: 'border-box', borderRadius: 999, border: `1.5px solid ${tone('teal', 'ink')}`, background: 'rgba(255, 255, 255, 0.5)' })} />
          <span style={abs({ inset: 28, boxSizing: 'border-box', borderRadius: 999, border: `1.5px solid ${tone('teal', 'ink')}`, background: tone('teal', 'bg') })} />
          <span style={abs({ inset: 51, borderRadius: 999, background: tone('teal', 'mark') })} />
        </span>
        <span style={abs({ right: 16, bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, fontSize: 11, fontWeight: 700, color: tone('teal', 'ink') })}>
          <span>TAM</span>
          <span>SAM</span>
          <span>SOM</span>
        </span>
      </>
    ),
  },
  'retention-curve': {
    tone: 'peach',
    art: (
      <>
        <svg width="220" height="80" viewBox="0 0 220 80" style={abs({ left: 16, bottom: 20 })}>
          <polyline points="2,8 42,12 82,18 112,56 152,64 192,68 218,70" fill="none" stroke="var(--cover-peach-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="112" cy="56" r="6" fill="#07142F" />
        </svg>
        <span style={abs({ left: 118, bottom: 56, fontSize: 11, fontWeight: 700, color: '#07142F' })}>Week 3</span>
      </>
    ),
  },
  'library-phones': {
    tone: 'rose',
    art: (
      <>
        <span style={abs({ left: 40, bottom: -20, width: 76, height: 136, ...phone('rose') })}>
          {pill(0, 8, tone('rose', 'soft'), { width: 'auto' })}
          <span style={{ height: 24, borderRadius: 6, background: tone('rose', 'bg') }} />
          <span style={{ height: 24, borderRadius: 6, background: tone('rose', 'bg') }} />
          {pill(40, 6, '#E4DFD3')}
        </span>
        <span style={abs({ left: 130, bottom: -34, width: 76, height: 136, ...phone('rose') })}>
          {pill(0, 8, tone('rose', 'soft'), { width: 'auto' })}
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4 }}>
            {(['bg', 'mark', 'bg', 'bg', 'bg', 'soft'] as const).map((part, i) => (
              <span key={i} style={{ height: 12, borderRadius: 3, background: tone('rose', part) }} />
            ))}
          </span>
          {pill(0, 18, '#07142F', { width: 'auto' })}
        </span>
      </>
    ),
  },
  'canteen-bars': {
    tone: 'mint',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 16, color: tone('mint', 'ink') })}>CANTEEN ORDERS BY HOUR</span>
        <span style={abs({ left: 16, right: 16, bottom: 16, height: '56%', display: 'flex', alignItems: 'flex-end', gap: 6 })}>
          {bars([19, 31, 60, 100, 73, 35, 25, 46], (i) => (i === 3 ? '#07142F' : [2, 4, 7].includes(i) ? tone('mint', 'mark') : tone('mint', 'soft')))}
        </span>
      </>
    ),
  },
  'cafe-prices': {
    tone: 'gold',
    art: (
      <span style={abs({ inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 })}>
        {(['₹40', '₹55', '₹70'] as const).map((p, i) => (
          <span key={p} style={{ height: 28, padding: '0 14px', boxSizing: 'border-box', borderRadius: 999, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 700, marginLeft: (i - 1) * 56, background: i === 1 ? '#07142F' : '#fff', color: i === 1 ? '#fff' : '#3D4A63', border: i === 1 ? 'none' : '1px solid #E4DFD3' }}>
            {p}
          </span>
        ))}
      </span>
    ),
  },
  'activation-line': {
    tone: 'teal',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 14, color: tone('teal', 'ink') })}>ACTIVATION</span>
        <svg width="200" height="76" viewBox="0 0 200 76" style={abs({ left: 16, bottom: 16 })}>
          <polyline points="2,68 34,60 66,62 98,42 130,34 162,18 195,8" fill="none" stroke="var(--cover-teal-mark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="195" cy="8" r="5" fill="#07142F" />
        </svg>
      </>
    ),
  },
  'hostel-donut': {
    tone: 'lavender',
    art: (
      <span style={abs({ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <span style={{ width: 84, height: 84, borderRadius: 999, background: `conic-gradient(${tone('lavender', 'mark')} 0 45%, ${tone('lavender', 'soft')} 45% 75%, #fff 75% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: tone('lavender', 'bg') }} />
        </span>
      </span>
    ),
  },
  'laundry-deck': {
    tone: 'peach',
    art: (
      <span style={abs({ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <span style={{ width: 150, height: 92, boxSizing: 'border-box', borderRadius: 10, background: '#fff', border: `1px solid ${tone('peach', 'soft')}`, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pill(90, 10, '#07142F')}
          {pill(118, 6, '#E4DFD3')}
          {pill(100, 6, '#E4DFD3')}
          {pill(48, 14, tone('peach', 'mark'))}
        </span>
      </span>
    ),
  },
  'banking-table': {
    tone: 'stone',
    art: (
      <span style={abs({ inset: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, alignContent: 'start' })}>
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} style={{ height: i < 3 ? 14 : 16, borderRadius: 3, background: i < 3 ? tone('stone', 'mark') : [4, 6, 11, 13].includes(i) ? tone('stone', 'soft') : '#fff' }} />
        ))}
      </span>
    ),
  },
  dataset: {
    tone: 'teal',
    art: (
      <span style={abs({ inset: 20, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <span className="cover-label" style={{ color: tone('teal', 'ink') }}>DATASET · 18 MONTHS OF SIGN-UPS</span>
        <span style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} style={{ height: i < 4 ? 14 : 12, borderRadius: 3, background: i < 4 ? tone('teal', 'mark') : [6, 9, 15, 16].includes(i) ? tone('teal', 'soft') : '#fff' }} />
          ))}
        </span>
      </span>
    ),
  },
  deck: {
    tone: 'lavender',
    art: (
      <span style={abs({ inset: 20, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <span className="cover-label" style={{ color: tone('lavender', 'ink') }}>DECK · RECOMMENDATIONS</span>
        <span style={{ width: 180, height: 112, boxSizing: 'border-box', borderRadius: 10, background: '#fff', border: `1px solid ${tone('lavender', 'soft')}`, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pill(110, 10, '#07142F')}
          {pill(140, 6, '#E4DFD3')}
          {pill(120, 6, '#E4DFD3')}
          {pill(130, 6, '#E4DFD3')}
          {pill(60, 14, tone('lavender', 'mark'))}
        </span>
      </span>
    ),
  },
};

interface CoverProps {
  /** A drawing from ART. Empty or unknown means the work has no preview, so the cover is generated. */
  variant?: string;
  className?: string;
  children?: ReactNode;
  /** Generated covers only: the work's title, format and a short note such as "2 files". */
  title?: string;
  kind?: Format;
  meta?: string;
  /** Generated covers only: a fixed tone, else one picked from `seed` (the work's slug). */
  tone?: CoverTone | null;
  seed?: string;
  /** The work page hero: more padding and a bigger title. */
  large?: boolean;
}

export function Cover({ variant, className, children, title = '', kind = 'Report', meta, tone: fixed, seed, large = false }: CoverProps) {
  const drawn = variant ? ART[variant] : undefined;
  const t: Tone = drawn?.tone ?? fixed ?? toneFor(seed ?? title);
  const classes = ['cover', !drawn && 'cover-gen', large && 'cover-lg', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={{ background: tone(t, 'bg') }}>
      <div className="cover-art" aria-hidden="true">
        {drawn ? drawn.art : (
          <>
            <span className="cover-gen-circle" style={{ background: tone(t, 'soft') }} />
            <span className="cover-gen-body" style={{ color: tone(t, 'ink') }}>
              <span className="cover-gen-tile" style={{ color: tone(t, 'mark') }}><Icon name={FORMAT_ICON[kind]} size={22} /></span>
              <span className="cover-gen-overline">{[kind, meta].filter(Boolean).join(' · ')}</span>
              <span className="cover-gen-title">{title}</span>
            </span>
          </>
        )}
      </div>
      {children}
    </div>
  );
}
