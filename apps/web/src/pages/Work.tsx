import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ApiError, useMe, useVouch, useWork, type Me, type Work } from '../api';
import { Avatar, Dots, Logo } from '../components/Bits';
import { Cover, filesLabel } from '../components/Cover';
import { CheckBadge, Icon } from '../components/Icon';
import { isCompany, isVisitor } from '../components/Page';
import { FeedbackNote, StatusPill, VerificationList } from '../components/Status';
import { ErrorState, Loading, NotFound } from './Placeholder';
import '../features/work/work.css';

/**
 * FN-06-I01 Proof of Work: the work (images or its card, files, kind, area), how it was verified, who did what, vouches
 * with their weight, and Vouch for this work (FN-06-I02). For the team, while it isn't published, the verification
 * section is its status (FN-05-I01). Anyone can view it; vouching needs an account.
 */
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

const fileType = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'Slides';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'fig'].includes(ext)) return 'Image';
  return ext ? ext.toUpperCase() : 'File';
};
const fileSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

function WorkView({ w, me }: { w: Work; me: Me }) {
  const posted = (useLocation().state as { posted?: boolean } | null)?.posted;
  const onTeam = w.team.some((m) => m.handle === me.handle);
  const published = w.status === 'published';
  const lead = w.team[0];
  const verified = [w.checks.ai && 'AI', w.checks.club && 'club review'].filter(Boolean).join(' and ');
  const teamLine = w.team.length > 1 ? `Team of ${w.team.length}` : 'Solo';
  const meta = [w.area, w.month, teamLine].filter(Boolean).join(' · ');
  const named = w.vouches.length;

  return (
    <article className="work-page">
      <div className="container">
        <StatusNotice w={w} onTeam={onTeam} posted={!!posted} />
        <div className="work-top">
          <nav aria-label="Breadcrumb" className="crumbs desktop-only">
            <Link to="/explore">Explore</Link>
            {w.area && (
              <>
                <span aria-hidden="true">›</span>
                <Link to={`/explore?area=${encodeURIComponent(w.area)}`}>{w.area}</Link>
              </>
            )}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{w.cardTitle}</span>
          </nav>
          <div className="badges desktop-only">
            {w.item && w.kind.toLowerCase() === w.item.kind
              ? <span className="badge">CLUB {w.item.kind.toUpperCase()}</span>
              : <span className="badge">{w.kind.toUpperCase()}</span>}
            {w.item && w.kind.toLowerCase() !== w.item.kind && !/club/i.test(w.kind) && <span className="badge">CLUB {w.item.kind.toUpperCase()}</span>}
          </div>

          <Provenance w={w} className="mobile-only" />

          <div className="title-row">
            <h1 className="work-title display">{w.title}</h1>
            <div className="button-row desktop-only">
              <ShareButton w={w} />
            </div>
          </div>
          <p className="work-meta mobile-only muted">{meta}</p>
          <div className="rating-row">
            {published ? (
              <span className="score score-lg">
                <b>{w.score.toFixed(1)}</b>
                <Dots score={w.score} size="lg" />
                <a href="#vouches" className="link">{w.vouchCount} {w.vouchCount === 1 ? 'vouch' : 'vouches'}</a>
              </span>
            ) : (
              <StatusPill status={w.status} />
            )}
            {verified && (
              <span className="verified">
                <CheckBadge size={18} />
                Verified by {verified}
              </span>
            )}
            <span className="muted desktop-only">{meta}</span>
          </div>

          <div className={`gallery${w.images.length > 1 ? '' : ' gallery-one'}`}>
            <div className="gallery-main">
              <Cover
                variant={w.cover === 'cac' ? 'cac-report' : w.cover}
                image={w.images[0]}
                alt={w.images.length ? `${w.title}, image 1 of ${w.images.length}` : ''}
                fit="contain"
                className="cover-fill"
                large
                title={w.title}
                kind={w.format ?? undefined}
                meta={filesLabel(w.files)}
                tone={w.coverTone}
                seed={w.slug}
              />
              <Link to="/explore" className="hero-btn hero-back mobile-only" aria-label="Back to Explore">
                <Icon name="chevronLeft" size={22} strokeWidth={2} />
              </Link>
              <div className="hero-actions mobile-only">
                <ShareButton w={w} icon />
              </div>
              <a href="#files" className="files-btn">
                <Icon name="file" size={16} />
                {filesLabel(w.files)}
              </a>
            </div>
            {w.images.length > 1 && (
              <div className="gallery-side">
                {w.images.slice(1, 3).map((src, i) => (
                  <Cover key={src} image={src} alt={`${w.title}, image ${i + 2} of ${w.images.length}`} fit="contain" className="cover-fill" />
                ))}
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Sections" className="tabs desktop-only">
          <a href="#about" className="active">Overview</a>
          <a href="#verification">Verification</a>
          <a href="#team">Who did what</a>
          <a href="#vouches">Vouches ({w.vouchCount})</a>
        </nav>

        <div className="work-layout">
          <div className="work-main">
            <section id="about" aria-labelledby="about-title">
              <h2 id="about-title" className="sub-title desktop-only">About this work</h2>
              {w.summary.map((p) => <p key={p} className="lede">{p}</p>)}
              <dl className="work-facts">
                <div><dt>Kind</dt><dd>{w.kind}</dd></div>
                {w.area && <div><dt>Area</dt><dd><Link to={`/explore?area=${encodeURIComponent(w.area)}`}>{w.area}</Link></dd></div>}
                <div><dt>Files</dt><dd>{w.files}</dd></div>
                <div><dt>Posted</dt><dd>{w.month}</dd></div>
              </dl>
              <Provenance w={w} className="desktop-only" />
              <div id="files" className="work-files">
                <h3 className="work-files-title">Files</h3>
                {w.fileList?.length ? (
                  <ul className="file-list">
                    {w.fileList.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="file-row">
                        <span className="tile tile-xs tile-flat tile-blue" aria-hidden="true"><Icon name="file" size={18} /></span>
                        <span className="grow">
                          <b className="block file-name">{f.name}</b>
                          <span className="small muted">{fileType(f.name)} · {fileSize(f.size)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small soft">{filesLabel(w.files)}{w.format ? ` · ${w.format}` : ''}</p>
                )}
              </div>
            </section>

            <section id="verification" aria-labelledby="verification-title">
              <h2 id="verification-title" className="sub-title">{onTeam && !published ? 'Verification status' : 'How this was verified'}</h2>
              <p className="section-sub">AI checks all work. The club’s Core Team also reviews club work.</p>
              <VerificationList work={w} />
              {onTeam && w.status === 'changes' && w.feedback && <FeedbackNote feedback={w.feedback} />}
            </section>

            <section id="team" aria-labelledby="team-title">
              <h2 id="team-title" className="sub-title">Who did what</h2>
              {/* Open question R-11: whether teammates confirm their part isn't covered, so parts show as posted. */}
              <ul className="team-grid">
                {w.team.map((m) => (
                  <li key={m.handle}>
                    <Link to={`/people/${m.handle}`} className="member">
                      <Avatar person={m} size={44} decorative />
                      <span className="grow">
                        <b className="block">{m.name}</b>
                        <span className="small soft">{m.role || (w.team.length === 1 ? 'Solo work' : 'Part not written down')}</span>
                      </span>
                      <Icon name="chevronRight" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section id="vouches" aria-labelledby="vouches-title">
              <h2 id="vouches-title" className="sub-title">Vouches ({w.vouchCount})</h2>
              <p className="section-sub">Highest weight first. A vouch’s weight comes from the voucher’s profile strength.</p>
              {named > 0 ? (
                <ul className="vouch-list">
                  {w.vouches.map((v) => (
                    <li key={v.id} className="vouch-row">
                      <Avatar person={v.voucher} size={44} decorative />
                      <span className="grow">
                        <Link to={`/people/${v.voucher.handle}`} className="vouch-name">{v.voucher.name}</Link>
                        <span className="small soft block">{v.voucher.line}</span>
                      </span>
                      <span className={`pill ${v.weight >= 7 ? 'pill-blue' : 'pill-muted'}`}>Weight {v.weight.toFixed(1)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">{published ? 'No vouches yet.' : 'Vouching opens once this work is verified.'}</p>
              )}
              {w.vouchCount > named && (
                <p className="small muted vouch-more">{named > 0 ? `${w.vouchCount - named} more` : w.vouchCount} {w.vouchCount - named === 1 ? 'vouch counts' : 'vouches count'} toward the score.</p>
              )}
              <div className="mobile-only"><VouchNote w={w} me={me} onTeam={onTeam} inline /></div>
            </section>
          </div>

          <aside className="work-aside" aria-label="Vouch">
            <div className="vouch-panel">
              {published ? (
                <>
                  <span className="muted small">Vouch score</span>
                  <div className="panel-score">
                    <span className="big-score display">{w.score.toFixed(1)}</span>
                    <span>
                      <Dots score={w.score} size="lg" />
                      <span className="small soft block">{w.vouchCount} {w.vouchCount === 1 ? 'vouch' : 'vouches'}</span>
                    </span>
                  </div>
                  <div className="divider" />
                </>
              ) : (
                <span className="row-between"><span className="muted small">Not verified yet</span><StatusPill status={w.status} /></span>
              )}
              <VouchNote w={w} me={me} onTeam={onTeam} />
              <VouchAction w={w} me={me} onTeam={onTeam} />
            </div>
            {lead && (
              <Link to={`/people/${lead.handle}`} className="aside-card">
                <Avatar person={lead} size={48} ring decorative />
                <span className="grow">
                  <b className="block">{lead.name}</b>
                  <span className="small soft">{w.team.length > 1 ? `With ${w.team.length - 1} ${w.team.length === 2 ? 'teammate' : 'teammates'}` : 'Solo work'}</span>
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

      <VouchDock w={w} me={me} onTeam={onTeam} />
    </article>
  );
}

/** What's happening with work that isn't published yet, or that was just posted. */
function StatusNotice({ w, onTeam, posted }: { w: Work; onTeam: boolean; posted: boolean }) {
  // Open question R-09: the order of the checks isn't decided; club work here waits for its club after the AI check.
  let text: string | null = null;
  if (w.status === 'published') text = posted ? 'Posted. The AI check passed, so your work is now on Explore.' : null;
  else if (!onTeam) text = 'In review. This work appears on Explore once it’s verified.';
  else if (w.status === 'changes') text = 'Your club’s Core Team sent feedback. See it under Verification status.';
  else text = posted
    ? 'Sent for verification. The AI check passed; your club’s Core Team reviews it next.'
    : 'In review. Your club’s Core Team reviews it next, then it appears on Explore.';
  if (!text) return null;
  return (
    <p className={`notice${w.status === 'changes' && onTeam ? ' notice-club' : ''}`} role="status">
      <Icon name={w.status === 'published' ? 'check' : w.status === 'changes' ? 'info' : 'clock'} size={18} />
      <span>
        {text}
        {w.status === 'changes' && onTeam && <> <a href="#verification" className="link">Read the feedback</a></>}
      </span>
    </p>
  );
}

function Provenance({ w, className }: { w: Work; className?: string }) {
  let title: string;
  let sub: string;
  if (w.brief) {
    title = `Problem statement: ${w.brief.title}`;
    sub = [w.brief.company && `From ${w.brief.company}`, w.club && `solved at ${w.club.name}`].filter(Boolean).join(', ') || 'A real company problem';
  } else if (w.item) {
    title = `Club ${w.item.kind}: ${w.item.title}`;
    sub = w.club ? `Set by ${w.club.name}` : 'Club work';
  } else if (w.company) {
    title = `${w.kind} for ${w.company.name}`;
    sub = w.club ? `By a team at ${w.club.name}` : 'Work done for a real company';
  } else if (w.club) {
    title = `${w.kind} at ${w.club.name}`;
    sub = 'Club work';
  } else return null;
  return (
    <div className={`provenance ${className ?? ''}`}>
      <span className="tile tile-gold tile-sm" aria-hidden="true"><Icon name={w.brief || (w.company && !w.item) ? 'building' : 'users'} size={20} /></span>
      <span className="grow">
        <b className="block">{title}</b>
        <span className="small soft">{sub}</span>
      </span>
    </div>
  );
}

/** Why someone can't vouch here, if they can't. */
function VouchNote({ w, me, onTeam, inline = false }: { w: Work; me: Me; onTeam: boolean; inline?: boolean }) {
  let note: string | null = null;
  // Inline (phones, in the Vouches section): the empty list already says vouching opens once verified.
  if (isCompany(me)) note = 'Vouches come from people, so company accounts can’t vouch.';
  else if (isVisitor(me) || (inline && w.status !== 'published')) note = null;
  else if (onTeam) note = w.status === 'published' ? 'This is your work, so others vouch for it.' : 'This is your work. Others can vouch once it’s verified.';
  else if (w.status !== 'published') note = 'Vouching opens once this work is verified.';
  return note ? <p className="small soft vouch-note">{note}</p> : null;
}

const canAct = (w: Work, me: Me, onTeam: boolean) => isVisitor(me) || (!isCompany(me) && !onTeam && w.status === 'published');

/**
 * FN-06-I02 Vouch: shows your vouch weight, which comes from your profile strength, then Confirm.
 * Open question R-13: who counts as an experienced user isn't defined, so any signed-in person can vouch.
 * Open question R-06: whether profile completion and strength are one measure isn't decided; the weight is the API's.
 * Open question R-38: undoing a vouch isn't covered, so a vouch stays.
 */
function VouchAction({ w, me, onTeam, compact = false }: { w: Work; me: Me; onTeam: boolean; compact?: boolean }) {
  const vouch = useVouch(w.slug);
  const [confirming, setConfirming] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (wasConfirming.current && !confirming) opener.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  if (!canAct(w, me, onTeam)) return null;
  if (isVisitor(me)) {
    return (
      <div className="vouch-cta">
        {!compact && <p className="small soft">Vouching needs an account, so each vouch carries a real person’s weight.</p>}
        <Link to="/signup" className="btn btn-primary btn-lg btn-block">Sign up to vouch</Link>
      </div>
    );
  }
  if (w.myVouch) {
    const mine = w.vouches.find((v) => v.voucher.handle === me.handle);
    return (
      <p className="vouch-done" role="status">
        <CheckBadge size={18} />
        You vouched for this work{mine ? ` · weight ${mine.weight.toFixed(1)}` : ''}
      </p>
    );
  }
  if (!confirming) {
    return (
      <button ref={opener} type="button" className="btn btn-accent btn-lg btn-block" onClick={() => setConfirming(true)}>
        Vouch for this work
      </button>
    );
  }
  return (
    <div className="vouch-confirm" role="group" aria-label="Confirm your vouch">
      <div className="your-weight">
        <span className="muted small">Your vouch weight</span>
        <span className="display weight-value">
          {me.vouchWeight.toFixed(1)} <span className="weight-level">· {me.vouchLevel}</span>
        </span>
      </div>
      <p className="small muted">It comes from your profile strength. More verified work and experience give your vouch more weight.</p>
      {vouch.error && <p className="field-help field-error" role="alert">{vouch.error.message}</p>}
      <div className="vouch-confirm-actions">
        <button type="button" className="btn btn-outline btn-lg" onClick={() => setConfirming(false)}>Cancel</button>
        <button type="button" className="btn btn-accent btn-lg grow" autoFocus disabled={vouch.isPending} onClick={() => vouch.mutate(true, { onSuccess: () => setConfirming(false) })}>
          {vouch.isPending ? 'Vouching…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

/** Phones: the vouch action floats above the tab bar. Notes about why you can't vouch sit in the Vouches section instead. */
function VouchDock({ w, me, onTeam }: { w: Work; me: Me; onTeam: boolean }) {
  if (!canAct(w, me, onTeam)) return null;
  return (
    <div className="vouch-dock work-dock mobile-only">
      <VouchAction w={w} me={me} onTeam={onTeam} compact />
    </div>
  );
}

/** Shares the work's link: the phone's share sheet where there is one, else copies it. */
function ShareButton({ w, icon = false }: { w: Work; icon?: boolean }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href.split('#')[0];
    if (navigator.share) {
      try {
        await navigator.share({ title: w.title, url });
      } catch {
        // Closed the share sheet: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the address bar still has the link.
    }
  };
  const label = copied ? 'Link copied' : 'Share';
  return (
    <>
      {icon ? (
        <button type="button" className="icon-btn bare" aria-label={label} onClick={() => void share()}>
          <Icon name={copied ? 'check' : 'share'} />
        </button>
      ) : (
        <button type="button" className="btn btn-outline" onClick={() => void share()}>
          <Icon name={copied ? 'check' : 'share'} size={18} />
          {label}
        </button>
      )}
      <span className="visually-hidden" role="status">{copied ? 'Link copied' : ''}</span>
    </>
  );
}
