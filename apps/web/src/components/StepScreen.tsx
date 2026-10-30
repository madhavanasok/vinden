import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { ActionBar } from './Layout';
import { Page } from './Page';
import { ProgressBar } from './Rows';
import '../features/onboarding/onboarding.css';

/**
 * One question or one short form per screen: sign-up, each profile completion step, adding a role.
 * Tablet and desktop: the form in a panel under the Page header, its buttons at the panel's foot.
 * Phone: the form runs full width and the buttons move to the Action bar (Back and next type).
 * Figma: Page header + Action bar. Skill: vinden-component-page-header, vinden-component-action-bar.
 */
export function StepScreen({ title, eyebrow, sub, back, progress, primary, secondary, error, onSubmit, children }: {
  title: string;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  /** Where the phone's back arrow goes; defaults to the previous page. */
  back?: string;
  /** How far along the whole flow is (e.g. profile completion), always with visible text. */
  progress?: { value: number; max?: number; label: string; text: string };
  /** The submit button. `accent` only for the screen's one key action, such as Send for verification. */
  primary: { label: string; busyLabel?: string; busy?: boolean; accent?: boolean };
  /** A second action that doesn't submit, such as Skip. */
  secondary?: { label: string; onClick: () => void; disabled?: boolean };
  /** A message about the whole form, e.g. from the server. Field errors belong on their fields. */
  error?: string | null;
  onSubmit: () => void;
  children: ReactNode;
}) {
  const submitClass = `btn btn-lg ${primary.accent ? 'btn-accent' : 'btn-primary'}`;
  const submitLabel = primary.busy ? primary.busyLabel ?? primary.label : primary.label;
  const skip = secondary && (
    <button type="button" className="btn btn-lg btn-outline" onClick={secondary.onClick} disabled={secondary.disabled || primary.busy}>
      {secondary.label}
    </button>
  );
  return (
    <Page title={title} eyebrow={eyebrow} sub={sub} back={back} width="narrow">
      {progress && (
        <div className="step-progress">
          <ProgressBar value={progress.value} max={progress.max} label={progress.label} />
          <span className="small soft">{progress.text}</span>
        </div>
      )}
      <form
        className="step-screen"
        noValidate
        aria-busy={primary.busy || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (!primary.busy) onSubmit();
        }}
      >
        <div className="step-body">{children}</div>
        {error && (
          <p className="step-error" role="alert">
            <Icon name="info" />
            <span>{error}</span>
          </p>
        )}
        <div className="step-foot desktop-only">
          {skip}
          <button type="submit" className={submitClass} disabled={primary.busy}>{submitLabel}</button>
        </div>
        <ActionBar>
          {skip}
          <button type="submit" className={`${submitClass} grow`} disabled={primary.busy}>{submitLabel}</button>
        </ActionBar>
      </form>
    </Page>
  );
}
