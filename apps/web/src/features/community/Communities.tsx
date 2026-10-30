import { useState } from 'react';
import { Link } from 'react-router';
import { useCommunities, useMe, type Community } from '../../api';
import { CommunityCardLink } from '../../components/CommunityCardLink';
import { Icon } from '../../components/Icon';
import { EmptyState, Page, TabRow } from '../../components/Page';
import { ErrorState, Loading } from '../../pages/Placeholder';
import './community.css';

type Filter = 'all' | 'club' | 'platform' | 'people' | 'yours';

const GROUPS: { key: Filter; label: string; note: string; test: (c: Community) => boolean }[] = [
  { key: 'all', label: 'All', note: 'Open communities: Join. Closed ones: Request to join, and the admin approves.', test: () => true },
  { key: 'club', label: 'Club communities', note: 'Each Vinden Club’s news and events, open to everyone. Following one doesn’t make you a club member.', test: (c) => c.kind === 'club' },
  { key: 'platform', label: 'From Vinden', note: 'Open to everyone. Vinden runs these.', test: (c) => c.platform },
  { key: 'people', label: 'Made by people', note: 'Open ones you can join straight away. Closed ones need their admin’s approval.', test: (c) => !c.platform && c.kind !== 'club' },
  { key: 'yours', label: 'Yours', note: 'Communities you’ve joined, asked to join or run.', test: (c) => c.status !== 'none' || c.isAdmin },
];

/** Club communities first (your college's club leads the completion bar too), then Vinden's, then people's. */
const rank = (c: Community) => (c.kind === 'club' ? 0 : c.platform ? 1 : 2);

/**
 * FN-08-I01 Communities: every club's community and Vinden's platform communities (both open: Join), and the ones
 * people made (open: Join; closed: Request to join). Every community is a card that opens its page. Visitors can
 * browse; Join asks them to sign up. Joining a club's community isn't club membership.
 */
export function Communities() {
  const me = useMe();
  const list = useCommunities();
  const [filter, setFilter] = useState<Filter>('all');
  const account = me.data?.account;
  // Open question R-14: who can create communities isn't settled; any personal account can.
  const actions = account === 'person'
    ? <Link to="/communities/new" className="btn btn-primary"><Icon name="plus" size={18} strokeWidth={2} />Create a community</Link>
    : account === 'visitor'
      ? <Link to="/signup" className="btn btn-primary">Sign up to join</Link>
      : null;

  if (list.isPending) return <Page title="Communities" top><Loading /></Page>;
  if (list.error) return <Page title="Communities" top><ErrorState error={list.error} onRetry={() => void list.refetch()} /></Page>;

  const all = [...list.data].sort((a, b) => rank(a) - rank(b));
  const groups = GROUPS.filter((g) => g.key !== 'yours' || (account !== 'visitor' && all.some(g.test)));
  const group = groups.find((g) => g.key === filter) ?? groups[0];
  const shown = all.filter(group.test);

  return (
    <Page title="Communities" sub="Follow clubs and topics for their updates and events." actions={actions} top>
      <TabRow<Filter>
        label="Show communities"
        tabs={groups.map((g) => ({ key: g.key, label: g.label, count: all.filter(g.test).length }))}
        value={group.key}
        onChange={setFilter}
      />
      <p className="community-filter-note soft">{group.note}</p>
      {shown.length ? (
        <ul className="community-grid" aria-label={group.label === 'All' ? 'All communities' : group.label}>
          {shown.map((c) => <li key={c.slug}><CommunityCardLink community={c} /></li>)}
        </ul>
      ) : (
        <EmptyState
          icon="users"
          title="No communities here yet"
          body="Start one on any topic you care about."
          action={account === 'person' ? <Link to="/communities/new" className="btn btn-outline btn-sm">Create a community</Link> : undefined}
        />
      )}
    </Page>
  );
}
