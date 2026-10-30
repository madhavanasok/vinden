import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMe, type Me } from '../api';
import { Icon } from './Icon';
import { MobileBar, PageBar } from './Layout';
import { Loading } from '../pages/Placeholder';

/**
 * The frame for every screen. Phone: a Page-type Mobile top bar with back (or the Home-type bar for top-level tabs).
 * Tablet and desktop: an eyebrow, the h1, a line of context and the page's actions on the right.
 * Figma: Page header. Skill: vinden-component-page-header.
 */
export function Page({ title, eyebrow, sub, actions, back, top = false, width = 'wide', children }: {
  title: string;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  /** Where the phone's back arrow goes; defaults to the previous page. */
  back?: string;
  /** A top-level tab (Explore, Communities, Club…): the phone shows the Home-type bar instead of back. */
  top?: boolean;
  /** 'narrow' for forms and single-step screens (720 px), 'wide' for everything else. */
  width?: 'wide' | 'narrow';
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <>
      {top ? <MobileBar /> : <PageBar title={title} onBack={() => (back ? navigate(back) : navigate(-1))} />}
      <div className={`container page page-${width}`}>
        <header className={`page-head${top ? '' : ' page-head-sub'}`}>
          <div className="page-head-text">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="page-title display">{title}</h1>
            {sub && <p className="page-sub">{sub}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </header>
        {children}
      </div>
    </>
  );
}

/* ---------- Who can see what ---------- */

export const isVisitor = (me?: Me) => !me || me.account === 'visitor';
export const isCompany = (me?: Me) => me?.account === 'company';
export const isMember = (me?: Me) => !!me?.club;
/** Any Core Team seat, or one of `roles` when given (e.g. ['Proof of Work & Quality', 'President']). */
export const isCore = (me?: Me, roles?: string[]) => !!me?.club?.coreRole && (!roles || roles.includes(me.club.coreRole));

/**
 * Shows its children only to the people `allow` lets in; everyone else gets a plain explanation and a way on.
 * Permissions per role are an open question (R-26), so gates follow what the sources say each role does.
 */
export function Gate({ allow, who, children }: { allow: (me: Me) => boolean; who: string; children: ReactNode }) {
  const me = useMe();
  if (me.isPending) return <Loading />;
  if (me.data && allow(me.data)) return <>{children}</>;
  const visitor = isVisitor(me.data);
  return (
    <div className="state" role="status">
      <span className="tile tile-lav" aria-hidden="true"><Icon name="lock" /></span>
      <h1 className="state-title display">{visitor ? 'Sign up to see this' : 'Not for this account'}</h1>
      <p className="soft">This page is for {who}.</p>
      {visitor ? <Link to="/signup" className="btn btn-primary">Sign up</Link> : <Link to="/" className="btn btn-outline">Back to Explore</Link>}
    </div>
  );
}

/* ---------- Empty state ---------- */

/** What's missing and the next step. Figma: Empty state. */
export function EmptyState({ icon = 'sparkle', title, body, action }: { icon?: Parameters<typeof Icon>[0]['name']; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="tile tile-gold" aria-hidden="true"><Icon name={icon} /></span>
      <div>
        <p className="empty-state-title">{title}</p>
        {body && <p className="small soft">{body}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Board ---------- */

export interface BoardColumn {
  key: string;
  title: string;
  items: { key: string | number; content: ReactNode }[];
}

/**
 * Columns for things that move through fixed steps: club selection, problem statements. Each column shows its count.
 * Desktop and tablet: columns side by side, scrolling sideways if needed. Phone: a sideways rail of columns.
 * Figma: Board column. Skill: vinden-component-board.
 */
export function Board({ label, columns }: { label: string; columns: BoardColumn[] }) {
  return (
    <div className="board" role="list" aria-label={label}>
      {columns.map((c) => (
        <section key={c.key} className="board-col" role="listitem" aria-label={`${c.title}, ${c.items.length}`}>
          <h2 className="board-head"><span>{c.title}</span><span className="board-count">{c.items.length}</span></h2>
          {c.items.length ? (
            <ul className="board-items">{c.items.map((i) => <li key={i.key}>{i.content}</li>)}</ul>
          ) : (
            <p className="board-empty">None</p>
          )}
        </section>
      ))}
    </div>
  );
}

/* ---------- Tabs that filter a page ---------- */

/** In-page tabs; the active one has aria-current. Figma: Category tab. */
export function TabRow<T extends string>({ label, tabs, value, onChange }: { label: string; tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (key: T) => void }) {
  return (
    <div className="page-tabs tab-row" role="group" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.key} type="button" className={t.key === value ? 'active' : undefined} aria-pressed={t.key === value} onClick={() => onChange(t.key)}>
          {t.label}{t.count !== undefined && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
