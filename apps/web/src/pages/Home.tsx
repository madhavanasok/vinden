import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useHome, type Me } from '../api';
import { WorkGrid } from '../components/Cards';
import { Icon } from '../components/Icon';
import { MobileBar } from '../components/Layout';
import { EmptyState, isVisitor } from '../components/Page';
import { CompleteProfilePanel } from '../features/onboarding/CompleteProfilePanel';
import { ErrorState, Loading } from './Placeholder';
import '../features/work/work.css';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/**
 * Home (register FN-07-I01): the completion bar and verified work. Sign-up lands here.
 * Open question R-23: nothing else on Home was discussed, so it carries only a greeting, search and those two.
 */
export function Home() {
  const home = useHome();
  if (home.isPending) return <Loading />;
  if (home.isError) return <ErrorState error={home.error} onRetry={() => void home.refetch()} />;
  const { me, works } = home.data;

  return (
    <div className="home">
      <MobileBar />
      <div className="container">
        <section className="hero home-hero" aria-labelledby="hero-title">
          <p className="hero-greeting">{isVisitor(me) ? 'Proof of Work is the new résumé' : `${greeting()}, ${me.firstName}`}</p>
          <h1 id="hero-title" className="hero-title display">{isVisitor(me) ? 'See what students have made' : 'What’s next?'}</h1>
          <HomeSearch />
        </section>

        {me.account === 'person' && <CompleteProfilePanel />}
        {isVisitor(me) && <SignUpPrompt />}

        <section className="section" aria-labelledby="works-title">
          <div className="section-head">
            <div>
              <h2 id="works-title" className="section-title">Verified work</h2>
              <p className="section-sub">Checked by AI, reviewed by clubs, vouched for by people who know the field</p>
            </div>
            <Link to="/explore" className="see-all">Explore all work</Link>
          </div>
          {works.length ? (
            <WorkGrid works={works} label="Verified work" />
          ) : (
            <EmptyState title="No verified work yet" body={postHint(me)} action={me.account === 'person' ? <Link to="/post" className="btn btn-primary btn-sm">Post work</Link> : undefined} />
          )}
        </section>
      </div>
    </div>
  );
}

const postHint = (me: Me) => (me.account === 'person' ? 'Post your first Proof of Work. Once it’s verified, it shows here.' : 'Verified work shows here as people post it.');

/** Search goes to the work repository, where the query can be refined. */
function HomeSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore');
  };
  return (
    <form role="search" className="search hero-search" onSubmit={submit}>
      <Icon name="search" size={24} />
      <input type="search" aria-label="Search verified work" placeholder="Search work, skills, people, clubs" value={q} onChange={(e) => setQ(e.target.value)} />
      <button type="submit" className="btn btn-primary hero-search-btn">Search</button>
    </form>
  );
}

/** Visitors browse without an account (open question R-07); posting and vouching need one. */
function SignUpPrompt() {
  return (
    <section className="signup-prompt" aria-labelledby="signup-title">
      <span className="tile tile-gold" aria-hidden="true"><Icon name="sparkle" /></span>
      <div className="grow">
        <h2 id="signup-title" className="signup-prompt-title">Show what you can do</h2>
        <p className="soft">Sign up with your email to post your own work, get it verified and vouch for others.</p>
      </div>
      <Link to="/signup" className="btn btn-primary">Sign up</Link>
    </section>
  );
}
