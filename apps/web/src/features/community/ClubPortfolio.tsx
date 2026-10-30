import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api';
import { ClubProjectCard } from '../../components/ClubProjectCard';
import { EmptyState, Page, TabRow } from '../../components/Page';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { usePortfolio, type Portfolio } from './api';
import './community.css';

/**
 * FN-09-I02 Club portfolio: every published club project as cards, each opening its work page, with the team.
 * The club level of showcasing (open question R-35). Open questions R-12 and R-16: private company work and who can
 * see the portfolio aren't settled, so every published project is public.
 */
export function ClubPortfolio() {
  const { slug = '' } = useParams();
  const portfolio = usePortfolio(slug);
  if (portfolio.isPending) return <Loading />;
  if (portfolio.error) {
    return portfolio.error instanceof ApiError && portfolio.error.status === 404
      ? <NotFound message={portfolio.error.message} />
      : <ErrorState error={portfolio.error} onRetry={() => void portfolio.refetch()} />;
  }
  return <PortfolioView data={portfolio.data} />;
}

function PortfolioView({ data }: { data: Portfolio }) {
  const { club, projects } = data;
  const categories = [...new Set(projects.map((p) => p.category))].sort();
  const [category, setCategory] = useState('all');
  const shown = category === 'all' ? projects : projects.filter((p) => p.category === category);
  return (
    <Page
      title="Portfolio"
      eyebrow={<Link to={`/clubs/${club.slug}`} className="eyebrow-link">{club.name}</Link>}
      sub={`Every project ${club.name} has published. Each card opens the work page, with who did what.`}
      back={`/clubs/${club.slug}`}
    >
      {categories.length > 1 && (
        <TabRow
          label="Filter projects by category"
          tabs={[{ key: 'all', label: 'All', count: projects.length }, ...categories.map((c) => ({ key: c, label: c, count: projects.filter((p) => p.category === c).length }))]}
          value={category}
          onChange={setCategory}
        />
      )}
      {shown.length ? (
        <ul className="club-portfolio" aria-label={`${club.name} projects`}>
          {shown.map((p) => <li key={p.slug}><ClubProjectCard work={p} team={p.team} /></li>)}
        </ul>
      ) : (
        <EmptyState icon="file" title="No projects yet" body="Club projects show here once they’re published." />
      )}
    </Page>
  );
}
