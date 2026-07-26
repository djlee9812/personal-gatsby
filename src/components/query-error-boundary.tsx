import * as React from 'react';
import {
  isStaticQueryErrorMessage,
  QueryErrorFallback,
} from './query-error-fallback';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: React.ReactNode;
  /** When this changes, clear a sticky error after navigation. */
  resetKey?: string;
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

  componentDidUpdate(prevProps: Props): void {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey &&
      this.props.resetKey !== undefined
    ) {
      this.setState({ hasError: false, message: '' });
    }
  }

  componentDidCatch(error: unknown): void {
    console.error('QueryErrorBoundary caught:', error);
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const kind = isStaticQueryErrorMessage(this.state.message)
      ? 'static-query'
      : 'generic';

    return <QueryErrorFallback kind={kind} />;
  }
}
