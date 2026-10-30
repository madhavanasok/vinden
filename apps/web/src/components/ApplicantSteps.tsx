import { Icon } from './Icon';
import '../features/community/community.css';

/** Club selection can include five steps (PDF §2); an application then ends as selected or ended. */
export const SELECTION_STEPS = ['motivation', 'screening', 'interview', 'task', 'final'] as const;
export type SelectionStep = (typeof SELECTION_STEPS)[number];
export type AppStep = SelectionStep | 'selected' | 'ended';

export const STEP_LABEL: Record<AppStep, string> = {
  motivation: 'Motivation form',
  screening: 'Screening',
  interview: 'Interview',
  task: 'Practical task',
  final: 'Final selection',
  selected: 'Selected',
  ended: 'Ended',
};

/**
 * Where a club application is: the five selection steps, done, current or to come. Used by the applicant (Apply) and
 * the Core Team (Evaluate). `row` lays the steps out side by side (a column on phones); `column` always stacks them.
 */
export function ApplicantSteps({ step, layout = 'row', label = 'Selection steps' }: { step: AppStep; layout?: 'row' | 'column'; label?: string }) {
  const current = SELECTION_STEPS.indexOf(step as SelectionStep);
  const stateOf = (i: number) => {
    if (step === 'selected') return 'done';
    if (step === 'ended') return 'ended';
    return i < current ? 'done' : i === current ? 'current' : 'upcoming';
  };
  return (
    <div className={`applicant-steps applicant-steps-${layout}`}>
      <ol aria-label={label}>
        {SELECTION_STEPS.map((s, i) => {
          const state = stateOf(i);
          return (
            <li key={s} className={`applicant-step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="step-marker" aria-hidden="true">{state === 'done' ? <Icon name="check" size={16} strokeWidth={2.4} /> : i + 1}</span>
              <span className="applicant-step-label">{STEP_LABEL[s]}</span>
              {state === 'done' && <span className="visually-hidden">, done</span>}
              {state === 'current' && <span className="visually-hidden">, current step</span>}
            </li>
          );
        })}
      </ol>
      {step === 'selected' && <p className="applicant-steps-end is-selected"><Icon name="check" size={16} strokeWidth={2.2} />Selected</p>}
      {step === 'ended' && <p className="applicant-steps-end"><Icon name="close" size={16} strokeWidth={2.2} />Application ended</p>}
    </div>
  );
}
