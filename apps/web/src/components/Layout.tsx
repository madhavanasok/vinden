import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useMe } from '../api';
import { Avatar, Logo } from './Bits';
import { Icon, type IconName } from './Icon';

const CATEGORIES = [
  { label: 'For you', params: '' },
  { label: 'Business', params: 'category=Business' },
  { label: 'Design', params: 'category=Design' },
  { label: 'Data', params: 'category=Data' },
  { label: 'Research', params: 'category=Research' },
  { label: 'Problem statements', params: 'view=briefs' },
];

/** Explore covers Home plus anything opened from it: work, and other people's profiles. */
function useExploreActive() {
  const { pathname } = useLocation();
  const me = useMe();
  return pathname === '/' || pathname.startsWith('/work/') || (pathname.startsWith('/people/') && pathname !== `/people/${me.data?.handle}`);
}

export function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header showSearch={pathname !== '/'} />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Footer />
      {/* Flows like Post work bring their own Action bar on phones, so the tab bar steps aside. */}
      {pathname !== '/post' && <TabBar />}
    </>
  );
}

export function Brand({ size = 38 }: { size?: number }) {
  return (
    <Link to="/" className="brand" aria-label="Vinden home">
      <Logo size={size} />
      <span className="wordmark">vinden</span>
    </Link>
  );
}

type Theme = 'light' | 'dark';
const THEME_KEY = 'vinden.theme';
const THEME_COLOR: Record<Theme, string> = { light: '#FDFBF6', dark: '#07142F' };
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = (): Theme => (document.documentElement.dataset.theme as Theme | undefined) ?? (systemDark().matches ? 'dark' : 'light');

/** A saved choice wins; without one the system setting decides, and can change while the page is open. */
function useTheme() {
  const [theme, setTheme] = useState(currentTheme);
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    const query = systemDark();
    query.addEventListener('change', sync);
    window.addEventListener('vinden-theme', sync);
    return () => {
      query.removeEventListener('change', sync);
      window.removeEventListener('vinden-theme', sync);
    };
  }, []);
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_COLOR[next]));
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the choice lasts until the page reloads.
    }
    window.dispatchEvent(new Event('vinden-theme'));
  };
  return { theme, toggle };
}

/** Moon in the light theme, Sun in the dark one. Figma: the Theme switch in Top nav and Mobile top bar. */
function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" className="icon-btn bare" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
      <Icon name={dark ? 'sun' : 'moon'} size={22} />
    </button>
  );
}

function HeaderSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  };
  return (
    <form role="search" className="search header-search" onSubmit={submit}>
      <Icon name="search" />
      <input type="search" aria-label="Search Vinden" placeholder="Search work, skills, people, clubs" value={q} onChange={(e) => setQ(e.target.value)} />
    </form>
  );
}

function Header({ showSearch }: { showSearch: boolean }) {
  const me = useMe();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const explore = useExploreActive();
  const current = pathname === '/' ? params.toString().replace(/(^|&)q=[^&]*/, '').replace(/^&/, '') : null;

  return (
    <header className="site-header">
      <div className="container header-row">
        <Brand />
        {showSearch && <HeaderSearch />}
        <nav className="main-nav" aria-label="Main">
          <Link to="/" className={explore ? 'active' : undefined} aria-current={explore ? 'page' : undefined}>Explore</Link>
          <NavLink to="/club">Club</NavLink>
          <NavLink to="/openings">Openings</NavLink>
          <NavLink to="/saved">Saved</NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/post" className="btn btn-primary">
            <Icon name="plus" size={18} strokeWidth={2} />
            Post work
          </Link>
          <ThemeSwitch />
          <button type="button" className="icon-btn" aria-label="Notifications, 2 new">
            <Icon name="bell" size={22} />
            <span className="notify-dot" />
          </button>
          {me.data && (
            <Link to={`/people/${me.data.handle}`} className="avatar-link" aria-label="Your profile">
              <Avatar person={me.data} size={44} decorative />
            </Link>
          )}
        </div>
      </div>
      <nav className="cat-nav" aria-label="Categories">
        <div className="container cat-row">
          {CATEGORIES.map((c) => {
            const active = current === c.params;
            return (
              <Link key={c.label} to={c.params ? `/?${c.params}` : '/'} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
                {c.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

/** The phone layout's top bar: logo, notifications and your avatar. */
export function MobileBar() {
  const me = useMe();
  return (
    <div className="mobile-bar mobile-only">
      <Brand size={36} />
      <div className="header-actions">
        <ThemeSwitch />
        <button type="button" className="icon-btn" aria-label="Notifications, 2 new">
          <Icon name="bell" size={22} />
          <span className="notify-dot" />
        </button>
        {me.data && (
          <Link to={`/people/${me.data.handle}`} className="avatar-link" aria-label="Your profile">
            <Avatar person={me.data} size={44} decorative />
          </Link>
        )}
      </div>
    </div>
  );
}

/** The phone top bar for anything opened from a tab: back, title and an optional note such as "Step 2 of 4". */
export function PageBar({ title, note, onBack }: { title: string; note?: string; onBack: () => void }) {
  return (
    <div className="mobile-bar page-bar mobile-only">
      <button type="button" className="icon-btn bare" aria-label="Back" onClick={onBack}><Icon name="arrowLeft" size={22} /></button>
      <span className="page-bar-title">{title}</span>
      {note && <span className="small soft page-bar-note">{note}</span>}
    </div>
  );
}

/** Phone-only bar fixed above the safe area, carrying the page's main action. On desktop the action lives in a side panel. */
export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="action-bar mobile-only">{children}</div>;
}

function TabBar() {
  const me = useMe();
  const { pathname } = useLocation();
  const explore = useExploreActive();
  const profile = `/people/${me.data?.handle ?? 'ishaan'}`;
  const tabs: { to: string; label: string; icon: IconName; active: boolean }[] = [
    { to: '/', label: 'Explore', icon: 'compass', active: explore },
    { to: '/club', label: 'Club', icon: 'users', active: pathname === '/club' },
    { to: '/post', label: 'Post', icon: 'plusSquare', active: pathname === '/post' },
    { to: '/openings', label: 'Openings', icon: 'briefcase', active: pathname === '/openings' },
    { to: profile, label: 'Profile', icon: 'user', active: pathname === profile },
  ];
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.label} to={t.to} className={t.active ? 'active' : undefined} aria-current={t.active ? 'page' : undefined}>
          <Icon name={t.icon} size={22} strokeWidth={t.active ? 1.9 : 1.8} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div className="footer-brand">
          <Logo size={30} />
          <span className="wordmark wordmark-sm">vinden</span>
          <span className="soft">Proof of Work is the new résumé.</span>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <a href="#">About</a>
          <a href="#">Vinden Club</a>
          <a href="#">For companies</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
        <span className="muted small">© 2026 Vinden</span>
      </div>
    </footer>
  );
}
