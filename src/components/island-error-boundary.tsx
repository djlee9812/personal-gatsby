import * as React from 'react';

interface State {
  hasError: boolean;
}

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
  /** When this changes, clear a sticky error after navigation. */
  resetKey?: string;
}

/**
 * Isolates a lazy island (hero scene, travel map) so a chunk or render throw
 * does not replace Layout's main tree.
 */
export class IslandErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey &&
      this.props.resetKey !== undefined
    ) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: unknown): void {
    console.error('IslandErrorBoundary caught:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
