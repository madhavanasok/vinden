import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMe, type Community } from '../api';
import { CommunityCard } from './Cards';
import '../features/community/community.css';

/**
 * A Community card that opens its community page (/communities/:slug). The whole card is the link; its Join button
 * sits above the link and still works on its own. Visitors can browse, and pressing Join takes them to sign up.
 * Wraps CommunityCard (Cards.tsx). Skill: vinden-component-community-card.
 */
export function CommunityCardLink({ community }: { community: Community }) {
  const me = useMe();
  const navigate = useNavigate();
  const visitor = me.data?.account === 'visitor';
  // Visitors can't join (the API refuses their writes), so the card's button becomes a way to sign up.
  const toSignUp = (e: MouseEvent) => {
    if (!(e.target instanceof Element) || !e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    navigate('/signup');
  };
  return (
    <div className="community-link" onClickCapture={visitor ? toSignUp : undefined}>
      <Link to={`/communities/${community.slug}`} className="community-link-cover" aria-label={`Open ${community.name}`} />
      <CommunityCard community={community} />
    </div>
  );
}
