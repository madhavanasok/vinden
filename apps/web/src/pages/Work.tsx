import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError, timeAgo, useMe, useToggleSave, useVouch, useWork, type Me, type Work } from '../api';
import { Avatar, Dots, Logo } from '../components/Bits';
import { Cover } from '../components/Cover';
import { CheckBadge, Icon, type IconName } from '../components/Icon';
import { ErrorState, Loading, NotFound } from './Placeholder';

const SPLIT_COLORS = ['#1565D8', '#F9963A', '#B7A4F2', '#FFD23F'];

export function WorkPage() {
  const { slug = '' } = useParams();
  const work = useWork(slug);
  const me = useMe();

  if (work.isPending || me.isPending) return <Loading />;
  if (work.isError) {
    if (work.error instanceof ApiError && work.error.status === 404) return <NotFound message={work.error.message} />;
    return <ErrorState error={work.error} onRetry={() => void work.refetch()} />;
  }
  if (me.isError) return <ErrorState error={me.error} onRetry={() => void me.refetch()} />;
  return <WorkView w={work.data} me={me.data} />;
}

function WorkView({ w, me }: { w: Work; me: Me }) {
  const lead = w.team[0];
  const verified = [w.checks.ai && 'AI', w.checks.club && 'club review'].filter(Boolean).join(' and ');
  const meta = `${w.tags.join(' · ')} · ${w.month} · ${w.weeks} weeks · ${w.team.length > 1 ? `Team of ${w.team.length}` : 'Solo'}`;

  return (
    <article className="work-page">
      <div className="container">
        <div className="work-top">
          <nav aria-label="Breadcrumb" className="crumbs desktop-only">
            <Link to="/">Explore</Link>
            <span aria-hidden="true">›</span>
            <Link to={`/?category=${w.category}`}>{w.category}</Link>
            <span aria-hidden="true">›</span>
            <span>{w.subcategory}</span>
            <span aria-hidden="true">›</span>
            <span>{w.cardTitle}</span>
          </nav>
          <Link to="/" className="back-link desktop-only">
            <Icon name="arrowLeft" size={16} strokeWidth={2} />
            Back to Explore
          </Link>
          <div className="badges desktop-only">
            <span className="badge">{w.kind.toUpperCase()}</span>
            {w.team.length > 1 && <span className="badge">TEAM PROJECT</span>}
          </div>

          <Provenance w={w} className="mobile-only" />

          <div className="title-row">
            <h1 className="work-title display">{w.title}</h1>
            <div className="button-row desktop-only">
              <button type="button" className="btn btn-outline">
                <Icon name="share" size={18} />
                Share
              </button>
              <SaveToggle w={w} variant="button" />
            </div>
          </div>
          <div className="work-meta mobile-only">
            <p className="soft">{w.tags.join(' · ')}</p>
            <p className="muted">{w.month} · {w.weeks} weeks · {w.team.length > 1 ? `Team of ${w.team.length}` : 'Solo'}</p>
          </div>
          <div className="rating-row">
            <span className="score score-lg">
              <b>{w.score.toFixed(1)}</b>
              <Dots score={w.score} size="lg" />
              <a href="#vouches" className="link">{w.vouchCount} vouches</a>
            </span>
            {verified && (
              <span className="verified">
                <CheckBadge size={18} />
                Verified by {verified}
              </span>
            )}
            <span className="muted desktop-only">{meta}</span>
          </div>

          <div className="gallery">
            <div className="gallery-main">
              <Cover variant={w.cover === 'cac' ? 'cac-report' : w.cover} className="cover-fill" />
              <Link to="/" className="hero-btn hero-back mobile-only" aria-label="Back to Explore">
                <Icon name="chevronLeft" size={22} strokeWidth={2} />
              </Link>
              <div className="hero-actions mobile-only">
                <button type="button" className="icon-btn bare" aria-label="Share">
                  <Icon name="share" />
                </button>
                <SaveToggle w={w} variant="icon" />
              </div>
              <button type="button" className="files-btn">
                <Icon name="file" size={16} />
                {w.files} {w.files === 1 ? 'file' : 'files'}
              </button>
            </div>
            {w.files > 1 && (
              <div className="gallery-side">
                <Cover variant="dataset" className="cover-fill" />
                <Cover variant="deck" className="cover-fill">
                  {w.files > 3 && <button type="button" className="more-files">+{w.files - 3} more files</button>}
                </Cover>
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Sections" className="tabs desktop-only">
          <a href="#about" className="active">Overview</a>
          <a href="#verification">Verification</a>
          <a href="#team">Team</a>
          <a href="#vouches">Vouches ({w.vouchCount})</a>
        </nav>

        <div className="work-layout">
          <div className="work-main">
            <section id="about" aria-labelledby="about-title">
              <h2 id="about-title" className="sub-title desktop-only">About this work</h2>
              {w.summary.map((p) => <p key={p} className="lede">{p}</p>)}
              <div className="tag-row">
                {w.skills.map((s) => <span key={s} className="tag">{s}</span>)}
              </div>
              <Provenance w={w} className="desktop-only" />
            </section>

            <section id="verification" aria-labelledby="verification-title">
              <h2 id="verification-title" className="sub-title">How this was verified</h2>
              <p className="section-sub">Each check adds trust. Recruiters see all three.</p>
              <Verification w={w} />
            </section>

            <section id="team" aria-labelledby="team-title">
              <div className="row-between wrap">
                <h2 id="team-title" className="sub-title">Who did what</h2>
                {w.splitConfirmed && (
                  <span className="pill pill-blue">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    Confirmed by all {w.team.length}
                  </span>
                )}
              </div>
              <div className="split" role="img" aria-label={`Contribution split: ${w.team.map((m) => `${m.name.split(' ')[0]} ${m.share}%`).join(', ')}`}>
                {w.team.map((m, i) => <span key={m.handle} style={{ width: `${m.share}%`, background: SPLIT_COLORS[i % 4] }} />)}
              </div>
              <div className="team-grid">
                {w.team.map((m, i) => (
                  <Link key={m.handle} to={`/people/${m.handle}`} className="member">
                    <Avatar person={m} size={44} decorative />
                    <span className="grow">
                      <b className="block">{m.name}</b>
                      <span className="small soft">{m.role}</span>
                    </span>
                    <span className="share">
                      <span className="share-dot" style={{ background: SPLIT_COLORS[i % 4] }} />
                      {m.share}%
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <Vouches w={w} />
          </div>

          <aside className="work-aside">
            <div className="vouch-panel">
              <span className="muted small">Vouch weight</span>
              <div className="panel-score">
                <span className="big-score display">{w.score.toFixed(1)}</span>
                <span>
                  <Dots score={w.score} size="lg" />
                  <span className="small soft block">{w.vouchCount} vouches · {w.professionalCount} professionals</span>
                </span>
              </div>
              <div className="divider" />
              <YourWeight me={me} />
              <p className="small muted">Vouches from people with more verified experience count for more.</p>
              <VouchButton w={w} me={me} block />
              <button type="button" className="btn btn-outline btn-block">Message the team</button>
            </div>
            {lead && (
              <Link to={`/people/${lead.handle}`} className="aside-card">
                <Avatar person={lead} size={48} ring decorative />
                <span className="grow">
                  <b className="block">{lead.name}</b>
                  <span className="small soft">{w.team.length > 1 ? 'Team lead' : 'Author'}</span>
                </span>
                <span className="link small">View profile</span>
              </Link>
            )}
            {w.club && w.checks.club && (
              <div className="aside-card aside-card-lav">
                <Logo size={44} />
                <span className="grow">
                  <b className="block">{w.club.name}</b>
                  <span className="small soft">Reviewed and verified this work</span>
                </span>
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="vouch-dock mobile-only">
        <YourWeight me={me} />
        <VouchButton w={w} me={me} />
      </div>
    </article>
  );
}

function Provenance({ w, className }: { w: Work; className?: string }) {
  if (!w.company && !w.club) return null;
  const title = w.company ? `${w.kind === 'Paid brief' ? 'Paid brief' : w.kind} from ${w.company.name}` : `${w.kind} at ${w.club!.name}`;
  const sub = w.company && w.club ? `Solved by a team at ${w.club.name}` : w.company ? 'Work done for a real company' : 'Set and reviewed by the club';
  return (
    <div className={`provenance ${className ?? ''}`}>
      <span className="tile tile-gold tile-sm"><Icon name={w.company ? 'building' : 'users'} size={20} /></span>
      <span className="grow">
        <b className="block">{title}</b>
        <span className="small soft">{sub}</span>
      </span>
    </div>
  );
}

function Verification({ w }: { w: Work }) {
  const checks: { title: string; icon: IconName; tone: string; date: string | null; body: string; done: string; missing: string }[] = [
    { title: 'AI check', icon: 'sparkle', tone: 'blue', date: w.checks.ai, body: 'Files and claims reviewed. No issues found.', done: 'Passed', missing: 'Not run yet' },
    { title: 'Club review', icon: 'shield', tone: 'lav', date: w.checks.club, body: "Approved by the club's Proof of Work & Quality team.", done: 'Approved', missing: 'Not reviewed by a club' },
    {
      title: 'Company sign-off', icon: 'building', tone: 'gold', date: w.checks.company,
      body: w.company ? `${w.company.name} approved this work for public view.` : 'No company was involved in this work.', done: 'Signed off', missing: 'Not applicable',
    },
  ];
  return (
    <div className="verify-grid">
      {checks.map((c) => (
        <div key={c.title} className={`verify-card${c.date ? '' : ' is-missing'}`}>
          <span className={`tile tile-sm tile-${c.tone} tile-flat`}><Icon name={c.icon} size={20} /></span>
          <span className="grow">
            <b className="block">{c.title}</b>
            <span className="small soft">{c.date ? c.body : c.missing}</span>
          </span>
          <span className="verify-status">
            {c.date ? <><CheckBadge size={16} /><span className="desktop-only">{c.done} · {c.date}</span></> : <span className="muted small desktop-only">{c.missing}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Vouches({ w }: { w: Work }) {
  const [filter, setFilter] = useState<'all' | 'Professional' | 'Peer'>('all');
  const shown = w.vouches.filter((v) => filter === 'all' || v.voucher.level === filter);
  return (
    <section id="vouches" aria-labelledby="vouches-title">
      <h2 id="vouches-title" className="sub-title">Vouches ({w.vouchCount})</h2>
      <p className="section-sub">Weighted by each voucher's experience and track record</p>
      <div className="chip-row" role="group" aria-label="Filter vouches">
        <button type="button" className="chip chip-sm chip-soft" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          <Icon name="sliders" size={16} />
          Highest weight
        </button>
        <button type="button" className="chip chip-sm chip-soft" aria-pressed={filter === 'Professional'} onClick={() => setFilter('Professional')}>Professionals</button>
        <button type="button" className="chip chip-sm chip-soft" aria-pressed={filter === 'Peer'} onClick={() => setFilter('Peer')}>Peers</button>
      </div>
      {shown.length === 0 && (
        <p className="empty">
          {w.vouches.length === 0 ? `No written vouches yet. ${w.vouchCount} people have vouched without a note.` : 'No vouches from this group yet.'}
        </p>
      )}
      {shown.map((v) => (
        <article key={v.id} className="vouch">
          <div className="vouch-head">
            <Avatar person={v.voucher} size={48} decorative />
            <div className="grow">
              <Link to={`/people/${v.voucher.handle}`} className="vouch-name">{v.voucher.name}</Link>
              <p className="small soft">{v.voucher.line}</p>
            </div>
            <span className={`pill ${v.weight >= 7 ? 'pill-blue' : 'pill-muted'}`}>Vouch weight {v.weight.toFixed(1)}</span>
          </div>
          <h3 className="vouch-title display">{v.headline}</h3>
          <p className="vouch-body">{v.body}</p>
          <div className="row-between wrap vouch-foot">
            <span className="small muted">Vouched for: {v.skills} · {timeAgo(v.createdAt)}</span>
            <button type="button" className="btn btn-outline btn-sm">
              <Icon name="thumbsUp" size={16} />
              Helpful {v.helpful}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function YourWeight({ me }: { me: Me }) {
  return (
    <div className="your-weight">
      <span className="muted small">Your vouch weight</span>
      <span className="display weight-value">
        {me.vouchWeight.toFixed(1)} <span className="weight-level">· {me.vouchLevel}</span>
      </span>
    </div>
  );
}

function VouchButton({ w, me, block = false }: { w: Work; me: Me; block?: boolean }) {
  const vouch = useVouch(w.slug);
  const own = w.team.some((m) => m.handle === me.handle);
  const cls = `btn btn-lg${block ? ' btn-block' : ''}`;
  if (own) return <button type="button" className={`${cls} btn-outline`} disabled>This is your work</button>;
  if (w.myVouch) {
    return (
      <button type="button" className={`${cls} btn-outline`} disabled={vouch.isPending} onClick={() => vouch.mutate(false)}>
        <Icon name="check" size={18} strokeWidth={2.4} />
        Vouched · Undo
      </button>
    );
  }
  return (
    <button type="button" className={`${cls} btn-accent`} disabled={vouch.isPending} onClick={() => vouch.mutate(true)}>
      Vouch for this work
    </button>
  );
}

function SaveToggle({ w, variant }: { w: Work; variant: 'button' | 'icon' }) {
  const toggle = useToggleSave();
  const onClick = () => toggle.mutate({ kind: 'work', slug: w.slug });
  if (variant === 'icon') {
    return (
      <button type="button" className="icon-btn bare" aria-label="Save" aria-pressed={w.saved} disabled={toggle.isPending} onClick={onClick}>
        <Icon name="bookmark" filled={w.saved} />
      </button>
    );
  }
  return (
    <button type="button" className="btn btn-outline" aria-pressed={w.saved} disabled={toggle.isPending} onClick={onClick}>
      <Icon name="bookmark" size={18} filled={w.saved} />
      {w.saved ? 'Saved' : 'Save'}
    </button>
  );
}
