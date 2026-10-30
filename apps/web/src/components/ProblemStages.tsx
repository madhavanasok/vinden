import { Icon } from './Icon';
import '../features/training/training.css';

/** The cycle every problem statement moves through (client PDF §5): company → problem → student team → solution → Proof of Work. */
export type ProblemStage = 'problem' | 'team' | 'solution' | 'pow';

export const PROBLEM_STAGES: { key: ProblemStage; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'team', label: 'Student team' },
  { key: 'solution', label: 'Solution' },
  { key: 'pow', label: 'Proof of Work' },
];

export const problemStageLabel = (s: ProblemStage) => PROBLEM_STAGES.find((x) => x.key === s)?.label ?? s;

/**
 * Where one problem statement is: the four stages in order, with the ones passed ticked and the current one marked.
 * Used by the company tracking its projects and by the Core Team managing them. Figma: Problem stages.
 */
export function ProblemStages({ stage, label = 'Stage' }: { stage: ProblemStage; label?: string }) {
  const current = PROBLEM_STAGES.findIndex((s) => s.key === stage);
  return (
    <ol className="tr-stages" aria-label={label}>
      {PROBLEM_STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={s.key} className={`tr-stage tr-stage-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="tr-stage-marker" aria-hidden="true">
              {state === 'done' && <Icon name="check" size={14} strokeWidth={2.6} />}
            </span>
            <span className="tr-stage-label">
              {s.label}
              {state === 'done' && <span className="visually-hidden">, done</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
