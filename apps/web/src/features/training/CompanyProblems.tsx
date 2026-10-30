import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { EmptyState, Page } from '../../components/Page';
import { Icon } from '../../components/Icon';
import { ProblemStages } from '../../components/ProblemStages';
import { stageLabel, useMyProblems, type Problem } from './api';
import { CompanyGate, names, ProblemHead, QueryState, scrollToPanel, WorkStatusPill } from './shared';
import './training.css';

/**
 * FN-12-I04 Your problem statements: track each project (problem, club, stage, solution) and review the solution once it
 * is delivered as Proof of Work. Open question R-20: which company features come first (the operating model says
 * companies could "eventually" track and evaluate), so evaluating means reviewing the Proof of Work page for now.
 * Open question R-12: how private company work is shown.
 */
export function CompanyProblems() {
  return (
    <CompanyGate>
      <Problems />
    </CompanyGate>
  );
}

/** One line on where the project is, for the list and the panel. */
function progressLine(p: Problem) {
  if (p.work) return p.work.status === 'published' ? 'Solution delivered as Proof of Work' : 'Solution posted, being reviewed by the club';
  if (!p.club) return 'Waiting for a Vinden Club to take it on';
  if (p.stage === 'problem') return `With ${p.club.name}: a student team comes next`;
  if (p.stage === 'team') return 'A student team is working on it';
  if (p.stage === 'solution') return 'The team is preparing the solution';
  return 'Delivered: the team posts it as Proof of Work';
}

function Problems() {
  const q = useMyProblems();
  const [params, setParams] = useSearchParams();
  const panel = useRef<HTMLElement>(null);
  if (!q.data) return <QueryState query={q} />;
  const { company, problems } = q.data;
  const selected = problems.find((p) => p.slug === params.get('p')) ?? problems[0];
  const submitted = params.get('submitted') === '1' && selected;

  return (
    <Page
      title="Your problem statements"
      eyebrow={company.name}
      top
      sub="Track each project from problem to Proof of Work, and review the solution when it’s delivered."
      actions={(
        <Link to="/problems/new" className="btn btn-primary">
          <Icon name="plus" size={18} strokeWidth={2} />
          Submit a problem
        </Link>
      )}
    >
      {submitted && (
        <p className="notice" role="status">
          <Icon name="check" size={20} strokeWidth={2.2} />
          <span>Problem statement submitted. A Vinden Club’s Industry & Outreach team will coordinate requirements with you.</span>
        </p>
      )}

      {problems.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No problem statements yet"
          body="Submit a real problem, and a Vinden Club’s student team can work on it."
          action={<Link to="/problems/new" className="btn btn-outline">Submit a problem</Link>}
        />
      ) : (
        <div className="tr-split">
          <div className="tr-company-list">
            <div className="tr-table-head" aria-hidden="true">
              <span>Problem</span>
              <span>Club</span>
              <span>Stage</span>
              <span>Solution</span>
            </div>
            <ul className="tr-rows" aria-label="Your problem statements">
              {problems.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`?p=${p.slug}`}
                    replace
                    preventScrollReset
                    className="tr-problem-row"
                    aria-current={p.slug === selected?.slug ? 'true' : undefined}
                    onClick={() => scrollToPanel(panel.current)}
                  >
                    <span className="tr-cell-main">
                      <b>{p.title}</b>
                      <span className="small soft">{p.needs}</span>
                    </span>
                    <span className="tr-cell"><span className="tr-cell-label">Club</span>{p.club?.name ?? 'Not with a club yet'}</span>
                    <span className="tr-cell"><span className="tr-cell-label">Stage</span>{stageLabel(p.stage)}</span>
                    <span className="tr-cell">
                      <span className="tr-cell-label">Solution</span>
                      {p.work ? <WorkStatusPill status={p.work.status} /> : <span className="muted">Not yet</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {selected && (
            <aside ref={panel} className="side-card tr-panel" aria-labelledby="problem-title">
              <ProblemHead problem={selected} headingId="problem-title" />
              <div className="tr-panel-block">
                <h3 className="tr-panel-label">Stage</h3>
                <ProblemStages stage={selected.stage} label={`Stage of ${selected.title}`} />
                <p className="small soft">{progressLine(selected)}</p>
              </div>
              <dl className="tr-facts">
                <div><dt>Club</dt><dd>{selected.club ? `${selected.club.name} · ${selected.club.college}` : 'Not with a club yet'}</dd></div>
                <div><dt>Student team</dt><dd>{selected.team.length ? names(selected.team) : 'Not chosen yet'}</dd></div>
                <div><dt>Requirements</dt><dd>{selected.requirements ?? 'The club’s Industry & Outreach team coordinates these with you.'}</dd></div>
                {selected.followUp && <div><dt>Follow-up</dt><dd>{selected.followUp}</dd></div>}
              </dl>
              <Solution problem={selected} />
            </aside>
          )}
        </div>
      )}
    </Page>
  );
}

/** Evaluate the solution: once the team posts it, it's a Proof of Work page the company can review. */
function Solution({ problem }: { problem: Problem }) {
  const { work } = problem;
  if (!work) {
    return (
      <div className="tr-solution tr-solution-empty">
        <h3 className="tr-panel-label">Solution</h3>
        <p className="small soft">Not delivered yet. When the team delivers it, it’s posted as Proof of Work and you can review it here.</p>
      </div>
    );
  }
  return (
    <div className="tr-solution">
      <h3 className="tr-panel-label">{work.status === 'published' ? 'Solution delivered' : 'Solution posted'}</h3>
      <WorkStatusPill status={work.status} />
      <p className="tr-solution-title">{work.title}</p>
      <Link to={`/work/${work.slug}`} className="btn btn-accent btn-block">Review the solution</Link>
    </div>
  );
}
