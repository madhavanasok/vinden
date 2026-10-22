import type { CSSProperties, ReactNode } from 'react';

/*
 * Card and hero art. There's no photography of student work yet, so each cover is a small
 * drawing of the work itself — a chart, a funnel, a deck — in the brand's tints.
 */

const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });
const bars = (heights: number[], color: (i: number) => string) =>
  heights.map((h, i) => <span key={i} style={{ flex: 1, height: `${h}%`, background: color(i), borderRadius: '4px 4px 0 0' }} />);
const pill = (w: number, h: number, bg: string, extra?: CSSProperties) => <span style={{ display: 'block', width: w, height: h, borderRadius: 999, background: bg, ...extra }} />;

const PHONE: CSSProperties = { boxSizing: 'border-box', borderRadius: 14, background: '#fff', border: '1px solid #CFC2F7', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 };

const ART: Record<string, { bg: string; art: ReactNode }> = {
  cac: {
    bg: '#0E1F45',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 16, color: '#C9D3EA' })}>CAC PER STUDENT</span>
        <span className="cover-figure" style={abs({ left: 16, top: 32, color: '#fff' })}>2.1×</span>
        <span style={abs({ left: 16, right: 16, bottom: 16, height: '38%', display: 'flex', alignItems: 'flex-end', gap: 8 })}>
          {bars([31, 42, 53, 67, 83, 100], (i) => (i === 5 ? '#FFD23F' : '#F9963A'))}
        </span>
      </>
    ),
  },
  'cac-report': {
    bg: '#0E1F45',
    art: (
      <>
        <span style={abs({ left: '50%', top: '50%', width: 'min(400px, 78%)', height: 280, transform: 'translate(-46%, -54%)', borderRadius: 14, background: 'rgba(255,255,255,0.14)' })} />
        <span style={abs({ left: '50%', top: '50%', width: 'min(400px, 78%)', height: 'min(280px, 70%)', transform: 'translate(-50%, -50%)', boxSizing: 'border-box', borderRadius: 14, background: '#fff', padding: 'clamp(14px, 4%, 24px)', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' })}>
          <span className="cover-label" style={{ color: '#5C6680' }}>SNACKLY × VINDEN CLUB MERIDIAN</span>
          <span className="cover-report-title">Why CAC doubled on campus</span>
          <span style={{ marginTop: 'auto', height: '48%', display: 'flex', alignItems: 'flex-end', gap: 8, borderBottom: '1px solid #E4DFD3' }}>
            {bars([26, 33, 43, 51, 63, 81, 100], (i) => (i === 6 ? '#F7841E' : i === 5 ? '#F9963A' : '#FBC793'))}
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
    bg: '#FFF3CC',
    art: (
      <span style={abs({ left: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 6 })}>
        {([[160, 'Sign-up'], [136, 'Phone'], [108, 'Profile'], [54, 'KYC']] as const).map(([w, label], i) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pill(w, 12, i === 3 ? '#F9963A' : '#07142F')}
            <span style={{ fontSize: 11, fontWeight: i === 3 ? 700 : 600, color: i === 3 ? '#A84B06' : '#3D4A63' }}>{label}</span>
          </span>
        ))}
      </span>
    ),
  },
  'checkin-phone': {
    bg: '#EFEAFD',
    art: (
      <>
        <span className="cover-figure-sm" style={abs({ left: 16, bottom: 18 })}>Weekly<br />check-in</span>
        <span style={abs({ right: 22, bottom: -26, width: 104, height: 150, ...PHONE, padding: '14px 12px', gap: 8, borderRadius: 18 })}>
          {pill(56, 8, '#B7A4F2')}
          {pill(72, 6, '#E4DFD3')}
          <span style={{ display: 'flex', gap: 5, marginTop: 4 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ width: 12, height: 12, boxSizing: 'border-box', borderRadius: 999, background: i === 2 ? '#5B43AE' : '#EFEAFD', border: i === 2 ? 'none' : '1px solid #B7A4F2' }} />
            ))}
          </span>
          {pill(80, 6, '#E4DFD3')}
          {pill(60, 6, '#E4DFD3')}
        </span>
      </>
    ),
  },
  'tam-circles': {
    bg: '#DCE8FB',
    art: (
      <>
        <span style={abs({ left: 18, bottom: -34, width: 150, height: 150 })}>
          <span style={abs({ inset: 0, boxSizing: 'border-box', borderRadius: 999, border: '1.5px solid #0F4FAE', background: '#EAF2FD' })} />
          <span style={abs({ inset: 28, boxSizing: 'border-box', borderRadius: 999, border: '1.5px solid #0F4FAE', background: '#DCE8FB' })} />
          <span style={abs({ inset: 51, borderRadius: 999, background: '#1565D8' })} />
        </span>
        <span style={abs({ right: 16, bottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, fontSize: 11, fontWeight: 700, color: '#0F4FAE' })}>
          <span>TAM</span>
          <span>SAM</span>
          <span>SOM</span>
        </span>
      </>
    ),
  },
  'retention-curve': {
    bg: '#FDE3C8',
    art: (
      <>
        <svg width="220" height="80" viewBox="0 0 220 80" style={abs({ left: 16, bottom: 20 })}>
          <polyline points="2,8 42,12 82,18 112,56 152,64 192,68 218,70" fill="none" stroke="#A84B06" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="112" cy="56" r="6" fill="#07142F" />
        </svg>
        <span style={abs({ left: 118, bottom: 56, fontSize: 11, fontWeight: 700, color: '#07142F' })}>Week 3</span>
      </>
    ),
  },
  'library-phones': {
    bg: '#EFEAFD',
    art: (
      <>
        <span style={abs({ left: 40, bottom: -20, width: 76, height: 136, ...PHONE })}>
          {pill(0, 8, '#B7A4F2', { width: 'auto' })}
          <span style={{ height: 24, borderRadius: 6, background: '#EFEAFD' }} />
          <span style={{ height: 24, borderRadius: 6, background: '#EFEAFD' }} />
          {pill(40, 6, '#E4DFD3')}
        </span>
        <span style={abs({ left: 130, bottom: -34, width: 76, height: 136, ...PHONE })}>
          {pill(0, 8, '#B7A4F2', { width: 'auto' })}
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4 }}>
            {['#EFEAFD', '#5B43AE', '#EFEAFD', '#EFEAFD', '#EFEAFD', '#B7A4F2'].map((c, i) => (
              <span key={i} style={{ height: 12, borderRadius: 3, background: c }} />
            ))}
          </span>
          {pill(0, 18, '#07142F', { width: 'auto' })}
        </span>
      </>
    ),
  },
  'canteen-bars': {
    bg: '#EAF2FD',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 16, color: '#0F4FAE' })}>CANTEEN ORDERS BY HOUR</span>
        <span style={abs({ left: 16, right: 16, bottom: 16, height: '56%', display: 'flex', alignItems: 'flex-end', gap: 6 })}>
          {bars([19, 31, 60, 100, 73, 35, 25, 46], (i) => (i === 3 ? '#07142F' : [2, 4, 7].includes(i) ? '#4A87E3' : '#ADC9F4'))}
        </span>
      </>
    ),
  },
  'cafe-prices': {
    bg: '#FFF3CC',
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
    bg: '#DCE8FB',
    art: (
      <>
        <span className="cover-label" style={abs({ left: 16, top: 14, color: '#0F4FAE' })}>ACTIVATION</span>
        <svg width="200" height="76" viewBox="0 0 200 76" style={abs({ left: 16, bottom: 16 })}>
          <polyline points="2,68 34,60 66,62 98,42 130,34 162,18 195,8" fill="none" stroke="#1565D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="195" cy="8" r="5" fill="#07142F" />
        </svg>
      </>
    ),
  },
  'hostel-donut': {
    bg: '#EFEAFD',
    art: (
      <span style={abs({ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <span style={{ width: 84, height: 84, borderRadius: 999, background: 'conic-gradient(#5B43AE 0 45%, #B7A4F2 45% 75%, #fff 75% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: '#EFEAFD' }} />
        </span>
      </span>
    ),
  },
  'laundry-deck': {
    bg: '#FDE3C8',
    art: (
      <span style={abs({ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <span style={{ width: 150, height: 92, boxSizing: 'border-box', borderRadius: 10, background: '#fff', border: '1px solid #FBC793', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pill(90, 10, '#07142F')}
          {pill(118, 6, '#E4DFD3')}
          {pill(100, 6, '#E4DFD3')}
          {pill(48, 14, '#F9963A')}
        </span>
      </span>
    ),
  },
  'banking-table': {
    bg: '#EAF2FD',
    art: (
      <span style={abs({ inset: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, alignContent: 'start' })}>
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} style={{ height: i < 3 ? 14 : 16, borderRadius: 3, background: i < 3 ? '#0F4FAE' : [4, 6, 11, 13].includes(i) ? '#ADC9F4' : '#fff' }} />
        ))}
      </span>
    ),
  },
  dataset: {
    bg: '#EAF2FD',
    art: (
      <span style={abs({ inset: 20, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <span className="cover-label" style={{ color: '#0F4FAE' }}>DATASET · 18 MONTHS OF SIGN-UPS</span>
        <span style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} style={{ height: i < 4 ? 14 : 12, borderRadius: 3, background: i < 4 ? '#0F4FAE' : [6, 9, 15, 16].includes(i) ? '#ADC9F4' : '#fff' }} />
          ))}
        </span>
      </span>
    ),
  },
  deck: {
    bg: '#EFEAFD',
    art: (
      <span style={abs({ inset: 20, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <span className="cover-label" style={{ color: '#5B43AE' }}>DECK · RECOMMENDATIONS</span>
        <span style={{ width: 180, height: 112, boxSizing: 'border-box', borderRadius: 10, background: '#fff', border: '1px solid #CFC2F7', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pill(110, 10, '#07142F')}
          {pill(140, 6, '#E4DFD3')}
          {pill(120, 6, '#E4DFD3')}
          {pill(130, 6, '#E4DFD3')}
          {pill(60, 14, '#B7A4F2')}
        </span>
      </span>
    ),
  },
};

export function Cover({ variant, className, children }: { variant: string; className?: string; children?: ReactNode }) {
  const { bg, art } = ART[variant] ?? { bg: '#EEF1F6', art: null };
  return (
    <div className={`cover${className ? ` ${className}` : ''}`} style={{ background: bg }}>
      <div className="cover-art" aria-hidden="true">{art}</div>
      {children}
    </div>
  );
}
