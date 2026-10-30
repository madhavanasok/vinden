import { Link } from 'react-router';
import { Logo } from '../components/Bits';

export function Loading() {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="muted">Loading…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="state" role="alert">
      <h1 className="state-title display">Something went wrong</h1>
      <p className="soft">{error.message}. Is the demo API running? Start everything with npm run dev.</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>
    </div>
  );
}

export function NotFound({ message = "There's nothing at this link." }: { message?: string }) {
  return (
    <div className="state">
      <h1 className="state-title display">Not found</h1>
      <p className="soft">{message}</p>
      <Link to="/" className="btn btn-primary">Back to Explore</Link>
    </div>
  );
}

export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="state">
      <Logo size={56} />
      <h1 className="state-title display">{title}</h1>
      <p className="soft">{body}</p>
      <p className="muted small">This part of the demo isn't built yet.</p>
      <Link to="/" className="btn btn-outline">Back to Explore</Link>
    </div>
  );
}
