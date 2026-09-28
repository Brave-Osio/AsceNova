import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors anywhere below it so a thrown error shows a
 * styled recovery panel instead of white-screening the whole app.
 * Must be a class component — React has no hook equivalent for
 * componentDidCatch/getDerivedStateFromError.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error caught by ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-svh items-center justify-center bg-brand-bg px-4">
        <div className="card max-w-md rounded-3xl p-10 text-center">
          <AlertTriangle size={40} className="mx-auto text-amber-400" />
          <h1 className="mt-4 text-2xl font-bold text-brand-text">Something went wrong</h1>
          <p className="mt-2 text-brand-text-secondary">
            An unexpected error occurred. Reloading the page usually fixes this.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-brand-primary-light transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
