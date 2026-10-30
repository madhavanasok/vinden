import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { getPersona, useMe, usePersonas, useSwitchPersona, type Me } from '../api';
import { Avatar, Logo } from './Bits';
import { Icon, type IconName } from './Icon';

/** Explore covers Home, the work repository and anything opened from them: work, and other people's profiles. */
function useExploreActive() {
  const { pathname } = useLocation();
  const me = useMe();
  return pathname === '/' || pathname === '/explore' || pathname.startsWith('/work/') || (pathname.startsWith('/people/') && pathname !== `/people/${me.data?.handle}`);
}

/** Flows that bring their own phone Action bar, so the tab bar steps aside. */
const OWN_ACTION_BAR = [/^\/post$/, /^\/signup$/, /^\/profile\//, /^\/problems\/new$/, /^\/companies\/register$/, /^\/clubs\/[^/]+\/apply$/, /^\/communities\/new$/];

export function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <DemoBar />
      <Header showSearch={pathname !== '/' && pathname !== '/explore'} />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Footer />
      {!OWN_ACTION_BAR.some((r) => r.test(pathname)) && <TabBar />}
    </>
  );
}

/**
 * Demo only, not part of the product: switch who the demo acts as, so every role's screens and flows can be tried.
 * Visible at every size, above everything else, and styled apart from the product UI.
 */
function DemoBar() {
  const personas = usePersonas();
  const switchTo = useSwitchPersona();
  const current = getPersona();
  return (
    <div className="demo-bar">
      <div className="container demo-row">
        <label htmlFor="demo-persona" className="demo-label"><span className="demo-tag">Demo</span>Viewing as</label>
        <select id="demo-persona" className="demo-select" value={current} onChange={(e) => switchTo(e.target.value)}>
          {(personas.data ?? [{ as: current, name: current, label: '' }]).map((p) => (
            <option key={p.as} value={p.as}>{p.name}{p.label ? ` · ${p.label}` : ''}</option>
          ))}
        </select>
      </div>
    </div>
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
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore');
  };
  return (
    <form role="search" className="search header-search" onSubmit={submit}>
      <Icon name="search" />
      <input type="search" aria-label="Search Vinden" placeholder="Search work, skills, people, clubs" value={q} onChange={(e) => setQ(e.target.value)} />
    </form>
  );
}

/** The top nav's links for each kind of account. Navigation itself isn't decided yet; this follows the register's areas. */
function navFor(me: Me | undefined, explore: boolean, pathname: string) {
  const links: { to: string; label: string; active?: boolean }[] = [{ to: '/', label: 'Explore', active: explore }];
  if (me?.account === 'company') {
    links.push({ to: '/problems', label: 'Problem statements' });
    return links;
  }
  links.push({ to: '/communities', label: 'Communities' });
  if (me?.club) links.push({ to: '/club', label: 'Club', active: pathname === '/club' || pathname.startsWith('/club/') || pathname.startsWith('/clubs/') });
  return links;
}

function ProfileLink({ me }: { me: Me }) {
  if (me.account === 'company' && me.company) {
    return (
      <Link to="/problems" className="avatar-link" aria-label={`${me.company.name} account`}>
        <span className="company-square" style={{ background: me.company.color }} aria-hidden="true">{me.company.initial}</span>
      </Link>
    );
  }
  return (
    <Link to={`/people/${me.handle}`} className="avatar-link" aria-label="Your profile">
      <Avatar person={me} size={44} decorative />
    </Link>
  );
}

function Header({ showSearch }: { showSearch: boolean }) {
  const me = useMe();
  const { pathname } = useLocation();
  const explore = useExploreActive();
  const visitor = me.data?.account === 'visitor';

  return (
    <header className="site-header">
      <div className="container header-row">
        <Brand />
        {showSearch && <HeaderSearch />}
        <nav className="main-nav" aria-label="Main">
          {navFor(me.data, explore, pathname).map((l) =>
            l.active === undefined ? (
              <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
            ) : (
              <Link key={l.to} to={l.to} className={l.active ? 'active' : undefined} aria-current={l.active ? 'page' : undefined}>{l.label}</Link>
            ),
          )}
        </nav>
        <div className="header-actions">
          {visitor ? (
            <>
              <ThemeSwitch />
              <Link to="/companies/register" className="btn btn-outline header-secondary">For companies</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          ) : (
            <>
              {me.data?.account === 'company' ? (
                <Link to="/problems/new" className="btn btn-primary">
                  <Icon name="plus" size={18} strokeWidth={2} />
                  Submit a problem
                </Link>
              ) : (
                <Link to="/post" className="btn btn-primary">
                  <Icon name="plus" size={18} strokeWidth={2} />
                  Post work
                </Link>
              )}
              <ThemeSwitch />
              {me.data && <ProfileLink me={me.data} />}
            </>
          )}
        </div>
      </div>
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
        {me.data && (me.data.account === 'visitor' ? <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link> : <ProfileLink me={me.data} />)}
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
  const m = me.data;
  const tab = (to: string, label: string, icon: IconName, active = pathname === to) => ({ to, label, icon, active });
  const tabs = !m || m.account === 'visitor'
    ? [tab('/', 'Explore', 'compass', explore), tab('/communities', 'Communities', 'users', pathname.startsWith('/communities')), tab('/signup', 'Sign up', 'user')]
    : m.account === 'company'
      ? [tab('/', 'Explore', 'compass', explore), tab('/problems', 'Problems', 'briefcase'), tab('/problems/new', 'Submit', 'plusSquare')]
      : [
          tab('/', 'Explore', 'compass', explore),
          tab('/communities', 'Communities', 'users', pathname.startsWith('/communities')),
          tab('/post', 'Post', 'plusSquare'),
          ...(m.club ? [tab('/club', 'Club', 'graduation', pathname === '/club' || pathname.startsWith('/club/') || pathname.startsWith('/clubs/'))] : []),
          tab(`/people/${m.handle}`, 'Profile', 'user'),
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
          <Link to="/explore">Explore work</Link>
          <Link to="/communities">Communities</Link>
          <Link to="/companies/register">For companies</Link>
        </nav>
        <span className="muted small">© 2026 Vinden</span>
      </div>
    </footer>
  );
}
