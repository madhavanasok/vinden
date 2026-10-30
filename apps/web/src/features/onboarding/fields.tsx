import { useId, useState } from 'react';
import { Icon } from '../../components/Icon';

/** An email input: the right keyboard on phones, autofill, and 17 px text so iOS doesn't zoom. Figma: Text field. */
export function EmailField({ label, value, onChange, error, helper, placeholder = 'name@example.com', autoComplete = 'email', autoFocus = false }: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const help = error ?? helper;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        className="field-input"
        value={value}
        maxLength={254}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {help && <p id={`${id}-help`} className="field-help">{help}</p>}
    </div>
  );
}

/**
 * Short values typed one at a time and shown as removable tags: skills, interests.
 * Enter or Add adds the typed value; leaving the field with text in it adds it too, so nothing typed is lost on Save.
 * Figma: Text field + Tag (removable). Same pattern as the skills on Post work.
 */
export function TagField({ label, hint, values, onChange, placeholder, addLabel, max = 20, error }: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel: string;
  max?: number;
  error?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const full = values.length >= max;
  const add = () => {
    const s = draft.trim().replace(/\s+/g, ' ');
    if (s.length >= 2 && !full && !values.some((v) => v.toLowerCase() === s.toLowerCase())) onChange([...values, s]);
    setDraft('');
  };
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      {hint && <p id={`${id}-hint`} className="small soft">{hint}</p>}
      <div className="skill-input">
        <input
          id={id}
          className="field-input"
          value={draft}
          placeholder={placeholder}
          maxLength={40}
          disabled={full}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() && add()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-outline" onClick={add} disabled={full}>
          <Icon name="plus" size={18} strokeWidth={2} />
          {addLabel}
        </button>
      </div>
      {values.length > 0 && (
        <ul className="tag-row" aria-label={label}>
          {values.map((v) => (
            <li key={v} className="tag tag-removable">
              {v}
              <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
                <Icon name="close" size={14} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p id={`${id}-error`} className="field-help field-error">{error}</p>}
    </div>
  );
}
