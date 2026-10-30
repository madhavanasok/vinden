import { useId, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useCommunities, useMe, type Me } from '../../api';
import { CommunityCard } from '../../components/Cards';
import { OptionCards, type Option } from '../../components/Forms';
import { Icon } from '../../components/Icon';
import { Gate } from '../../components/Page';
import { StepScreen } from '../../components/StepScreen';
import { ErrorState, Loading, NotFound } from '../../pages/Placeholder';
import { nextStepPath, SCREEN_FOR, useMyProfile, useUpdateProfile, type Describes, type MyProfile, type ProfilePatch, type StepScreenKey } from './api';
import { TagField } from './fields';
import { RoleStatus } from './RoleStatus';
import './onboarding.css';

const SCREENS: StepScreenKey[] = ['describe', 'college', 'communities', 'skills'];
const isScreen = (s: string): s is StepScreenKey => (SCREENS as string[]).includes(s);

/**
 * FN-02-I03 to I06: one profile question per screen, each with Skip and Save, opened from the completion bar on Home.
 * After Save or Skip, the next step that is neither done nor skipped opens; when none is left, Home.
 * Open question R-03: whether "What describes you" must come first. Every step can be skipped, so none is forced.
 */
export function CompleteStep() {
  const { step = '' } = useParams();
  if (!isScreen(step)) return <NotFound message="There’s no profile step at this link." />;
  return (
    <Gate allow={(me) => me.account === 'person'} who="people with a personal Vinden account">
      <StepLoader key={step} step={step} />
    </Gate>
  );
}

function StepLoader({ step }: { step: StepScreenKey }) {
  const me = useMe();
  const profile = useMyProfile();
  if (me.isPending || profile.isPending) return <Loading />;
  if (me.isError) return <ErrorState error={me.error} onRetry={() => void me.refetch()} />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  const props = { me: me.data, profile: profile.data };
  if (step === 'describe') return <DescribeStep {...props} />;
  if (step === 'college') return <CollegeStep {...props} />;
  if (step === 'communities') return <CommunitiesStep {...props} />;
  return <SkillsStep {...props} />;
}

interface StepProps {
  me: Me;
  profile: MyProfile;
}

/** Saving or skipping a step, then moving on. */
function useStepActions(me: Me, step: StepScreenKey) {
  const navigate = useNavigate();
  const update = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const save = (patch: ProfilePatch, then?: string) => {
    setError(null);
    update.mutate(patch, {
      onSuccess: (next) => navigate(then ?? nextStepPath(next, step)),
      onError: (e) => setError(`We couldn’t save that: ${e.message}`),
    });
  };
  // Skip marks this screen's unfinished steps as skipped; they stay on the bar on Home so people can come back.
  const open = (me.completion?.steps ?? []).filter((s) => SCREEN_FOR[s.key] === step && !s.done).map((s) => s.key);
  const skip = () => (open.length ? save({ skip: open }) : navigate(nextStepPath(me, step)));
  return { save, skip, busy: update.isPending, error };
}

function StepFrame({ me, title, sub, actions, onSave, children }: {
  me: Me;
  title: string;
  sub: string;
  actions: ReturnType<typeof useStepActions>;
  onSave: () => void;
  children: ReactNode;
}) {
  const percent = me.completion?.percent ?? 0;
  return (
    <StepScreen
      eyebrow="Complete your profile"
      title={title}
      sub={sub}
      progress={{ value: percent, label: 'Profile complete', text: `Profile ${percent}% complete` }}
      primary={{ label: 'Save', busyLabel: 'Saving…', busy: actions.busy }}
      secondary={{ label: 'Skip', onClick: actions.skip }}
      error={actions.error}
      onSubmit={onSave}
    >
      {children}
    </StepScreen>
  );
}

/* ---------- FN-02-I03 What describes you ---------- */

const DESCRIBE_OPTIONS: Option<Describes>[] = [
  { value: 'student', title: 'Student', description: 'In college now', icon: 'graduation' },
  { value: 'professional', title: 'Early-career professional', description: '1–4 years of work', icon: 'briefcase' },
  // Open question R-04: whether founder and freelancer are one choice or two. Kept apart, as the call listed them.
  { value: 'founder', title: 'Founder', description: 'Building your own company', icon: 'trendingUp' },
  { value: 'freelancer', title: 'Freelancer', description: 'Working with your own clients', icon: 'user' },
];

