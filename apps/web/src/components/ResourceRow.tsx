import { Icon, type IconName } from './Icon';
import '../features/training/training.css';

const host = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const TYPE_ICON: Record<string, IconName> = {
  Course: 'graduation',
  Article: 'file',
  Book: 'bookmark',
  Video: 'sparkle',
  'Case study': 'briefcase',
  'Industry report': 'trendingUp',
  Tool: 'sliders',
  Template: 'plusSquare',
};

/**
 * One resource on a learning path: what kind it is (course, article, book, video, case study, industry report, tool,
 * template), its title, and a link when there is one. The Core Team can take it off the path. Figma: Resource row.
 * Render inside a <ul>.
 */
export function ResourceRow({ type, title, link, onRemove, removing = false }: {
  type: string;
  title: string;
  link?: string;
  /** Shown to the Core Team, who curate the path. */
  onRemove?: () => void;
  removing?: boolean;
}) {
  return (
    <li className="tr-resource">
      <span className="tile tile-sm tile-flat tile-lav" aria-hidden="true"><Icon name={TYPE_ICON[type] ?? 'file'} /></span>
      <span className="grow">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" className="tr-resource-title">
            {title}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <b className="tr-resource-title">{title}</b>
        )}
        <span className="block small muted">{[type, link && host(link)].filter(Boolean).join(' · ')}</span>
      </span>
      {onRemove && (
        <button type="button" className="icon-btn bare" aria-label={`Remove ${title} from this path`} onClick={onRemove} disabled={removing}>
          <Icon name="close" />
        </button>
      )}
    </li>
  );
}
