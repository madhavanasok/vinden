import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { WorkGrid } from '../../components/Cards';
import { Icon } from '../../components/Icon';
import { EmptyState, Page } from '../../components/Page';
import { ErrorState, Loading } from '../../pages/Placeholder';
import { useExplore } from './api';
import './work.css';

/**
 * FN-07-I02 The work repository: verified work, searchable and filtered by area. No sign-in needed.
 * A card opens the work; the maker's name opens their profile.
 */
// Open question R-25: what people can do after finding someone (save, shortlist, contact) isn't decided, so cards only open.
export function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const area = params.get('area') ?? '';
  const [draft, setDraft] = useState(q);
  const explore = useExplore(q, area);

  useEffect(() => setDraft(q), [q]);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    update({ q: draft.trim() });
  };

  const data = explore.data;
  const filtered = Boolean(q || area);
  const total = data?.areas.reduce((sum, a) => sum + a.count, 0) ?? 0;

  return (
    <Page title="Explore verified work" sub="Real work by students and early-career people, checked by AI and reviewed by their clubs." back="/">
      <form role="search" className="search explore-search" onSubmit={submit}>
        <Icon name="search" size={22} />
        <input type="search" aria-label="Search verified work" placeholder="Search work, skills, people, colleges" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm explore-search-btn">Search</button>
      </form>

      <div className="chip-row explore-areas" role="group" aria-label="Filter by area">
        <button type="button" className="chip chip-sm" aria-pressed={!area} onClick={() => update({ area: '' })}>
          All areas{data && <span className="chip-count">{total}</span>}
        </button>
        {data?.areas.map((a) => (
          <button key={a.area} type="button" className="chip chip-sm" aria-pressed={area === a.area} onClick={() => update({ area: area === a.area ? '' : a.area })}>
            {a.area}<span className="chip-count">{a.count}</span>
          </button>
        ))}
      </div>

      {explore.isPending ? <Loading /> : explore.isError ? <ErrorState error={explore.error} onRetry={() => void explore.refetch()} /> : (
        <section className="explore-results" aria-labelledby="results-title" aria-busy={explore.isFetching}>
          <div className="explore-results-head">
            <h2 id="results-title" className="explore-count" aria-live="polite">
              {data!.works.length} {data!.works.length === 1 ? 'piece' : 'pieces'} of verified work
              {q && <> for “{q}”</>}
              {area && <> in {area}</>}
            </h2>
            {filtered && <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>Clear</button>}
          </div>
          {data!.works.length ? (
            <WorkGrid works={data!.works} label="Verified work" />
          ) : (
            <EmptyState
              icon="search"
              title="No verified work matches"
              body={area && !q ? `Nothing in ${area} yet. Try another area.` : 'Try another word, or search all areas.'}
              action={<button type="button" className="btn btn-outline btn-sm" onClick={() => setParams({}, { replace: true })}>Show all work</button>}
            />
          )}
        </section>
      )}
    </Page>
  );
}
