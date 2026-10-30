import { Link } from 'react-router';
import { ApiError, timeAgo } from '../../api';
import { Icon } from '../../components/Icon';
import { Board, EmptyState, Gate, Page, isCore } from '../../components/Page';
import { PersonRow, ProgressBar } from '../../components/Rows';
import { ErrorState, Loading } from '../../pages/Placeholder';
import { SELECTION_STEPS, STEP_LABEL, useApplications, type Applications as Data } from './api';
import './community.css';

/**
 * FN-10-I02 Applications: the Core Team's board of applicants by step (the Core Team recruits and selects, PDF §1).
 * Each card opens the evaluation. Shows how many are selected so far, of about 30.
 * Open question R-17: which steps run in the app isn't settled, so all five are on the board.
 */
export function Applications() {
  return (
    <Gate allow={(me) => isCore(me)} who="the club’s Core Team">
      <ApplicationsPage />
    </Gate>
  );
}

function ApplicationsPage() {
  const data = useApplications();
  if (data.isPending) return <Loading />;
  if (data.error) {
    return data.error instanceof ApiError && data.error.status === 403
      ? <div className="state"><h1 className="state-title display">Not for this account</h1><p className="soft">{data.error.message}</p></div>
      : <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  }
  return <ApplicationsView data={data.data} />;
}

function ApplicationsView({ data }: { data: Data }) {
  const { club, applications, selected, target } = data;
  const active = applications.filter((a) => a.step !== 'selected' && a.step !== 'ended');
  const chosen = applications.filter((a) => a.step === 'selected');
  const ended = applications.filter((a) => a.step === 'ended');

  return (
    <Page
      title="Applications"
      eyebrow={club.name}
      sub="Selection can include five steps. It’s open to the whole college and never on academic performance alone."
      back={`/clubs/${club.slug}`}
      actions={<Link to={`/clubs/${club.slug}`} className="btn btn-outline">Club page</Link>}
    >
      <div className="selection-progress">
        <p><b>Selected: {selected} of about {target}</b></p>
        <ProgressBar value={selected} max={target} label={`Selected ${selected} of about ${target}`} />
        <span className="small soft">
          {active.length} in progress{ended.length > 0 && ` · ${ended.length} ended`}{!club.recruiting && ' · Recruitment is closed'}
        </span>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon="users" title="No applications yet" body="Students apply from the club page while recruitment is open." />
      ) : (
        <Board
          label="Applicants by step"
          columns={SELECTION_STEPS.map((s) => ({
            key: s,
            title: STEP_LABEL[s],
            items: active.filter((a) => a.step === s).map((a) => ({
              key: a.id,
              content: (
                <Link to={`/club/applications/${a.id}`} className="board-card">
                  <b>{a.name}</b>
                  <span>{a.line}</span>
                  <span>Applied {timeAgo(a.createdAt)}</span>
                </Link>
              ),
            })),
          }))}
        />
      )}

      {chosen.length > 0 && (
        <section className="page-section" aria-labelledby="selected-title">
          <div className="section-head">
            <div>
              <h2 id="selected-title" className="section-title">Selected</h2>
              <p className="section-sub">They’re now club members.</p>
            </div>
          </div>
          <ul className="applicant-list">
            {chosen.map((a) => (
              <li key={a.id}>
                <PersonRow person={a} line={a.line} to={`/club/applications/${a.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {ended.length > 0 && (
        <section className="page-section" aria-labelledby="ended-title">
          <div className="section-head">
            <div>
              <h2 id="ended-title" className="section-title">Ended</h2>
              <p className="section-sub">Applications that didn’t go further. Their notes are kept.</p>
            </div>
          </div>
          <ul className="applicant-list">
            {ended.map((a) => (
              <li key={a.id}>
                <PersonRow person={a} line={a.line} to={`/club/applications/${a.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="small muted selection-note"><Icon name="info" size={16} />Open a card to read the motivation form and note each of the eight evaluation factors.</p>
    </Page>
  );
}
