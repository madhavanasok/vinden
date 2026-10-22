import { useId, useState, type ReactNode } from 'react';
import type { Person } from '../api';
import { Avatar } from './Bits';
import { Icon, type IconName } from './Icon';

/** A labelled input. Text is 17 px so phones never zoom on focus. Figma: Text field. */
export function TextField({ label, value, onChange, multiline = false, placeholder, helper, error, maxLength }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  helper?: string;
  error?: string;
  maxLength?: number;
}) {
  const id = useId();
  const help = error ?? helper;
  const props = {
    id,
    value,
    placeholder,
    maxLength,
    className: 'field-input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': help ? `${id}-help` : undefined,
  };
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">{label}</label>
      {multiline
        ? <textarea rows={5} {...props} onChange={(e) => onChange(e.target.value)} />
        : <input type="text" {...props} onChange={(e) => onChange(e.target.value)} />}
      {help && <p id={`${id}-help`} className="field-help">{help}</p>}
    </div>
  );
}

/** A yes/no the person decides; never pre-ticked for consent. Figma: Checkbox. */
export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }) {
  return (
    <label className="checkbox">
      <input type="checkbox" className="visually-hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="checkbox-box" aria-hidden="true"><Icon name="check" size={16} strokeWidth={2.4} /></span>
      <span>{children}</span>
    </label>
  );
}

export interface Option<T extends string> {
  value: T;
  title: string;
  description: string;
  icon: IconName;
}

/** A radio group of explained choices. Figma: Option card (State Default | Selected). */
export function OptionCards<T extends string>({ legend, name, options, value, onChange, error }: {
  legend: string;
  name: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <fieldset className="field">
      <legend className="field-label">{legend}</legend>
      <div className="option-grid">
        {options.map((o) => (
          <label key={o.value} className={`option-card${value === o.value ? ' is-selected' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="visually-hidden" />
            <span className="tile tile-sm tile-flat tile-blue" aria-hidden="true"><Icon name={o.icon} /></span>
            <span className="grow">
              <b className="block option-title">{o.title}</b>
              <span className="small soft">{o.description}</span>
            </span>
            <span className="radio" aria-hidden="true" />
          </label>
        ))}
      </div>
      {error && <p className="field-help field-error">{error}</p>}
    </fieldset>
  );
}

/** Progress through a multi-step form. Desktop shows the row; phones show a progress bar instead. Figma: Step. */
export function Steps({ steps, current, done, onSelect }: { steps: string[]; current: number; done: boolean[]; onSelect: (index: number) => void }) {
  return (
    <ol className="steps desktop-only">
      {steps.map((label, i) => {
        const state = i === current ? 'current' : done[i] ? 'done' : 'upcoming';
        return (
          <li key={label} className={`step step-${state}`}>
            <button type="button" onClick={() => onSelect(i)} aria-current={i === current ? 'step' : undefined}>
              <span className="step-marker" aria-hidden="true">{state === 'done' ? <Icon name="check" size={16} strokeWidth={2.4} /> : i + 1}</span>
              <span className="step-label">{label}</span>
              {state === 'done' && <span className="visually-hidden">, done</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export interface PickedFile {
  name: string;
  size: number;
}

const fileKind = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'Slides';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'fig'].includes(ext)) return 'Image';
  return 'File';
};
const fileSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

/** Where people add the files that prove the work, with the list below. Figma: Upload field + File row. */
export function UploadField({ label, files, onAdd, onRemove, error }: { label: string; files: PickedFile[]; onAdd: (files: PickedFile[]) => void; onRemove: (index: number) => void; error?: string }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const add = (list: FileList | null) => list && onAdd([...list].map((f) => ({ name: f.name, size: f.size })));
  return (
    <div className="field">
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <label
        htmlFor={id}
        className={`upload-zone${over ? ' is-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <input id={id} type="file" multiple className="visually-hidden" aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        <span className="tile tile-sm tile-flat tile-blue" aria-hidden="true"><Icon name="upload" /></span>
        <b>Drop files here or <span className="link-text">browse</span></b>
        <span id={`${id}-hint`} className="small muted">PDF, slides, images or a spreadsheet · up to 50 MB</span>
      </label>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="file-row">
              <span className="tile tile-xs tile-flat tile-blue" aria-hidden="true"><Icon name="file" size={18} /></span>
              <span className="grow">
                <b className="block file-name">{f.name}</b>
                <span className="small muted">{fileKind(f.name)} · {fileSize(f.size)}</span>
              </span>
              <button type="button" className="icon-btn bare" aria-label={`Remove ${f.name}`} onClick={() => onRemove(i)}><Icon name="close" /></button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-help field-error">{error}</p>}
    </div>
  );
}

/** One teammate's role and share while posting team work. Figma: Teammate row (Layout Wide | Stacked). */
export function TeammateRow({ person, line, role, share, color, you, onRole, onShare, onRemove }: {
  person: Person;
  line: string;
  role: string;
  share: string;
  color: string;
  you: boolean;
  onRole: (role: string) => void;
  onShare: (share: string) => void;
  onRemove: () => void;
}) {
  const name = you ? 'Your' : `${person.name}’s`;
  return (
    <li className="teammate">
      <span className="teammate-who">
        <span className="split-dot" style={{ background: color }} aria-hidden="true" />
        <Avatar person={person} size={32} decorative />
        <span className="grow">
          <b className="block">{person.name}{you && ' (you)'}</b>
          <span className="small muted">{line}</span>
        </span>
      </span>
      <input className="field-input teammate-role" aria-label={`${name} role in this work`} placeholder="Their role, e.g. Research" value={role} onChange={(e) => onRole(e.target.value)} />
      <span className="share-input">
        <input className="field-input" inputMode="numeric" aria-label={`${name} share, in percent`} value={share} onChange={(e) => onShare(e.target.value.replace(/\D/g, '').slice(0, 3))} />
        <span aria-hidden="true">%</span>
      </span>
      {you ? <span className="teammate-remove" /> : (
        <button type="button" className="icon-btn bare teammate-remove" aria-label={`Remove ${person.name}`} onClick={onRemove}><Icon name="close" /></button>
      )}
    </li>
  );
}