function DescribeStep({ me, profile }: StepProps) {
  const actions = useStepActions(me, 'describe');
  const [value, setValue] = useState<Describes | null>(me.describes ?? profile.describes);
  const [error, setError] = useState<string>();
  const onSave = () => {
    if (!value) return setError('Choose one, or skip this step.');
    actions.save({ describes: value });
  };
  return (
    <StepFrame me={me} title="What describes you?" sub="It decides what we ask next: college for students, experience for professionals." actions={actions} onSave={onSave}>
      <OptionCards legend="I’m a…" name="describes" options={DESCRIBE_OPTIONS} value={value} onChange={(v) => { setValue(v); setError(undefined); }} error={error} />
    </StepFrame>
  );
}

/* ---------- FN-02-I04 College and year ---------- */

function CollegeStep({ me, profile }: StepProps) {
  const actions = useStepActions(me, 'college');
  const id = useId();
  const [college, setCollege] = useState(profile.college ?? '');
  const [year, setYear] = useState(profile.studyYear ?? '');
  const [errors, setErrors] = useState<{ college?: string; year?: string }>({});
  const onSave = () => {
    const next = {
      college: college.trim().length < 2 ? 'Add your college.' : undefined,
      year: year ? undefined : 'Choose your year of study.',
    };
    setErrors(next);
    if (!next.college && !next.year) actions.save({ college: college.trim(), studyYear: year });
  };
  return (
    <StepFrame me={me} title="About your studies" sub="Your college decides which Vinden Club community we suggest." actions={actions} onSave={onSave}>
      <div className={`field${errors.college ? ' has-error' : ''}`}>
        <label htmlFor={`${id}-college`} className="field-label">College</label>
        <input
          id={`${id}-college`}
          className="field-input"
          list={`${id}-colleges`}
          autoComplete="off"
          maxLength={100}
          placeholder="e.g. Meridian College"
          value={college}
          aria-invalid={errors.college ? true : undefined}
          aria-describedby={`${id}-college-help`}
          onChange={(e) => { setCollege(e.target.value); setErrors({ ...errors, college: undefined }); }}
        />
        <datalist id={`${id}-colleges`}>
          {profile.colleges.map((c) => <option key={c} value={c} />)}
        </datalist>
        <p id={`${id}-college-help`} className="field-help">{errors.college ?? 'Start typing to pick from colleges on Vinden, or type yours.'}</p>
      </div>
      <div className={`field${errors.year ? ' has-error' : ''}`}>
        <label htmlFor={`${id}-year`} className="field-label">Year of study</label>
        <span className="select-wrap">
          <select
            id={`${id}-year`}
            className="field-input"
            value={year}
            aria-invalid={errors.year ? true : undefined}
            aria-describedby={errors.year ? `${id}-year-help` : undefined}
            onChange={(e) => { setYear(e.target.value); setErrors({ ...errors, year: undefined }); }}
          >
            <option value="">Choose your year</option>
            {profile.studyYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Icon name="chevronDown" />
        </span>
        {errors.year && <p id={`${id}-year-help`} className="field-help">{errors.year}</p>}
      </div>
    </StepFrame>
  );
}

/* ---------- FN-02-I05 Join communities ---------- */

function CommunitiesStep({ me, profile }: StepProps) {
  const actions = useStepActions(me, 'communities');
  const communities = useCommunities();
  const list = communities.data ?? [];
  const club = list.find((c) => c.slug === profile.clubCommunity);
  // Their college's club community first, then topics; other clubs' communities last.
  const rest = [...list.filter((c) => c !== club && c.kind === 'topic'), ...list.filter((c) => c !== club && c.kind === 'club')];
  const askCollege = !club && !profile.college && me.describes !== 'professional';
  return (
    <StepFrame me={me} title="Join communities" sub="Follow your college’s club community and the topics you care about." actions={actions} onSave={() => actions.save({})}>
      {communities.isPending && <p className="soft" role="status">Loading communities…</p>}
      {communities.isError && <p className="field-error" role="alert">We couldn’t load communities. <button type="button" className="link-btn" onClick={() => void communities.refetch()}>Try again</button></p>}
      {club && (
        <section className="step-section" aria-labelledby="club-community-title">
          <h2 id="club-community-title" className="step-section-title">Your college’s Vinden Club</h2>
          <ul className="step-communities">
            <li><CommunityCard community={club} /></li>
          </ul>
        </section>
      )}
      {askCollege && (
        <p className="step-links">
          Add your college to see your Vinden Club’s community. <Link to="/profile/complete/college" className="link">Add your college</Link>
        </p>
      )}
      {rest.length > 0 && (
        <section className="step-section" aria-labelledby="communities-title">
          <h2 id="communities-title" className="step-section-title">Communities to join</h2>
          <p className="small soft">Open communities you join at once. Closed ones ask their admin first.</p>
          <ul className="step-communities">
            {rest.map((c) => <li key={c.slug}><CommunityCard community={c} /></li>)}
          </ul>
        </section>
      )}
      <p className="notice">
        <Icon name="info" />
        <span>Following a club’s community gets you its news and events. It isn’t club membership.</span>
      </p>
    </StepFrame>
  );
}

/* ---------- FN-02-I06 Skills and experience ---------- */

const ADD_ROLE = '/profile/experience/new?from=complete';

function SkillsStep({ me, profile }: StepProps) {
  const actions = useStepActions(me, 'skills');
  const [skills, setSkills] = useState(profile.skills);
  const [interests, setInterests] = useState(profile.interests);
  const [error, setError] = useState<string>();
  const dirty = skills.join('|') !== profile.skills.join('|') || interests.join('|') !== profile.interests.join('|');
  const onSave = () => {
    if (!skills.length) return setError('Add at least one skill, or skip this step.');
    actions.save({ skills, interests });
  };
  const pro = me.describes === 'professional';
  // Open question R-05: whether the profile also asks for a résumé and past projects. Not asked here.
  return (
    <StepFrame me={me} title="Skills and experience" sub="What you can do, what you want to learn, and the roles you’ve had." actions={actions} onSave={onSave}>
      <TagField
        label="Skills"
        hint="Your verified work shows which ones you’ve proved."
        values={skills}
        onChange={(v) => { setSkills(v); setError(undefined); }}
        placeholder="e.g. Market sizing"
        addLabel="Add skill"
        error={error}
      />
      <TagField label="Interests" hint="What you want to work on or learn." values={interests} onChange={setInterests} placeholder="e.g. Growth" addLabel="Add interest" />
      <div className="divider" />
      <section className="step-section" aria-labelledby="experience-title">
        <h2 id="experience-title" className="step-section-title">Experience</h2>
        <p className="small soft">
          {pro ? 'Add your roles. Your manager confirms each one by email, or you upload the offer letter privately.' : 'Had an internship or a job? Add the role and get it verified.'}
        </p>
        {profile.experiences.length > 0 && (
          <ul className="role-list" aria-label="Your roles">
            {profile.experiences.map((e) => (
              <li key={e.id} className="role-row">
                <span className="company-square" style={{ background: e.color }} aria-hidden="true">{e.initial}</span>
                <span className="grow"><b className="block">{e.role}</b><span className="small soft">{e.company}</span></span>
                <RoleStatus experience={e} />
              </li>
            ))}
          </ul>
        )}
        <Link
          to={ADD_ROLE}
          className="step-link-card"
          onClick={(e) => {
            // Keep skills typed so far: save them before leaving for Add experience.
            if (!dirty || !skills.length) return;
            e.preventDefault();
            actions.save({ skills, interests }, ADD_ROLE);
          }}
        >
          <span className="tile tile-sm tile-flat tile-blue" aria-hidden="true"><Icon name="briefcase" /></span>
          <span className="grow">
            <b className="block">{profile.experiences.length ? 'Add another role' : 'Add a role'}</b>
            <span className="small soft">Verified by your manager or your offer letter</span>
          </span>
          <Icon name="chevronRight" />
        </Link>
      </section>
    </StepFrame>
  );
}
