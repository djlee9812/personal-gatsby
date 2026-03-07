import * as React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: React.ReactNode;
}

/**
 * Catches Gatsby StaticQuery runtime errors (e.g. "The result of this StaticQuery
 * could not be fetched") and shows a friendly message with a refresh CTA instead
 * of the generic error overlay. Common after stale cache or dev server race.
 */
export class QueryErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown): void {
    console.error('QueryErrorBoundary caught:', error);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const isStaticQueryError =
      this.state.message.includes('StaticQuery') &&
      this.state.message.includes('could not be fetched');

    return (
      <div
        style={{
          padding: '2rem',
          maxWidth: '480px',
          margin: '4rem auto',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
          {isStaticQueryError ? 'Page data not ready' : 'Something went wrong'}
        </h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {isStaticQueryError
            ? 'This is usually a temporary issue. Refreshing the page often fixes it.'
            : 'Try refreshing the page.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Refresh page
        </button>
      </div>
    );
  }
}
